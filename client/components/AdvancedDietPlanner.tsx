import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Sparkles,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

/* ============================================================
   DATA MODELS
============================================================ */

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micros: {
    fiber: number;
    iron: number;
    calcium: number;
    potassium: number;
    vitaminA: number;
    vitaminC: number;
    vitaminB12: number;
  };
  ingredients: string[];
  instructions: string[];
  allergens: string[];
  dietType: string[];
}

interface DailyMealPlan {
  breakfast: Meal;
  snack1: Meal;
  lunch: Meal;
  snack2: Meal;
  dinner: Meal;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

interface WeeklyMealPlan {
  days: DailyMealPlan[];
}

interface DietPreferences {
  goals: "fat_loss" | "muscle_gain" | "maintain";
  dietType: string[];
  likes: string[];
  dislikes: string[];
  mustInclude: string[];
  allergens: string[];
  calorieTarget: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

/* ============================================================
   FOOD DATABASE
============================================================ */

const FOOD_DATABASE: Meal[] = [
  {
    id: "1",
    name: "Oats + Banana",
    calories: 320,
    protein: 10,
    carbs: 60,
    fats: 6,
    micros: {
      fiber: 5,
      iron: 2,
      calcium: 40,
      potassium: 220,
      vitaminA: 5,
      vitaminC: 8,
      vitaminB12: 0,
    },
    ingredients: ["Oats", "Banana", "Milk"],
    instructions: ["Cook oats", "Add banana on top"],
    allergens: ["dairy"],
    dietType: ["veg", "high-protein"],
  },
  {
    id: "2",
    name: "Paneer Stir Fry",
    calories: 280,
    protein: 22,
    carbs: 10,
    fats: 16,
    micros: {
      fiber: 2,
      iron: 1,
      calcium: 200,
      potassium: 100,
      vitaminA: 6,
      vitaminC: 4,
      vitaminB12: 0,
    },
    ingredients: ["Paneer", "Veggies"],
    instructions: ["Stir fry paneer", "Add veggies"],
    allergens: ["dairy"],
    dietType: ["veg", "high-protein"],
  },
  {
    id: "3",
    name: "Chicken + Rice",
    calories: 450,
    protein: 42,
    carbs: 38,
    fats: 4,
    micros: {
      fiber: 0,
      iron: 2,
      calcium: 12,
      potassium: 150,
      vitaminA: 0,
      vitaminC: 0,
      vitaminB12: 1,
    },
    ingredients: ["Chicken", "Rice"],
    instructions: ["Grill chicken", "Cook rice"],
    allergens: [],
    dietType: ["non-veg", "high-protein"],
  },
  {
    id: "4",
    name: "Boiled Eggs + Toast",
    calories: 280,
    protein: 20,
    carbs: 30,
    fats: 10,
    micros: {
      fiber: 3,
      iron: 3,
      calcium: 55,
      potassium: 140,
      vitaminA: 5,
      vitaminC: 0,
      vitaminB12: 1.2,
    },
    ingredients: ["Eggs", "Whole Wheat Bread"],
    instructions: ["Boil eggs", "Toast bread"],
    allergens: ["eggs", "gluten"],
    dietType: ["veg", "high-protein"],
  },
  {
    id: "5",
    name: "Dal + Roti",
    calories: 350,
    protein: 15,
    carbs: 55,
    fats: 8,
    micros: {
      fiber: 8,
      iron: 4,
      calcium: 50,
      potassium: 300,
      vitaminA: 2,
      vitaminC: 5,
      vitaminB12: 0,
    },
    ingredients: ["Lentils", "Whole Wheat Flour"],
    instructions: ["Cook dal", "Make roti"],
    allergens: [],
    dietType: ["veg", "high-protein"],
  },
  {
    id: "6",
    name: "Salmon + Broccoli",
    calories: 400,
    protein: 45,
    carbs: 15,
    fats: 18,
    micros: {
      fiber: 3,
      iron: 1.5,
      calcium: 60,
      potassium: 400,
      vitaminA: 100,
      vitaminC: 90,
      vitaminB12: 3,
    },
    ingredients: ["Salmon", "Broccoli"],
    instructions: ["Bake salmon", "Steam broccoli"],
    allergens: ["fish"],
    dietType: ["non-veg", "high-protein"],
  },
];

/* ============================================================
   FILTERING + GENERATION LOGIC
============================================================ */

function filterMeals(pref: DietPreferences): Meal[] {
  return FOOD_DATABASE.filter((meal) => {
    const dietMatch =
      pref.dietType.length === 0 ||
      pref.dietType.some((d) => meal.dietType.includes(d));
    const allergenSafe = pref.allergens.every(
      (a) => !meal.allergens.includes(a),
    );
    const dislikesSafe = pref.dislikes.every(
      (d) => !meal.ingredients.includes(d),
    );
    const likesMatch =
      pref.likes.length > 0
        ? pref.likes.some((l) => meal.ingredients.includes(l))
        : true;

    return dietMatch && allergenSafe && dislikesSafe && likesMatch;
  });
}

function generateDailyPlan(pref: DietPreferences): DailyMealPlan {
  const meals = filterMeals(pref);

  if (meals.length < 5) {
    throw new Error("Not enough meals in database for selected preferences.");
  }

  const pick = () => meals[Math.floor(Math.random() * meals.length)];

  const breakfast = pick();
  const snack1 = pick();
  const lunch = pick();
  const snack2 = pick();
  const dinner = pick();

  const totals = [breakfast, snack1, lunch, snack2, dinner].reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  return {
    breakfast,
    snack1,
    lunch,
    snack2,
    dinner,
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalCarbs: totals.carbs,
    totalFats: totals.fats,
  };
}

function generateWeeklyPlan(pref: DietPreferences): WeeklyMealPlan {
  return {
    days: Array.from({ length: 7 }, () => generateDailyPlan(pref)),
  };
}

/* ============================================================
   REACT COMPONENT
============================================================ */

export default function AdvancedDietPlanner() {
  const [prefs, setPrefs] = useState<DietPreferences>({
    goals: "maintain",
    dietType: ["veg", "non-veg"],
    likes: [],
    dislikes: [],
    mustInclude: [],
    allergens: [],
    calorieTarget: 2000,
    macroTargets: { protein: 120, carbs: 200, fats: 60 },
  });

  const [daily, setDaily] = useState<DailyMealPlan | null>(null);
  const [weekly, setWeekly] = useState<WeeklyMealPlan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");

  const createDaily = async () => {
    try {
      setLoading(true);
      setError("");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDaily(generateDailyPlan(prefs));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createWeekly = async () => {
    try {
      setLoading(true);
      setError("");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setWeekly(generateWeeklyPlan(prefs));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (goal: "fat_loss" | "muscle_gain" | "maintain") => {
    setPrefs((prev) => ({ ...prev, goals: goal }));
    if (goal === "fat_loss") {
      setPrefs((prev) => ({
        ...prev,
        macroTargets: { protein: 130, carbs: 150, fats: 50 },
      }));
    } else if (goal === "muscle_gain") {
      setPrefs((prev) => ({
        ...prev,
        macroTargets: { protein: 180, carbs: 250, fats: 70 },
      }));
    } else {
      setPrefs((prev) => ({
        ...prev,
        macroTargets: { protein: 120, carbs: 200, fats: 60 },
      }));
    }
  };

  const handleDietTypeChange = (type: string) => {
    setPrefs((prev) => ({
      ...prev,
      dietType: prev.dietType.includes(type)
        ? prev.dietType.filter((t) => t !== type)
        : [...prev.dietType, type],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Advanced Diet Planner
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Generate personalized meal plans based on your goals and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-orange-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Your Preferences
              </h2>

              {/* Goals */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
                  Fitness Goal
                </h3>
                <div className="space-y-2">
                  {(["fat_loss", "muscle_gain", "maintain"] as const).map(
                    (goal) => (
                      <button
                        key={goal}
                        onClick={() => handleGoalChange(goal)}
                        className={`w-full px-4 py-2 rounded-lg transition-all ${
                          prefs.goals === goal
                            ? "bg-orange-500 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {goal === "fat_loss"
                          ? "🔥 Fat Loss"
                          : goal === "muscle_gain"
                            ? "💪 Muscle Gain"
                            : "⚖️ Maintain"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Diet Types */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
                  Diet Type
                </h3>
                <div className="space-y-2">
                  {["veg", "non-veg"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleDietTypeChange(type)}
                      className={`w-full px-4 py-2 rounded-lg transition-all text-sm ${
                        prefs.dietType.includes(type)
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {type === "veg" ? "🥬 Vegetarian" : "🍗 Non-Vegetarian"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
                  Daily Calories: {prefs.calorieTarget}
                </h3>
                <input
                  type="range"
                  min="1500"
                  max="3500"
                  step="100"
                  value={prefs.calorieTarget}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      calorieTarget: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={createDaily}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Generating..." : "📅 Daily Plan"}
                </Button>
                <Button
                  onClick={createWeekly}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Generating..." : "📆 Weekly Plan"}
                </Button>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {daily || weekly ? (
              <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-orange-100 animate-fade-in">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab("daily")}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === "daily"
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    📅 Daily
                  </button>
                  <button
                    onClick={() => setActiveTab("weekly")}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === "weekly"
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    📆 Weekly
                  </button>
                </div>

                {activeTab === "daily" && daily && (
                  <div className="space-y-4">
                    <MealCard meal={daily.breakfast} mealType="🌅 Breakfast" />
                    <MealCard meal={daily.snack1} mealType="🥤 Snack 1" />
                    <MealCard meal={daily.lunch} mealType="🍽️ Lunch" />
                    <MealCard meal={daily.snack2} mealType="🥜 Snack 2" />
                    <MealCard meal={daily.dinner} mealType="🌙 Dinner" />
                    <DailyTotals plan={daily} />
                  </div>
                )}

                {activeTab === "weekly" && weekly && (
                  <div className="space-y-4">
                    {weekly.days.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg"
                      >
                        <h3 className="font-semibold text-lg mb-3">
                          📅 Day {idx + 1}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <p className="text-gray-600 dark:text-gray-400">
                              Calories
                            </p>
                            <p className="font-bold text-orange-600">
                              {day.totalCalories}
                            </p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <p className="text-gray-600 dark:text-gray-400">
                              Protein
                            </p>
                            <p className="font-bold text-blue-600">
                              {day.totalProtein}g
                            </p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <p className="text-gray-600 dark:text-gray-400">
                              Carbs
                            </p>
                            <p className="font-bold text-green-600">
                              {day.totalCarbs}g
                            </p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <p className="text-gray-600 dark:text-gray-400">
                              Fats
                            </p>
                            <p className="font-bold text-red-600">
                              {day.totalFats}g
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-orange-100 text-center">
                <Calendar className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Plan Generated Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure your preferences and generate a meal plan to get
                  started!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Components */

function MealCard({ meal, mealType }: { meal: Meal; mealType: string }) {
  return (
    <div className="p-4 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg border-l-4 border-orange-500">
      <h4 className="font-semibold text-lg mb-2">{mealType}</h4>
      <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
        {meal.name}
      </p>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Cal</p>
          <p className="font-bold text-orange-600">{meal.calories}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Pro</p>
          <p className="font-bold text-blue-600">{meal.protein}g</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Carb</p>
          <p className="font-bold text-green-600">{meal.carbs}g</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Fat</p>
          <p className="font-bold text-red-600">{meal.fats}g</p>
        </div>
      </div>
    </div>
  );
}

function DailyTotals({ plan }: { plan: DailyMealPlan }) {
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Daily Totals
      </h4>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-purple-100">Calories</p>
          <p className="text-2xl font-bold">{plan.totalCalories}</p>
        </div>
        <div>
          <p className="text-purple-100">Protein</p>
          <p className="text-2xl font-bold">{plan.totalProtein}g</p>
        </div>
        <div>
          <p className="text-purple-100">Carbs</p>
          <p className="text-2xl font-bold">{plan.totalCarbs}g</p>
        </div>
        <div>
          <p className="text-purple-100">Fats</p>
          <p className="text-2xl font-bold">{plan.totalFats}g</p>
        </div>
      </div>
    </Card>
  );
}
