import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import WeeklyQuests from "@/components/achievements/WeeklyQuests";
import SocialCompetitions from "@/components/achievements/SocialCompetitions";

export default function Quests() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const {
    allAchievements,
    unlockedAchievements,
    loading,
    weeklyStats,
    weeklyLeaderboard,
    leaderboardLoading,
  } = useAchievements();

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "quests" | "competitions" | "achievements" | "leaderboard"
  >("quests");

  useEffect(() => {
    const ids = new Set(unlockedAchievements.map((ua) => ua.achievement_id));
    setUnlockedIds(ids);

    const xp = unlockedAchievements.reduce((sum, ua) => {
      const achievement = allAchievements.find(
        (a) => a.id === ua.achievement_id,
      );
      return sum + (achievement?.points || 0);
    }, 0);
    setTotalXP(xp);
  }, [unlockedAchievements, allAchievements]);

  const unlockedList = allAchievements.filter((a) => unlockedIds.has(a.id));
  const lockedList = allAchievements.filter((a) => !unlockedIds.has(a.id));

  const getAchievementDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      STREAK_3: "Maintain a 3-day streak",
      STREAK_7: "Maintain a 7-day streak",
      STREAK_15: "Maintain a 15-day streak",
      STREAK_30: "Maintain a 30-day streak",
      STEPS_50K: "Walk 50,000 steps total",
      STEPS_100K: "Walk 100,000 steps total",
      STEPS_500K: "Walk 500,000 steps total",
      WATER_7D: "Hit water goal 7 days total",
    };
    return descriptions[type] || "";
  };

  const getRankMedal = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏆";
  };

  const bgClass = theme === "dark"
    ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
    : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50";

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass}`}>
        <div className="flex items-center justify-center h-screen">
          <div
            className={`w-12 h-12 rounded-full border-4 border-transparent animate-spin ${
              theme === "dark"
                ? "border-t-blue-500 border-r-blue-500"
                : "border-t-blue-600 border-r-blue-600"
            }`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 md:pb-8 ${bgClass}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-20 border-b ${
          theme === "dark"
            ? "bg-gray-950/95 border-gray-800/50"
            : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-200/30"
        } backdrop-blur-md`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl transition-all flex-shrink-0 hover:scale-110 active:scale-95 ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-white/60 text-gray-700 hover:text-gray-900"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
                className={`text-base sm:text-xl md:text-2xl font-black truncate bg-clip-text text-transparent ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                }`}
              >
                🎮 Quests Hub
              </h1>
            </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className={`sticky top-14 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-950/95 border-gray-800/50"
            : "bg-white/80 border-purple-200/30"
        } backdrop-blur-md`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            {[
              { id: "quests" as const, label: "Quests", icon: "📋", color: "from-blue-500 to-cyan-500" },
              { id: "competitions" as const, label: "Competitions", icon: "⚡", color: "from-purple-500 to-pink-500" },
              { id: "achievements" as const, label: "Badges", icon: "🏆", color: "from-orange-500 to-red-500" },
              { id: "leaderboard" as const, label: "Leaderboard", icon: "🏅", color: "from-green-500 to-emerald-500" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base font-bold transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5 group ${
                  activeTab === tab.id
                    ? theme === "dark"
                      ? "text-white"
                      : "text-gray-900"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {/* Animated background for active tab */}
                {activeTab === tab.id && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color} rounded-full shadow-lg`}
                    style={{
                      animation: "slideIn 0.3s ease-out",
                    }}
                  />
                )}
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Quests Tab */}
        {activeTab === "quests" && <WeeklyQuests variant="full" />}

        {/* Competitions Tab */}
        {activeTab === "competitions" && <SocialCompetitions variant="full" />}

        {/* Achievements/Badges Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            {/* Overview Stats - Vibrant Design */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div
                className={`rounded-2xl p-4 text-center transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer group overflow-hidden relative ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
                    : "bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200"
                }`}
                style={{
                  animation: "fadeInUp 0.5s ease-out 0.1s both",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-orange-600">
                    {unlockedList.length}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      theme === "dark" ? "text-orange-400" : "text-orange-700"
                    }`}
                  >
                    Unlocked
                  </p>
                </div>
              </div>
              <div
                className={`rounded-2xl p-4 text-center transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer group overflow-hidden relative ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30"
                    : "bg-gradient-to-br from-yellow-100 to-amber-100 border border-yellow-200"
                }`}
                style={{
                  animation: "fadeInUp 0.5s ease-out 0.2s both",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-amber-500/0 group-hover:from-yellow-500/10 group-hover:to-amber-500/10 transition-all" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-yellow-600">{totalXP}</p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      theme === "dark" ? "text-yellow-400" : "text-yellow-700"
                    }`}
                  >
                    Total XP
                  </p>
                </div>
              </div>
              <div
                className={`rounded-2xl p-4 text-center transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer group overflow-hidden relative ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                    : "bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200"
                }`}
                style={{
                  animation: "fadeInUp 0.5s ease-out 0.3s both",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-green-600">
                    {weeklyStats.weeklyAchievements.length}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      theme === "dark" ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    This Week
                  </p>
                </div>
              </div>
              <div
                className={`rounded-2xl p-4 text-center transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer group overflow-hidden relative ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                    : "bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200"
                }`}
                style={{
                  animation: "fadeInUp 0.5s ease-out 0.4s both",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-purple-600">
                    {allAchievements.length - unlockedList.length}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      theme === "dark" ? "text-purple-400" : "text-purple-700"
                    }`}
                  >
                    Locked
                  </p>
                </div>
              </div>
            </div>

            {/* Unlocked Achievements */}
            {unlockedList.length > 0 && (
              <div>
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Unlock className="w-5 h-5" />
                  Unlocked Badges ({unlockedList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unlockedList.map((achievement) => {
                    const userAchievement = unlockedAchievements.find(
                      (ua) => ua.achievement_id === achievement.id,
                    );
                    const unlockedDate = userAchievement?.unlocked_at
                      ? new Date(
                          userAchievement.unlocked_at,
                        ).toLocaleDateString()
                      : "";

                    return (
                      <div
                        key={achievement.id}
                        className={`rounded-xl p-4 transition-all ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 hover:border-green-500/50"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg"
                        }`}
                      >
                        <div className="text-4xl mb-3">{achievement.icon || "🏆"}</div>
                        <h4
                          className={`font-bold text-sm mb-1 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p
                          className={`text-xs mb-3 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              theme === "dark"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            +{achievement.points} XP
                          </span>
                          <span
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-600"
                            }`}
                          >
                            {unlockedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedList.length > 0 && (
              <div>
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Locked Badges ({lockedList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lockedList.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-xl p-4 opacity-60 ${
                        theme === "dark"
                          ? "bg-gray-800/30 border border-gray-700/30"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="text-4xl mb-3 grayscale opacity-50">
                        {achievement.icon || "🔒"}
                      </div>
                      <h4
                        className={`font-bold text-sm mb-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-xs mb-3 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {getAchievementDescription(achievement.type)}
                      </p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                          theme === "dark"
                            ? "bg-gray-700/50 text-gray-400"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        +{achievement.points} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🏆 Weekly Leaderboard
            </h3>

            {leaderboardLoading ? (
              <div className="flex justify-center items-center py-12">
                <div
                  className={`w-8 h-8 rounded-full border-2 border-transparent animate-spin ${
                    theme === "dark"
                      ? "border-t-blue-500 border-r-blue-500"
                      : "border-t-blue-600 border-r-blue-600"
                  }`}
                />
              </div>
            ) : weeklyLeaderboard.length === 0 ? (
              <div
                className={`text-center py-12 rounded-lg ${
                  theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <p
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  No leaderboard data yet. Start walking! 👟
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {weeklyLeaderboard.map((entry) => {
                  const isCurrentUser = entry.user_id === userProfile?.id;
                  return (
                    <div
                      key={entry.user_id}
                      className={`rounded-xl p-3 flex items-center gap-3 transition-all ${
                        isCurrentUser
                          ? theme === "dark"
                            ? "bg-blue-500/20 border border-blue-500/50"
                            : "bg-blue-100/50 border border-blue-300"
                          : theme === "dark"
                            ? "bg-gray-800/50 border border-gray-700/50"
                            : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="flex-shrink-0 text-2xl">
                        {getRankMedal(entry.rank)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm ${
                            isCurrentUser
                              ? theme === "dark"
                                ? "text-blue-300"
                                : "text-blue-600"
                              : theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {entry.full_name}
                          {isCurrentUser && (
                            <span
                              className={`ml-2 text-xs font-normal ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              (You)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-bold ${
                            isCurrentUser
                              ? theme === "dark"
                                ? "text-blue-300"
                                : "text-blue-600"
                              : theme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                          }`}
                        >
                          {entry.steps.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          steps
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
