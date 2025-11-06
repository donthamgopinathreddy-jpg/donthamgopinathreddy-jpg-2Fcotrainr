import { useNavigate } from "react-router-dom";
import GlassyTile from "@/components/GlassyTile";
import { Dumbbell, Apple, MessageCircle, Utensils, Flame, Footprints, Droplets, Newspaper } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
  "Every step counts towards your goal! 🚀",
  "You're doing amazing, keep it up! 💪",
  "Progress over perfection! 🎯",
  "Your body is a temple, treat it right! 🏛️",
  "One day or day one, you decide! ⚡",
];

export default function Home() {
  const navigate = useNavigate();

  // Mock data
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const stepsGoal = 10000;
  const stepsCompleted = 8420;
  const caloriesGoal = 2500;
  const caloriesConsumed = 1850;
  const waterGoal = 3;
  const waterConsumed = 2.2;

  const stepsPercent = Math.round((stepsCompleted / stepsGoal) * 100);
  const caloriesPercent = Math.round((caloriesConsumed / caloriesGoal) * 100);
  const waterPercent = Math.round((waterConsumed / waterGoal) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-primary min-h-60 flex flex-col items-center justify-center px-6 pb-12">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-20 w-80 h-80 bg-white rounded-full filter blur-3xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-800 text-base font-medium">{quote}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-8 pb-8 relative z-20 space-y-6">
        {/* Progress Bars Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* Steps Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-foreground">Steps</span>
              </div>
              <span className="text-sm font-bold text-primary">{stepsCompleted.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${Math.min(stepsPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stepsPercent}% of daily goal</p>
          </div>

          {/* Calories Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-foreground">Calories</span>
              </div>
              <span className="text-sm font-bold text-primary">{caloriesConsumed} / {caloriesGoal}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{caloriesPercent}% of daily goal</p>
          </div>

          {/* Water Intake Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-foreground">Water</span>
              </div>
              <span className="text-sm font-bold text-cyan-400">{waterConsumed}L / {waterGoal}L</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(waterPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{waterPercent}% of daily goal</p>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-600 px-1">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <GlassyTile
              icon={<Dumbbell className="w-6 h-6 text-cyan-600" />}
              title="Trainers"
              onClick={() => navigate("/discover")}
              variant="trainers"
              className="text-center"
            />
            <GlassyTile
              icon={<Apple className="w-6 h-6 text-purple-600" />}
              title="Nutritionists"
              onClick={() => navigate("/discover")}
              variant="nutritionists"
              className="text-center"
            />
            <GlassyTile
              icon={<Utensils className="w-6 h-6 text-green-600" />}
              title="Meals"
              onClick={() => navigate("/meals")}
              variant="meals"
              className="text-center"
            />
            <GlassyTile
              icon={<Newspaper className="w-6 h-6 text-amber-600" />}
              title="Feed"
              onClick={() => navigate("/feed")}
              variant="feed"
              className="text-center"
            />
          </div>
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Premium</h3>
          <p className="text-sm text-gray-700 mb-4">
            Unlimited video sessions, full meal tracking, and priority chat support.
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Subscribe ₹199/mo
          </button>
        </div>

        {/* Feed/Posts Teaser */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-primary mb-2">📰 Latest Posts</h3>
          <p className="text-xs text-muted-foreground">
            Transformation stories, tips, and motivation from our community.
          </p>
        </div>
      </div>
    </div>
  );
}
