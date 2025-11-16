import { useState, useEffect } from "react";
import { Lock, Zap, TrendingUp, AlertCircle, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useDietPreferences } from "@/hooks/useDietPreferences";
import { useDietReviewRequests } from "@/hooks/useDietReviewRequests";
import { toast } from "sonner";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import WorkoutCard from "@/components/WorkoutCard";
import DietPlannerForm from "@/components/DietPlannerForm";
import AskTrainerModal from "@/components/AskTrainerModal";
import TrendGraphsSection from "@/components/TrendGraphsSection";

type WorkoutCategory =
  | "gym"
  | "yoga"
  | "boxing"
  | "zumba"
  | "stretching"
  | "warmups";
type WorkoutLevel = "basic" | "intermediate" | "advanced";

const TREND_METRICS = [
  { name: "Steps", icon: "👣", color: "from-blue-400 to-blue-600" },
  { name: "Calories", icon: "🔥", color: "from-red-400 to-red-600" },
  { name: "Water", icon: "💧", color: "from-cyan-400 to-cyan-600" },
  { name: "Workouts", icon: "💪", color: "from-orange-400 to-orange-600" },
];

export default function TrainingHub() {
  const { userProfile } = useAuth();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { preferences, updatePreferences, loading: prefsLoading } =
    useDietPreferences();
  const { createReviewRequest, loading: reviewLoading } =
    useDietReviewRequests();

  const plan = (userProfile?.subscription_plan || "free") as
    | "free"
    | "basic"
    | "premium";

  // State management
  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory>("gym");
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>("basic");
  const [showDietModal, setShowDietModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [dietGoal, setDietGoal] = useState(preferences?.goal || "");
  const [dietType, setDietType] = useState(preferences?.diet_type || "");
  const [allergens, setAllergens] = useState<string[]>(
    preferences?.allergies || [],
  );
  const [savingDiet, setSavingDiet] = useState(false);

  // Determine what's locked
  const isBasicWorkoutsLocked = plan === "free";
  const isDietPlannerLocked = plan === "free";
  const isAIInsightsLocked = plan !== "premium";
  const isTrendGraphsLocked = plan === "free";

  // Categories and levels
  const categories: WorkoutCategory[] = [
    "gym",
    "yoga",
    "boxing",
    "zumba",
    "stretching",
    "warmups",
  ];
  const levels: WorkoutLevel[] = ["basic", "intermediate", "advanced"];

  // Filter workouts based on plan and selections
  const filteredWorkouts = workouts.filter((w) => {
    // Category filter
    if (w.category !== selectedCategory) return false;

    // Level filter - free users only see basic
    if (plan === "free" && w.level !== "basic") return false;

    // Level selection filter - basic/premium users can filter
    if (plan !== "free" && w.level !== selectedLevel) return false;

    return true;
  });

  // Handle diet preferences save
  const handleSaveDietPreferences = async () => {
    try {
      setSavingDiet(true);
      const success = await updatePreferences({
        goal: dietGoal as "lose_fat" | "build_muscle" | "maintain" | null,
        diet_type: dietType as "veg" | "non_veg" | "vegan" | null,
        allergies: allergens,
      });

      if (success) {
        toast.success("Diet preferences saved successfully!");
        setShowDietModal(false);
      } else {
        toast.error("Failed to save diet preferences");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSavingDiet(false);
    }
  };

  // Handle ask trainer review
  const handleAskTrainerReview = async (trainerId: string | null) => {
    try {
      // Create a temporary diet plan ID (in real app, would be from actual plan)
      const result = await createReviewRequest("diet-plan-" + Date.now(), trainerId || undefined);

      if (result) {
        toast.success("Review request sent to trainer!");
        setShowTrainerModal(false);
      } else {
        toast.error("Failed to send review request");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-32">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
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
                    : "bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-2 border-white/60 dark:border-gray-700/60 backdrop-blur-md hover:border-orange-500"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Level Filters */}
          {plan !== "free" && (
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedLevel === level
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          )}

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
                    No workouts found for this category{" "}
                    {plan !== "free" && "and level"}.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* DIET PLANNER SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
                    ? "Set your nutrition goals and preferences (limited features)."
                    : "Complete control over your nutrition plan with AI assistance."}
              </p>
            </div>
          </div>

          {isDietPlannerLocked ? (
            // Locked state with blur effect
            <div className="relative">
              <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative z-10 space-y-4">
                  <Lock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Diet Planner Locked
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    Upgrade to Basic or Premium to unlock personalized meal
                    planning features.
                  </p>
                  <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <DietPlannerForm
              plan={plan}
              preferences={preferences}
              onOpenTrainerModal={() => setShowTrainerModal(true)}
              onSave={handleSaveDietPreferences}
              isSaving={savingDiet}
            />
          )}
        </section>

        {/* AI INSIGHTS SECTION - Premium Only */}
        {plan === "premium" && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-orange-500" />
              AI Weekly Insights
            </h2>

            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden relative">
              {/* Animated glow background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
              </div>

              <div className="relative z-10 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-sm opacity-90">Steps Change</p>
                    <p className="text-3xl font-bold mt-1">+12%</p>
                    <p className="text-xs opacity-75 mt-1">vs last week</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-sm opacity-90">Calories Burned</p>
                    <p className="text-3xl font-bold mt-1">-180 kcal</p>
                    <p className="text-xs opacity-75 mt-1">weekly average</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-sm opacity-90">Consistency</p>
                    <p className="text-3xl font-bold mt-1">Good 🎯</p>
                    <p className="text-xs opacity-75 mt-1">Keep it up!</p>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span> Pro Tip
                  </p>
                  <p className="text-base opacity-95 leading-relaxed">
                    Try adding a 10-minute walk after meals to improve digestion
                    and boost your daily activity levels. This simple habit can
                    increase your weekly steps by 15-20%.
                  </p>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="font-semibold">🎯 Goal Progress</p>
                    <p className="text-sm opacity-90 mt-2">
                      You're 68% towards your weekly goal
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="font-semibold">📈 Best Day</p>
                    <p className="text-sm opacity-90 mt-2">
                      Wednesday - 12,500 steps
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TREND GRAPHS SECTION */}
        <TrendGraphsSection isLocked={isTrendGraphsLocked} metrics={TREND_METRICS} />

        {/* Upgrade CTA for locked features */}
        {(isDietPlannerLocked || isTrendGraphsLocked || isAIInsightsLocked) && (
          <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white shadow-2xl border border-white/20 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">
                Ready to unlock your full potential?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Upgrade to {plan === "free" ? "Basic or Premium" : "Premium"} to
                access all premium features and accelerate your fitness journey.
              </p>
              <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
                View Pricing Plans
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Ask Trainer Modal */}
      <AskTrainerModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        onSubmit={handleAskTrainerReview}
        isLoading={reviewLoading}
      />
    </div>
  );
}
