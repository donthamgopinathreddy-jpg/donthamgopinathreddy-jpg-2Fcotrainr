import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useStepCounter } from "@/hooks/useStepCounter";
import { supabase } from "@/lib/supabase";

export default function ClientHome() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { steps } = useStepCounter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterConsumed, setWaterConsumed] = useState(0);

  // User greeting
  const userGreeting = userProfile?.full_name?.split(" ")[0] || "User";

  // Real data from hooks and profile
  const stepsToday = steps || 0;
  const stepsTarget = 10000;
  const caloriesTarget = 2000;
  const caloriesBurned = dailyStats?.calories_burned || 0;
  const waterTarget = 2500;
  const distanceKm = dailyStats?.distance_km || 0;

  const bmiValue = userProfile?.weight_kg && userProfile?.height_cm
    ? (userProfile.weight_kg / ((userProfile.height_cm / 100) ** 2)).toFixed(1)
    : null;
  const bmiStatus = bmiValue
    ? parseFloat(bmiValue) < 18.5 ? "Underweight"
      : parseFloat(bmiValue) < 25 ? "Normal"
      : parseFloat(bmiValue) < 30 ? "Overweight"
      : "Obese"
    : "Not set";
  const currentStreak = dailyStats?.streak_days || 0;

  // Fetch daily stats from database
  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Fetch daily stats
        const { data, error } = await supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('date', today)
          .single();

        if (data) {
          setDailyStats(data);
          if (data.water_consumed) {
            setWaterConsumed(data.water_consumed);
          }
        }
      } catch (err) {
        console.log('Stats not available yet (expected on first login)');
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
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userProfile.id)
          .eq('read', false);

        if (data) {
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.log('Could not fetch notifications');
      }
    };

    fetchUnreadCount();
  }, [userProfile?.id]);

  const handleAddWater = async (amount: number) => {
    if (!userProfile?.id) return;

    const newTotal = waterConsumed + amount;
    setWaterConsumed(newTotal);

    try {
      const today = new Date().toISOString().split('T')[0];

      if (dailyStats) {
        await supabase
          .from('daily_stats')
          .update({ water_consumed: newTotal })
          .eq('user_id', userProfile.id)
          .eq('date', today);
      } else {
        await supabase
          .from('daily_stats')
          .insert([{
            user_id: userProfile.id,
            date: today,
            water_consumed: newTotal,
            steps: stepsToday,
          }]);
      }
    } catch (err) {
      console.log('Could not update water');
    }
  };

  const quickAccessTiles = [
    { label: "Trainers", icon: Users, color: "from-orange-400 to-orange-500", onClick: () => navigate("/trainers") },
    { label: "Nutritionists", icon: Apple, color: "from-green-400 to-green-500", onClick: () => navigate("/nutritionists") },
    { label: "Meal Tracker", icon: Utensils, color: "from-blue-400 to-blue-500", onClick: () => navigate("/meals") },
    { label: "CoCircle", icon: Users, color: "from-purple-400 to-purple-500", onClick: () => navigate("/community") },
    { label: "Quests", icon: Trophy, color: "from-yellow-400 to-yellow-500", onClick: () => navigate("/quests") },
    { label: "Become a Trainer", icon: Award, color: "from-pink-400 to-pink-500", onClick: () => navigate("/become-trainer") },
  ];

  const suggestionCards = [
    { title: "Stay hydrated", description: "Drink more water", icon: Droplets },
    { title: "Walk daily", description: "Aim for 10k steps", icon: Footprints },
    { title: "Rest well", description: "8 hours sleep", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pb-24">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* 1. Header Bar */}
        <header className="px-5 py-4 flex items-center justify-between">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
            {userGreeting.charAt(0).toUpperCase()}
          </div>

          {/* Center greeting */}
          <div className="flex-1 ml-4">
            <p className="text-sm text-gray-600">Hi {userGreeting}</p>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 hover:bg-white/30 rounded-full transition-colors">
            <Bell size={24} className="text-gray-700" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
        </header>

        {/* 2. Banner Card */}
        <div className="mx-5 mb-6 rounded-3xl overflow-hidden backdrop-blur-md bg-white/90 shadow-lg border border-white/20 h-40 flex flex-col justify-end relative">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=200&fit=crop"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          <div className="relative p-5 text-white">
            <h2 className="text-lg font-bold">Focus Fitness</h2>
            <p className="text-sm text-gray-100">Today's target</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-orange-400/80 text-xs font-medium">
              Fat Loss
            </div>
          </div>
        </div>

        {/* 3. Today's Stats Card */}
        <div className="mx-5 mb-6 backdrop-blur-md bg-white/90 rounded-3xl p-6 shadow-lg border border-white/20">
          {/* 3a. Main Steps Ring */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              {/* Circular progress background */}
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(stepsToday / stepsTarget) * 283} 283`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-gray-900">{stepsToday}</p>
                <p className="text-xs text-gray-600 mt-1">Today's steps</p>
              </div>
            </div>
          </div>

          {/* 3b. Mini Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                <Flame size={20} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-600">Calories</p>
              <p className="text-sm font-bold text-gray-900">{caloriesBurned}</p>
              <p className="text-xs text-gray-500">/{caloriesTarget}</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Droplets size={20} className="text-blue-500" />
              </div>
              <p className="text-xs text-gray-600">Water</p>
              <p className="text-sm font-bold text-gray-900">{waterConsumed}</p>
              <p className="text-xs text-gray-500">ml</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Footprints size={20} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-600">Distance</p>
              <p className="text-sm font-bold text-gray-900">{distanceKm}</p>
              <p className="text-xs text-gray-500">km</p>
            </div>
          </div>
        </div>

        {/* 4. Quick Water Buttons */}
        <div className="mx-5 mb-6 flex gap-3 justify-center">
          <button className="flex-1 py-3 px-4 rounded-full backdrop-blur-md bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/30 text-sm font-medium text-blue-700 hover:from-blue-400/30 hover:to-blue-500/30 transition-all">
            +200ml
          </button>
          <button className="flex-1 py-3 px-4 rounded-full backdrop-blur-md bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/30 text-sm font-medium text-blue-700 hover:from-blue-400/30 hover:to-blue-500/30 transition-all">
            +500ml
          </button>
          <button className="flex-1 py-3 px-4 rounded-full backdrop-blur-md bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/30 text-sm font-medium text-blue-700 hover:from-blue-400/30 hover:to-blue-500/30 transition-all">
            +1L
          </button>
        </div>

        {/* 5. BMI Card */}
        <div className="mx-5 mb-6 backdrop-blur-md bg-white/90 rounded-3xl p-5 shadow-lg border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">BMI</p>
            <p className="text-2xl font-bold text-gray-900">{bmiValue || "—"}</p>
            <p className="text-xs text-gray-600 mt-1">{bmiStatus}</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Height<br />{userProfile?.height_cm || "—"} cm</p>
            <p className="mt-2">Weight<br />{userProfile?.weight_kg || "—"} kg</p>
          </div>
        </div>

        {/* 6. Streak Card */}
        <div className="mx-5 mb-6 backdrop-blur-md bg-white/90 rounded-3xl px-5 py-4 shadow-lg border border-white/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Flame size={24} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Current streak</p>
            <p className="text-lg font-bold text-gray-900">{currentStreak} days</p>
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

        {/* 7. Quick Access Grid */}
        <div className="mx-5 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Quick access</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickAccessTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.label}
                  onClick={tile.onClick}
                  className="backdrop-blur-md bg-white/90 rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all flex flex-col items-center gap-3 group"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 text-center">{tile.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Smart Suggestions */}
        <div className="mb-8">
          <div className="px-5 mb-4">
            <h3 className="text-sm font-bold text-gray-900">Smart suggestions for you</h3>
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
                  <p className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</p>
                  <p className="text-xs text-gray-700">{suggestion.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9. Latest from CoCircle */}
        <div className="mx-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Latest from CoCircle</h3>
          
          {/* Empty state */}
          <div className="backdrop-blur-md bg-white/90 rounded-3xl p-8 shadow-lg border border-white/20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Zap size={32} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No posts yet</p>
            <p className="text-xs text-gray-600 mt-1">Check back soon for community updates</p>
            <button
              onClick={() => navigate("/community")}
              className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs font-medium hover:from-orange-500 hover:to-yellow-500 transition-all flex items-center gap-2"
            >
              Explore CoCircle
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
