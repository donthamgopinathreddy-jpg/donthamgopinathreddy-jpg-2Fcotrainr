import { useState, useEffect } from "react";
import {
  Lock,
  Zap,
  TrendingUp,
  AlertCircle,
  X,
  Sparkles,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useDietPreferences } from "@/hooks/useDietPreferences";
import { useDietReviewRequests } from "@/hooks/useDietReviewRequests";
import { toast } from "sonner";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import WorkoutCard from "@/components/WorkoutCard";
import WeeklyWorkoutPlanner from "@/components/WeeklyWorkoutPlanner";
import ExpandedDietPlanner from "@/components/ExpandedDietPlanner";
import AskTrainerModal from "@/components/AskTrainerModal";
import TrendGraphsSection from "@/components/TrendGraphsSection";
import TrainingHubCarousel from "@/components/TrainingHubCarousel";

type WorkoutCategory =
  | "gym"
  | "yoga"
  | "boxing"
  | "zumba"
  | "stretching"
  | "warmups";
type WorkoutLevel = "basic" | "intermediate" | "advanced";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TREND_METRICS = [
  { name: "Steps", icon: "👣", color: "from-blue-400 to-blue-600" },
  { name: "Calories", icon: "🔥", color: "from-red-400 to-red-600" },
  { name: "Water", icon: "💧", color: "from-cyan-400 to-cyan-600" },
  { name: "Workouts", icon: "💪", color: "from-orange-400 to-orange-600" },
];

