import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Unlock, TrendingUp, Trophy, Medal, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Achievements() {
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
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard">("overview");

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

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gray-900"
            : "bg-gradient-to-br from-white to-gray-50"
        }`}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-24 md:pb-8 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={`text-lg sm:text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            🏆 Achievements
          </h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className={`sticky top-16 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-3 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "overview"
                  ? theme === "dark"
                    ? "border-blue-500 text-blue-500"
                    : "border-blue-600 text-blue-600"
                  : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300"
                    : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`py-3 px-3 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "leaderboard"
                  ? theme === "dark"
                    ? "border-blue-500 text-blue-500"
                    : "border-blue-600 text-blue-600"
                  : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300"
                    : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === "overview" ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Overall Stats */}
              <div
                className={`rounded-xl border ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-orange-900/20 to-transparent border-orange-700/50"
                    : "bg-gradient-to-br from-orange-50 to-transparent border-orange-200"
                } p-4 sm:p-6`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Achievements Unlocked
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-orange-500 mt-1">
                      {unlockedList.length}/{allAchievements.length}
                    </p>
                  </div>
                  <div className="text-4xl sm:text-5xl">🏆</div>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } overflow-hidden`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all"
                    style={{
                      width: `${(unlockedList.length / allAchievements.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Weekly Stats */}
              <div
                className={`rounded-xl border ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-900/20 to-transparent border-blue-700/50"
                    : "bg-gradient-to-br from-blue-50 to-transparent border-blue-200"
                } p-4 sm:p-6`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      This Week's Steps
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-500 mt-1">
                      {weeklyStats.totalWeeklySteps.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl sm:text-5xl">👟</div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    Best: {weeklyStats.highestSteps.toLocaleString()} steps
                  </span>
                </div>
              </div>

              {/* XP Stats */}
              <div
                className={`rounded-xl border ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-700/50"
                    : "bg-gradient-to-br from-yellow-50 to-transparent border-yellow-200"
                } p-4 sm:p-6`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total XP
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-yellow-500 mt-1">
                      {totalXP}
                    </p>
                  </div>
                  <div className="text-4xl sm:text-5xl">⭐</div>
                </div>
              </div>

              {/* Rank */}
              <div
                className={`rounded-xl border ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-purple-900/20 to-transparent border-purple-700/50"
                    : "bg-gradient-to-br from-purple-50 to-transparent border-purple-200"
                } p-4 sm:p-6`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Weekly Rank
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-500 mt-1">
                      {weeklyStats.userRank ? `#${weeklyStats.userRank}` : "—"}
                    </p>
                  </div>
                  <div className="text-4xl sm:text-5xl">
                    {weeklyStats.userRank
                      ? getRankMedal(weeklyStats.userRank)
                      : "🏅"}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Achievements */}
            {weeklyStats.weeklyAchievements.length > 0 && (
              <div className="mb-8">
                <h2
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Unlock className="w-5 h-5 text-green-500" />
                  Unlocked This Week
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {weeklyStats.weeklyAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-lg border ${
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                          : "bg-white border-gray-200 hover:shadow-md"
                      } p-3 sm:p-4 transition-all cursor-pointer`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="text-2xl sm:text-3xl flex-shrink-0">
                          {achievement.icon || "🏆"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm sm:text-base ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {achievement.title}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm ${
                              theme === "dark" ? "text-gray-400" : "text-gray-600"
                            } mb-2`}
                          >
                            {achievement.description}
                          </p>
                          <span className="inline-block text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">
                            +{achievement.points} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlocked Achievements */}
            {unlockedList.length > 0 && (
              <div className="mb-8">
                <h2
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Unlock className="w-5 h-5 text-green-500" />
                  Unlocked ({unlockedList.length})
                </h2>
                <div className="grid gap-3 sm:gap-4">
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
                        className={`rounded-lg border ${
                          theme === "dark"
                            ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                            : "bg-white border-gray-200 hover:shadow-md"
                        } p-3 sm:p-4 transition-all cursor-pointer`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="text-2xl sm:text-3xl flex-shrink-0">
                            {achievement.icon || "🏆"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-bold text-sm sm:text-base ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {achievement.title}
                            </h3>
                            <p
                              className={`text-xs sm:text-sm ${
                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                              } mb-2`}
                            >
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">
                                +{achievement.points} XP
                              </span>
                              <span
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-500"
                                    : "text-gray-500"
                                }`}
                              >
                                Unlocked {unlockedDate}
                              </span>
                            </div>
                          </div>
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
                <h2
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Lock className="w-5 h-5 text-gray-400" />
                  Locked ({lockedList.length})
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {lockedList.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-lg border ${
                        theme === "dark"
                          ? "bg-gray-800/30 border-gray-700/30"
                          : "bg-gray-50 border-gray-200"
                      } p-3 sm:p-4 opacity-75`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="text-2xl sm:text-3xl grayscale opacity-50 flex-shrink-0">
                          {achievement.icon || "🔒"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm sm:text-base ${
                              theme === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {achievement.title}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm ${
                              theme === "dark" ? "text-gray-500" : "text-gray-500"
                            } mb-2`}
                          >
                            {getAchievementDescription(achievement.type)}
                          </p>
                          <span className="inline-block text-xs bg-gray-500/20 text-gray-600 px-2 py-1 rounded-full">
                            +{achievement.points} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Leaderboard Tab */}
            {leaderboardLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div>
                <h2
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Medal className="w-5 h-5 text-yellow-500" />
                  Weekly Leaderboard
                </h2>

                {weeklyLeaderboard.length === 0 ? (
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
                      No leaderboard data yet. Start walking to claim your spot!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {weeklyLeaderboard.map((entry) => {
                      const isCurrentUser = entry.user_id === userProfile?.id;
                      return (
                        <div
                          key={entry.user_id}
                          className={`rounded-lg border ${
                            isCurrentUser
                              ? theme === "dark"
                                ? "bg-gradient-to-r from-blue-900/30 to-transparent border-blue-700/50"
                                : "bg-gradient-to-r from-blue-50 to-transparent border-blue-200"
                              : theme === "dark"
                                ? "bg-gray-800/50 border-gray-700/50"
                                : "bg-white border-gray-200"
                          } p-3 sm:p-4 transition-all`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            {/* Rank Medal */}
                            <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 flex-shrink-0">
                              <span className="text-2xl sm:text-3xl">
                                {getRankMedal(entry.rank)}
                              </span>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {entry.profile_picture_url && (
                                  <img
                                    src={entry.profile_picture_url}
                                    alt={entry.full_name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p
                                    className={`font-semibold text-sm sm:text-base truncate ${
                                      isCurrentUser
                                        ? theme === "dark"
                                          ? "text-blue-400"
                                          : "text-blue-600"
                                        : theme === "dark"
                                          ? "text-white"
                                          : "text-gray-900"
                                    }`}
                                  >
                                    {entry.full_name}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      theme === "dark"
                                        ? "text-gray-500"
                                        : "text-gray-500"
                                    } truncate`}
                                  >
                                    @{entry.username}
                                  </p>
                                </div>
                                {isCurrentUser && (
                                  <span
                                    className={`ml-auto text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                                      theme === "dark"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    You
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Steps */}
                            <div className="text-right flex-shrink-0">
                              <p
                                className={`text-lg sm:text-2xl font-bold ${
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {entry.steps.toLocaleString()}
                              </p>
                              <p
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-500"
                                    : "text-gray-500"
                                }`}
                              >
                                steps
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
