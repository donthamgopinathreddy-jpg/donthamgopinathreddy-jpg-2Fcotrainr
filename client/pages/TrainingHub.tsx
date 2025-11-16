import { useState } from "react";
import { Lock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useDietPreferences } from "@/hooks/useDietPreferences";
import { useDietReviewRequests } from "@/hooks/useDietReviewRequests";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import WorkoutCard from "@/components/WorkoutCard";

type WorkoutCategory =
  | "gym"
  | "yoga"
  | "boxing"
  | "zumba"
  | "stretching"
  | "warmups";
type WorkoutLevel = "basic" | "intermediate" | "advanced";

export default function TrainingHub() {
  const { userProfile } = useAuth();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { preferences } = useDietPreferences();
  const { createReviewRequest, loading: reviewLoading } =
    useDietReviewRequests();

  const plan = (userProfile?.subscription_plan || "free") as
    | "free"
    | "basic"
    | "premium";

  // Determine what's locked
  const isBasicWorkoutsLocked = plan === "free";
  const isDietPlannerLocked = plan === "free";
  const isAIInsightsLocked = plan !== "premium";
  const isTrendGraphsLocked = plan === "free";

  // Filter workouts based on plan
  const filterWorkoutsByPlan = (workouts: any[]) => {
    if (plan === "free") {
      return workouts.filter((w) => w.level === "basic");
    }
    return workouts;
  };

  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory>("gym");
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>("basic");

  const categories: WorkoutCategory[] = [
    "gym",
    "yoga",
    "boxing",
    "zumba",
    "stretching",
    "warmups",
  ];
  const levels: WorkoutLevel[] = ["basic", "intermediate", "advanced"];

  const filteredWorkouts = filterWorkoutsByPlan(
    workouts.filter(
      (w) =>
        w.category === selectedCategory &&
        (plan === "premium" || plan === "basic" ? true : w.level === "basic"),
    ),
  );

  const handleAskTrainerReview = async () => {
    // This would open a modal in a real implementation
    alert("Opening Ask Trainer dialog...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-32">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Training & Nutrition Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your personalized fitness and wellness command center
          </p>
        </div>

        {/* Subscription Banner */}
        <SubscriptionBanner plan={plan} />

        {/* WORKOUT SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏋️ Workouts
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {plan === "free"
                ? "Basic workouts available. Upgrade for intermediate and advanced routines."
                : "Explore all workout levels and categories tailored to your fitness goals."}
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const isLockedForUser = plan === "free" && level !== "basic";
              return (
                <button
                  key={level}
                  onClick={() => !isLockedForUser && setSelectedLevel(level)}
                  disabled={isLockedForUser}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedLevel === level
                      ? "bg-orange-500 text-white"
                      : isLockedForUser
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Workout Cards Grid */}
          {workoutsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No workouts found for this category and level.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* DIET PLANNER SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                🍽️ Diet Planner
                {isDietPlannerLocked && (
                  <Lock className="w-6 h-6 text-orange-500" />
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {plan === "free"
                  ? "Upgrade to unlock personalized diet planning."
                  : plan === "basic"
                    ? "Set your nutrition goals and preferences."
                    : "Complete control over your nutrition plan."}
              </p>
            </div>
          </div>

          {isDietPlannerLocked ? (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
              <Lock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Diet Planner Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade to Basic or Premium to unlock personalized meal
                planning.
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Plan Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Goal Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fitness Goal
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500 focus:outline-none transition-colors">
                    <option value="">Select your goal</option>
                    <option value="lose_fat">Lose Fat</option>
                    <option value="build_muscle">Build Muscle</option>
                    <option value="maintain">Maintain Weight</option>
                  </select>
                </div>

                {/* Diet Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Diet Type
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500 focus:outline-none transition-colors">
                    <option value="">Select diet type</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non_veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>

              {/* Likes and Dislikes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Foods You Like
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="e.g., Chicken, Rice, Broccoli..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Foods to Avoid
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="e.g., Mushrooms, Olives..."
                  />
                </div>
              </div>

              {/* Premium Only Features */}
              {plan === "premium" && (
                <>
                  {/* Allergens */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Allergens{" "}
                      <span className="text-orange-500">★ Premium</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "dairy",
                        "gluten",
                        "nuts",
                        "soy",
                        "eggs",
                        "shellfish",
                        "wheat",
                        "lactose",
                      ].map((allergen) => (
                        <label
                          key={allergen}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded accent-orange-500"
                          />
                          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                            {allergen}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Macros */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Macro Targets (g){" "}
                      <span className="text-orange-500">★ Premium</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="number"
                        placeholder="Protein (g)"
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Carbs (g)"
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Fats (g)"
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Daily Budget{" "}
                      <span className="text-orange-500">★ Premium</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Budget (₹)"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-orange-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                      Generate Weekly Plan
                    </button>
                    <button
                      onClick={handleAskTrainerReview}
                      disabled={reviewLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      Ask Trainer to Review
                    </button>
                  </div>
                </>
              )}

              <button className="w-full px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">
                Save Preferences
              </button>
            </div>
          )}
        </section>

        {/* AI INSIGHTS SECTION */}
        {plan === "premium" && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              ✨ AI Weekly Insights
            </h2>

            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white backdrop-blur-lg border border-white/20 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Steps Change</p>
                    <p className="text-3xl font-bold">+12%</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Calories Burned</p>
                    <p className="text-3xl font-bold">-180 kcal</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Consistency</p>
                    <p className="text-3xl font-bold">Good 🎯</p>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-lg font-semibold mb-2">💡 Pro Tip</p>
                  <p className="text-base opacity-95">
                    Try adding a 10-minute walk after meals to improve digestion
                    and boost your daily activity levels.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TREND GRAPHS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              📊 Trend Graphs
              {isTrendGraphsLocked && (
                <Lock className="w-6 h-6 text-orange-500" />
              )}
            </h2>
          </div>

          {isTrendGraphsLocked ? (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
              <TrendingUp className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Trend Graphs Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade to Basic or Premium to view your health trends and
                progress.
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["Steps", "Calories", "Water Intake", "Workouts"].map(
                (metric) => (
                  <div
                    key={metric}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                      {metric}
                    </h3>
                    <div className="h-40 bg-gradient-to-t from-orange-200 to-transparent dark:from-orange-900/30 rounded-lg flex items-end justify-around p-4">
                      {[20, 40, 35, 50, 45, 60, 55].map((height, i) => (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className="w-4 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg"
                        ></div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Week overview
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* Upgrade CTA for locked features */}
        {(isDietPlannerLocked || isTrendGraphsLocked) && (
          <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              Ready to unlock your full potential?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Upgrade to {plan === "free" ? "Basic or Premium" : "Premium"} to
              access all premium features and accelerate your fitness journey.
            </p>
            <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:shadow-lg transition-all">
              View Pricing Plans
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
