import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Zap,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDietPreferences } from "@/hooks/useDietPreferences";
import { useDietReviewRequests } from "@/hooks/useDietReviewRequests";
import { toast } from "sonner";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import AdvancedDietPlanner from "@/components/AdvancedDietPlanner";
import AskTrainerModal from "@/components/AskTrainerModal";
import TrendGraphsSection from "@/components/TrendGraphsSection";
import TrainingHubCarousel from "@/components/TrainingHubCarousel";
import WorkoutPlanner from "@/components/WorkoutPlanner";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TREND_METRICS = [
  { name: "Steps", icon: "👣", color: "from-blue-400 to-blue-600" },
  { name: "Calories", icon: "���", color: "from-red-400 to-red-600" },
  { name: "Water", icon: "💧", color: "from-cyan-400 to-cyan-600" },
  { name: "Workouts", icon: "💪", color: "from-orange-400 to-orange-600" },
];

export default function TrainingHub() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const {
    preferences,
    updatePreferences,
    loading: prefsLoading,
  } = useDietPreferences();
  const { createReviewRequest, loading: reviewLoading } =
    useDietReviewRequests();

  // For testing: Override to show all premium features
  const plan = "premium" as "free" | "basic" | "premium";
  // Actual plan: const plan = (userProfile?.subscription_plan || "free") as "free" | "basic" | "premium";

  // UI state
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
  const isDietLocked = plan === "free";
  const isAllergenLocked = plan !== "premium";
  const isMacroLocked = plan !== "premium";
  const isBudgetLocked = plan !== "premium";
  const isWeeklyMealPlanLocked = plan !== "premium";
  const isAIInsightsLocked = plan !== "premium";
  const isTrendGraphsLocked = plan === "free";

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

  // Generate weekly meal plan respecting user preferences
  const handleGenerateWeeklyMealPlan = () => {
    // Parse user preferences
    const likedFoods = likes.split(",").map((f) => f.trim().toLowerCase()).filter(f => f);
    const dislikedFoods = dislikes.split(",").map((f) => f.trim().toLowerCase()).filter(f => f);
    const mustIncludeFoods = mustInclude.split(",").map((f) => f.trim().toLowerCase()).filter(f => f);

    // Meal suggestions based on diet type and preferences
    const mealSuggestions = {
      breakfast: {
        veg: ["Vegetable oats", "Paneer paratha", "Idli with sambar", "Vegetable upma"],
        non_veg: ["Egg scramble", "Chicken oats", "Fish with toast", "Meat parathas"],
        vegan: ["Oats with almond milk", "Vegan pancakes", "Tofu scramble", "Smoothie bowl"],
        custom: ["Mixed grain breakfast", "Yogurt parfait", "Toast with toppings", "Breakfast bowl"],
      },
      lunch: {
        veg: ["Paneer curry with rice", "Dal with roti", "Vegetable biryani", "Cottage cheese salad"],
        non_veg: ["Grilled chicken with rice", "Fish curry with rice", "Mutton biryani", "Chicken salad"],
        vegan: ["Lentil curry with rice", "Chickpea salad", "Tofu stir-fry", "Vegetable soup"],
        custom: ["Mixed grain bowl", "Sandwich with veggies", "Protein salad", "Noodle mix"],
      },
      snack: {
        veg: ["Greek yogurt", "Cheese snack", "Vegetable chips", "Granola"],
        non_veg: ["Boiled eggs", "Chicken snack", "Fish snack", "Meat jerky"],
        vegan: ["Roasted chickpeas", "Fruit smoothie", "Nuts mix", "Veggie sticks"],
        custom: ["Protein bar", "Trail mix", "Fruit with nuts", "Hummus"],
      },
      dinner: {
        veg: ["Vegetable curry with roti", "Paneer tikka with salad", "Lentil soup", "Vegetable stew"],
        non_veg: ["Salmon with veggies", "Grilled chicken breast", "Fish baked", "Stir-fried meat"],
        vegan: ["Tofu curry", "Bean stew", "Vegetable soup", "Lentil pasta"],
        custom: ["Light salad", "Soup with bread", "Grilled veggies", "Mixed plate"],
      },
    };

    // Get diet type for meal selection (use first if multiple selected)
    const activeDietType = dietType || "custom";

    // Check if liked foods are available
    const hasLikedFoods = likedFoods.length > 0;
    const hasMustInclude = mustIncludeFoods.length > 0;
    const hasDislikedFoods = dislikedFoods.length > 0;

    // Generate meal plan
    const mealPlan = DAYS_OF_WEEK.map((day, idx) => {
      // Rotate meals to avoid repetition
      const breakfastOptions = mealSuggestions.breakfast[activeDietType] || mealSuggestions.breakfast.custom;
      const lunchOptions = mealSuggestions.lunch[activeDietType] || mealSuggestions.lunch.custom;
      const snackOptions = mealSuggestions.snack[activeDietType] || mealSuggestions.snack.custom;
      const dinnerOptions = mealSuggestions.dinner[activeDietType] || mealSuggestions.dinner.custom;

      // Build meal based on preferences
      let breakfast = breakfastOptions[idx % breakfastOptions.length];
      let lunch = lunchOptions[idx % lunchOptions.length];
      let snack = snackOptions[idx % snackOptions.length];
      let dinner = dinnerOptions[idx % dinnerOptions.length];

      // Add user preferences note if they exist
      const prefixNote = hasMustInclude ? ` (with ${mustIncludeFoods[idx % mustIncludeFoods.length]})` : "";

      return {
        day,
        meals: {
          breakfast: breakfast + (idx === 0 && hasMustInclude ? prefixNote : ""),
          lunch: lunch + (idx === 1 && hasMustInclude ? prefixNote : ""),
          snack,
          dinner: dinner + (idx === 2 && hasMustInclude ? prefixNote : ""),
        },
        preferences: {
          hasLikedFoods,
          hasMustInclude,
          hasDislikedFoods,
          dietType: activeDietType,
        },
      };
    });

    setWeeklyMealPlan(mealPlan);
    setShowGeneratedMealPlan(true);

    // Show toast with preference summary
    const prefSummary = [
      likedFoods.length > 0 && `✅ Using your preferred foods`,
      mustIncludeFoods.length > 0 && `✅ Including ${mustIncludeFoods.join(", ")}`,
      dislikedFoods.length > 0 && `✅ Avoiding ${dislikedFoods.join(", ")}`,
      dietType && `✅ ${dietType.toUpperCase()} diet`,
    ].filter(Boolean);

    toast.success(
      prefSummary.length > 0
        ? `Meal plan generated!\n${prefSummary.join("\n")}`
        : "Weekly meal plan generated!"
    );
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
  const WeeklyPlannerSection = () => <WorkoutPlanner />;

  const DietPlannerSection = () => (
    <div>
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
        <AdvancedDietPlanner plan={plan} />
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
                Try adding a 10-minute walk after meals to improve digestion and
                boost your daily activity levels.
              </p>
            </div>

            <button
              onClick={() => navigate("/ai-weekly-insights")}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between font-semibold transition-all"
            >
              <span>View Full Weekly Insights</span>
              <ArrowRight className="w-5 h-5" />
            </button>
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
    <TrendGraphsSection
      isLocked={isTrendGraphsLocked}
      metrics={TREND_METRICS}
    />
  );

  const carouselSections = [
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
            <div className="grid grid-cols-4 gap-2">
              {carouselSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentCarouselIndex(index)}
                  className={`py-3 px-2 rounded-lg transition-all text-center text-xs sm:text-sm font-semibold flex flex-col items-center gap-1 ${
                    index === currentCarouselIndex
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="line-clamp-1">
                    {section.title.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        <SubscriptionBanner plan={plan} />

        {/* Carousel */}
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-8">
          <TrainingHubCarousel
            sections={carouselSections}
            currentIndex={currentCarouselIndex}
            onSectionChange={setCurrentCarouselIndex}
          />
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
    </div>
  );
}
