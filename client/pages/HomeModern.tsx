import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Flame,
  Footprints,
  Apple,
  Zap,
  Users,
  MessageCircle,
  Target,
  Heart,
  TrendingUp,
  Award,
  Edit3,
  Upload,
  Dumbbell,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useStepCounter } from "@/hooks/useStepCounter";

const HomeModern = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const { steps } = useStepCounter();

  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop",
  );
  const [dailyStreak, setDailyStreak] = useState(7);
  const [bmi, setBmi] = useState(24.5);
  const [stepsGoal] = useState(10000);
  const [calories, setCalories] = useState(450);
  const [caloriesGoal] = useState(2000);
  const [water, setWater] = useState(4);
  const [waterGoal] = useState(8);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    if (userProfile?.height_cm && userProfile?.weight_kg) {
      const heightM = userProfile.height_cm / 100;
      const calculatedBmi = userProfile.weight_kg / (heightM * heightM);
      setBmi(Math.round(calculatedBmi * 10) / 10);
    }
  }, [userProfile]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Calculate progress percentages
  const stepsPercent = (steps / stepsGoal) * 100;
  const caloriesPercent = (calories / caloriesGoal) * 100;
  const waterPercent = (water / waterGoal) * 100;

  const stats = [
    {
      label: "Streak",
      value: `${dailyStreak}d`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "BMI",
      value: bmi.toFixed(1),
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Steps",
      value: steps.toLocaleString(),
      icon: Footprints,
      color: "text-blue-500",
    },
    {
      label: "Level",
      value: "Pro",
      icon: TrendingUp,
      color: "text-green-500",
    },
  ];

  const tiles = [
    {
      icon: Users,
      label: "Discover",
      color: "from-orange-500 to-yellow-500",
      path: "/discover",
      shortcut: "Find trainers",
    },
    {
      icon: Apple,
      label: "Meals",
      color: "from-green-500 to-emerald-500",
      path: "/meals",
      shortcut: "Track nutrition",
    },
    {
      icon: Users,
      label: "Community",
      color: "from-blue-500 to-cyan-500",
      path: "/community",
      shortcut: "Share & connect",
    },
    {
      icon: MessageCircle,
      label: "Messages",
      color: "from-orange-500 to-red-500",
      path: "/messages",
      shortcut: "Chat",
    },
    {
      icon: Award,
      label: "Achievements",
      color: "from-yellow-500 to-amber-500",
      path: "/achievements",
      shortcut: "Gamification",
    },
    {
      icon: Target,
      label: "Goals",
      color: "from-indigo-500 to-purple-500",
      path: "/goals",
      shortcut: "Set targets",
    },
  ];

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black"
          : "bg-gradient-to-br from-white via-gray-50 to-white"
      }`}
    >
      {/* Header with Cover Image */}
      <div className="relative h-56 overflow-hidden group">
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

        {/* Edit Cover Button */}
        <label
          className="absolute bottom-4 right-4 p-3 rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 cursor-pointer transition-all duration-300 shadow-lg"
          title="Change cover image"
        >
          <Upload size={20} />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
          />
        </label>

        {/* Top Navigation Bar */}
        <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 bg-gradient-to-b from-black/30 to-transparent">
          {/* Logo/Title */}
          <div className="text-white font-bold text-xl">CoTrainr</div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 transition-all duration-300"
            >
              <Bell size={24} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        {/* Welcome Card with Profile */}
        <div
          className={`rounded-2xl backdrop-blur-xl p-6 mb-6 border transition-all duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
              : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Profile Picture */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {userProfile?.full_name?.charAt(0) || "U"}
            </div>

            {/* Welcome Text */}
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Welcome back,
              </p>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {userProfile?.full_name || "Athlete"}
              </h1>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats &&
              Array.isArray(stats) &&
              stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 backdrop-blur text-center transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gray-700/30 border border-gray-600/30"
                        : "bg-white/30 border border-white/50"
                    }`}
                  >
                    <Icon className={`${stat.color} mx-auto mb-1`} size={20} />
                    <div
                      className={`text-xs font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {stat.label}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stat.value}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Daily Streak Card - Prominent */}
        <div
          className={`rounded-2xl backdrop-blur-xl p-6 mb-6 border overflow-hidden transition-all duration-300 group hover:shadow-xl ${
            theme === "dark"
              ? "bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-700/30 hover:border-orange-600/50"
              : "bg-gradient-to-br from-orange-100/60 to-red-100/40 border-orange-300/30 hover:border-orange-400/50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-orange-300" : "text-orange-700"
                }`}
              >
                Your Streak
              </p>
              <h2 className="text-4xl font-bold text-orange-500 group-hover:scale-110 transition-transform duration-300">
                {dailyStreak} Days 🔥
              </h2>
            </div>
            <Flame className="text-orange-500 animate-bounce" size={48} />
          </div>

          {/* Streak Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                This week
              </span>
              <span
                className={`font-bold ${
                  theme === "dark" ? "text-orange-300" : "text-orange-600"
                }`}
              >
                7/7 Days
              </span>
            </div>
            <div
              className={`h-2 rounded-full overflow-hidden ${
                theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
              }`}
            >
              <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-full"></div>
            </div>
          </div>

          {/* Streak Bonus */}
          <div
            className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              theme === "dark"
                ? "bg-green-900/30 text-green-300 border border-green-700/30"
                : "bg-green-100/50 text-green-700 border border-green-300/50"
            }`}
          >
            ✨ 50 XP bonus for maintaining your streak!
          </div>
        </div>

        {/* Analytics Dashboard - Analytical Bars */}
        <div
          className={`rounded-2xl backdrop-blur-xl p-6 mb-6 border transition-all duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
              : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
          }`}
        >
          <h3
            className={`text-lg font-bold mb-6 flex items-center gap-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            <TrendingUp size={24} className="text-blue-500" />
            Today's Analytics
          </h3>

          <div className="space-y-6">
            {/* Steps Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-semibold flex items-center gap-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <Footprints size={18} className="text-blue-500" />
                  Steps
                </span>
                <span
                  className={`text-sm font-bold ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {steps.toLocaleString()} / {stepsGoal.toLocaleString()}
                </span>
              </div>
              <div
                className={`h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                }`}
              >
                <div
                  style={{ width: `${Math.min(stepsPercent, 100)}%` }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {Math.round(stepsPercent)}% complete
              </div>
            </div>

            {/* Calories Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-semibold flex items-center gap-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <Zap size={18} className="text-orange-500" />
                  Calories
                </span>
                <span
                  className={`text-sm font-bold ${
                    theme === "dark" ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  {calories} / {caloriesGoal} kcal
                </span>
              </div>
              <div
                className={`h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                }`}
              >
                <div
                  style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {Math.round(caloriesPercent)}% complete
              </div>
            </div>

            {/* Water Intake Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-semibold flex items-center gap-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <Apple size={18} className="text-green-500" />
                  Water
                </span>
                <span
                  className={`text-sm font-bold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {water} / {waterGoal} L
                </span>
              </div>
              <div
                className={`h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                }`}
              >
                <div
                  style={{ width: `${Math.min(waterPercent, 100)}%` }}
                  className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {Math.round(waterPercent)}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="mb-8">
          <h3
            className={`text-lg font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tiles &&
              Array.isArray(tiles) &&
              tiles.map((tile, idx) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(tile.path)}
                    className={`relative rounded-xl p-4 backdrop-blur-xl border overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30 hover:border-gray-600/50"
                        : "bg-gradient-to-br from-white/60 to-white/40 border-white/40 hover:border-white/60"
                    }`}
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${tile.color}`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <Icon
                        size={32}
                        className={`mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 ${
                          tile.color === "from-orange-500 to-yellow-500"
                            ? "text-orange-500"
                            : tile.color === "from-green-500 to-emerald-500"
                              ? "text-green-500"
                              : tile.color === "from-blue-500 to-cyan-500"
                                ? "text-blue-500"
                                : tile.color === "from-orange-500 to-red-500"
                                  ? "text-orange-500"
                                  : tile.color ===
                                      "from-yellow-500 to-amber-500"
                                    ? "text-yellow-500"
                                    : "text-indigo-500"
                        }`}
                      />
                      <p
                        className={`font-bold text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {tile.label}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {tile.shortcut}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Recommended Section */}
        <div
          className={`rounded-2xl backdrop-blur-xl p-6 border ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
              : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
          }`}
        >
          <h3
            className={`text-lg font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            🎯 Recommendations
          </h3>
          <ul
            className={`space-y-2 text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <li>✅ Keep up your 7-day streak! You're on fire 🔥</li>
            <li>✅ Complete 3,456 more steps to reach today's goal</li>
            <li>✅ Log a meal to track your nutrition progress</li>
            <li>✅ Connect with a trainer to boost your results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeModern;
