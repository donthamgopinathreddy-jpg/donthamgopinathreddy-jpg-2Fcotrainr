import { Lock, Plus } from "lucide-react";
import { useState } from "react";
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
  "sesame",
];

const DIET_TYPES = [
  { id: "veg", label: "Veg", emoji: "🥬" },
  { id: "non_veg", label: "Non-Veg", emoji: "🍗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "high_protein", label: "High-Protein", emoji: "💪" },
  { id: "keto", label: "Keto", emoji: "🥑" },
];

const FITNESS_GOALS = [
  { id: "lose_fat", label: "Lose Fat", emoji: "📉" },
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "maintain", label: "Maintain", emoji: "⚖️" },
];

const BUDGET_OPTIONS = [
  { id: "low", label: "Low", emoji: "💰" },
  { id: "medium", label: "Medium", emoji: "💸" },
  { id: "high", label: "High", emoji: "💎" },
];

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
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>(
    dietType ? [dietType] : []
  );

  const handleDietTypeToggle = (type: string) => {
    const updated = selectedDietTypes.includes(type)
      ? selectedDietTypes.filter((t) => t !== type)
      : [...selectedDietTypes, type];
    setSelectedDietTypes(updated);
    // For now keep single select behavior, but updated to support multi
    setDietType(updated[updated.length - 1] || "");
  };

  const handleAllergenToggle = (allergen: string) => {
    setAllergens(
      allergens.includes(allergen)
        ? allergens.filter((a) => a !== allergen)
        : [...allergens, allergen]
    );
  };

  return (
    <div className="space-y-6">
      {/* Fitness Goal */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Fitness Goal
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FITNESS_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setDietGoal(goal.id)}
              className={`p-3 rounded-xl transition-all border-2 text-center ${
                dietGoal === goal.id
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-orange-400"
              }`}
            >
              <div className="text-2xl mb-1">{goal.emoji}</div>
              <div className="text-xs font-semibold">{goal.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Diet Types - Multi-Select */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            2
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Diet Type (Multi-Select)
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIET_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleDietTypeToggle(type.id)}
              className={`p-3 rounded-xl transition-all border-2 text-center ${
                selectedDietTypes.includes(type.id)
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-orange-400"
              }`}
            >
              <div className="text-xl mb-1">{type.emoji}</div>
              <div className="text-xs font-semibold">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Food Preferences */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            3
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Food Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Foods You Like
            </label>
            <textarea
              value={likes || ""}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="Chicken, Rice, Broccoli..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all resize-none h-20 text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Foods to Avoid
            </label>
            <textarea
              value={dislikes || ""}
              onChange={(e) => setDislikes(e.target.value)}
              placeholder="Mushrooms, Olives..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all resize-none h-20 text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Must Include
            </label>
            <textarea
              value={mustInclude || ""}
              onChange={(e) => setMustInclude(e.target.value)}
              placeholder="Protein, Greens..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all resize-none h-20 text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Allergens - Premium */}
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 transition-all ${
          plan !== "premium" ? "opacity-60" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            4
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Allergens
            {plan !== "premium" && (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ALLERGENS.map((allergen) => (
            <label
              key={allergen}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer ${
                plan === "premium"
                  ? "hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  : "cursor-not-allowed"
              }`}
            >
              <input
                type="checkbox"
                checked={allergens.includes(allergen)}
                onChange={() => handleAllergenToggle(allergen)}
                className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                disabled={plan !== "premium"}
              />
              <span className="text-sm capitalize font-medium text-gray-700 dark:text-gray-300">
                {allergen}
              </span>
            </label>
          ))}
        </div>

        {plan !== "premium" && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
              🔒 Upgrade to Premium to manage allergens
            </p>
          </div>
        )}
      </div>

      {/* Macro Targets - Premium */}
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 transition-all ${
          plan !== "premium" ? "opacity-60" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            5
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Macro Targets
            {plan !== "premium" && (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Protein
              </span>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold">
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Carbs
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fats
              </span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-bold">
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

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Daily Calories:{" "}
              <span className="text-orange-600 dark:text-orange-400 text-lg">
                {Math.round(proteinTarget * 4 + carbsTarget * 4 + fatsTarget * 9)}
              </span>{" "}
              kcal
            </p>
          </div>
        </div>

        {plan !== "premium" && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
              🔒 Upgrade to Premium to customize macros
            </p>
          </div>
        )}
      </div>

      {/* Budget - Premium */}
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 transition-all ${
          plan !== "premium" ? "opacity-60" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            6
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Budget Tier
            {plan !== "premium" && (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((budget) => (
            <button
              key={budget.id}
              onClick={() => setBudgetFilter(budget.id)}
              disabled={plan !== "premium"}
              className={`p-3 rounded-xl transition-all border-2 text-center ${
                budgetFilter === budget.id
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
              } ${plan === "premium" ? "hover:border-orange-400 cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div className="text-2xl mb-1">{budget.emoji}</div>
              <div className="text-xs font-semibold">{budget.label}</div>
            </button>
          ))}
        </div>

        {plan !== "premium" && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
              🔒 Upgrade to Premium to set budget
            </p>
          </div>
        )}
      </div>

      {/* Generated Meal Plan */}
      {showGeneratedMealPlan && weeklyMealPlan && (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📅 Your 7-Day Meal Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyMealPlan.slice(0, 4).map((day: any, idx: number) => (
              <div
                key={idx}
                className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  {day.day}
                </h4>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p>🍳 {day.meals.breakfast}</p>
                  <p>🥗 {day.meals.lunch}</p>
                  <p>🍎 {day.meals.snack}</p>
                  <p>🍽️ {day.meals.dinner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {isSaving ? "Saving..." : "💾 Save Preferences"}
        </button>

        {plan === "premium" && (
          <button
            onClick={onGenerateMealPlan}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Plan
          </button>
        )}

        {plan === "premium" && (
          <button
            onClick={onAskTrainer}
            className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:shadow-lg transition-all border-2 border-orange-200 dark:border-orange-900/50 text-sm"
          >
            👨‍🏫 Ask Trainer
          </button>
        )}
      </div>
    </div>
  );
}
