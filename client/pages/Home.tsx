import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StreaksCard from "@/components/StreaksCard";
import MoodTrackerDB from "@/components/MoodTrackerDB";
import ProgressTracker from "@/components/ProgressTracker";
import WeeklyMoodDropdown from "@/components/WeeklyMoodDropdown";
import SubscriptionModal from "@/components/SubscriptionModal";
import {
  Dumbbell,
  Apple,
  Utensils,
  Flame,
  Footprints,
  Droplets,
  Newspaper,
  Settings,
  Activity,
  Upload,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useHealthSync } from "@/hooks/useHealthSync";
import { useStepCounter } from "@/hooks/useStepCounter";
import { useStepAchievements } from "@/hooks/useStepAchievements";
import NotificationsDropdown from "@/components/NotificationsDropdown";

const MOTIVATIONAL_QUOTES = [
  "Every step counts towards your goal! 🚀",
  "You're doing amazing, keep it up! 💪",
  "Progress over perfection! 🎯",
  "Your body is a temple, treat it right! ��️",
  "One day or day one, you decide! ��",
];

export default function Home() {
  const navigate = useNavigate();
  const { userProfile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    todaySteps: syncedSteps,
    isSyncing,
    hasPermission,
    requestPermissions,
    syncTodaySteps,
    isAvailable: isHealthSyncAvailable,
  } = useHealthSync();
  const { steps, isTracking } = useStepCounter();
  const { newlyUnlocked: newAchievement } = useStepAchievements(steps);

  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop",
  );
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [stepsTarget, setStepsTarget] = useState(10000);
  const [editStepsTarget, setEditStepsTarget] = useState(10000);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [pendingMeetings, setPendingMeetings] = useState<any[]>([]);
  const [latestFeed, setLatestFeed] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [showHealthPermissionPrompt, setShowHealthPermissionPrompt] = useState(
    isHealthSyncAvailable && !hasPermission,
  );
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Sync user data from profile and auto step counter
  useEffect(() => {
    if (userProfile) {
      const isDemoMode =
        userProfile.id.startsWith("demo-user") ||
        userProfile.id.includes("demo");

      // Always start with bio from Supabase
      let bioValue = userProfile.bio || "0|0";

      // For demo mode, try to load from localStorage first
      if (isDemoMode) {
        const savedTargets = localStorage.getItem(`targets_${userProfile.id}`);
        if (savedTargets) {
          bioValue = savedTargets;
        }
      }

      // Parse the bio value safely
      const parts = bioValue.split("|");
      const water = parseFloat(parts[1] || "0") || 0;

      setWaterConsumed(water);

      if (userProfile.cover_image_url) {
        setCoverImage(userProfile.cover_image_url);
      }
    }
  }, [userProfile?.id, userProfile?.bio, userProfile?.cover_image_url]);

  // Fetch latest feed
  useEffect(() => {
    const fetchLatestFeed = async () => {
      setLoadingFeed(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*, users(full_name, profile_picture_url)")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          // Silently handle error - app can work without feed
          console.debug("Feed unavailable:", error.message);
          setLatestFeed([]);
        } else {
          setLatestFeed(data || []);
        }
      } catch (error) {
        // Silently handle network errors - app can work without feed
        console.debug("Error fetching feed - continuing without it");
        setLatestFeed([]);
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

      // Update the steps target (the goal)
      setStepsTarget(stepsTarget);

      // Save water consumed to Supabase (in case it was edited)
      const isDemoMode =
        userProfile.id.startsWith("demo-user") ||
        userProfile.id.includes("demo");
      const bioValue = `${steps}|${waterConsumed}`;

      if (!isDemoMode) {
        const { error } = await supabase
          .from("users")
          .update({ bio: bioValue })
          .eq("id", userProfile.id);

        if (error) throw error;
      } else {
        localStorage.setItem(`targets_${userProfile.id}`, bioValue);
      }

      setShowTargetsModal(false);
      toast.success("✓ Step target updated!");
    } catch (error) {
      console.error("Error saving targets:", error);
      toast.error("Failed to save targets");
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
      const isDemoMode =
        userProfile.id.startsWith("demo-user") ||
        userProfile.id.includes("demo");

      // Save to Supabase
      const bioValue = `${steps}|${newWater}`;

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

  const stepsPercent = Math.round((steps / stepsGoal) * 100);
  const waterPercent = Math.round((waterConsumed / waterGoal) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Pending Meeting Invites */}
      {pendingMeetings.length > 0 && (
        <div className="bg-muted/50 border-b border-border px-4 py-4">
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground mb-3">
              Meeting Invites
            </h3>
            <div className="space-y-2">
              {pendingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-2 shadow-md hover:shadow-lg transition-shadow"
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

        {/* Welcome Text - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Welcome,
          </h1>
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            {userProfile?.full_name?.split(" ")[0] || "User"}
          </p>
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 right-4 flex gap-3">
          {/* Notification Dropdown */}
          <NotificationsDropdown />

          {/* Edit Cover Button */}
          <label className="p-3 cursor-pointer shadow-lg hover:shadow-xl transition-all">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-8 pb-24 relative z-20 space-y-6">
        {/* Motivational Quote Tile */}
        <div
          className={`rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-orange-900/40 to-amber-900/30 border border-orange-700/40 shadow-md"
              : "bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-300/40 shadow-md"
          }`}
        >
          <div className="relative z-10">
            <div
              className="text-3xl mb-3 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              ✨
            </div>
            <p
              className={`text-lg font-bold leading-relaxed animate-pulse ${
                theme === "dark" ? "text-orange-100" : "text-orange-900"
              }`}
            >
              {quote}
            </p>
            <div className="mt-4 flex gap-1 justify-end">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    theme === "dark" ? "bg-orange-600/60" : "bg-orange-400/60"
                  }`}
                  style={{
                    animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Sync Permission Banner */}
        {isHealthSyncAvailable &&
          !hasPermission &&
          showHealthPermissionPrompt && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Auto-sync Your Steps
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                  Connect your phone's health data to automatically track your
                  steps.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const granted = await requestPermissions();
                      if (granted) {
                        setShowHealthPermissionPrompt(false);
                        toast.success("Health data access granted!");
                        await syncTodaySteps();
                      }
                    }}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Connect Now
                  </button>
                  <button
                    onClick={() => setShowHealthPermissionPrompt(false)}
                    className="text-xs font-semibold bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-900 dark:text-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Progress Bars Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-6 l-shape-bg fitness-gradient-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Today's Stats
            </h2>
            <div className="flex items-center gap-2">
              {isHealthSyncAvailable && (
                <button
                  onClick={async () => {
                    if (!hasPermission) {
                      const granted = await requestPermissions();
                      if (granted) {
                        setShowHealthPermissionPrompt(false);
                        toast.success(
                          "Health data access granted! Syncing steps...",
                        );
                        await syncTodaySteps();
                      }
                    } else {
                      await syncTodaySteps();
                    }
                  }}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    hasPermission
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  } disabled:opacity-50`}
                  title={
                    hasPermission
                      ? "Sync steps from phone"
                      : "Connect to health data"
                  }
                >
                  <Activity
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing
                    ? "Syncing..."
                    : hasPermission
                      ? "Synced"
                      : "Connect"}
                </button>
              )}
              <button
                onClick={() => {
                  setEditStepsTarget(stepsTarget);
                  setShowTargetsModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
              >
                <Settings className="w-4 h-4" />
                Set Daily Goal
              </button>
            </div>
          </div>
          {/* Steps Progress */}
          <div className="flex items-center justify-between w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-colors">
            <button
              onClick={() => navigate("/activity/steps")}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Steps
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-orange-600">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {stepsPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 shadow-lg shadow-orange-600/50"
                  style={{ width: `${Math.min(stepsPercent, 100)}%` }}
                />
              </div>
            </button>
            <button
              onClick={() => setShowTargetsModal(true)}
              className="ml-3 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-semibold rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-xs flex items-center gap-1"
            >
              +
            </button>
          </div>

          {/* Achievement Notification */}
          {newAchievement && (
            <div className="flex gap-2 pt-2 animate-pulse bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 p-3 rounded-lg border-l-4 border-yellow-500">
              <div className="text-2xl">{newAchievement.icon}</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-yellow-900 dark:text-yellow-200">
                  {newAchievement.title}! 🎉
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {newAchievement.description}
                </p>
              </div>
            </div>
          )}

          {/* Calories Burned */}
          <div className="flex items-center justify-between w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-colors">
            <button
              onClick={() => navigate("/activity/steps")}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Calories
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-red-600">
                  {Math.round(steps * 0.05)} cal
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {Math.min(Math.round((steps * 0.05) / 20), 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-500 shadow-lg shadow-red-600/50"
                  style={{
                    width: `${Math.min(Math.round((steps * 0.05) / 20), 100)}%`,
                  }}
                />
              </div>
            </button>
            <button
              onClick={() => setShowTargetsModal(true)}
              className="ml-3 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs flex items-center gap-1"
            >
              +
            </button>
          </div>

          {/* Water Intake Progress */}
          <div className="flex items-center justify-between w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-colors">
            <button
              onClick={() => navigate("/activity/water")}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Water
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyan-600">
                  {waterConsumed}L ({Math.round(waterConsumed * 1000)}ml)
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {waterPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500 shadow-lg shadow-cyan-600/50"
                  style={{ width: `${Math.min(waterPercent, 100)}%` }}
                />
              </div>
            </button>
            <button
              onClick={() => setShowTargetsModal(true)}
              className="ml-3 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-semibold rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors text-xs flex items-center gap-1"
            >
              +
            </button>
          </div>

          {/* Quick Add Water Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAddWater(0.2)}
              className="flex-1 bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +200ml
            </button>
            <button
              onClick={() => handleAddWater(0.5)}
              className="flex-1 bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +500ml
            </button>
            <button
              onClick={() => handleAddWater(1)}
              className="flex-1 bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              +1L
            </button>
          </div>
        </div>

        {/* BMI Index Card */}
        <div
          className={`${bmiStatus.bgColor} rounded-2xl p-6 space-y-4 dark:bg-gray-800`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={`w-6 h-6 ${bmiStatus.color}`} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                BMI Index
              </h2>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${bmiStatus.color} mb-2`}>
              {bmi}
            </div>
            <p className={`text-sm font-semibold ${bmiStatus.color} mb-3`}>
              {bmiStatus.category}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Height: {userHeight}cm | Weight: {userWeight}kg
            </p>
          </div>
          <div className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex-1 text-center">
              <p className="font-semibold">Normal</p>
              <p className="text-gray-500 dark:text-gray-400">18.5 - 24.9</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-semibold">Overweight</p>
              <p className="text-gray-500 dark:text-gray-400">25 - 29.9</p>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="space-y-3 rounded-2xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/discover")}
              className="backdrop-blur-md bg-gradient-to-br from-blue-400/40 to-cyan-400/40 hover:from-blue-400/60 hover:to-cyan-400/60 border border-blue-300/30 hover:border-blue-300/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Dumbbell className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <p className="font-semibold text-sm">Trainers</p>
              <p className="text-white/80 text-xs mt-0.5">Find trainers</p>
            </button>
            <button
              onClick={() => navigate("/discover")}
              className="backdrop-blur-md bg-gradient-to-br from-purple-400/40 to-pink-400/40 hover:from-purple-400/60 hover:to-pink-400/60 border border-purple-300/30 hover:border-purple-300/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Apple className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <p className="font-semibold text-sm">Nutritionists</p>
              <p className="text-white/80 text-xs mt-0.5">Find experts</p>
            </button>
            <button
              onClick={() => navigate("/meals")}
              className="backdrop-blur-md bg-gradient-to-br from-green-400/40 to-emerald-400/40 hover:from-green-400/60 hover:to-emerald-400/60 border border-green-300/30 hover:border-green-300/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Utensils className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <p className="font-semibold text-sm">Meal Tracker</p>
              <p className="text-white/80 text-xs mt-0.5">Log nutrition</p>
            </button>
            <button
              onClick={() => navigate("/feed")}
              className="backdrop-blur-md bg-gradient-to-br from-orange-400/40 to-yellow-400/40 hover:from-orange-400/60 hover:to-yellow-400/60 border border-orange-300/30 hover:border-orange-300/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Newspaper className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <p className="font-semibold text-sm">Feed</p>
              <p className="text-white/80 text-xs mt-0.5">Community posts</p>
            </button>
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

        {/* Daily Streak Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
            📊 Your Progress
          </h2>
          <StreaksCard compact={false} />
        </div>

        {/* Mood Tracker Section */}
        <div className="mt-6">
          <MoodTrackerDB />
        </div>

        {/* Weekly Mood Dropdown */}
        <div className="mt-6">
          <WeeklyMoodDropdown />
        </div>

        {/* Progress Goals Section */}
        <div className="mt-6">
          <ProgressTracker />
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <Newspaper className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No posts yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Targets Edit Modal */}
      {showTargetsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-border/40">
            <h2 className="text-lg font-bold text-foreground">
              Set Daily Goals
            </h2>
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                �� Steps are automatically counted from your device sensors
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Steps Goal
                </label>
                <input
                  type="number"
                  value={editStepsTarget}
                  onChange={(e) =>
                    setEditStepsTarget(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Calories burned = steps × 0.05 cal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 2.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Daily goal: {waterGoal}L (based on your weight)
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTargetsModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlan={
          (userProfile?.subscription_plan || "free") as
            | "free"
            | "basic"
            | "premium"
        }
      />
    </div>
  );
}
