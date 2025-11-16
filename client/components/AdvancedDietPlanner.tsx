import React, { useState } from "react";
import { Plus, Lock, Sparkles } from "lucide-react";
import { useDietPlanGenerator, type DietPreferences, type MealPlan } from "@/hooks/useDietPlanGenerator";
import { Card } from "@/components/ui/card";

interface AdvancedDietPlannerProps {
  plan: "free" | "basic" | "premium";
}

const DIET_TYPES = ["Veg", "Non-Veg", "Vegan", "High-Protein", "Keto"];
const ALLERGENS = ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Wheat", "Shellfish", "Sesame"];
const GOALS = ["Lose Fat", "Build Muscle", "Maintain"];
const BUDGETS = ["Low", "Medium", "High"];

export default function AdvancedDietPlanner({ plan }: AdvancedDietPlannerProps) {
  const { generateMealPlan, loading, error } = useDietPlanGenerator();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  const [preferences, setPreferences] = useState<DietPreferences>({
    goal: "Maintain",
    dietTypes: [],
    preferredFoods: [],
    dislikedFoods: [],
    mustIncludeFoods: [],
    allergens: [],
    dailyCalorieTarget: 2000,
    proteinTarget: 150,
    carbsTarget: 200,
    fatsTarget: 65,
    budgetTier: "Medium",
  });

  const handleGeneratePlan = async () => {
    const generatedPlan = await generateMealPlan(preferences);
    if (generatedPlan) {
      setMealPlan(generatedPlan);
    }
  };

  const MealCard = ({ meal, label }: { meal: any; label: string }) => {
    if (!meal) return null;
    return (
      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 border border-orange-100 dark:border-orange-900/50 rounded-xl p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{meal.name}</h4>
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
            {label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="text-gray-600 dark:text-gray-400">
            <div className="font-bold text-orange-600 dark:text-orange-400">{meal.calories || 0}</div>
            <div>kcal</div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <div className="font-bold text-red-600 dark:text-red-400">{meal.protein_g || 0}g</div>
            <div>protein</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Goal Selection */}
      <div>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Fitness Goal</label>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => setPreferences((prev) => ({ ...prev, goal: goal as any }))}
              className={`p-2 rounded-lg transition-all text-sm font-medium border-2 ${
                preferences.goal === goal
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {goal === "Lose Fat" && "📉"}
              {goal === "Build Muscle" && "💪"}
              {goal === "Maintain" && "⚖️"}
              <span className="ml-1">{goal}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Diet Types Multi-Select */}
      <div>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Diet Type</label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  dietTypes: prev.dietTypes.includes(type)
                    ? prev.dietTypes.filter((t) => t !== type)
                    : [...prev.dietTypes, type],
                }))
              }
              className={`p-2 rounded-lg transition-all text-sm font-medium border-2 ${
                preferences.dietTypes.includes(type)
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie Target */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-bold text-gray-900 dark:text-white">Daily Calories</label>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{preferences.dailyCalorieTarget}</span>
        </div>
        <input
          type="range"
          min="1200"
          max="3500"
          value={preferences.dailyCalorieTarget}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              dailyCalorieTarget: parseInt(e.target.value),
            }))
          }
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Allergens - Premium */}
      <div className={plan !== "premium" ? "opacity-60 pointer-events-none" : ""}>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          Allergens {plan !== "premium" && <Lock className="w-4 h-4 text-orange-500" />}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ALLERGENS.map((allergen) => (
            <label
              key={allergen}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <input
                type="checkbox"
                checked={preferences.allergens.includes(allergen)}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    allergens: prev.allergens.includes(allergen)
                      ? prev.allergens.filter((a) => a !== allergen)
                      : [...prev.allergens, allergen],
                  }))
                }
                className="w-4 h-4 rounded accent-orange-500"
                disabled={plan !== "premium"}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{allergen}</span>
            </label>
          ))}
        </div>
        {plan !== "premium" && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">🔒 Upgrade to Premium</p>
        )}
      </div>

      {/* Budget - Premium */}
      <div className={plan !== "premium" ? "opacity-60 pointer-events-none" : ""}>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          Budget Tier {plan !== "premium" && <Lock className="w-4 h-4 text-orange-500" />}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map((budget) => (
            <button
              key={budget}
              onClick={() => setPreferences((prev) => ({ ...prev, budgetTier: budget as any }))}
              disabled={plan !== "premium"}
              className={`p-2 rounded-lg text-sm font-medium border-2 transition-all ${
                preferences.budgetTier === budget
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {budget === "Low" && "💰"}
              {budget === "Medium" && "💸"}
              {budget === "High" && "💎"}
            </button>
          ))}
        </div>
        {plan !== "premium" && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">🔒 Upgrade to Premium</p>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGeneratePlan}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Generating..." : "Generate Daily Meal Plan"}
      </button>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      {/* Generated Meal Plan */}
      {mealPlan && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-700 dark:text-orange-400">{mealPlan.totals.calories}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Total Calories</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-700 dark:text-red-400">{mealPlan.totals.protein.toFixed(0)}g</div>
              <div className="text-xs text-red-600 dark:text-red-400">Protein</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-white">Your Meals</h4>
            <MealCard meal={mealPlan.breakfast} label="Breakfast" />
            <MealCard meal={mealPlan.lunch} label="Lunch" />
            <MealCard meal={mealPlan.snack1} label="Snack 1" />
            <MealCard meal={mealPlan.snack2} label="Snack 2" />
            <MealCard meal={mealPlan.dinner} label="Dinner" />
          </div>
        </div>
      )}
    </div>
  );
}
