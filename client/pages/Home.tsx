import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import { Dumbbell, Apple, MessageCircle, Utensils, Flame, Footprints, Droplets, Newspaper, Briefcase, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MOTIVATIONAL_QUOTES = [
  "Every step counts towards your goal! 🚀",
  "You're doing amazing, keep it up! 💪",
  "Progress over perfection! 🎯",
  "Your body is a temple, treat it right! 🏛️",
  "One day or day one, you decide! ⚡",
];

export default function Home() {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop"
  );
  const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Admin");
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [targets, setTargets] = useState({
    steps: 10000,
    calories: 2500,
    water: 2.5,
  });
  const [editTargets, setEditTargets] = useState({ ...targets });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Mock data
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const userWeight = 75; // kg - would come from user profile

  // Calculate water goal based on weight: roughly 30ml per kg
  const waterGoalCalculated = Math.round((userWeight * 30) / 1000 * 10) / 10;

  const stepsGoal = targets.steps;
  const stepsCompleted = 8420;
  const caloriesGoal = targets.calories;
  const caloriesConsumed = 1850;
  const waterConsumed = 2.2;
  const waterGoal = targets.water;

  const handleSaveTargets = () => {
    setTargets({ ...editTargets });
    setShowTargetsModal(false);
    toast.success("Targets updated!");
  };

  const stepsPercent = Math.round((stepsCompleted / stepsGoal) * 100);
  const caloriesPercent = Math.round((caloriesConsumed / caloriesGoal) * 100);
  const waterPercent = Math.round((waterConsumed / waterGoalCalculated) * 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
        <Logo size="sm" />
      </div>

      {/* Hero Header with Cover Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 h-64">
        {/* Cover Image */}
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Edit Cover Button */}
        <label className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
          />
        </label>

        {/* Greeting */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-6">
          <p className="text-white text-base font-medium">{quote}</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-md mx-auto px-4 -mt-16 relative z-20 mb-8">
        <div className="flex items-end gap-4">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg cursor-pointer shadow-lg transition-all">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Welcome Text */}
          <div className="pb-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Ready to train?</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-8 pb-8 relative z-20 space-y-6">
        {/* Progress Bars Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 l-shape-bg fitness-gradient-1">
          {/* Steps Progress */}
          <button
            onClick={() => navigate("/activity/steps")}
            className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Steps</span>
              </div>
              <span className="text-sm font-bold text-orange-600">{stepsCompleted.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 shadow-lg shadow-orange-600/50"
                style={{ width: `${Math.min(stepsPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{stepsPercent}% of daily goal</p>
          </button>

          {/* Calories Progress */}
          <button
            onClick={() => navigate("/activity/calories")}
            className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-gray-900">Calories</span>
              </div>
              <span className="text-sm font-bold text-red-600">{caloriesConsumed} / {caloriesGoal}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 transition-all duration-500 shadow-lg shadow-red-600/50"
                style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{caloriesPercent}% of daily goal</p>
          </button>

          {/* Water Intake Progress */}
          <button
            onClick={() => navigate("/activity/water")}
            className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <span className="font-semibold text-gray-900">Water</span>
              </div>
              <span className="text-sm font-bold text-cyan-600">{waterConsumed}L / {waterGoalCalculated}L</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500 shadow-lg shadow-cyan-600/50"
                style={{ width: `${Math.min(waterPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{waterPercent}% of daily goal</p>
          </button>
        </div>

        {/* Quick Action Tiles */}
        <div className="space-y-3 l-shape-bg fitness-gradient-2 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-600 px-1">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <GlassyTile
              icon={<Dumbbell className="w-6 h-6 text-cyan-700" />}
              title="Trainers"
              onClick={() => navigate("/discover")}
              variant="trainers"
              className="text-center"
            />
            <GlassyTile
              icon={<Apple className="w-6 h-6 text-purple-700" />}
              title="Nutritionists"
              onClick={() => navigate("/discover")}
              variant="nutritionists"
              className="text-center"
            />
            <GlassyTile
              icon={<Utensils className="w-6 h-6 text-green-700" />}
              title="Meal Tracker"
              onClick={() => navigate("/meals")}
              variant="meals"
              className="text-center"
            />
            <GlassyTile
              icon={<Newspaper className="w-6 h-6 text-amber-700" />}
              title="Feed"
              onClick={() => navigate("/feed")}
              variant="feed"
              className="text-center"
            />
          </div>

          {/* Join as Trainer CTA */}
          <div
            onClick={() => navigate("/trainer-signup")}
            className="relative overflow-hidden rounded-2xl p-4 py-5 cursor-pointer transition-all duration-300 active:scale-95 hover:scale-105 shadow-lg hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FFA502 50%, #FFB700 75%, #FF6B6B 100%)",
              backgroundSize: "300% 300%",
              animation: "gradientFlow 8s ease infinite"
            }}
          >
            <style>{`
              @keyframes gradientFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .trainer-cta::before {
                content: '';
                position: absolute;
                bottom: 0;
                right: 0;
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%);
                opacity: 0.5;
                pointer-events: none;
              }
              .trainer-cta::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, rgba(255,255,255,0.15) 50%, transparent 50%);
                pointer-events: none;
              }
            `}</style>
            <div className="absolute inset-0 trainer-cta" />
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Briefcase className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-0.5">Become a Trainer</h3>
              <p className="text-xs text-gray-800">Share your expertise and earn</p>
            </div>
          </div>
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200 l-shape-bg fitness-gradient-3">
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
