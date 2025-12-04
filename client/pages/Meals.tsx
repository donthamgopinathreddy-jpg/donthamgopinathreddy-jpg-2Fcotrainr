import { useState, useMemo } from "react";
import {
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  TrendingUp,
  Flame,
  Apple,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MealEntry {
  id: string;
  name: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "snacks" | "dinner";
}

interface FoodInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  inputType: "weight" | "quantity";
  unitName?: string;
  unitWeight?: number;
}

const FOOD_DATABASE: Record<string, FoodInfo> = {
  "chicken breast": {
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    inputType: "weight",
  },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, inputType: "weight" },
  oatmeal: {
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 6.9,
    inputType: "weight",
  },
  berries: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, inputType: "weight" },
  "greek yogurt": {
    calories: 59,
    protein: 10,
    carbs: 3.3,
    fat: 0.4,
    inputType: "weight",
  },
  eggs: {
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    inputType: "quantity",
    unitName: "per egg",
    unitWeight: 50,
  },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, inputType: "weight" },
  bread: {
    calories: 265,
    protein: 9,
    carbs: 49,
    fat: 3.3,
    inputType: "quantity",
    unitName: "per slice",
    unitWeight: 30,
  },
  banana: {
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    inputType: "quantity",
    unitName: "per banana",
    unitWeight: 120,
  },
  apple: {
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    inputType: "quantity",
    unitName: "per apple",
    unitWeight: 182,
  },
  salmon: {
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    inputType: "weight",
  },
  almonds: {
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    inputType: "quantity",
    unitName: "per handful",
    unitWeight: 30,
  },
  "sweet potato": {
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    inputType: "weight",
  },
  "peanut butter": {
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    inputType: "weight",
  },
  orange: {
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.3,
    inputType: "quantity",
    unitName: "per orange",
    unitWeight: 150,
  },
  carrot: {
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    inputType: "quantity",
    unitName: "per carrot",
    unitWeight: 61,
  },
  cheese: {
    calories: 402,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    inputType: "quantity",
    unitName: "per slice",
    unitWeight: 30,
  },
  broccoli: {
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    inputType: "weight",
  },
  spinach: {
    calories: 23,
    protein: 2.7,
    carbs: 3.6,
    fat: 0.4,
    inputType: "weight",
  },
  pasta: {
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    inputType: "weight",
  },
  tomato: {
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    inputType: "quantity",
    unitName: "per tomato",
    unitWeight: 123,
  },
  beef: {
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    inputType: "weight",
  },
  "green peas": {
    calories: 81,
    protein: 5.4,
    carbs: 14,
    fat: 0.4,
    inputType: "weight",
  },
  lentils: {
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    inputType: "weight",
  },
  chickpeas: {
    calories: 164,
    protein: 9,
    carbs: 27,
    fat: 3,
    inputType: "weight",
  },
};

const MEAL_TYPES = [
  { id: "breakfast", name: "Breakfast", icon: "☀️", time: "7:00 AM" },
  { id: "lunch", name: "Lunch", icon: "🌤️", time: "12:30 PM" },
  { id: "snacks", name: "Snacks", icon: "🍿", time: "3:00 PM" },
  { id: "dinner", name: "Dinner", icon: "🌙", time: "7:30 PM" },
] as const;

