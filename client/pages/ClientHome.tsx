import React, { useState } from "react";
import {
  Bell,
  Flame,
  Activity,
  Droplet,
  ArrowRight,
  Users,
  Apple,
  MessageCircle,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ClientHome() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Demo data - will be replaced with real data from Supabase
  const [stats] = useState({
    steps: 0,
    stepsGoal: 10000,
    calories: 0,
    caloriesGoal: 2000,
    water: 0,
    waterGoal: 2500,
    distance: 0,
    streak: 0,
  });

  const [notifications] = useState(0);
  const [bmi] = useState<number | null>(null);
  const [bmiStatus] = useState<string | null>(null);

  const quickTiles = [
    {
      icon: Users,
      label: "Trainers",
      path: "/discover",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Apple,
      label: "Nutritionists",
      path: "/discover",
      color: "from-green-400 to-green-600",
    },
    {
      icon: Droplet,
      label: "Meal Tracker",
      path: "/meals",
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: MessageCircle,
      label: "CoCircle",
      path: "/community",
      color: "from-pink-400 to-pink-600",
    },
    {
      icon: Sparkles,
      label: "Quests",
      path: "/quests",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Award,
      label: "Become Trainer",
      path: "/trainer-signup",
      color: "from-yellow-400 to-yellow-600",
    },
  ];

  const stepsPercent = (stats.steps / stats.stepsGoal) * 100;
  const caloriesPercent = (stats.calories / stats.caloriesGoal) * 100;
  const waterPercent = (stats.water / stats.waterGoal) * 100;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/80 border-b border-gray-200/50 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
              {userProfile?.full_name?.[0]?.toUpperCase() || ""}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Hi, {userProfile?.full_name?.split(" ")[0] || "Friend"}
              </h2>
            </div>
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={24} className="text-gray-700" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="relative h-40 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/50 border border-white/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-20"></div>
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=160&fit=crop"
            alt="banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent flex flex-col justify-end p-4">
            <p className="text-white font-bold text-lg">
              Focus: {userProfile?.primary_focus || "General Fitness"}
            </p>
            <p className="text-gray-200 text-sm">
              Today's goal: Complete your daily activities
            </p>
          </div>
        </div>

        {/* Today's Stats Card */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl shadow-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Today's Stats</h3>

          {/* Steps Progress Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg">
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(stepsPercent)}%
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.steps.toLocaleString()} /{" "}
                    {stats.stepsGoal.toLocaleString()}
                  </p>
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, rgba(251, 146, 60, 0.3) 0deg, rgba(251, 146, 60, 0.3) ${stepsPercent * 3.6}deg, transparent ${stepsPercent * 3.6}deg)`,
                }}
              ></div>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">Steps</p>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="backdrop-blur-xl bg-white/50 rounded-2xl p-3 border border-gray-200/50 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {stats.calories}
              </p>
              <p className="text-xs text-gray-600">Calories</p>
            </div>
            <div className="backdrop-blur-xl bg-white/50 rounded-2xl p-3 border border-gray-200/50 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {stats.water}ml
              </p>
              <p className="text-xs text-gray-600">Water</p>
            </div>
            <div className="backdrop-blur-xl bg-white/50 rounded-2xl p-3 border border-gray-200/50 text-center">
              <p className="text-2xl font-bold text-teal-500">
                {stats.distance.toFixed(1)}km
              </p>
              <p className="text-xs text-gray-600">Distance</p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Calories
                </span>
                <span className="text-xs text-gray-600">
                  {Math.round(caloriesPercent)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all"
                  style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Water</span>
                <span className="text-xs text-gray-600">
                  {Math.round(waterPercent)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                  style={{ width: `${Math.min(waterPercent, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Water Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl">
            +200ml
          </button>
          <button className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl">
            +500ml
          </button>
          <button className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl">
            +1L
          </button>
        </div>

        {/* BMI Card */}
        {bmi && (
          <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">BMI Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {bmi.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 mt-1">BMI</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">
                  {bmiStatus || "Normal"}
                </p>
                <p className="text-xs text-gray-600 mt-1">Status</p>
              </div>
              <div className="text-center">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {userProfile?.height_cm || "-"} cm
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {userProfile?.weight_kg || "-"} kg
                  </p>
                  <p className="text-xs text-gray-600 mt-1">H/W</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streak Card */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.streak} days
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-8 rounded-full ${
                  i < stats.streak
                    ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                    : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Quick Tiles Grid */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Quick Access</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickTiles.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => navigate(tile.path)}
                className={`backdrop-blur-xl bg-gradient-to-br ${tile.color} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all shadow-lg text-white`}
              >
                <tile.icon size={24} />
                <p className="text-xs font-semibold text-center">
                  {tile.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Smart Suggestions</h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 backdrop-blur-xl bg-white/50 border border-white/20 rounded-2xl p-3 space-y-2"
                >
                  <div className="h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-xl"></div>
                  <p className="text-sm font-medium text-gray-900">
                    Suggestion will appear here
                  </p>
                  <p className="text-xs text-gray-600">Tap to learn more</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest from CoCircle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Latest from CoCircle
            </h3>
            <button
              onClick={() => navigate("/community")}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm"
            >
              See all
            </button>
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/50 border border-white/20 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      User Name
                    </p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <p className="text-sm text-gray-700">
                  Post caption will appear here
                </p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>❤️ Likes</span>
                  <span>💬 Comments</span>
                  <span>↗️ Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
