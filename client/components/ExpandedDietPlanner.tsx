import { Lock, Sparkles } from "lucide-react";
import { DietPreferences } from "@/hooks/useDietPreferences";

interface ExpandedDietPlannerProps {
  plan: "free" | "basic" | "premium";
  preferences: DietPreferences | null;
  dietGoal: string;
  setDietGoal: (v: string) => void;
  dietType: string;
  setDietType: (v: string) => void;
  likes: string;
  setLikes: (v: string) => void;
  dislikes: string;
  setDislikes: (v: string) => void;
  mustInclude: string;
  setMustInclude: (v: string) => void;
  allergens: string[];
  setAllergens: (v: string[]) => void;
  proteinTarget: number;
  setProteinTarget: (v: number) => void;
  carbsTarget: number;
  setCarbsTarget: (v: number) => void;
  fatsTarget: number;
  setFatsTarget: (v: number) => void;
  budgetFilter: string;
  setBudgetFilter: (v: string) => void;
  onGenerateMealPlan: () => void;
  onAskTrainer: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  showGeneratedMealPlan: boolean;
  weeklyMealPlan: any;
}

const ALLERGENS = [
  "dairy",
  "gluten",
  "nuts",
  "soy",
  "eggs",
  "shellfish",
  "wheat",
  "lactose-free",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ExpandedDietPlanner({
  plan,
  preferences,
  dietGoal,
  setDietGoal,
  dietType,
  setDietType,
  likes,
  setLikes,
  dislikes,
  setDislikes,
  mustInclude,
  setMustInclude,
  allergens,
  setAllergens,
  proteinTarget,
  setProteinTarget,
  carbsTarget,
  setCarbsTarget,
  fatsTarget,
  setFatsTarget,
  budgetFilter,
  setBudgetFilter,
  onGenerateMealPlan,
  onAskTrainer,
  onSave,
  isSaving,
  showGeneratedMealPlan,
  weeklyMealPlan,
}: ExpandedDietPlannerProps) {
  const handleAllergenToggle = (allergen: string) => {
    setAllergens(
      allergens.includes(allergen)
        ? allergens.filter((a) => a !== allergen)
        : [...allergens, allergen],
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. GOAL SELECTOR */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          1️⃣ Fitness Goal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "lose_fat", label: "Lose Fat", emoji: "📉" },
            { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
            { id: "maintain", label: "Maintain", emoji: "⚖️" },
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => setDietGoal(goal.id)}
              className={`p-4 rounded-xl transition-all border-2 flex items-center gap-3 ${
                dietGoal === goal.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-600"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-orange-500"
              }`}
            >
              <span className="text-2xl">{goal.emoji}</span>
              <span className="font-semibold">{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. DIET TYPE */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          2️⃣ Diet Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: "veg", label: "Vegetarian", emoji: "🥬" },
            { id: "non_veg", label: "Non-Vegetarian", emoji: "🍗" },
            { id: "vegan", label: "Vegan", emoji: "🌱" },
            { id: "custom", label: "Custom", emoji: "⚙️" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setDietType(type.id)}
              className={`p-4 rounded-xl transition-all border-2 flex items-center gap-3 ${
                dietType === type.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-600"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-orange-500"
              }`}
            >
              <span className="text-2xl">{type.emoji}</span>
              <span className="font-semibold text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. FOOD PREFERENCES */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          3️⃣ Food Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Likes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Foods You Like
            </label>
            <textarea
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="e.g., Chicken, Rice, Broccoli..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none h-24"
            />
          </div>

          {/* Dislikes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Foods to Avoid
            </label>
            <textarea
              value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              placeholder="e.g., Mushrooms, Olives..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none h-24"
            />
          </div>

          {/* Must Include */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Must Include
            </label>
            <textarea
              value={mustInclude}
              onChange={(e) => setMustInclude(e.target.value)}
              placeholder="e.g., Protein sources, Greens..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none h-24"
            />
          </div>
        </div>
      </div>

      {/* 4. ALLERGENS (PREMIUM ONLY) */}
      <div
        className={`bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all ${
          plan !== "premium" ? "opacity-50 pointer-events-none relative" : ""
        }`}
      >
        {plan !== "premium" && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                🔒 Premium Feature
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          4️⃣ Allergens
          {plan !== "premium" && <Lock className="w-5 h-5 text-orange-500" />}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALLERGENS.map((allergen) => (
            <label
              key={allergen}
              className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-white/30 transition-all"
            >
              <input
                type="checkbox"
                checked={allergens.includes(allergen)}
                onChange={() => handleAllergenToggle(allergen)}
                className="w-5 h-5 rounded accent-orange-500 cursor-pointer"
                disabled={plan !== "premium"}
              />
              <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                {allergen}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. MACRO CUSTOMIZATION (PREMIUM ONLY) */}
      <div
        className={`bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all ${
          plan !== "premium" ? "opacity-50 pointer-events-none relative" : ""
        }`}
      >
        {plan !== "premium" && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                �� Premium Feature
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          5️⃣ Macro Customization
          {plan !== "premium" && <Lock className="w-5 h-5 text-orange-500" />}
        </h3>
        <div className="space-y-6">
          {/* Protein */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Protein (g)
              </label>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {proteinTarget}g
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              disabled={plan !== "premium"}
            />
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Carbs (g)
              </label>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {carbsTarget}g
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={carbsTarget}
              onChange={(e) => setCarbsTarget(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              disabled={plan !== "premium"}
            />
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fats (g)
              </label>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {fatsTarget}g
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={fatsTarget}
              onChange={(e) => setFatsTarget(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              disabled={plan !== "premium"}
            />
          </div>

          {/* Summary */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/50">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>Total Daily Calories:</strong>{" "}
              {Math.round(proteinTarget * 4 + carbsTarget * 4 + fatsTarget * 9)}{" "}
              kcal
            </p>
          </div>
        </div>
      </div>

      {/* 6. BUDGET FILTER (PREMIUM ONLY) */}
      <div
        className={`bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all ${
          plan !== "premium" ? "opacity-50 pointer-events-none relative" : ""
        }`}
      >
        {plan !== "premium" && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                🔒 Premium Feature
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          6️⃣ Budget Filter
          {plan !== "premium" && <Lock className="w-5 h-5 text-orange-500" />}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "low", label: "Low Budget", emoji: "💰" },
            { id: "medium", label: "Medium Budget", emoji: "💸" },
            { id: "high", label: "High Budget", emoji: "💎" },
          ].map((budget) => (
            <button
              key={budget.id}
              onClick={() => setBudgetFilter(budget.id)}
              disabled={plan !== "premium"}
              className={`p-4 rounded-xl transition-all border-2 flex items-center gap-3 ${
                budgetFilter === budget.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-600"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-orange-500"
              }`}
            >
              <span className="text-2xl">{budget.emoji}</span>
              <span className="font-semibold">{budget.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. WEEKLY PLAN GENERATOR (PREMIUM ONLY) */}
      <div
        className={`bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all ${
          plan !== "premium" ? "opacity-50 pointer-events-none relative" : ""
        }`}
      >
        {plan !== "premium" && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-xl">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                🔒 Premium Feature
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          7️⃣ Weekly Plan Generator
          {plan !== "premium" && <Lock className="w-5 h-5 text-orange-500" />}
        </h3>
        <button
          onClick={onGenerateMealPlan}
          disabled={plan !== "premium"}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate 7-Day Meal Plan
        </button>
      </div>

      {/* Generated Meal Plan Display */}
      {showGeneratedMealPlan && weeklyMealPlan && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            📅 Your 7-Day Meal Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyMealPlan.map((day: any, idx: number) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800/50"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                  {day.day}
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>🍳 Breakfast:</strong> {day.meals.breakfast}
                  </p>
                  <p>
                    <strong>🥗 Lunch:</strong> {day.meals.lunch}
                  </p>
                  <p>
                    <strong>🍎 Snack:</strong> {day.meals.snack}
                  </p>
                  <p>
                    <strong>🍽️ Dinner:</strong> {day.meals.dinner}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? "Saving..." : "💾 Save Preferences"}
        </button>

        {plan === "premium" && (
          <button
            onClick={onAskTrainer}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            👨‍🏫 Ask Trainer to Review
          </button>
        )}
      </div>
    </div>
  );
}
