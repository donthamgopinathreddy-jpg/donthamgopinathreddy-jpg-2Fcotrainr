import { useState, useMemo } from "react";
import { Plus, Minus, TrendingUp, Sunrise, Apple, UtensilsCrossed, Moon, Clock, Settings } from "lucide-react";
import Logo from "@/components/Logo";
import { useMeals } from "@/hooks/useMeals";
import { toast } from "sonner";

interface MealEntry {
  id: string;
  name: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Food database with nutritional info per 100g or per unit
interface FoodInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  inputType: "weight" | "quantity"; // weight for grams, quantity for units
  unitName?: string; // e.g., "per egg", "per cup", "per slice"
  unitWeight?: number; // grams per unit, used to convert quantity to weight
}

const FOOD_DATABASE: Record<string, FoodInfo> = {
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, inputType: "weight" },
  "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, inputType: "weight" },
  "oatmeal": { calories: 389, protein: 17, carbs: 66, fat: 6.9, inputType: "weight" },
  "berries": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, inputType: "weight" },
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.3, fat: 0.4, inputType: "weight" },
  "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11, inputType: "quantity", unitName: "per egg", unitWeight: 50 },
  "milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, inputType: "weight" },
  "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.3, inputType: "quantity", unitName: "per slice", unitWeight: 30 },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, inputType: "quantity", unitName: "per banana", unitWeight: 120 },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, inputType: "quantity", unitName: "per apple", unitWeight: 182 },
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, inputType: "weight" },
  "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13, inputType: "weight" },
  "almonds": { calories: 579, protein: 21, carbs: 22, fat: 50, inputType: "quantity", unitName: "per handful", unitWeight: 30 },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, inputType: "weight" },
  "peanut butter": { calories: 588, protein: 25, carbs: 20, fat: 50, inputType: "weight" },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.3, inputType: "quantity", unitName: "per orange", unitWeight: 150 },
  "carrot": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, inputType: "quantity", unitName: "per carrot", unitWeight: 61 },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fat: 33, inputType: "quantity", unitName: "per slice", unitWeight: 30 },
  "butter": { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, inputType: "weight" },
  "honey": { calories: 304, protein: 0.3, carbs: 82, fat: 0, inputType: "weight" },
  "pasta": { calories: 131, protein: 5, carbs: 25, fat: 1.1, inputType: "weight" },
  "tomato": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, inputType: "quantity", unitName: "per tomato", unitWeight: 123 },
  "lettuce": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.3, inputType: "weight" },
  "chicken thigh": { calories: 209, protein: 26, carbs: 0, fat: 11, inputType: "weight" },
  "tuna": { calories: 144, protein: 30, carbs: 0, fat: 1.3, inputType: "weight" },
};

const DEMO_MEALS: MealEntry[] = [
  { id: "1", name: "Oatmeal with berries", weight: 250, calories: 350, protein: 12, carbs: 52, fat: 8 },
  { id: "2", name: "Chicken breast rice", weight: 300, calories: 520, protein: 45, carbs: 48, fat: 6 },
  { id: "3", name: "Greek yogurt", weight: 200, calories: 150, protein: 18, carbs: 10, fat: 5 },
];

// Function to find closest food match and calculate macros
const calculateMacrosFromFood = (foodName: string, inputValue: number, inputType: "weight" | "quantity" = "weight") => {
  const normalizedFood = foodName.toLowerCase().trim();

  // Try exact match first
  if (FOOD_DATABASE[normalizedFood]) {
    const food = FOOD_DATABASE[normalizedFood];
    let weightInGrams = inputValue;

    // If input is quantity and food has unitWeight, convert to grams
    if (inputType === "quantity" && food.inputType === "quantity" && food.unitWeight) {
      weightInGrams = inputValue * food.unitWeight;
    }

    const multiplier = weightInGrams / 100;
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      inputType: food.inputType,
      unitName: food.unitName,
    };
  }

  // Try partial match
  for (const [key, value] of Object.entries(FOOD_DATABASE)) {
    if (normalizedFood.includes(key) || key.includes(normalizedFood)) {
      let weightInGrams = inputValue;

      if (inputType === "quantity" && value.inputType === "quantity" && value.unitWeight) {
        weightInGrams = inputValue * value.unitWeight;
      }

      const multiplier = weightInGrams / 100;
      return {
        calories: Math.round(value.calories * multiplier),
        protein: Math.round(value.protein * multiplier * 10) / 10,
        carbs: Math.round(value.carbs * multiplier * 10) / 10,
        fat: Math.round(value.fat * multiplier * 10) / 10,
        inputType: value.inputType,
        unitName: value.unitName,
      };
    }
  }

  // Default values if not found
  return { calories: 0, protein: 0, carbs: 0, fat: 0, inputType: "weight", unitName: undefined };
};