export default function TrainingHub() {
  const { userProfile } = useAuth();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const {
    preferences,
    updatePreferences,
    loading: prefsLoading,
  } = useDietPreferences();
  const { createReviewRequest, loading: reviewLoading } =
    useDietReviewRequests();

  const plan = (userProfile?.subscription_plan || "free") as
    | "free"
    | "basic"
    | "premium";

  // Workout state
  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory>("gym");
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>("basic");
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, string>>({});
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDayForWorkout, setSelectedDayForWorkout] =
    useState<string>("");
  const [showTrainerModal, setShowTrainerModal] = useState(false);

  // Diet state
  const [dietGoal, setDietGoal] = useState(preferences?.goal || "");
  const [dietType, setDietType] = useState(preferences?.diet_type || "");
  const [likes, setLikes] = useState((preferences?.likes || []).join(", "));
  const [dislikes, setDislikes] = useState(
    (preferences?.dislikes || []).join(", "),
  );
  const [mustInclude, setMustInclude] = useState("");
  const [allergens, setAllergens] = useState<string[]>(
    preferences?.allergies || [],
  );
  const [proteinTarget, setProteinTarget] = useState(150);
  const [carbsTarget, setCarbsTarget] = useState(250);
  const [fatsTarget, setFatsTarget] = useState(70);
  const [budgetFilter, setBudgetFilter] = useState("medium");
  const [savingDiet, setSavingDiet] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<any>(null);
  const [showGeneratedMealPlan, setShowGeneratedMealPlan] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Subscription gating
  const isWorkoutLocked = plan === "free";
  const isDietLocked = plan === "free";
  const isAllergenLocked = plan !== "premium";
  const isMacroLocked = plan !== "premium";
  const isBudgetLocked = plan !== "premium";
  const isWeeklyMealPlanLocked = plan !== "premium";
  const isAIInsightsLocked = plan !== "premium";
  const isTrendGraphsLocked = plan === "free";

  // Workout categories
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
    if (w.category !== selectedCategory) return false;
    if (plan === "free" && w.level !== "basic") return false;
    if (plan !== "free" && w.level !== selectedLevel) return false;
    return true;
  });

  // Handle workout day assignment
  const handleAssignWorkout = (dayIndex: string, workoutId: string) => {
    setWeeklyPlan({ ...weeklyPlan, [dayIndex]: workoutId });
    setShowWorkoutModal(false);
    toast.success("Workout assigned!");
  };

  // Get workout details
  const getWorkoutById = (id: string) => {
    return workouts.find((w) => w.id === id);
  };

  // Calculate weekly stats
  const weeklyStats = Object.values(weeklyPlan)
    .map((id) => getWorkoutById(id as string))
    .filter(Boolean)
    .reduce(
      (acc, w) => ({
        count: acc.count + 1,
        minutes: acc.minutes + (w?.duration_minutes || 0),
      }),
      { count: 0, minutes: 0 },
    );

  // Handle save diet preferences
  const handleSaveDietPreferences = async () => {
    try {
      setSavingDiet(true);
      const success = await updatePreferences({
        goal: dietGoal as "lose_fat" | "build_muscle" | "maintain" | null,
        diet_type: dietType as "veg" | "non_veg" | "vegan" | null,
        likes: likes.split(",").map((l) => l.trim()),
        dislikes: dislikes.split(",").map((d) => d.trim()),
        allergies: allergens,
      });

      if (success) {
        toast.success("Diet preferences saved successfully!");
      } else {
        toast.error("Failed to save diet preferences");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSavingDiet(false);
    }
  };

  // Generate weekly meal plan (mock)
  const handleGenerateWeeklyMealPlan = () => {
    const mealPlan = DAYS_OF_WEEK.map((day) => ({
      day,
      meals: {
        breakfast: "Oats with berries",
        lunch: "Grilled chicken with rice",
        snack: "Greek yogurt",
        dinner: "Salmon with vegetables",
      },
    }));
    setWeeklyMealPlan(mealPlan);
    setShowGeneratedMealPlan(true);
    toast.success("Weekly meal plan generated!");
  };

  // Handle ask trainer review
  const handleAskTrainerReview = async (trainerId: string | null) => {
    try {
      const result = await createReviewRequest(
        "diet-plan-" + Date.now(),
        trainerId || undefined,
      );

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

  // Section components
  const WorkoutsSection = () => (
    <div className="space-y-6">
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

      {/* Difficulty Level */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Difficulty Level
        </p>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => {
            const isLocked = plan === "free" && level !== "basic";
            return (
              <button
                key={level}
                onClick={() => !isLocked && setSelectedLevel(level)}
                disabled={isLocked}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  selectedLevel === level
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : isLocked
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
                {isLocked && <Lock className="w-3 h-3 inline ml-1" />}
              </button>
            );
          })}
        </div>
        {plan === "free" && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            💡 Upgrade to unlock Intermediate and Advanced workouts
          </p>
        )}
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
              <div
                key={workout.id}
                className="relative group"
                onClick={() => {
                  if (plan !== "free" || workout.level === "basic") {
                    setSelectedDayForWorkout(workout.id);
                    setShowWorkoutModal(true);
                  }
                }}
              >
                <WorkoutCard workout={workout} />
                {plan === "free" && workout.level !== "basic" && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center text-white">
                      <Lock className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Upgrade to unlock</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No workouts found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const WeeklyPlannerSection = () => (
    <div className="space-y-6">
      {isWorkoutLocked ? (
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
          <Lock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Workout Planner Locked
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upgrade to unlock the weekly workout planner
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
            Upgrade Now
          </button>
        </div>
      ) : (
        <>
          <WeeklyWorkoutPlanner
            weeklyPlan={weeklyPlan}
            workouts={workouts}
            onSelectDay={(day) => {
              setSelectedDayForWorkout(day);
              setShowWorkoutModal(true);
            }}
            onRemoveWorkout={(day) => {
              const newPlan = { ...weeklyPlan };
              delete newPlan[day];
              setWeeklyPlan(newPlan);
            }}
          />

          {/* Weekly Summary */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                  📊 This Week's Summary
                </p>
                <p className="text-lg text-gray-900 dark:text-white font-bold mt-2">
                  {weeklyStats.count} Workouts • {weeklyStats.minutes} Minutes
                </p>
              </div>
              <div className="text-4xl">💪</div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const DietPlannerSection = () => (
    <div className="space-y-6">
      {isDietLocked ? (
        <div className="relative">
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
            <Lock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Diet Planner Locked
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Upgrade to Basic or Premium to unlock personalized diet planning.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      ) : (
        <ExpandedDietPlanner
          plan={plan}
          preferences={preferences}
          dietGoal={dietGoal}
          setDietGoal={setDietGoal}
          dietType={dietType}
          setDietType={setDietType}
          likes={likes}
          setLikes={setLikes}
          dislikes={dislikes}
          setDislikes={setDislikes}
          mustInclude={mustInclude}
          setMustInclude={setMustInclude}
          allergens={allergens}
          setAllergens={setAllergens}
          proteinTarget={proteinTarget}
          setProteinTarget={setProteinTarget}
          carbsTarget={carbsTarget}
          setCarbsTarget={setCarbsTarget}
          fatsTarget={fatsTarget}
          setFatsTarget={setFatsTarget}
          budgetFilter={budgetFilter}
          setBudgetFilter={setBudgetFilter}
          onGenerateMealPlan={handleGenerateWeeklyMealPlan}
          onAskTrainer={() => setShowTrainerModal(true)}
          onSave={handleSaveDietPreferences}
          isSaving={savingDiet}
          showGeneratedMealPlan={showGeneratedMealPlan}
          weeklyMealPlan={weeklyMealPlan}
        />
      )}
    </div>
  );

  const AIInsightsSection = () => (
    <div>
      {!isAIInsightsLocked && (
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          </div>

          <div className="relative z-10 space-y-6">
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

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> Pro Tip
              </p>
              <p className="text-base opacity-95">
                Try adding a 10-minute walk after meals to improve digestion
                and boost your daily activity levels.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAIInsightsLocked && (
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
          <Sparkles className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Feature Locked
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Upgrade to Premium to unlock AI-powered weekly insights and coaching
            tips.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transition-all">
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );

  const TrendSection = () => (
    <TrendGraphsSection isLocked={isTrendGraphsLocked} metrics={TREND_METRICS} />
  );

  const carouselSections = [
    {
      id: "workouts",
      title: "Workout Library",
      description: "Browse and select your favorite workouts",
      icon: "🏋️",
      component: <WorkoutsSection />,
    },
    {
      id: "weekly-planner",
      title: "Weekly Workout Planner",
      description: "Plan your workouts for the week ahead",
      icon: "📅",
      component: <WeeklyPlannerSection />,
    },
    {
      id: "diet",
      title: "Diet Planner",
      description: "Customize your personalized nutrition plan",
      icon: "🍎",
      component: <DietPlannerSection />,
    },
    {
      id: "insights",
      title: "AI Weekly Insights",
      description: "Get personalized coaching and progress tracking",
      icon: "✨",
      component: <AIInsightsSection />,
    },
    {
      id: "trends",
      title: "Trend Graphs",
      description: "Track your fitness progress over time",
      icon: "📈",
      component: <TrendSection />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-32">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header with Tabs */}
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Training & Nutrition Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Complete fitness and wellness command center
            </p>
          </div>

          {/* Feature Tabs - Like Followers/Following */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-5 gap-2">
              {carouselSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => {
                    // This button only shows the feature info
                    // The carousel will handle the actual navigation
                  }}
                  className={`py-3 px-2 rounded-lg transition-all text-center text-xs sm:text-sm font-semibold flex flex-col items-center gap-1 ${
                    index === 0
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="line-clamp-1">{section.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        <SubscriptionBanner plan={plan} />

        {/* Carousel */}
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-8">
          <TrainingHubCarousel sections={carouselSections} />
        </div>

        {/* Upgrade CTA */}
        {(isDietLocked || isTrendGraphsLocked || isAIInsightsLocked) && (
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
                access all features and accelerate your fitness journey.
              </p>
              <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
                View Pricing Plans
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <AskTrainerModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        onSubmit={handleAskTrainerReview}
        isLoading={reviewLoading}
      />

      {/* Workout Selection Modal */}
      {showWorkoutModal && plan !== "free" && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Workout
              </h3>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {filteredWorkouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() =>
                    handleAssignWorkout(selectedDayForWorkout, workout.id)
                  }
                  className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {workout.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.duration_minutes} min •{" "}
                        {workout.calories_burned} cal
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
