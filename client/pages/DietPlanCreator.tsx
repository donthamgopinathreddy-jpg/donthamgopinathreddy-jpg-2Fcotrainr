import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useDietPlanGenerator,
  type DietPreferences,
  type MealPlan,
} from "@/hooks/useDietPlanGenerator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function DietPlanCreator() {
  const navigate = useNavigate();
  const { generateMealPlan, generateWeeklyPlan, loading, error } =
    useDietPlanGenerator();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>([]);
  const [currentWeekDay, setCurrentWeekDay] = useState(0);

  const [preferences, setPreferences] = useState<DietPreferences>({
    goal: "Maintain",
    dietTypes: [],
    preferredFoods: [],
    dislikedFoods: [],
    mustIncludeFoods: [],
    culturalPreference: undefined,
    allergens: [],
    dailyCalorieTarget: 2000,
    proteinTarget: 150,
    carbsTarget: 200,
    fatsTarget: 65,
    budgetTier: "Medium",
  });

  const dietTypeOptions = [
    "Veg",
    "Non-Veg",
    "Vegan",
    "High-Protein",
    "Keto",
    "Custom",
  ];
  const allergenOptions = [
    "Dairy",
    "Gluten",
    "Nuts",
    "Soy",
    "Eggs",
    "Wheat",
    "Shellfish",
    "Sesame",
  ];
  const culturalOptions = [
    "South Indian",
    "North Indian",
    "Western",
    "Asian",
    "Middle Eastern",
  ];

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

  const handleGeneratePlan = async () => {
    const plan = await generateMealPlan(preferences);
    if (plan) {
      setMealPlan(plan);
      setWeeklyPlan([]);
    }
  };

  const handleGenerateWeekly = async () => {
    const weekly = await generateWeeklyPlan(preferences);
    if (weekly) {
      setWeeklyPlan(weekly);
      setCurrentWeekDay(0);
    }
  };

  const MealCard = ({ meal, label }: { meal: any; label: string }) => {
    if (!meal) return null;

    return (
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-100">
        <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <img
            src={meal.image_url || "https://via.placeholder.com/300"}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-lg mb-2">{meal.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{label}</p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="bg-white p-2 rounded border border-orange-100">
            <div className="font-semibold">{meal.calories || 0}</div>
            <div className="text-xs text-gray-500">Calories</div>
          </div>
          <div className="bg-white p-2 rounded border border-orange-100">
            <div className="font-semibold">{meal.protein_g || 0}g</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div className="bg-white p-2 rounded border border-orange-100">
            <div className="font-semibold">{meal.carbs_g || 0}g</div>
            <div className="text-xs text-gray-500">Carbs</div>
          </div>
          <div className="bg-white p-2 rounded border border-orange-100">
            <div className="font-semibold">{meal.fats_g || 0}g</div>
            <div className="text-xs text-gray-500">Fats</div>
          </div>
        </div>

        {meal.ingredients && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-2">Ingredients:</h4>
            <ul className="text-xs space-y-1">
              {meal.ingredients.slice(0, 4).map((ing: string, idx: number) => (
                <li key={idx} className="text-gray-600">
                  • {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>⏱ {meal.prep_time_minutes || 0} min</span>
          <span>•</span>
          <span>{meal.cuisine_type || "Mix"}</span>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Diet Plan Creator</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Preferences Form */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
              1
            </span>
            Your Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal Selection */}
            <div>
              <Label className="font-semibold mb-3 block">Fitness Goal</Label>
              <Select
                value={preferences.goal}
                onValueChange={(value: any) =>
                  setPreferences((prev) => ({ ...prev, goal: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lose Fat">Lose Fat</SelectItem>
                  <SelectItem value="Build Muscle">Build Muscle</SelectItem>
                  <SelectItem value="Maintain">Maintain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Tier */}
            <div>
              <Label className="font-semibold mb-3 block">Budget Tier</Label>
              <Select
                value={preferences.budgetTier}
                onValueChange={(value: any) =>
                  setPreferences((prev) => ({ ...prev, budgetTier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cultural Preference */}
            <div>
              <Label className="font-semibold mb-3 block">
                Cultural Preference
              </Label>
              <Select
                value={preferences.culturalPreference || ""}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    culturalPreference: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {culturalOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Diet Types - Multi-Select */}
          <div className="mt-6">
            <Label className="font-semibold mb-4 block">
              Diet Types (Multi-select)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietTypeOptions.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-orange-50 cursor-pointer"
                >
                  <Checkbox
                    checked={preferences.dietTypes.includes(type)}
                    onCheckedChange={() => handleDietTypeToggle(type)}
                  />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergens - Multi-Select */}
          <div className="mt-6">
            <Label className="font-semibold mb-4 block">
              Allergens to Avoid
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allergenOptions.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-red-50 cursor-pointer"
                >
                  <Checkbox
                    checked={preferences.allergens.includes(allergen)}
                    onCheckedChange={() => handleAllergenToggle(allergen)}
                  />
                  <span className="text-sm font-medium">{allergen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Calorie and Macro Targets */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold mb-2 block">
                Daily Calorie Target
              </Label>
              <Input
                type="number"
                value={preferences.dailyCalorieTarget}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    dailyCalorieTarget: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label className="font-semibold mb-2 block">
                Protein Target (g)
              </Label>
              <Input
                type="number"
                value={preferences.proteinTarget}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    proteinTarget: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label className="font-semibold mb-2 block">
                Carbs Target (g)
              </Label>
              <Input
                type="number"
                value={preferences.carbsTarget}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    carbsTarget: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label className="font-semibold mb-2 block">
                Fats Target (g)
              </Label>
              <Input
                type="number"
                value={preferences.fatsTarget}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    fatsTarget: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
            >
              {loading ? "Generating..." : "Generate Daily Plan"}
            </Button>
            <Button
              onClick={handleGenerateWeekly}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Generating..." : "Generate Weekly Plan"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </Card>

        {/* Daily Meal Plan */}
        {mealPlan && (
          <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Your Daily Meal Plan
            </h2>

            {/* Totals Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <Card className="p-4 bg-gradient-to-br from-orange-100 to-orange-50">
                <div className="text-2xl font-bold text-orange-600">
                  {mealPlan.totals.calories}
                </div>
                <div className="text-xs text-gray-600">Total Calories</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-red-100 to-red-50">
                <div className="text-2xl font-bold text-red-600">
                  {mealPlan.totals.protein.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">Protein (g)</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {mealPlan.totals.carbs.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">Carbs (g)</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">
                  {mealPlan.totals.fats.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">Fats (g)</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-100 to-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {mealPlan.totals.fiber.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">Fiber (g)</div>
              </Card>
            </div>

            {/* Meal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MealCard meal={mealPlan.breakfast} label="Breakfast" />
              <MealCard meal={mealPlan.snack1} label="Snack 1" />
              <MealCard meal={mealPlan.lunch} label="Lunch" />
              <MealCard meal={mealPlan.snack2} label="Snack 2" />
              <MealCard meal={mealPlan.dinner} label="Dinner" />
            </div>
          </Card>
        )}

        {/* Weekly Plan View */}
        {weeklyPlan.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Weekly Meal Plan - Day {currentWeekDay + 1}
            </h2>

            {/* Day Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentWeekDay(idx)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                      currentWeekDay === idx
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ),
              )}
            </div>

            {/* Current Day Meals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MealCard
                meal={weeklyPlan[currentWeekDay].breakfast}
                label="Breakfast"
              />
              <MealCard
                meal={weeklyPlan[currentWeekDay].snack1}
                label="Snack 1"
              />
              <MealCard meal={weeklyPlan[currentWeekDay].lunch} label="Lunch" />
              <MealCard
                meal={weeklyPlan[currentWeekDay].snack2}
                label="Snack 2"
              />
              <MealCard
                meal={weeklyPlan[currentWeekDay].dinner}
                label="Dinner"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
