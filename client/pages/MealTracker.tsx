import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Flame, TrendingUp, BarChart3 } from "lucide-react";
import { useMealTrackerData } from "@/hooks/useMeals";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Food {
  id: string;
  name: string;
  category: string;
  units_available: string[];
  per_100g: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useDailyMeals, useWeeklyMeals, useAddMeal, useDeleteMeal } =
    useMealTrackerData();

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [foods, setFoods] = useState<Food[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "snacks" | "dinner"
  >("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState("g");
  const [activeTab, setActiveTab] = useState<"today" | "summary" | "analytics">("today");

  const { data: dailyMeals, isLoading: loadingDaily } = useDailyMeals(
    currentDate,
    user?.id
  );
  const { data: weeklyMeals } = useWeeklyMeals(getWeekStartDate(), user?.id);
  const addMealMutation = useAddMeal();
  const deleteMealMutation = useDeleteMeal();

  useEffect(() => {
    fetch("/foods-database.json")
      .then((res) => res.json())
      .then((data) => setFoods(data.foods))
      .catch((err) => console.error("Failed to load foods:", err));
  }, []);

  function getWeekStartDate() {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split("T")[0];
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday =
      date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
    return isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  function calculateMacros(food: Food, qty: number, unit: string) {
    const multiplier = unit === "g" ? qty / 100 : unit === "piece" ? (qty * 100) / 100 : qty / 100;
    return {
      calories: Math.round(food.per_100g.calories * multiplier * 10) / 10,
      protein: Math.round(food.per_100g.protein * multiplier * 10) / 10,
      carbs: Math.round(food.per_100g.carbs * multiplier * 10) / 10,
      fats: Math.round(food.per_100g.fats * multiplier * 10) / 10,
    };
  }

  async function handleAddFood() {
    if (!selectedFood) return;

    const macros = calculateMacros(selectedFood, quantity, selectedUnit);

    try {
      await addMealMutation.mutateAsync({
        date: currentDate,
        meal_type: selectedMealType,
        food_name: selectedFood.name,
        quantity,
        unit: selectedUnit,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      });

      toast({
        title: "Success",
        description: `${selectedFood.name} added to ${selectedMealType}`,
      });

      setSelectedFood(null);
      setQuantity(100);
      setSelectedUnit("g");
      setShowAddFood(false);
      setSearchQuery("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteMeal(mealId: string) {
    try {
      await deleteMealMutation.mutateAsync(mealId);
      toast({
        title: "Success",
        description: "Meal removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove meal",
        variant: "destructive",
      });
    }
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const macros = selectedFood
    ? calculateMacros(selectedFood, quantity, selectedUnit)
    : null;

  const renderMacroCircle = (label: string, current: number, goal: number, color: string) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    const colorMap: Record<string, { gradient: string; text: string }> = {
      calories: { gradient: "from-orange-400 to-red-500", text: "text-orange-600" },
      protein: { gradient: "from-blue-400 to-cyan-500", text: "text-blue-600" },
      carbs: { gradient: "from-green-400 to-emerald-500", text: "text-green-600" },
      fats: { gradient: "from-yellow-400 to-amber-500", text: "text-yellow-600" },
    };

    return (
      <div key={label} className="flex flex-col items-center gap-2">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              className="stroke-gray-200"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              className={`stroke-gradient bg-gradient-to-r ${colorMap[color].gradient}`}
              style={{
                strokeWidth: 8,
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                stroke: `url(#gradient-${color})`,
                transition: "stroke-dashoffset 0.5s ease",
              }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-2xl font-bold ${colorMap[color].text}`}>
              {Math.round(percentage)}%
            </p>
            <p className="text-xs text-gray-600 font-medium">{label}</p>
          </div>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${colorMap[color].text}`}>
            {Math.round(current)}
          </p>
          <p className="text-xs text-gray-500">/ {goal} {label === "Calories" ? "cal" : "g"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-gray-900">
            {formatDate(currentDate)}
          </h1>
        </div>
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Macro Circles Section - Always Visible */}
      {dailyMeals && (
        <div className="bg-white border-b-2 border-gray-200 p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Flame size={24} className="text-orange-500" />
            Nutrition Dashboard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderMacroCircle("Calories", dailyMeals.totals.calories, 2500, "calories")}
            {renderMacroCircle("Protein", dailyMeals.totals.protein, 150, "protein")}
            {renderMacroCircle("Carbs", dailyMeals.totals.carbs, 300, "carbs")}
            {renderMacroCircle("Fats", dailyMeals.totals.fats, 75, "fats")}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-300 flex gap-1 p-2 sticky top-16 z-10 shadow-sm">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 rounded-t-2xl ${
            activeTab === "today"
              ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Flame size={18} className="mx-auto mb-1" />
          Today
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 rounded-t-2xl ${
            activeTab === "summary"
              ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BarChart3 size={18} className="mx-auto mb-1" />
          Summary
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 rounded-t-2xl ${
            activeTab === "analytics"
              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <TrendingUp size={18} className="mx-auto mb-1" />
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* TODAY TAB */}
        {activeTab === "today" && (
          <div className="p-4 space-y-4">
            {["breakfast", "lunch", "snacks", "dinner"].map((mealType) => {
              const mealIcons: Record<string, string> = {
                breakfast: "🌅",
                lunch: "🍽️",
                snacks: "🥜",
                dinner: "🌙",
              };
              
              const mealCalories = dailyMeals
                ? dailyMeals[mealType as keyof typeof dailyMeals].reduce((s, m) => s + (m.calories || 0), 0)
                : 0;
              
              return (
                <div
                  key={mealType}
                  className="bg-white rounded-3xl p-4 border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{mealIcons[mealType]}</span>
                      <div>
                        <h2 className="font-bold text-gray-900 capitalize text-lg">
                          {mealType}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          {mealCalories > 0 ? `${Math.round(mealCalories)} cal` : "No items"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType as any);
                        setShowAddFood(true);
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full text-xs font-bold hover:shadow-lg hover:scale-110 transition-all duration-300"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>

                  {dailyMeals &&
                  dailyMeals[mealType as keyof typeof dailyMeals].length > 0 ? (
                    <div className="space-y-2">
                      {dailyMeals[mealType as keyof typeof dailyMeals].map(
                        (meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">
                                {meal.food_name}
                              </p>
                              <p className="text-xs text-gray-600 font-medium">
                                {meal.quantity}{meal.unit} • <span className="text-orange-600 font-bold">{meal.calories}cal</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteMeal(meal.id!)}
                              className="p-2 hover:bg-red-200 rounded-lg transition text-red-600 hover:scale-110"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400 font-medium">No items yet</p>
                      <p className="text-xs text-gray-400 mt-1">Tap Add to log your meal</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === "summary" && dailyMeals && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl">
                  <span className="font-semibold text-gray-900">Total Calories</span>
                  <span className="text-2xl font-bold text-orange-600">{Math.round(dailyMeals.totals.calories)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold">Protein</p>
                    <p className="text-xl font-bold text-blue-600">{Math.round(dailyMeals.totals.protein)}g</p>
                    <p className="text-xs text-blue-600/70">Goal: 150g</p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <p className="text-xs text-green-700 font-semibold">Carbs</p>
                    <p className="text-xl font-bold text-green-600">{Math.round(dailyMeals.totals.carbs)}g</p>
                    <p className="text-xs text-green-600/70">Goal: 300g</p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                    <p className="text-xs text-red-700 font-semibold">Fats</p>
                    <p className="text-xl font-bold text-red-600">{Math.round(dailyMeals.totals.fats)}g</p>
                    <p className="text-xs text-red-600/70">Goal: 75g</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold mb-2">Macro Distribution</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700">Protein</span>
                        <span className="font-bold text-blue-600">{((dailyMeals.totals.protein * 4 / dailyMeals.totals.calories) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${((dailyMeals.totals.protein * 4 / dailyMeals.totals.calories) * 100).toFixed(0)}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && weeklyMeals && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-green-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Trends</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Daily Calories</p>
                  <div className="flex items-end justify-between gap-2 h-32 bg-gray-50 rounded-2xl p-4">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = date.toISOString().split("T")[0];
                      const cal = weeklyMeals[dateStr]?.totals.calories || 0;
                      const maxCal = 3000;
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="relative w-full h-full flex items-end justify-center">
                            <div
                              className="w-full bg-gradient-to-t from-green-400 to-green-500 rounded-t-lg transition-all"
                              style={{height: `${(cal / maxCal) * 100}%`, minHeight: cal > 0 ? "8px" : "0px"}}
                            />
                          </div>
                          <p className="text-xs text-gray-600 font-semibold mt-1">
                            {cal > 0 ? Math.round(cal) : "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(dateStr).toLocaleDateString("en-US", {weekday: "short"})}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <p className="text-xs text-green-700 font-semibold">Avg Daily</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(
                        [0,1,2,3,4,5,6].reduce((sum, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - i));
                          const dateStr = date.toISOString().split("T")[0];
                          return sum + (weeklyMeals[dateStr]?.totals.calories || 0);
                        }, 0) / 7
                      )}
                    </p>
                    <p className="text-xs text-green-600/70">calories</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <p className="text-xs text-purple-700 font-semibold">Streak</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {[0,1,2,3,4,5,6].filter(i => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dateStr = date.toISOString().split("T")[0];
                        return (weeklyMeals[dateStr]?.totals.calories || 0) > 0;
                      }).length}
                    </p>
                    <p className="text-xs text-purple-600/70">days logged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Food</h2>
              <button
                onClick={() => setShowAddFood(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!selectedFood ? (
              <>
                <div className="relative mb-4">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  {filteredFoods.slice(0, 20).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition"
                    >
                      <p className="font-medium text-gray-900">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {food.per_100g.calories}cal / 100g • P:
                        {food.per_100g.protein}g C:{food.per_100g.carbs}g F:
                        {food.per_100g.fats}g
                      </p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedFood.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedFood.category}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setQuantity(Math.max(10, quantity - 10))
                        }
                        className="px-3 py-2 bg-gray-200 rounded-lg font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 10)}
                        className="px-3 py-2 bg-gray-200 rounded-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <div className="flex gap-2">
                      {selectedFood.units_available.map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setSelectedUnit(unit)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedUnit === unit
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {macros && (
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Nutritional Info
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-orange-500">
                            {macros.calories}
                          </p>
                          <p className="text-xs text-gray-600">Cal</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-500">
                            {macros.protein}g
                          </p>
                          <p className="text-xs text-gray-600">P</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-500">
                            {macros.carbs}g
                          </p>
                          <p className="text-xs text-gray-600">C</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-500">
                            {macros.fats}g
                          </p>
                          <p className="text-xs text-gray-600">F</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddFood}
                      disabled={addMealMutation.isPending}
                      className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                    >
                      Add to {selectedMealType}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTracker;
