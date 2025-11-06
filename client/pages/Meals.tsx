import { useState } from "react";
import { Plus, Minus, TrendingUp } from "lucide-react";

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEMO_MEALS: MealEntry[] = [
  { id: "1", name: "Oatmeal with berries", calories: 350, protein: 12, carbs: 52, fat: 8 },
  { id: "2", name: "Chicken breast rice", calories: 520, protein: 45, carbs: 48, fat: 6 },
  { id: "3", name: "Greek yogurt", calories: 150, protein: 18, carbs: 10, fat: 5 },
];

export default function Meals() {
  const [meals, setMeals] = useState<MealEntry[]>(DEMO_MEALS);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

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

  const handleAddMeal = () => {
    if (!newFood.name || !newFood.calories) return;

    const meal: MealEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: Number(newFood.calories),
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fat: Number(newFood.fat) || 0,
    };

    setMeals([...meals, meal]);
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
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
                <span className="text-sm font-semibold text-orange-500">Calories</span>
                <span className="text-sm font-bold text-foreground">{totalCalories} / {calorieGoal}</span>
              </div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            {/* Protein Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-500">Protein</span>
                <span className="text-sm font-bold text-foreground">{totalProtein}g / {proteinGoal}g</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-500">Carbs</span>
                <span className="text-sm font-bold text-foreground">{totalCarbs}g / {carbsGoal}g</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fat Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-amber-500">Fat</span>
                <span className="text-sm font-bold text-foreground">{totalFat}g / {fatGoal}g</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-500"
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

              <input
                type="text"
                placeholder="Food name (e.g., Chicken Rice)"
                value={newFood.name}
                onChange={(e) => setNewFood((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <input
                type="number"
                placeholder="Calories"
                value={newFood.calories}
                onChange={(e) => setNewFood((prev) => ({ ...prev, calories: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={newFood.protein}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, protein: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={newFood.carbs}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, carbs: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="number"
                  placeholder="Fat (g)"
                  value={newFood.fat}
                  onChange={(e) => setNewFood((prev) => ({ ...prev, fat: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-2 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddFood(false)}
                  className="flex-1 bg-muted text-muted-foreground font-medium py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newFood.name || !newFood.calories}
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