export default function MealsPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<"daily" | "weekly">("daily");
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "snacks" | "dinner"
  >("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("g");

  // Filter food database by search
  const foodResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return Object.keys(FOOD_DATABASE).filter((food) =>
      food.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate macros for selected food
  const selectedFoodData = selectedFood ? FOOD_DATABASE[selectedFood] : null;
  const calculatedMacros = selectedFoodData
    ? {
        calories: Math.round(
          selectedFoodData.calories *
            (selectedFoodData.inputType === "weight" ? quantity : quantity)
        ),
        protein: (selectedFoodData.protein * quantity).toFixed(1),
        carbs: (selectedFoodData.carbs * quantity).toFixed(1),
        fat: (selectedFoodData.fat * quantity).toFixed(1),
      }
    : null;

  // Get meals for selected date
  const mealsForDate = meals.filter(
    (meal) =>
      meal.mealType === selectedMealType &&
      new Date(meal.id.split("-")[0]).toDateString() ===
        selectedDate.toDateString()
  );

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const dayMeals = meals.filter(
      (meal) =>
        new Date(meal.id.split("-")[0]).toDateString() ===
        selectedDate.toDateString()
    );
    return {
      calories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: dayMeals.reduce((sum, meal) => sum + meal.fat, 0),
    };
  }, [meals, selectedDate]);

  // Calculate weekly average
  const weeklyAverage = useMemo(() => {
    const today = new Date();
    const weekMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.id.split("-")[0]);
      const daysDiff = Math.floor(
        (today.getTime() - mealDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 7;
    });
    const daysWithMeals = new Set(
      weekMeals.map((m) => new Date(m.id.split("-")[0]).toDateString())
    ).size;
    return {
      calories: Math.round(
        weekMeals.reduce((sum, meal) => sum + meal.calories, 0) /
          Math.max(daysWithMeals, 1)
      ),
      protein: (
        weekMeals.reduce((sum, meal) => sum + meal.protein, 0) /
        Math.max(daysWithMeals, 1)
      ).toFixed(1),
    };
  }, [meals]);

  const handleAddFood = () => {
    if (!selectedFood || !calculatedMacros) {
      toast.error("Please select a food item");
      return;
    }

    const newMeal: MealEntry = {
      id: `${selectedDate.toISOString()}-${Math.random()}`,
      name: selectedFood,
      weight: quantity,
      calories: calculatedMacros.calories,
      protein: parseFloat(calculatedMacros.protein),
      carbs: parseFloat(calculatedMacros.carbs),
      fat: parseFloat(calculatedMacros.fat),
      mealType: selectedMealType,
    };

    setMeals([...meals, newMeal]);
    setShowAddFood(false);
    setSearchQuery("");
    setSelectedFood(null);
    setQuantity(1);
    toast.success(`${selectedFood} added to ${selectedMealType}!`);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-black text-gray-900">Meal Tracker</h1>
        </div>

        {/* View Toggle */}
        <div className="px-5 pb-4 flex gap-2">
          <button
            onClick={() => setViewType("daily")}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
              viewType === "daily"
                ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewType("weekly")}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
              viewType === "weekly"
                ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {viewType === "daily" && (
        <div className="px-5 py-6 space-y-6">
          {/* Date Selector */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </p>
              <p className="text-2xl font-black text-gray-900">
                {formatDate(selectedDate)}
              </p>
            </div>
            <button
              onClick={nextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Meal Cards */}
          <div className="space-y-3">
            {MEAL_TYPES.map((mealType) => {
              const mealItems = meals.filter(
                (meal) =>
                  meal.mealType === mealType.id &&
                  new Date(meal.id.split("-")[0]).toDateString() ===
                    selectedDate.toDateString()
              );

              const mealTotals = {
                calories: mealItems.reduce((sum, m) => sum + m.calories, 0),
                protein: mealItems.reduce((sum, m) => sum + m.protein, 0),
                carbs: mealItems.reduce((sum, m) => sum + m.carbs, 0),
                fat: mealItems.reduce((sum, m) => sum + m.fat, 0),
              };

              return (
                <button
                  key={mealType.id}
                  onClick={() => {
                    setSelectedMealType(
                      mealType.id as
                        | "breakfast"
                        | "lunch"
                        | "snacks"
                        | "dinner"
                    );
                    setShowAddFood(true);
                  }}
                  className="group relative w-full rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-102 active:scale-95 text-left"
                >
                  {/* Glassmorphism Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-yellow-400/20 to-pink-400/20 backdrop-blur-xl" />
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

                  {/* Content */}
                  <div className="relative p-5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {mealType.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {mealType.time}
                        </p>
                      </div>
                      <span className="text-2xl">{mealType.icon}</span>
                    </div>

                    {mealItems.length > 0 ? (
                      <div className="space-y-1 pt-2 border-t border-white/20">
                        <p className="text-sm font-black text-orange-600">
                          {mealTotals.calories} kcal
                        </p>
                        <p className="text-xs text-gray-600">
                          P: {mealTotals.protein.toFixed(1)}g • C:{" "}
                          {mealTotals.carbs.toFixed(1)}g • F:{" "}
                          {mealTotals.fat.toFixed(1)}g
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic pt-2">
                        No items yet
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Daily Summary */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-orange-400/20 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Daily Summary
                </p>
                <p className="text-xs text-gray-600">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {dailyTotals.calories > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-orange-600">
                      {dailyTotals.calories}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Calories</p>
                  </div>
                  <div className="bg-white/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-600">
                      {dailyTotals.protein.toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Protein</p>
                  </div>
                  <div className="bg-white/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-green-600">
                      {dailyTotals.carbs.toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Carbs</p>
                  </div>
                  <div className="bg-white/40 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-rose-600">
                      {dailyTotals.fat.toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Fat</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No meals logged yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {viewType === "weekly" && (
        <div className="px-5 py-6 space-y-6">
          {/* Weekly Chart */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Weekly Overview
                </p>
                <p className="text-xs text-gray-600">Last 7 days</p>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-between h-40 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - day));
                  const dayMeals = meals.filter(
                    (meal) =>
                      new Date(meal.id.split("-")[0]).toDateString() ===
                      date.toDateString()
                  );
                  const dayCalories = dayMeals.reduce(
                    (sum, meal) => sum + meal.calories,
                    0
                  );
                  const maxHeight = 200;
                  const barHeight = Math.max(
                    (dayCalories / 2500) * maxHeight,
                    10
                  );

                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-orange-400 to-yellow-400 rounded-t-xl transition-all hover:shadow-lg"
                        style={{ height: `${barHeight}px` }}
                      />
                      <p className="text-xs text-gray-600 mt-2 font-semibold">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Weekly Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-600">
                    {weeklyAverage.calories}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Avg Calories
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-600">
                    {weeklyAverage.protein}g
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Avg Protein
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Bottom Sheet */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Add Food to{" "}
                {MEAL_TYPES.find((m) => m.id === selectedMealType)?.name}
              </h2>
              <button
                onClick={() => {
                  setShowAddFood(false);
                  setSearchQuery("");
                  setSelectedFood(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="px-5 py-6 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search foods (e.g. egg, rice, banana)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedFood(null);
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {!selectedFood ? (
                <>
                  {/* Food Results List */}
                  {searchQuery && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {foodResults.length > 0 ? (
                        foodResults.map((food) => {
                          const foodInfo = FOOD_DATABASE[food];
                          return (
                            <button
                              key={food}
                              onClick={() => setSelectedFood(food)}
                              className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 transition-all"
                            >
                              <p className="font-semibold text-gray-900 capitalize">
                                {food}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {foodInfo.calories} cal • P: {foodInfo.protein}
                                g • C: {foodInfo.carbs}g • F: {foodInfo.fat}g (
                                per 100g)
                              </p>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          No foods found
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Food Detail */}
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {selectedFood}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Nutritional values per 100g
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setQuantity(Math.max(1, quantity - 10))
                          }
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Minus size={20} className="text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="flex-1 text-center bg-white border border-gray-300 rounded-lg px-4 py-2 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 10)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Plus size={20} className="text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Unit Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Unit
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="cup">Cups</option>
                      </select>
                    </div>
                  </div>

                  {/* Macros Preview */}
                  {calculatedMacros && (
                    <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Macros Preview
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">Calories</p>
                          <p className="text-lg font-bold text-orange-600">
                            {calculatedMacros.calories}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">Protein</p>
                          <p className="text-lg font-bold text-blue-600">
                            {calculatedMacros.protein}g
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">Carbs</p>
                          <p className="text-lg font-bold text-green-600">
                            {calculatedMacros.carbs}g
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">Fat</p>
                          <p className="text-lg font-bold text-rose-600">
                            {calculatedMacros.fat}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Button */}
                  <button
                    onClick={handleAddFood}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 mt-4"
                  >
                    Add to {MEAL_TYPES.find((m) => m.id === selectedMealType)?.name}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setSelectedFood(null);
                      setSearchQuery("");
                    }}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                  >
                    Back to Search
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
