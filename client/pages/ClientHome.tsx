import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Flame,
  Droplets,
  Footprints,
  Zap,
  Users,
  Apple,
  Utensils,
  Trophy,
  Award,
  Briefcase,
  ArrowRight,
  Heart,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  User,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useStepCounter } from "@/hooks/useStepCounter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MetricDetailsModal from "@/components/MetricDetailsModal";

export default function ClientHome() {
  const { userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { steps } = useStepCounter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [editStepsTarget, setEditStepsTarget] = useState(10000);

  // Metric details modal state
  const [openMetric, setOpenMetric] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState({
    steps: [8000, 9500, 7200, 10500, 8900, 9200, 8800],
    calories: [2100, 2400, 1900, 2600, 2200, 2300, 2000],
    water: [1500, 2000, 1800, 2100, 1900, 2200, 1700],
    distance: [5.2, 6.1, 4.8, 7.2, 5.9, 6.3, 5.1],
  });

  // Initialize images from userProfile when it loads
  useEffect(() => {
    if (userProfile?.cover_image_url) {
      console.log("[ClientHome] Loading cover image from userProfile");
      setCoverImage(userProfile.cover_image_url);
    }
    if (userProfile?.profile_picture_url) {
      console.log("[ClientHome] Loading profile picture from userProfile");
      setProfilePicture(userProfile.profile_picture_url);
    }
  }, [userProfile?.cover_image_url, userProfile?.profile_picture_url]);

  // User greeting
  const userGreeting = userProfile?.full_name?.split(" ")[0] || "User";

  // Real data from hooks and profile
  const stepsToday = steps || 0;
  const stepsTarget = editStepsTarget;

  // Auto-calculate calories from steps (approx 0.05 cal per step)
  const caloriesBurned =
    Math.round(stepsToday * 0.05) || dailyStats?.calories_burned || 0;
  const caloriesTarget = 2000;

  // Auto-calculate water intake based on weight (30ml per kg of body weight)
  const autoWaterTarget = userProfile?.weight_kg
    ? Math.round(userProfile.weight_kg * 30)
    : 2500;

  const distanceKm = dailyStats?.distance_km || 0;

  const bmiValue =
    userProfile?.weight_kg && userProfile?.height_cm
      ? (userProfile.weight_kg / (userProfile.height_cm / 100) ** 2).toFixed(1)
      : null;
  const bmiStatus = bmiValue
    ? parseFloat(bmiValue) < 18.5
      ? "Underweight"
      : parseFloat(bmiValue) < 25
        ? "Normal"
        : parseFloat(bmiValue) < 30
          ? "Overweight"
          : "Obese"
    : "Not set";
  const currentStreak = dailyStats?.streak_days || 0;

  // Fetch daily stats from database
  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);

        // Ensure we have a valid session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("[Stats] Session check error:", sessionError);
          setLoading(false);
          return;
        }

        if (!sessionData?.session?.access_token) {
          console.warn("[Stats] No valid session - cannot fetch daily stats");
          setLoading(false);
          return;
        }

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Fetch daily stats
        const { data, error } = await supabase
          .from("daily_stats")
          .select("*")
          .eq("user_id", userProfile.id)
          .eq("date", today)
          .single()
          .catch((err) => {
            console.warn(
              "[Stats] Supabase call failed, using fallback data:",
              err?.message,
            );
            return { data: null, error: err };
          });

        if (data) {
          setDailyStats(data);
          if (data.water_consumed) {
            setWaterConsumed(data.water_consumed);
          }
        }
      } catch (err) {
        console.warn(
          "[Stats] Fetch error:",
          err instanceof Error ? err.message : "Unknown error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, [userProfile?.id]);

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userProfile?.id) return;

      try {
        // Ensure we have a valid session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("[Notifications] Session check error:", sessionError);
          return;
        }

        if (!sessionData?.session?.access_token) {
          console.warn(
            "[Notifications] No valid session - cannot fetch notifications",
          );
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userProfile.id)
          .eq("read", false)
          .catch((err) => {
            console.warn("[Notifications] Failed to fetch:", err?.message);
            return { data: null, error: err };
          });

        if (data) {
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.warn(
          "[Notifications] Fetch error:",
          err instanceof Error ? err.message : "Unknown error",
        );
      }
    };

    fetchUnreadCount();
  }, [userProfile?.id]);

  // Debug: Log user profile on mount
  useEffect(() => {
    console.log("=== ClientHome Mounted ===");
    console.log("User Profile ID:", userProfile?.id);
    console.log("User Profile Email:", userProfile?.email);
  }, [userProfile?.id]);

  // Fetch cover image from Supabase database
  useEffect(() => {
    const fetchCoverImage = async () => {
      if (!userProfile?.id) return;

      try {
        // First ensure we have a valid session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("[Cover] Session check error:", sessionError);
          return;
        }

        if (!sessionData?.session?.access_token) {
          console.warn("[Cover] No valid session - cannot fetch cover image");
          return;
        }

        console.log(
          "[Cover] Session valid, fetching cover image for user:",
          userProfile.id,
        );

        const { data, error } = await supabase
          .from("users")
          .select("cover_image_url")
          .eq("id", userProfile.id)
          .single();

        if (error) {
          console.error("[Cover] Error fetching cover image:", {
            code: error?.code,
            message: error?.message,
            details: error?.details,
          });
          return;
        }

        if (data?.cover_image_url) {
          console.log("[Cover] ✅ Cover image fetched from database");
          setCoverImage(data.cover_image_url);
        } else {
          console.log("[Cover] No cover image found in database");
        }
      } catch (err) {
        console.error("[Cover] Error fetching cover image:", err);
      }
    };

    fetchCoverImage();
  }, [userProfile?.id]);

  // Subscribe to real-time profile updates
  useEffect(() => {
    if (!userProfile?.id) return;

    console.log("Setting up realtime subscription for user:", userProfile.id);

    const subscription = supabase
      .channel(`profile_${userProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${userProfile.id}`,
        },
        (payload) => {
          console.log("Profile updated in realtime:", payload);
          if (payload.new) {
            const updatedProfile = payload.new as any;
            // Update cover image if changed
            if (updatedProfile.cover_image_url) {
              console.log("Cover image updated from realtime");
              setCoverImage(updatedProfile.cover_image_url);
            }
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      subscription.unsubscribe();
    };
  }, [userProfile?.id]);

  const handleAddWater = async (amount: number) => {
    if (!userProfile?.id) return;

    const newTotal = waterConsumed + amount;
    setWaterConsumed(newTotal);

    try {
      const today = new Date().toISOString().split("T")[0];

      if (dailyStats) {
        await supabase
          .from("daily_stats")
          .update({ water_consumed: newTotal })
          .eq("user_id", userProfile.id)
          .eq("date", today);
      } else {
        await supabase.from("daily_stats").insert([
          {
            user_id: userProfile.id,
            date: today,
            water_consumed: newTotal,
            steps: stepsToday,
          },
        ]);
      }
    } catch (err) {
      console.log("Could not update water");
    }
  };

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    console.log(
      "Cover upload triggered - File:",
      file?.name,
      "User ID:",
      userProfile?.id,
    );

    if (!file || !userProfile?.id) {
      console.log("Cover upload - Missing file or user ID");
      return;
    }

    try {
      console.log("Starting cover image upload for user:", userProfile.id);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result as string;
          console.log("Cover image converted to base64, size:", dataUrl.length);
          console.log("Updating profile with cover_image_url...");

          // Update profile through auth context
          await updateProfile({ cover_image_url: dataUrl });
          console.log("✅ Cover image update successful");
          setCoverImage(dataUrl);
          toast.success("Cover image updated!");

          // Clear the input
          e.target.value = "";

          console.log(
            "✅ Cover image upload completed - AuthContext will verify the save",
          );
        } catch (err) {
          console.error("❌ Error in cover upload onload:", err);
          toast.error("Failed to update cover image");
          e.target.value = "";
        }
      };
      reader.onerror = () => {
        console.error("❌ FileReader error");
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Cover upload error:", err);
      toast.error("Failed to update cover image");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveStepsGoal = () => {
    if (editStepsTarget > 0) {
      setShowStepsModal(false);
      toast.success(`Steps goal updated to ${editStepsTarget}`);
    } else {
      toast.error("Please enter a valid steps goal");
    }
  };

  const quickAccessTiles = [
    {
      label: "Trainers",
      icon: Users,
      color: "from-orange-400 to-orange-500",
      onClick: () => navigate("/trainers"),
    },
    {
      label: "Nutritionists",
      icon: Apple,
      color: "from-green-400 to-green-500",
      onClick: () => navigate("/nutritionists"),
    },
    {
      label: "Meal Tracker",
      icon: Utensils,
      color: "from-blue-400 to-blue-500",
      onClick: () => navigate("/meals"),
    },
    {
      label: "CoCircle",
      icon: Users,
      color: "from-purple-400 to-purple-500",
      onClick: () => navigate("/community"),
    },
    {
      label: "Quests",
      icon: Trophy,
      color: "from-yellow-400 to-yellow-500",
      onClick: () => navigate("/quests"),
    },
    {
      label: "Become a Trainer",
      icon: Award,
      color: "from-pink-400 to-pink-500",
      onClick: () => navigate("/trainer-signup"),
    },
  ];

  const suggestionCards = [
    {
      title: "Stay hydrated",
      description: "Drink more water",
      icon: Droplets,
    },
    {
      title: "Walk daily",
      description: "Aim for 10k steps",
      icon: Footprints,
    },
    {
      title: "Rest well",
      description: "8 hours sleep",
      icon: Heart,
    },
  ];

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/nutrition", label: "Nutrition", icon: Utensils },
    { path: "/discover", label: "Discover", icon: MapPin },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      {/* Mobile Container - max width for native feel (390px iPhone-like) */}
      <div className="flex-1 w-full max-w-[430px] mx-auto flex flex-col relative">
        {/* Decorative background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-[430px] mx-auto">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Main Content - Navigation will overlap */}
        <div className="relative z-10 flex-1 overflow-y-auto pb-28">
          {/* 1. Top Right Notification Bell - Outline Style */}
          <div className="absolute top-4 right-5 z-50">
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex items-center justify-center transition-all active:scale-95"
            >
              <Bell
                size={24}
                className="text-white drop-shadow-lg fill-white"
                strokeWidth={0}
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg min-w-fit">
                  {unreadCount}
                </div>
              )}
            </button>
          </div>

          {/* 2. Full-Width Cover Image with Centered Profile Overlay */}
          <div className="relative -mx-5 mb-12 h-56 group overflow-visible">
            {/* Background Cover Image */}
            <img
              src={
                coverImage ||
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay (darker at bottom for text contrast) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>

            {/* Cover Image Picker - Right Corner Circle */}
            <div className="absolute right-4 -bottom-8 pointer-events-auto">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  id="coverImageInput"
                />
                <label
                  htmlFor="coverImageInput"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-500 font-bold text-sm overflow-hidden flex-shrink-0 shadow-lg border-2 border-white hover:shadow-xl transition-all active:scale-95 relative group cursor-pointer"
                >
                  {/* Camera Icon for Cover */}
                  <div className="flex items-center justify-center w-full h-full">
                    <Camera size={16} className="text-orange-500" />
                  </div>
                </label>
              </div>
            </div>

            {/* Centered Profile Picture - Display Only, No Upload */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden flex-shrink-0 shadow-xl border-4 border-white relative">
                {profilePicture || userProfile?.profile_picture_url ? (
                  <img
                    src={profilePicture || userProfile?.profile_picture_url!}
                    alt={userProfile?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(userProfile?.full_name)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Welcome Text Section - Below cover image */}
          <div className="px-5 mb-6 text-center mt-20">
            <p className="text-gray-600 text-sm font-medium">Welcome back,</p>
            <h1 className="text-gray-900 text-3xl font-bold">
              {userProfile?.full_name || "User"}
            </h1>
          </div>

          {/* 3. Banner Card - CTA Section */}
          <div className="mx-5 mb-6 rounded-3xl overflow-hidden relative bg-white">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏋️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    Ready to train?
                  </p>
                  <p className="text-xs text-gray-600">
                    Start your workout now
                  </p>
                </div>
                <button className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center hover:shadow-lg transition-all active:scale-95">
                  <ArrowRight size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. 2x2 Metric Tiles Grid */}
          <div className="mx-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Steps Tile */}
              <button
                onClick={() => setOpenMetric("steps")}
                className="group backdrop-blur-md bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-300 rounded-3xl p-5 shadow-md border border-orange-200/50 text-left hover:shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Steps
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stepsToday.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Footprints size={20} className="text-white" />
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min((stepsToday / stepsTarget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-2">
                  {Math.min((stepsToday / stepsTarget) * 100, 100).toFixed(0)}%
                  of {stepsTarget.toLocaleString()}
                </p>
              </button>

              {/* Calories Tile */}
              <button
                onClick={() => setOpenMetric("calories")}
                className="group backdrop-blur-md bg-gradient-to-br from-red-400 via-red-300 to-pink-300 rounded-3xl p-5 shadow-md border border-red-200/50 text-left hover:shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Calories
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {caloriesBurned}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame size={20} className="text-white" />
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min((caloriesBurned / caloriesTarget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-2">
                  {Math.min(
                    (caloriesBurned / caloriesTarget) * 100,
                    100,
                  ).toFixed(0)}
                  % of {caloriesTarget}
                </p>
              </button>

              {/* Water Tile */}
              <button
                onClick={() => setOpenMetric("water")}
                className="group backdrop-blur-md bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-300 rounded-3xl p-5 shadow-md border border-blue-200/50 text-left hover:shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Water
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {(waterConsumed / 1000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets size={20} className="text-white" />
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min((waterConsumed / autoWaterTarget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-2">
                  {Math.min(
                    (waterConsumed / autoWaterTarget) * 100,
                    100,
                  ).toFixed(0)}
                  % of {(autoWaterTarget / 1000).toFixed(1)}L
                </p>
              </button>

              {/* Distance Tile */}
              <button
                onClick={() => setOpenMetric("distance")}
                className="group backdrop-blur-md bg-gradient-to-br from-green-400 via-green-300 to-emerald-300 rounded-3xl p-5 shadow-md border border-green-200/50 text-left hover:shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Distance
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {distanceKm.toFixed(1)}km
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin size={20} className="text-white" />
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min((distanceKm / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-2">
                  {Math.min((distanceKm / 10) * 100, 100).toFixed(0)}% of 10km
                </p>
              </button>
            </div>
          </div>

          {/* 5. BMI Card */}
          <div className="mx-5 mb-6 backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  BMI Index
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {bmiValue || "—"}
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-purple-100 text-xs font-medium text-purple-700">
                  {bmiStatus}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Height
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {userProfile?.height_cm || "—"} cm
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Weight
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {userProfile?.weight_kg || "—"} kg
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Streak Card */}
          <div className="mx-5 mb-6 backdrop-blur-md bg-white/90 rounded-3xl px-5 py-4 shadow-lg border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame size={24} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Current streak
              </p>
              <p className="text-lg font-bold text-gray-900">
                {currentStreak} days
              </p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <div
                  key={day}
                  className={`w-2 h-2 rounded-full ${
                    day < currentStreak ? "bg-orange-400" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 6. Quick Access Grid */}
          <div className="mx-5 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Quick access
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickAccessTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.label}
                    onClick={tile.onClick}
                    className="backdrop-blur-2xl rounded-3xl p-4 transition-all duration-300 flex flex-col items-center gap-2 group active:scale-95 border border-white/40 hover:border-white/80 hover:scale-105"
                    style={{
                      background:
                        tile.label === "Trainers"
                          ? "linear-gradient(135deg, rgba(251, 146, 60, 0.65), rgba(249, 115, 22, 0.85))"
                          : tile.label === "Nutritionists"
                            ? "linear-gradient(135deg, rgba(96, 165, 250, 0.65), rgba(59, 130, 246, 0.85))"
                            : tile.label === "Meal Tracker"
                              ? "linear-gradient(135deg, rgba(74, 222, 128, 0.65), rgba(34, 197, 94, 0.85))"
                              : tile.label === "CoCircle"
                                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.65), rgba(139, 92, 246, 0.85))"
                                : tile.label === "Quests"
                                  ? "linear-gradient(135deg, rgba(253, 224, 71, 0.65), rgba(234, 179, 8, 0.85))"
                                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.65), rgba(220, 38, 38, 0.85))",
                      backdropFilter: "blur(25px)",
                      WebkitBackdropFilter: "blur(25px)",
                      boxShadow:
                        "0 4px 16px 0 rgba(0, 0, 0, 0.1), inset 0 1px 3px 0 rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300`}
                    >
                      <Icon size={20} className="text-white drop-shadow-lg" />
                    </div>
                    <p className="text-xs font-semibold text-white text-center drop-shadow">
                      {tile.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Smart Suggestions */}
          <div className="mb-8">
            <div className="px-5 mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Smart suggestions for you
              </h3>
            </div>
            <div className="px-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {suggestionCards.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-40 backdrop-blur-md bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-2xl p-4 border border-orange-300/20 snap-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center mb-3">
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-gray-700">
                      {suggestion.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8. Latest from CoCircle */}
          <div className="mx-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Latest from CoCircle
            </h3>

            {/* Empty state */}
            <div className="backdrop-blur-md bg-white/90 rounded-3xl p-8 shadow-lg border border-white/20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Zap size={32} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">No posts yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Check back soon for community updates
              </p>
              <button
                onClick={() => navigate("/community")}
                className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs font-medium hover:from-orange-500 hover:to-yellow-500 transition-all flex items-center gap-2 active:scale-95"
              >
                Explore CoCircle
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar - Fixed & Overlapping */}
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto">
          {/* Fade effect above nav */}
          <div className="h-6 bg-gradient-to-t from-white/95 via-white/50 to-transparent pointer-events-none"></div>

          {/* Navigation */}
          <nav className="bg-white/95 backdrop-blur-xl border-t border-white/40 shadow-2xl">
            <div className="flex items-center justify-around px-2 py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Steps Goal Modal */}
      {showStepsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Set Daily Goals</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                📊 Steps are automatically counted from your device sensors
              </p>
            </div>

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
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calories burned = steps × 0.05 cal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Goal (ml)
                </label>
                <input
                  type="number"
                  value={autoWaterTarget}
                  disabled
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-600 focus:outline-none cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated based on your weight ({userProfile?.weight_kg}
                  kg × 30ml)
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStepsModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStepsGoal}
                className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white font-medium py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
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
