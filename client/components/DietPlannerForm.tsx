import { useState } from "react";
import { DietPreferences } from "@/hooks/useDietPreferences";
import { Button } from "@/components/ui/button";

interface DietPlannerFormProps {
  plan: "free" | "basic" | "premium";
  preferences: DietPreferences | null;
  onOpenTrainerModal: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const ALLERGENS = [
  "dairy",
  "gluten",
  "nuts",
  "soy",
  "eggs",
  "shellfish",
  "wheat",
  "lactose",
];

export default function DietPlannerForm({
  plan,
  preferences,
  onOpenTrainerModal,
  onSave,
  isSaving,
}: DietPlannerFormProps) {
  const [goal, setGoal] = useState(preferences?.goal || "");
  const [dietType, setDietType] = useState(preferences?.diet_type || "");
  const [likes, setLikes] = useState((preferences?.likes || []).join(", "));
  const [dislikes, setDislikes] = useState((preferences?.dislikes || []).join(", "));
  const [allergens, setAllergens] = useState<string[]>(
    preferences?.allergies || [],
  );
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [budget, setBudget] = useState("");

  const handleAllergenToggle = (allergen: string) => {
    setAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen],
    );
  };

  const handleSave = async () => {
    await onSave();
  };

  return (
    <div className="space-y-6">
      {/* Basic Plan Fields - Available for Basic and Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Selector */}
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Fitness Goal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors"
          >
            <option value="">Select your goal</option>
            <option value="lose_fat">Lose Fat</option>
            <option value="build_muscle">Build Muscle</option>
            <option value="maintain">Maintain Weight</option>
          </select>
        </div>

        {/* Diet Type */}
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Diet Type
          </label>
          <select
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors"
          >
            <option value="">Select diet type</option>
            <option value="veg">Vegetarian</option>
            <option value="non_veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
      </div>

      {/* Likes and Dislikes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Foods You Like
          </label>
          <textarea
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
            rows={3}
            placeholder="e.g., Chicken, Rice, Broccoli..."
          />
        </div>
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Foods to Avoid
          </label>
          <textarea
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
            rows={3}
            placeholder="e.g., Mushrooms, Olives..."
          />
        </div>
      </div>

      {/* Premium Only Features */}
      {plan === "premium" && (
        <>
          {/* Allergens */}
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Allergens <span className="text-orange-500 font-bold">★ Premium</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ALLERGENS.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-white/20 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={allergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-5 h-5 rounded accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {allergen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Macro Targets (g){" "}
              <span className="text-orange-500 font-bold">★ Premium</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="250"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Fats (g)
                </label>
                <input
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  placeholder="70"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Budget Filter */}
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Daily Budget <span className="text-orange-500 font-bold">★ Premium</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="₹500"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500"
            />
          </div>

          {/* Action Buttons for Premium */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
              Generate Weekly Plan
            </button>
            <button
              onClick={onOpenTrainerModal}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105"
            >
              Ask Trainer to Review
            </button>
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}
