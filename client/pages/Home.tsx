import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import {
  Dumbbell,
  Apple,
  MessageCircle,
  Utensils,
  Flame,
  Footprints,
  Droplets,
  Newspaper,
  Briefcase,
  Settings,
  Activity,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const MOTIVATIONAL_QUOTES = [
  "Every step counts towards your goal! 🚀",
  "You're doing amazing, keep it up! 💪",
  "Progress over perfection! 🎯",
  "Your body is a temple, treat it right! 🏛️",
  "One day or day one, you decide! ⚡",
];

export default function Home() {
  const navigate = useNavigate();
  const { userProfile, updateProfile } = useAuth();

  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop",
  );
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [stepsTarget, setStepsTarget] = useState(10000);
  const [editStepsTarget, setEditStepsTarget] = useState(stepsTarget);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [pendingMeetings, setPendingMeetings] = useState<any[]>([]);
  const [latestFeed, setLatestFeed] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Sync user data from profile
  useEffect(() => {
    if (userProfile) {
      const isDemoMode = userProfile.id.startsWith("demo-user") || userProfile.id.includes("demo");
      let bioValue = userProfile.bio || "0|0";

      // For demo mode, try to load from localStorage first
      if (isDemoMode) {
        const savedTargets = localStorage.getItem(`targets_${userProfile.id}`);
        if (savedTargets) {
          bioValue = savedTargets;
        }
      }

      const [steps, water] = bioValue.split("|");
      setStepsCompleted(parseInt(steps || "0") || 0);
      setWaterConsumed(parseFloat(water || "0") || 0);

      if (userProfile.cover_image_url) {
        setCoverImage(userProfile.cover_image_url);
      }
    }
  }, [userProfile]);

  // Fetch latest feed
  useEffect(() => {
    const fetchLatestFeed = async () => {
      setLoadingFeed(true);
      try {
        const { data } = await supabase
          .from("posts")
          .select("*, users(full_name, profile_picture_url)")
          .order("created_at", { ascending: false })
          .limit(3);

        setLatestFeed(data || []);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchLatestFeed();
  }, []);

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0] || !userProfile?.id) return;

    const file = e.target.files[0];
    try {
      // Read as data URL and store directly
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
          // Update database with data URL
          if (updateProfile) {
            await updateProfile({
              cover_image_url: dataUrl,
            });
          }

          setCoverImage(dataUrl);
          toast.success("✓ Cover image updated!");
        } catch (error) {
          console.error("Error saving cover image:", error);
          toast.error("Failed to save cover image");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing cover image:", error);
      toast.error("Failed to process cover image");
    }
  };

  // Mock data
  const quote =
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const userWeight = userProfile?.weight_kg || 75;
  const userHeight = userProfile?.height_cm || 175;

  // Calculate water goal based on weight: roughly 30ml per kg
  const waterGoal = Math.round(((userWeight * 30) / 1000) * 10) / 10;

  const stepsGoal = stepsTarget;

  // Calculate calories burned from steps (~0.05 cal per step)
  const caloriesBurned = Math.round(stepsCompleted * 0.05);

  // Calculate BMI
  const heightInMeters = userHeight / 100;
  const bmi =
    Math.round((userWeight / (heightInMeters * heightInMeters)) * 10) / 10;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        category: "Underweight",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    if (bmi < 25)
      return {
        category: "Normal",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    if (bmi < 30)
      return {
        category: "Overweight",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    return { category: "Obese", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const bmiStatus = getBMICategory(bmi);

  const handleSaveTargets = async () => {
    try {
      if (!userProfile?.id) {
        toast.error("User not found");
        return;
      }

      // Update the steps target only (the goal)
      // Don't change the bio field - that stores actual completed steps and water
      setStepsTarget(editStepsTarget);
      setShowTargetsModal(false);
      toast.success("✓ Steps target updated!");
    } catch (error) {
      console.error("Error saving target:", error);
      toast.error("Failed to save target");
    }
  };

  const handleAddSteps = async (amount: number) => {
    try {
      if (!userProfile?.id) {
        toast.error("User not found");
        return;
      }

      const newSteps = stepsCompleted + amount;
      setStepsCompleted(newSteps);

      // Check if demo mode
      const isDemoMode = userProfile.id.startsWith("demo-user") || userProfile.id.includes("demo");

      // Save to Supabase
      const bioValue = `${newSteps}|${waterConsumed}`;

      if (isDemoMode) {
        // Save to localStorage in demo mode
        localStorage.setItem(`targets_${userProfile.id}`, bioValue);
        toast.success(`✓ Added ${amount} steps!`);
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({ bio: bioValue })
        .eq("id", userProfile.id);

      if (error) throw error;

      toast.success(`✓ Added ${amount} steps!`);
    } catch (error) {
      console.error("Error saving steps:", error);
      toast.error("Failed to save steps");
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      if (!userProfile?.id) {
        toast.error("User not found");
        return;
      }

      const newWater = parseFloat((waterConsumed + amount).toFixed(2));
      setWaterConsumed(newWater);

      // Check if demo mode
      const isDemoMode = userProfile.id.startsWith("demo-user") || userProfile.id.includes("demo");

      // Save to Supabase
      const bioValue = `${stepsCompleted}|${newWater}`;

      if (isDemoMode) {
        // Save to localStorage in demo mode
        localStorage.setItem(`targets_${userProfile.id}`, bioValue);
        toast.success(`✓ Added ${amount}L water!`);
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({ bio: bioValue })
        .eq("id", userProfile.id);

      if (error) throw error;

      toast.success(`✓ Added ${amount}L water!`);
    } catch (error) {
      console.error("Error saving water:", error);
      toast.error("Failed to save water");
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    navigate(`/video-meeting?room=${meetingId}`);
    setPendingMeetings(pendingMeetings.filter((m) => m.id !== meetingId));
    toast.success("Joining meeting...");
  };

  const handleDeclineMeeting = (meetingId: string) => {
    setPendingMeetings(pendingMeetings.filter((m) => m.id !== meetingId));
    toast.success("Meeting declined");
  };

  const stepsPercent = Math.round((stepsCompleted / stepsGoal) * 100);
  const caloriesPercent = Math.round((caloriesBurned / 400) * 100); // 400 is typical daily burn
  const waterPercent = Math.round((waterConsumed / waterGoal) * 100);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
        <Logo size="sm" />
      </div>

      {/* Pending Meeting Invites */}
      {pendingMeetings.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-orange-200 px-4 py-4">
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Meeting Invites
            </h3>
            <div className="space-y-2">
              {pendingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white border-2 border-orange-400 rounded-lg p-3 flex items-center justify-between gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {meeting.trainer} • {meeting.time}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleJoinMeeting(meeting.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => handleDeclineMeeting(meeting.id)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-3 py-2 rounded-lg font-semibold text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <svg
            className="w-5 h-5 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
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
              src={
                userProfile?.profile_picture_url ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                  userProfile?.username
              }
              alt="Profile"
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <button
              onClick={() => navigate("/profile")}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition-all"
              title="Edit profile photo"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>

          {/* Welcome Text */}
          <div className="pb-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Ready to train?</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-8 pb-24 relative z-20 space-y-6">
        {/* Progress Bars Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 l-shape-bg fitness-gradient-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Today's Stats</h2>
            <button
              onClick={() => {
                setEditStepsTarget(stepsTarget);
                setShowTargetsModal(true);
              }}
              className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
              Edit Steps
            </button>
          </div>
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
              <span className="text-sm font-bold text-orange-600">
                {stepsCompleted.toLocaleString()} / {stepsGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 shadow-lg shadow-orange-600/50"
                style={{ width: `${Math.min(stepsPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stepsPercent}% of daily goal
            </p>
          </button>

          {/* Quick Add Steps Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAddSteps(100)}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +100 steps
            </button>
            <button
              onClick={() => handleAddSteps(500)}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +500 steps
            </button>
          </div>

          {/* Quick Add Water Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAddWater(0.2)}
              className="flex-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +200ml
            </button>
            <button
              onClick={() => handleAddWater(0.5)}
              className="flex-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +500ml
            </button>
            <button
              onClick={() => handleAddWater(1)}
              className="flex-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +1L
            </button>
          </div>

          {/* Calories Progress */}
          <button
            onClick={() => navigate("/activity/calories")}
            className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-gray-900">
                  Calories Burned
                </span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {caloriesBurned} cal
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 transition-all duration-500 shadow-lg shadow-red-600/50"
                style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              ~{caloriesBurned} cal from {stepsCompleted} steps
            </p>
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
              <span className="text-sm font-bold text-cyan-600">
                {waterConsumed}L / {waterGoal}L
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500 shadow-lg shadow-cyan-600/50"
                style={{ width: `${Math.min(waterPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {waterPercent}% of daily goal
            </p>
          </button>
        </div>

        {/* BMI Index Card */}
        <div
          className={`${bmiStatus.bgColor} border-2 border-gray-200 rounded-2xl p-6 space-y-4`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={`w-6 h-6 ${bmiStatus.color}`} />
              <h2 className="text-lg font-bold text-gray-900">BMI Index</h2>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${bmiStatus.color} mb-2`}>
              {bmi}
            </div>
            <p className={`text-sm font-semibold ${bmiStatus.color} mb-3`}>
              {bmiStatus.category}
            </p>
            <p className="text-xs text-gray-600">
              Height: {userHeight}cm | Weight: {userWeight}kg
            </p>
          </div>
          <div className="flex gap-2 text-xs text-gray-700">
            <div className="flex-1 text-center">
              <p className="font-semibold">Normal</p>
              <p className="text-gray-500">18.5 - 24.9</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-semibold">Overweight</p>
              <p className="text-gray-500">25 - 29.9</p>
            </div>
          </div>
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
              background:
                "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FFA502 50%, #FFB700 75%, #FF6B6B 100%)",
              backgroundSize: "300% 300%",
              animation: "gradientFlow 8s ease infinite",
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
              <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                Become a Trainer
              </h3>
              <p className="text-xs text-gray-800">
                Share your expertise and earn
              </p>
            </div>
          </div>
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200 l-shape-bg fitness-gradient-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Unlock Premium
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Unlimited video sessions, full meal tracking, and priority chat
            support.
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Subscribe ₹199/mo
          </button>
        </div>

        {/* Latest Feed Posts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground px-2">
            📰 Latest Posts
          </h3>
          {loadingFeed ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin h-8 w-8 text-primary">
                <svg viewBox="0 0 50 50">
                  <circle
                    className="opacity-30"
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                  />
                  <circle
                    className="text-primary"
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray="100"
                    strokeDashoffset="75"
                  />
                </svg>
              </div>
            </div>
          ) : latestFeed.length > 0 ? (
            latestFeed.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      post.users?.profile_picture_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`
                    }
                    alt={post.users?.full_name || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {post.users?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-3 line-clamp-3">
                  {post.content}
                </p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full rounded-lg mb-3 object-cover max-h-48"
                  />
                )}
                <button
                  onClick={() => navigate("/feed")}
                  className="text-xs font-semibold text-primary hover:text-primary/80"
                >
                  View More Posts →
                </button>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No posts yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Targets Edit Modal */}
      {showTargetsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Edit Daily Targets
            </h2>
            <p className="text-sm text-gray-600">
              Set your daily goals. Calories burned are calculated from steps.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Steps Goal
                </label>
                <input
                  type="number"
                  value={editStepsTarget}
                  onChange={(e) =>
                    setEditStepsTarget(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calories burned = steps × 0.05 cal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Consumed Today (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={waterConsumed}
                  onChange={(e) =>
                    setWaterConsumed(parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 2.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Daily goal: {waterGoal}L (based on your weight)
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowTargetsModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
