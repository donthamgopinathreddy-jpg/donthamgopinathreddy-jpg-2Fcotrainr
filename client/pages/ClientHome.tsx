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
  Camera,
  TrendingUp,
  Activity,
  Settings,
  Plus,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useStepCounter } from "@/hooks/useStepCounter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import UnifiedMetricsModal from "@/components/UnifiedMetricsModal";

export default function ClientHome() {
  const { userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
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
  const [editCaloriesTarget, setEditCaloriesTarget] = useState(2000);

  // Unified metrics modal state
  const [showMetricsModal, setShowMetricsModal] = useState(false);
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
  const caloriesTarget = editCaloriesTarget;

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
    if (editStepsTarget > 0 && editCaloriesTarget > 0) {
      setShowStepsModal(false);
      toast.success(
        `Goals updated: ${editStepsTarget} steps, ${editCaloriesTarget} calories`,
      );
    } else {
      toast.error("Please enter valid values for both goals");
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
      label: "Online Meeting",
      icon: Users,
      color: "from-cyan-400 to-blue-500",
      onClick: () => navigate("/video-sessions"),
    },
    {
      label: "CoCircle",
      icon: Users,
      color: "from-purple-400 to-purple-500",
      onClick: () => navigate("/community"),
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

  return (
    <div className="w-full h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col relative overflow-hidden">
      {/* Mobile Container - max width for native feel (390px iPhone-like) */}
      <div className="w-full h-full flex flex-col relative">
        {/* Decorative background elements - contained properly */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Main Content - Navigation will overlap */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-24">
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

          {/* 4. Clean Metrics Grid - Steps, Calories, Distance, Water */}
          <div className="mx-5 mb-6 space-y-3">
            {/* Top Row - Steps and Calories */}
            <div className="grid grid-cols-2 gap-3">
              {/* Steps Card */}
              <div
                onClick={() => setShowMetricsModal(true)}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5 h-32 flex flex-col items-start justify-between text-white">
                  <div className="flex items-start justify-between w-full">
                    <Footprints size={28} className="text-white/80" />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStepsModal(true);
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <Settings size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/70">
                      Daily Steps
                    </p>
                    <p className="text-xl font-black text-white">
                      {(stepsToday / 1000).toFixed(1)}k /{" "}
                      {(stepsTarget / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>

              {/* Calories Card */}
              <div
                onClick={() => setShowMetricsModal(true)}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-pink-500 to-rose-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5 h-32 flex flex-col items-start justify-between text-white">
                  <div className="flex items-start justify-between w-full">
                    <Flame size={28} className="text-white/80" />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStepsModal(true);
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <Settings size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/70">
                      Calories
                    </p>
                    <p className="text-xl font-black text-white">
                      {caloriesBurned} / {caloriesTarget}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distance Card - Full Width */}
            <button
              onClick={() => setShowMetricsModal(true)}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 h-20 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <MapPin size={28} className="text-white/80" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white/70">
                      Distance
                    </p>
                    <p className="text-2xl font-black text-white">
                      {distanceKm.toFixed(1)} km
                    </p>
                  </div>
                </div>
              </div>
            </button>

            {/* Water Card - Full Width */}
            <div
              onClick={() => setShowMetricsModal(true)}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 h-20 flex items-center justify-between text-white">
                <div className="flex items-center gap-4 flex-1">
                  <Droplets size={28} className="text-white/80" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white/70">
                      Water Intake
                    </p>
                    <p className="text-sm font-medium text-white/90">
                      {(waterConsumed / 1000).toFixed(1)}L /{" "}
                      {(autoWaterTarget / 1000).toFixed(1)}L
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newWater = waterConsumed + 250;
                    setWaterConsumed(newWater);
                    toast.success("Added 250ml water!");
                  }}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-200 active:scale-95 ml-2 flex items-center gap-1 text-xs font-semibold text-white"
                >
                  <Plus size={16} className="text-white" />
                  250ml
                </button>
              </div>
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
                let bgColor = "";
                let textColor = "";
                let iconBg = "";

                if (tile.label === "Trainers") {
                  bgColor = "bg-blue-100";
                  textColor = "text-blue-700";
                  iconBg = "bg-blue-300";
                } else if (tile.label === "Nutritionists") {
                  bgColor = "bg-blue-100";
                  textColor = "text-blue-700";
                  iconBg = "bg-blue-300";
                } else if (tile.label === "Meal Tracker") {
                  bgColor = "bg-amber-100";
                  textColor = "text-amber-700";
                  iconBg = "bg-amber-300";
                } else if (tile.label === "Online Meeting") {
                  bgColor = "bg-purple-100";
                  textColor = "text-purple-700";
                  iconBg = "bg-purple-300";
                } else if (tile.label === "CoCircle") {
                  bgColor = "bg-green-100";
                  textColor = "text-green-700";
                  iconBg = "bg-green-300";
                } else if (tile.label === "Become a Trainer") {
                  bgColor = "bg-pink-100";
                  textColor = "text-pink-700";
                  iconBg = "bg-pink-300";
                }

                return (
                  <button
                    key={tile.label}
                    onClick={tile.onClick}
                    className={`rounded-3xl p-5 transition-all duration-300 flex flex-col items-center gap-2 group active:scale-95 hover:scale-105 ${bgColor} shadow-sm hover:shadow-md`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg} group-hover:scale-125 transition-transform duration-300`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <p
                      className={`text-xs font-semibold text-center ${textColor}`}
                    >
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

        {/* Unified Metrics Modal */}
        <UnifiedMetricsModal
          isOpen={showMetricsModal}
          onClose={() => setShowMetricsModal(false)}
          weeklyData={weeklyData}
          targets={{
            steps: editStepsTarget,
            calories: caloriesTarget,
            water: autoWaterTarget,
            distance: 10,
          }}
        />
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
                  Set your daily step target
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Calories Goal
                </label>
                <input
                  type="number"
                  value={editCaloriesTarget}
                  onChange={(e) =>
                    setEditCaloriesTarget(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 2000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set your daily calorie burn target
                </p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-teal-900 mb-1">
                  Water Goal
                </p>
                <p className="text-lg font-black text-teal-600">
                  {(autoWaterTarget / 1000).toFixed(2)}L
                </p>
                <p className="text-xs text-teal-700 mt-1">
                  Auto-calculated: {userProfile?.weight_kg}kg × 30ml per kg
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
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
