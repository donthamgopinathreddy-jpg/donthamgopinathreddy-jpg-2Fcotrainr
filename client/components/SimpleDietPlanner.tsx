import React, { useState } from "react";
import { Sparkles, Plus, X } from "lucide-react";

interface SimpleDietPlannerProps {
  plan: "free" | "basic" | "premium";
}

export default function SimpleDietPlanner({ plan }: SimpleDietPlannerProps) {
  const [goal, setGoal] = useState("Maintain");
  const [dietTypes, setDietTypes] = useState<string[]>([]);
  const [calories, setCalories] = useState(2000);
  const [generatedMeals, setGeneratedMeals] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const goals = ["Lose Fat", "Build Muscle", "Maintain"];
  const diets = ["Veg", "Non-Veg", "Vegan", "High-Protein", "Keto"];

  const toggleDiet = (diet: string) => {
    setDietTypes((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const generateMeals = async () => {
    setLoading(true);
    // Simulate meal generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mealSuggestions = {
      breakfast: {
        veg: "Vegetable Oats with Berries",
        "non_veg": "Egg & Chicken Scramble",
        vegan: "Oatmeal with Almond Milk",
        "high_protein": "Protein Pancakes",
        keto: "Eggs & Avocado",
      },
      lunch: {
        veg: "Paneer Curry with Rice",
        "non_veg": "Grilled Chicken with Rice",
        vegan: "Lentil Curry with Rice",
        "high_protein": "Protein-Rich Salad",
        keto: "Grilled Fish with Veggies",
      },
      snack: {
        veg: "Greek Yogurt",
        "non_veg": "Boiled Eggs",
        vegan: "Roasted Chickpeas",
        "high_protein": "Protein Bar",
        keto: "Nuts & Cheese",
      },
      dinner: {
        veg: "Vegetable Stew with Roti",
        "non_veg": "Salmon with Vegetables",
        vegan: "Bean Soup with Bread",
        "high_protein": "Lean Meat with Veggies",
        keto: "Steak with Salad",
      },
    };

    // Select meals based on diet type
    const activeDiet =
      dietTypes.length > 0
        ? dietTypes[0].toLowerCase().replace(" ", "_")
        : "veg";

    const meals = {
      breakfast:
        mealSuggestions.breakfast[activeDiet as keyof typeof mealSuggestions.breakfast] ||
        "Oats with Berries",
      lunch:
        mealSuggestions.lunch[activeDiet as keyof typeof mealSuggestions.lunch] ||
        "Rice with Curry",
      snack:
        mealSuggestions.snack[activeDiet as keyof typeof mealSuggestions.snack] ||
        "Healthy Snack",
      dinner:
        mealSuggestions.dinner[activeDiet as keyof typeof mealSuggestions.dinner] ||
        "Dinner Bowl",
    };

    setGeneratedMeals({
      goal,
      dietTypes: dietTypes.length > 0 ? dietTypes : ["Mixed"],
      calories,
      meals,
      protein: Math.round(calories * 0.3 / 4),
      carbs: Math.round(calories * 0.4 / 4),
      fats: Math.round(calories * 0.3 / 9),
    });

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Goal Selection */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          🎯 Fitness Goal
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`py-2 px-3 rounded-lg font-medium transition-all text-sm border-2 ${
                goal === g
                  ? "bg-orange-500 text-white border-orange-600 shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:border-orange-400"
              }`}
            >
              {g === "Lose Fat" && "📉"}
              {g === "Build Muscle" && "💪"}
              {g === "Maintain" && "⚖️"} {g}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Type Selection */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          🍽️ Diet Type (Select Any)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {diets.map((diet) => (
            <button
              key={diet}
              onClick={() => toggleDiet(diet)}
              className={`py-2 px-3 rounded-lg font-medium transition-all text-sm border-2 ${
                dietTypes.includes(diet)
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {diet}
              {dietTypes.includes(diet) && (
                <span className="ml-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie Target */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            🔥 Daily Calories
          </h3>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {calories}
          </span>
        </div>
        <input
          type="range"
          min="1200"
          max="3500"
          value={calories}
          onChange={(e) => setCalories(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1200</span>
          <span>3500</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateMeals}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Generating Your Meal Plan..." : "Generate Your Meal Plan"}
      </button>

      {/* Generated Meal Plan */}
      {generatedMeals && (
        <div className="space-y-4 pt-4 border-t-2 border-orange-200 dark:border-orange-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ✨ Your Personalized Meal Plan
            </h3>
            <button
              onClick={() => setGeneratedMeals(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-900/50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Goal</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {generatedMeals.goal}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Diet Type
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {generatedMeals.dietTypes.join(", ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {generatedMeals.calories}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">kcal</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {generatedMeals.protein}g
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  protein
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {generatedMeals.carbs}g
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">carbs</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {generatedMeals.fats}g
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">fats</p>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {["breakfast", "lunch", "snack", "dinner"].map((mealType) => (
              <div
                key={mealType}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {mealType === "breakfast" && "🍳"}
                      {mealType === "lunch" && "🍽️"}
                      {mealType === "snack" && "🥗"}
                      {mealType === "dinner" && "🍲"}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {mealType}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {generatedMeals.meals[mealType]}
                      </p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="py-2 px-4 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold rounded-lg border-2 border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
              Save Plan
            </button>
            <button className="py-2 px-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all">
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