const MEAL_TYPES = [
  { id: "early-breakfast", label: "Early Breakfast", icon: Sunrise, time: "6-7 AM" },
  { id: "mid-snack", label: "Mid-Morning Snack", icon: Apple, time: "10-11 AM" },
  { id: "lunch", label: "Lunch", icon: UtensilsCrossed, time: "12-2 PM" },
  { id: "afternoon-snack", label: "Afternoon Snack", icon: Apple, time: "4-5 PM" },
  { id: "dinner", label: "Dinner", icon: Moon, time: "7-9 PM" },
  { id: "evening-snack", label: "Evening Snack", icon: Clock, time: "9+ PM" },
];

export default function Meals() {
  const { meals, addMeal, deleteMeal, loading } = useMeals();
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodInfo | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");
  const [newFood, setNewFood] = useState({
    name: "",
    weight: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [addingMeal, setAddingMeal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goals, setGoals] = useState({
    calories: 2500,
    protein: 100,
    carbs: 300,
    fat: 80,
  });
  const [editGoals, setEditGoals] = useState({ ...goals });

  // Convert Supabase meals to local format for display
  const mealEntries = useMemo(() =>
    meals.map((meal) => ({
      id: meal.id,
      name: meal.food_name,
      weight: meal.weight_g,
      calories: meal.calories,
      protein: meal.protein_g,
      carbs: meal.carbs_g,
      fat: meal.fat_g,
      mealType: meal.meal_type || "snack",
    })),
    [meals]
  );

  // Group meals by type
  const mealsByType = useMemo(() => {
    const grouped: { [key: string]: typeof mealEntries } = {};
    MEAL_TYPES.forEach((type) => {
      grouped[type.id] = mealEntries.filter((m) => m.mealType === type.id);
    });
    return grouped;
  }, [mealEntries]);

  const totalCalories = mealEntries.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = mealEntries.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = mealEntries.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = mealEntries.reduce((sum, meal) => sum + meal.fat, 0);

  const calorieGoal = goals.calories;
  const proteinGoal = goals.protein;
  const carbsGoal = goals.carbs;
  const fatGoal = goals.fat;

  const handleSaveGoals = () => {
    setGoals({ ...editGoals });
    setShowGoalsModal(false);
    toast.success("Goals updated!");
  };

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

  const handleQuantityChange = (quantity: string) => {
    setNewFood((prev) => ({ ...prev, quantity }));

    // Auto-calculate macros if both food name and quantity are provided
    if (newFood.name && quantity && selectedFood) {
      const macros = calculateMacrosFromFood(newFood.name, Number(quantity), "quantity");
      setNewFood((prev) => ({
        ...prev,
        quantity,
        calories: String(macros.calories),
        protein: String(macros.protein),
        carbs: String(macros.carbs),
        fat: String(macros.fat),
      }));
    } else {
      setNewFood((prev) => ({ ...prev, quantity }));
    }
  };

  const handleWeightChange = (weight: string) => {
    setNewFood((prev) => ({ ...prev, weight }));

    // Auto-calculate macros if both food name and weight are provided
    if (newFood.name && weight && selectedFood?.inputType === "weight") {
      const macros = calculateMacrosFromFood(newFood.name, Number(weight), "weight");
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
    const foodData = FOOD_DATABASE[food.toLowerCase()];
    setSelectedFood(foodData);
    setNewFood((prev) => ({ ...prev, name: food, quantity: "", weight: "" }));
    setSuggestions([]);
  };

  const handleAddMeal = async () => {
    if (!newFood.name) return;

    let inputValue = 0;
    let inputType: "weight" | "quantity" = "weight";

    if (selectedFood?.inputType === "quantity") {
      if (!newFood.quantity) return;
      inputValue = Number(newFood.quantity);
      inputType = "quantity";
    } else {
      if (!newFood.weight) return;
      inputValue = Number(newFood.weight);
      inputType = "weight";
    }

    const macros = calculateMacrosFromFood(newFood.name, inputValue, inputType);

    const actualWeight = selectedFood?.inputType === "quantity" && selectedFood.unitWeight
      ? Number(newFood.quantity) * selectedFood.unitWeight
      : Number(newFood.weight);

    setAddingMeal(true);
    try {
      await addMeal({
        food_name: newFood.name,
        weight_g: actualWeight,
        calories: macros.calories,
        protein_g: macros.protein,
        carbs_g: macros.carbs,
        fat_g: macros.fat,
        meal_type: selectedMealType,
      });

      toast.success("Meal added!");
      setNewFood({ name: "", weight: "", quantity: "", calories: "", protein: "", carbs: "", fat: "" });
      setSelectedFood(null);
      setSuggestions([]);
      setShowAddFood(false);
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Failed to add meal");
    } finally {
      setAddingMeal(false);
    }
  };

  const removeMeal = async (id: string) => {
    try {
      await deleteMeal(id);
      toast.success("Meal deleted!");
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Failed to delete meal");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 l-shape-bg fitness-gradient-4">
      <div className="max-w-md mx-auto">
        {/* Logo Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
          <Logo size="sm" />
        </div>

        {/* Header */}
        <div className="sticky top-12 z-39 bg-white border-b border-gray-200 px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Meal Tracker</h1>
          <p className="text-gray-600 text-sm">Log your meals and track nutrition</p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Today's Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Today's Summary</h2>
              <button
                onClick={() => setEditGoals({ ...goals }) || setShowGoalsModal(true)}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
              >
                <Settings className="w-4 h-4" />
                Edit Goals
              </button>
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

          {/* Today's Meals - Grouped by Type */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-4">
              Today's Meals ({loading ? "..." : mealEntries.length})
            </h3>
            <div className="space-y-6">
              {MEAL_TYPES.map((mealType) => {
                const mealsOfType = mealsByType[mealType.id];
                return (
                  <div key={mealType.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <mealType.icon className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">
                          {mealType.label}
                        </h4>
                      </div>
                      <span className="text-xs text-muted-foreground">{mealType.time}</span>
                    </div>
                    {mealsOfType.length > 0 ? (
                      <div className="space-y-2">
                        {mealsOfType.map((meal) => (
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
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No meals logged</p>
                    )}
                  </div>
                );
              })}
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

              {/* Meal Type Selection */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Meal Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedMealType(type.id)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        selectedMealType === type.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background border border-border text-foreground hover:border-primary"
                      }`}
                      title={type.label}
                    >
                      {type.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

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
                    {suggestions.map((food) => {
                      const foodInfo = FOOD_DATABASE[food.toLowerCase()];
                      return (
                        <button
                          key={food}
                          onClick={() => handleSelectSuggestion(food)}
                          className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-foreground first:rounded-t-lg last:rounded-b-lg transition-colors capitalize"
                        >
                          <div className="flex justify-between items-center">
                            <span>{food}</span>
                            {foodInfo.inputType === "quantity" && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {foodInfo.unitName}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedFood && (
                selectedFood.inputType === "quantity" ? (
                  <input
                    type="number"
                    placeholder={`Quantity (${selectedFood.unitName})`}
                    value={newFood.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="Weight (grams)"
                    value={newFood.weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                )
              )}

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
                    setNewFood({ name: "", weight: "", quantity: "", calories: "", protein: "", carbs: "", fat: "" });
                    setSelectedFood(null);
                    setSuggestions([]);
                    setSelectedMealType("breakfast");
                  }}
                  className="flex-1 bg-muted text-muted-foreground font-medium py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newFood.name || (!newFood.weight && !newFood.quantity)}
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
