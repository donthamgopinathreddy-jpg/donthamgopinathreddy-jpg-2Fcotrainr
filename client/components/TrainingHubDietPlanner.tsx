import React, { useState } from "react";
import { Sparkles, X, Plus } from "lucide-react";
import { useDietPlanGenerator, type DietPreferences, type MealPlan } from "@/hooks/useDietPlanGenerator";

interface TrainingHubDietPlannerProps {
  plan: "free" | "basic" | "premium";
}

const DIET_TYPES = ["Veg", "Non-Veg", "Vegan", "High-Protein", "Keto", "Custom"];
const ALLERGENS = ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Wheat", "Shellfish", "Sesame"];
const BUDGETS = ["Low", "Medium", "High"];
const CULTURAL_PREFS = ["South Indian", "North Indian", "Western"];

export default function TrainingHubDietPlanner({ plan }: TrainingHubDietPlannerProps) {
  const { generateMealPlan, generateWeeklyPlan, loading, error } = useDietPlanGenerator();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [showForm, setShowForm] = useState(true);

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

  const [foodLikes, setFoodLikes] = useState("");
  const [foodDislikes, setFoodDislikes] = useState("");
  const [foodMustInclude, setFoodMustInclude] = useState("");
  const [cultural, setCultural] = useState("");
  const [otherAllergen, setOtherAllergen] = useState("");

  const handleDietTypeToggle = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      dietTypes: prev.dietTypes.includes(type)
        ? prev.dietTypes.filter((t) => t !== type)
        : [...prev.dietTypes, type],
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setPreferences((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const handleGenerateMeal = async () => {
    const updatedPrefs: DietPreferences = {
      ...preferences,
      preferredFoods: foodLikes.split(",").map((f) => f.trim()).filter((f) => f),
      dislikedFoods: foodDislikes.split(",").map((f) => f.trim()).filter((f) => f),
      mustIncludeFoods: foodMustInclude.split(",").map((f) => f.trim()).filter((f) => f),
    };

    if (otherAllergen) {
      updatedPrefs.allergens = [...updatedPrefs.allergens, otherAllergen];
    }

    const plan = await generateMealPlan(updatedPrefs);
    if (plan) {
      setMealPlan(plan);
      setShowForm(false);
    }
  };

  const MealCard = ({ meal, label }: { meal: any; label: string }) => {
    if (!meal) return null;
    return (
      <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800/50">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-gray-900 dark:text-white">{meal.name}</h4>
          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
            {label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <div className="font-bold text-orange-600 dark:text-orange-400">{meal.calories || 0}</div>
            <div className="text-gray-600 dark:text-gray-400">kcal</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <div className="font-bold text-red-600 dark:text-red-400">{meal.protein_g || 0}g</div>
            <div className="text-gray-600 dark:text-gray-400">protein</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <div className="font-bold text-blue-600 dark:text-blue-400">{meal.carbs_g || 0}g</div>
            <div className="text-gray-600 dark:text-gray-400">carbs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded">
            <div className="font-bold text-yellow-600 dark:text-yellow-400">{meal.fats_g || 0}g</div>
            <div className="text-gray-600 dark:text-gray-400">fats</div>
          </div>
        </div>
        {meal.prep_time_minutes && (
          <p className="text-xs text-gray-600 dark:text-gray-400">⏱️ {meal.prep_time_minutes} min</p>
        )}
      </div>
    );
  };

  if (!showForm && mealPlan) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">✨ Your Meal Plan</h3>
          <button onClick={() => setShowForm(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-900/50">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-orange-700 dark:text-orange-300">{mealPlan.totals.calories}</p>
              <p className="text-gray-600 dark:text-gray-400">kcal</p>
            </div>
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">{mealPlan.totals.protein.toFixed(0)}g</p>
              <p className="text-gray-600 dark:text-gray-400">protein</p>
            </div>
            <div>
              <p className="font-bold text-blue-700 dark:text-blue-300">{mealPlan.totals.carbs.toFixed(0)}g</p>
              <p className="text-gray-600 dark:text-gray-400">carbs</p>
            </div>
            <div>
              <p className="font-bold text-yellow-700 dark:text-yellow-300">{mealPlan.totals.fats.toFixed(0)}g</p>
              <p className="text-gray-600 dark:text-gray-400">fats</p>
            </div>
          </div>
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MealCard meal={mealPlan.breakfast} label="Breakfast" />
          <MealCard meal={mealPlan.snack1} label="Snack 1" />
          <MealCard meal={mealPlan.lunch} label="Lunch" />
          <MealCard meal={mealPlan.snack2} label="Snack 2" />
          <MealCard meal={mealPlan.dinner} label="Dinner" />
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 px-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all"
        >
          Generate New Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
      {/* Goal */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">🎯 Goal</label>
        <div className="grid grid-cols-3 gap-2">
          {["Lose Fat", "Build Muscle", "Maintain"].map((goal) => (
            <button
              key={goal}
              onClick={() => setPreferences((prev) => ({ ...prev, goal: goal as any }))}
              className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all ${
                preferences.goal === goal
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Types */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">🍽️ Diet Types</label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleDietTypeToggle(type)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all ${
                preferences.dietTypes.includes(type)
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {type} {preferences.dietTypes.includes(type) && "✓"}
            </button>
          ))}
        </div>
      </div>

      {/* Calories */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs font-bold text-gray-900 dark:text-white">🔥 Daily Calories</label>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{preferences.dailyCalorieTarget}</span>
        </div>
        <input
          type="range"
          min="1200"
          max="3500"
          value={preferences.dailyCalorieTarget}
          onChange={(e) => setPreferences((prev) => ({ ...prev, dailyCalorieTarget: parseInt(e.target.value) }))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg accent-orange-500"
        />
      </div>

      {/* Food Preferences */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">❤️ Foods You Like</label>
        <input
          type="text"
          value={foodLikes}
          onChange={(e) => setFoodLikes(e.target.value)}
          placeholder="e.g., Chicken, Rice, Paneer"
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
        />
      </div>

      {/* Disliked Foods */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">😞 Foods to Avoid</label>
        <input
          type="text"
          value={foodDislikes}
          onChange={(e) => setFoodDislikes(e.target.value)}
          placeholder="e.g., Mushrooms, Olives"
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
        />
      </div>

      {/* Must Include */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">⭐ Must Include</label>
        <input
          type="text"
          value={foodMustInclude}
          onChange={(e) => setFoodMustInclude(e.target.value)}
          placeholder="e.g., Protein, Greens"
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
        />
      </div>

      {/* Cultural Preference */}
      <div>
        <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">🌍 Cultural Preference</label>
        <div className="grid grid-cols-3 gap-2">
          {CULTURAL_PREFS.map((pref) => (
            <button
              key={pref}
              onClick={() => setCultural(pref)}
              className={`py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all ${
                cultural === pref
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Allergens */}
      {plan === "premium" && (
        <div>
          <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">⚠️ Allergens</label>
          <div className="grid grid-cols-2 gap-1">
            {ALLERGENS.map((allergen) => (
              <label key={allergen} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={preferences.allergens.includes(allergen)}
                  onChange={() => handleAllergenToggle(allergen)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-gray-900 dark:text-white">{allergen}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            value={otherAllergen}
            onChange={(e) => setOtherAllergen(e.target.value)}
            placeholder="Other allergens"
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white text-xs mt-2"
          />
        </div>
      )}

      {/* Budget */}
      {plan === "premium" && (
        <div>
          <label className="text-xs font-bold text-gray-900 dark:text-white mb-2 block">💰 Budget</label>
          <div className="grid grid-cols-3 gap-2">
            {BUDGETS.map((budget) => (
              <button
                key={budget}
                onClick={() => setPreferences((prev) => ({ ...prev, budgetTier: budget as any }))}
                className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all ${
                  preferences.budgetTier === budget
                    ? "bg-orange-500 text-white border-orange-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                }`}
              >
                {budget}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs">{error}</div>}

      <button
        onClick={handleGenerateMeal}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? "Generating..." : "Generate Meal Plan"}
      </button>
    </div>
  );
}
