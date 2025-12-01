import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Droplet,
  Footprints,
  TrendingUp,
  Dumbbell,
  Apple,
  UtensilsCrossed,
  Newspaper,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { statsApi, mealsApi } from "@/lib/api";

export default function MobileHome() {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Load today's stats
      const response = await statsApi.getDailyStats(today, today);
      if (response && response.length > 0) {
        setStats(response[0]);
      } else {
        setStats({
          steps: 0,
          calories_burned: 0,
          water_intake_ml: 0,
          distance_km: 0,
        });
      }

      // Load today's meals
      const mealsResponse = await mealsApi.getMeals(today);
      setMeals(mealsResponse || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stepProgress = Math.min((stats?.steps || 0) / 10000, 1);
  const waterProgress = Math.min((stats?.water_intake_ml || 0) / 2000, 1);
  const calorieGoal = 2000;
  const calorieProgress = Math.min(
    (stats?.calories_burned || 0) / calorieGoal,
    1,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-20">
      {/* Animated Background Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-b from-blue-100 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-t from-purple-100 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-4 py-8 shadow-lg animate-slide-down" style={{ animationDuration: "0.6s" }}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-blue-100 text-sm font-medium">Welcome back</p>
            <h1 className="text-3xl font-bold tracking-tight">
              {userProfile?.username || "Friend"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-12 h-12 rounded-full bg-blue-400 hover:bg-blue-300 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            👤
          </button>
        </div>

        {/* BMI Card */}
        {userProfile?.bmi && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 text-white border border-white/30 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.2s", animationDuration: "0.8s" }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm font-medium">Your BMI</p>
                <h2 className="text-4xl font-bold mt-1">
                  {userProfile.bmi.toFixed(1)}
                </h2>
                <p className="text-blue-100 text-xs mt-2 font-semibold">
                  {userProfile.bmi_status}
                </p>
              </div>
              <div className="text-right bg-white/20 rounded-2xl px-4 py-3">
                <p className="text-xs text-blue-100 mb-1">Height/Weight</p>
                <p className="text-sm font-semibold">{userProfile.height_cm}cm</p>
                <p className="text-sm font-semibold">{userProfile.weight_kg}kg</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Today's Stats</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Steps */}
          <div className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] animate-fade-in-up" style={{ animationDelay: "0.1s", animationDuration: "0.7s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Footprints className="text-blue-600" size={20} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {Math.round(stepProgress * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-2">Steps</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.steps || 0}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${stepProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Calories */}
          <div className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] animate-fade-in-up" style={{ animationDelay: "0.15s", animationDuration: "0.7s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-red-100 group-hover:bg-red-200 transition-colors">
                <Flame className="text-red-600" size={20} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                {Math.round(calorieProgress * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-2">Calories</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.calories_burned || 0}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${calorieProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Water */}
          <div className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] animate-fade-in-up" style={{ animationDelay: "0.2s", animationDuration: "0.7s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-cyan-100 group-hover:bg-cyan-200 transition-colors">
                <Droplet className="text-cyan-600" size={20} />
              </div>
              <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full">
                {Math.round(waterProgress * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-2">Water</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.water_intake_ml || 0}ml
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${waterProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] animate-fade-in-up" style={{ animationDelay: "0.25s", animationDuration: "0.7s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-green-100 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Today</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-2">Distance</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.distance_km || 0).toFixed(1)}km
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/discover")}
              className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-5 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.3s", animationDuration: "0.7s" }}
            >
              <div className="p-3 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                <Dumbbell size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold">Find Trainers</span>
            </button>

            <button
              onClick={() => navigate("/meals")}
              className="group bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-5 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.35s", animationDuration: "0.7s" }}
            >
              <div className="p-3 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                <Apple size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold">Log Meals</span>
            </button>

            <button
              onClick={() => navigate("/feed")}
              className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-5 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.4s", animationDuration: "0.7s" }}
            >
              <div className="p-3 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                <Newspaper size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold">Community</span>
            </button>

            <button
              onClick={() => navigate("/messages")}
              className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-5 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.45s", animationDuration: "0.7s" }}
            >
              <div className="p-3 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold">Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200/50 px-4 py-3 flex justify-around safe-area-inset-bottom shadow-2xl">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-1 text-blue-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="p-2 rounded-2xl bg-blue-100">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs font-bold">Home</span>
        </button>
        <button
          onClick={() => navigate("/discover")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="p-2 rounded-2xl hover:bg-gray-100">
            <Dumbbell size={20} />
          </div>
          <span className="text-xs font-semibold">Discover</span>
        </button>
        <button
          onClick={() => navigate("/messages")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="p-2 rounded-2xl hover:bg-gray-100">
            <MessageCircle size={20} />
          </div>
          <span className="text-xs font-semibold">Chat</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <div className="p-2 rounded-2xl hover:bg-gray-100">
            <Settings size={20} />
          </div>
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-down {
          animation: slide-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
