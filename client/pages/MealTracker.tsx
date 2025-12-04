import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search } from "lucide-react";
import { useMeals } from "@/hooks/useMeals";
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
    useMeals();

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
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full"
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
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {meal.quantity}
                              {meal.unit} • {meal.calories}cal
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal.id!)}
                            className="p-1 hover:bg-red-100 rounded-lg transition text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No items yet</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Summary */}
        {dailyMeals && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 rounded-t-3xl">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {Math.round(dailyMeals.totals.calories)}
                </p>
                <p className="text-xs text-gray-600">Calories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(dailyMeals.totals.protein)}g
                </p>
                <p className="text-xs text-gray-600">Protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {Math.round(dailyMeals.totals.carbs)}g
                </p>
                <p className="text-xs text-gray-600">Carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {Math.round(dailyMeals.totals.fats)}g
                </p>
                <p className="text-xs text-gray-600">Fats</p>
              </div>
            </div>
          </div>
        )}

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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
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

  return null;
};

export default MealTracker;
