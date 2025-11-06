import { useState } from "react";
import { Plus, Minus, TrendingUp } from "lucide-react";

interface MealEntry {
  id: string;
  name: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Food database with nutritional info per 100g
const FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "oatmeal": { calories: 389, protein: 17, carbs: 66, fat: 6.9 },
  "berries": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.3, fat: 0.4 },
  "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  "milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.3 },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13 },
  "almonds": { calories: 579, protein: 21, carbs: 22, fat: 50 },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  "peanut butter": { calories: 588, protein: 25, carbs: 20, fat: 50 },
};

const DEMO_MEALS: MealEntry[] = [
  { id: "1", name: "Oatmeal with berries", weight: 250, calories: 350, protein: 12, carbs: 52, fat: 8 },
  { id: "2", name: "Chicken breast rice", weight: 300, calories: 520, protein: 45, carbs: 48, fat: 6 },
  { id: "3", name: "Greek yogurt", weight: 200, calories: 150, protein: 18, carbs: 10, fat: 5 },
];

// Function to find closest food match and calculate macros
const calculateMacrosFromFood = (foodName: string, weight: number) => {
  const normalizedFood = foodName.toLowerCase().trim();

  // Try exact match first
  if (FOOD_DATABASE[normalizedFood]) {
    const food = FOOD_DATABASE[normalizedFood];
    const multiplier = weight / 100;
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    };
  }

  // Try partial match
  for (const [key, value] of Object.entries(FOOD_DATABASE)) {
    if (normalizedFood.includes(key) || key.includes(normalizedFood)) {
      const multiplier = weight / 100;
      return {
        calories: Math.round(value.calories * multiplier),
        protein: Math.round(value.protein * multiplier * 10) / 10,
        carbs: Math.round(value.carbs * multiplier * 10) / 10,
        fat: Math.round(value.fat * multiplier * 10) / 10,
      };
    }
  }

  // Default values if not found
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
};

export default function Meals() {
  const [meals, setMeals] = useState<MealEntry[]>(DEMO_MEALS);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    weight: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  const calorieGoal = 2500;
  const proteinGoal = 100;
  const carbsGoal = 300;
  const fatGoal = 80;

  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);
  const carbsPercent = Math.min((totalCarbs / carbsGoal) * 100, 100);
  const fatPercent = Math.min((totalFat / fatGoal) * 100, 100);

  const handleFoodNameChange = (name: string) => {
    setNewFood((prev) => ({ ...prev, name }));

    // Show suggestions
    if (name.length > 0) {
      const matches = Object.keys(FOOD_DATABASE).filter((food) =>
        food.includes(name.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleWeightChange = (weight: string) => {
    setNewFood((prev) => ({ ...prev, weight }));

    // Auto-calculate macros if both food name and weight are provided
    if (newFood.name && weight) {
      const macros = calculateMacrosFromFood(newFood.name, Number(weight));
      setNewFood((prev) => ({
        ...prev,
        weight,
        calories: String(macros.calories),
        protein: String(macros.protein),
        carbs: String(macros.carbs),
        fat: String(macros.fat),
      }));
    } else {
      setNewFood((prev) => ({ ...prev, weight }));
    }
  };

  const handleSelectSuggestion = (food: string) => {
    setNewFood((prev) => ({ ...prev, name: food }));
    setSuggestions([]);

    // Auto-calculate if weight is provided
    if (newFood.weight) {
      const macros = calculateMacrosFromFood(food, Number(newFood.weight));
      setNewFood((prev) => ({
        ...prev,
        name: food,
        calories: String(macros.calories),
        protein: String(macros.protein),
        carbs: String(macros.carbs),
        fat: String(macros.fat),
      }));
    }
  };

  const handleAddMeal = () => {
    if (!newFood.name || !newFood.weight) return;

    const weight = Number(newFood.weight);
    const macros = calculateMacrosFromFood(newFood.name, weight);

    const meal: MealEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      weight: weight,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
    };

    setMeals([...meals, meal]);
    setNewFood({ name: "", weight: "", calories: "", protein: "", carbs: "", fat: "" });
    setSuggestions([]);
    setShowAddFood(false);
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Meal Tracker</h1>
          <p className="text-gray-600 text-sm">Log your meals and track nutrition</p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Today's Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Today's Summary</h2>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            {/* Calories Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-orange-600">Calories</span>
                <span className="text-sm font-bold text-gray-900">{totalCalories} / {calorieGoal}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 transition-all duration-500 shadow-lg shadow-orange-600/50"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            {/* Protein Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-600">Protein</span>
                <span className="text-sm font-bold text-gray-900">{totalProtein}g / {proteinGoal}g</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-500 shadow-lg shadow-red-600/50"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-600">Carbs</span>
                <span className="text-sm font-bold text-gray-900">{totalCarbs}g / {carbsGoal}g</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500 shadow-lg shadow-blue-600/50"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fat Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-amber-600">Fat</span>
                <span className="text-sm font-bold text-gray-900">{totalFat}g / {fatGoal}g</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 transition-all duration-500 shadow-lg shadow-amber-600/50"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Today's Meals */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-3">Today's Meals ({meals.length})</h3>
            <div className="space-y-2">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{meal.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Weight: {meal.weight}g
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </p>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Food Section */}
          {!showAddFood ? (
            <button
              onClick={() => setShowAddFood(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Food
            </button>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-foreground">Add Meal</h3>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Food name (e.g., Chicken, Rice, Eggs)"
                  value={newFood.name}
                  onChange={(e) => handleFoodNameChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-border rounded-lg mt-1 shadow-lg">
                    {suggestions.map((food) => (
                      <button
                        key={food}
                        onClick={() => handleSelectSuggestion(food)}
                        className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-foreground first:rounded-t-lg last:rounded-b-lg transition-colors capitalize"
                      >
                        {food}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="number"
                placeholder="Weight (grams)"
                value={newFood.weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-900">Auto-calculated nutrition:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-blue-700 font-medium">{newFood.calories || "0"} cal</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">P: {newFood.protein || "0"}g</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">C: {newFood.carbs || "0"}g</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">F: {newFood.fat || "0"}g</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Type a food name and weight to auto-calculate nutrition. Can be manually edited.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={newFood.protein}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, protein: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={newFood.carbs}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, carbs: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />
                <input
                  type="number"
                  placeholder="Fat (g)"
                  value={newFood.fat}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, fat: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddFood(false);
                    setNewFood({ name: "", weight: "", calories: "", protein: "", carbs: "", fat: "" });
                    setSuggestions([]);
                  }}
                  className="flex-1 bg-muted text-muted-foreground font-medium py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newFood.name || !newFood.weight}
                  className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-sm"
                >
                  Save Meal
                </button>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg p-4 border border-green-500/20">
            <p className="text-xs text-muted-foreground">
              ✨ Meal tracking is <span className="font-bold text-green-500">FREE for all users!</span> No premium required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
