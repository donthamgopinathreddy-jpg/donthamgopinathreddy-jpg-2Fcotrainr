import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Flame, Egg, Wind, Droplet } from "lucide-react";
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
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const { data: dailyMeals, isLoading: loadingDaily } = useDailyMeals(
    currentDate,
    user?.id
  );
  const { data: weeklyMeals } = useWeeklyMeals(getWeekStartDate(), user?.id);
  const addMealMutation = useAddMeal();
  const deleteMealMutation = useDeleteMeal();

  // Load food database
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

  // Daily view
  if (view === "daily") {
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("weekly")}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition hover:bg-blue-100"
            >
              Weekly
            </button>
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
        </div>

        {/* Daily Macro Summary - Top Section */}
        {dailyMeals && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-b border-gray-300 p-5 sticky top-16 z-9 shadow-md">
            {/* Title */}
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              Today's Nutrition
            </h2>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Calories */}
              <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl p-4 border border-orange-300 group hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Calories</p>
                    <Flame size={14} className="opacity-70" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {Math.round(dailyMeals.totals.calories)}
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((dailyMeals.totals.calories / 2500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-80">2500 cal goal</p>
                </div>
              </div>

              {/* Protein */}
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl p-4 border border-blue-300 group hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Protein</p>
                    <Egg size={14} className="opacity-70" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {Math.round(dailyMeals.totals.protein)}g
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((dailyMeals.totals.protein / 150) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-80">150g goal</p>
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-3xl p-4 border border-emerald-300 group hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Carbs</p>
                    <Wind size={14} className="opacity-70" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {Math.round(dailyMeals.totals.carbs)}g
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((dailyMeals.totals.carbs / 300) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-80">300g goal</p>
                </div>
              </div>

              {/* Fats */}
              <div className="bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 rounded-3xl p-4 border border-rose-300 group hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Fats</p>
                    <Droplet size={14} className="opacity-70" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {Math.round(dailyMeals.totals.fats)}g
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((dailyMeals.totals.fats / 75) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs opacity-80">75g goal</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Meals */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-4 space-y-4">
            {["breakfast", "lunch", "snacks", "dinner"].map((mealType) => (
              <div
                key={mealType}
                className="bg-white rounded-3xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 capitalize">
                    {mealType}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType as any);
                      setShowAddFood(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition"
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
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400 font-medium">No items yet</p>
                    <p className="text-xs text-gray-400 mt-1">Tap Add to log your meal</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                  {/* Search */}
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

                  {/* Food List */}
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
                  {/* Food Details & Quantity Selector */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedFood.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedFood.category}
                      </p>
                    </div>

                    {/* Quantity Selector */}
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

                    {/* Unit Selector */}
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

                    {/* Macros Preview */}
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

                    {/* Action Buttons */}
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
  }

  // Weekly view
  if (view === "weekly") {
    const weekStart = getWeekStartDate();
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      weekDays.push(date.toISOString().split("T")[0]);
    }

    const weeklyData = weeklyMeals || {};
    const weeklyCalories = weekDays.map((day) => weeklyData[day]?.totals.calories || 0);
    const weeklyProtein = weekDays.map((day) => weeklyData[day]?.totals.protein || 0);
    const maxCalories = Math.max(...weeklyCalories, 2500);
    const avgCalories = weeklyCalories.reduce((a, b) => a + b, 0) / 7;
    const avgProtein = weeklyProtein.reduce((a, b) => a + b, 0) / 7;

    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900">Weekly Overview</h1>
            <p className="text-xs text-gray-600">
              {new Date(weekStart).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setView("daily")}
            className="text-xs font-medium text-orange-600 hover:text-orange-800 px-3 py-1 bg-orange-50 rounded-full"
          >
            Daily
          </button>
        </div>

        {/* Weekly Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Bar Chart */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Daily Calories</h2>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full h-full flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg transition-all hover:shadow-lg"
                      style={{
                        height: `${(weeklyCalories[i] / maxCalories) * 100}%`,
                        minHeight: weeklyCalories[i] > 0 ? "4px" : "0px",
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {weeklyCalories[i] > 0 ? Math.round(weeklyCalories[i]) : "—"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(day).toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Average Daily Calories</p>
              <p className="text-2xl font-bold text-orange-500">
                {Math.round(avgCalories)}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Average Daily Protein</p>
              <p className="text-2xl font-bold text-blue-500">{Math.round(avgProtein)}g</p>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Daily Breakdown</h2>
            <div className="space-y-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    setCurrentDate(day);
                    setView("daily");
                  }}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(day)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {weeklyData[day]?.totals.calories || 0}cal • P:
                      {Math.round(weeklyData[day]?.totals.protein || 0)}g
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MealTracker;
