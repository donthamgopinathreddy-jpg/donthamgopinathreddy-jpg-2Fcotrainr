import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Flame, X } from "lucide-react";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];
  const mealIcons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "🍽️",
    snacks: "🥜",
    dinner: "🌙",
  };

  const mealColors: Record<string, { gradient: string; dark: string }> = {
    breakfast: { gradient: "from-orange-400 to-yellow-500", dark: "orange" },
    lunch: { gradient: "from-blue-400 to-cyan-500", dark: "blue" },
    snacks: { gradient: "from-purple-400 to-pink-500", dark: "purple" },
    dinner: { gradient: "from-indigo-400 to-blue-600", dark: "indigo" },
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-4 flex items-center justify-between sticky top-0 z-20 shadow-2xl">
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() - 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-slate-600 rounded-lg transition text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-white">
            {formatDate(currentDate)}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Swipe to browse meals</p>
        </div>
        <button
          onClick={() => setCurrentDate(
            new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )}
          className="p-2 hover:bg-slate-600 rounded-lg transition text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Macro Summary Bar */}
      {dailyMeals && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-4 shadow-lg">
          <div className="flex justify-between gap-2">
            <div className="flex-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Cal</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.calories)}</p>
              <p className="text-xs opacity-75">/ 2500</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Protein</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.protein)}g</p>
              <p className="text-xs opacity-75">/ 150g</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Carbs</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.carbs)}g</p>
              <p className="text-xs opacity-75">/ 300g</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Fats</p>
              <p className="text-xl font-bold">{Math.round(dailyMeals.totals.fats)}g</p>
              <p className="text-xs opacity-75">/ 75g</p>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Swiper */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 pt-4">
          <h2 className="text-lg font-bold text-white">Meals</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 hover:bg-slate-700 rounded-full transition text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 hover:bg-slate-700 rounded-full transition text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 p-4 overflow-x-auto snap-x snap-mandatory flex-1 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {mealTypes.map((mealType) => {
            const mealCalories = dailyMeals
              ? dailyMeals[mealType as keyof typeof dailyMeals].reduce((s, m) => s + (m.calories || 0), 0)
              : 0;
            const mealItems = dailyMeals?.[mealType as keyof typeof dailyMeals] || [];

            return (
              <div
                key={mealType}
                className="flex-shrink-0 w-80 snap-center"
              >
                <div className={`bg-gradient-to-br ${mealColors[mealType].gradient} rounded-3xl p-6 h-full shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20 flex flex-col`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-4xl">{mealIcons[mealType]}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-white capitalize">
                            {mealType}
                          </h3>
                          <p className="text-sm text-white/80 font-semibold">
                            {Math.round(mealCalories)} cal
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType as any);
                        setShowAddFood(true);
                      }}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition text-white backdrop-blur-sm"
                    >
                      <Plus size={24} />
                    </button>
                  </div>

                  {/* Macro Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                    <div className="text-center">
                      <p className="text-xs text-white/80 font-semibold">P</p>
                      <p className="text-lg font-bold text-white">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.protein || 0), 0)
                        )}g
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-white/20">
                      <p className="text-xs text-white/80 font-semibold">C</p>
                      <p className="text-lg font-bold text-white">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.carbs || 0), 0)
                        )}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/80 font-semibold">F</p>
                      <p className="text-lg font-bold text-white">
                        {Math.round(
                          mealItems.reduce((s, m) => s + (m.fats || 0), 0)
                        )}g
                      </p>
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {mealItems.length > 0 ? (
                      mealItems.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between group hover:bg-white/20 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-white/70">
                              {meal.quantity}{meal.unit} • {meal.calories}cal
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal.id!)}
                            className="p-1.5 hover:bg-red-500/50 rounded-lg transition text-white/80 hover:text-white ml-2 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-white/50 font-semibold">No items yet</p>
                        <p className="text-xs text-white/40 mt-1">Tap + to add food</p>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType as any);
                      setShowAddFood(true);
                    }}
                    className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition shadow-lg"
                  >
                    + Add Food
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Food</h2>
              <button
                onClick={() => setShowAddFood(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
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
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredFoods.slice(0, 30).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-yellow-50 rounded-2xl transition border border-gray-200 hover:border-orange-300"
                    >
                      <p className="font-bold text-gray-900">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {food.per_100g.calories}cal/100g • P:{food.per_100g.protein}g C:{food.per_100g.carbs}g F:{food.per_100g.fats}g
                      </p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedFood.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedFood.category}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() =>
                          setQuantity(Math.max(10, quantity - 10))
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                        className="flex-1 bg-transparent text-center text-2xl font-bold text-gray-900 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 10)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Unit
                    </label>
                    <div className="flex gap-2">
                      {selectedFood.units_available.map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setSelectedUnit(unit)}
                          className={`px-4 py-2 rounded-lg font-bold transition ${
                            selectedUnit === unit
                              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {macros && (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border-2 border-orange-200">
                      <p className="text-sm font-bold text-gray-900 mb-3">
                        Nutritional Info
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-lg font-bold text-orange-600">
                            {macros.calories}
                          </p>
                          <p className="text-xs text-gray-600">Cal</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-lg font-bold text-blue-600">
                            {macros.protein}g
                          </p>
                          <p className="text-xs text-gray-600">P</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-lg font-bold text-green-600">
                            {macros.carbs}g
                          </p>
                          <p className="text-xs text-gray-600">C</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-lg font-bold text-red-600">
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
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddFood}
                      disabled={addMealMutation.isPending}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
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
