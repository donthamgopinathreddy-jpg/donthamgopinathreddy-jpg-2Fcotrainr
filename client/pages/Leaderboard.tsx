import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievements } from "@/hooks/useAchievements";
import { Trophy, TrendingUp, Zap, Star, Medal } from "lucide-react";
import { Link } from "react-router-dom";

const Achievements = () => {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { user } = useAuth();
  const {
    monthlyLeaderboard,
    leaderboard,
    userRank,
    loading,
    getTop10,
    getUserRankContext,
  } = useLeaderboard();
  const { achievements, userAchievements, loadingAchievements } = useAchievements(userProfile?.id);
  const [activeTab, setActiveTab] = useState<"achievements" | "monthly" | "overall">("achievements");

  const displayData =
    activeTab === "monthly" ? monthlyLeaderboard : activeTab === "overall" ? leaderboard : null;
  const topTen = displayData ? getTop10(displayData) : [];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b p-4`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Medal className="w-8 h-8 text-yellow-500" />
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Achievements
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "monthly"
                ? theme === "dark"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            <Zap className="inline w-4 h-4 mr-2" />
            This Month
          </button>
          <button
            onClick={() => setActiveTab("overall")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "overall"
                ? theme === "dark"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="inline w-4 h-4 mr-2" />
            All Time
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Loading leaderboard...
            </div>
          </div>
        ) : topTen.length === 0 ? (
          <div
            className={`text-center py-12 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No data available yet
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 10 Rankings */}
            <div className="space-y-2">
              {topTen.map((entry, index) => (
                <Link
                  key={entry.user_id}
                  to={`/user/${entry.username}`}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:shadow-lg border border-gray-200"
                  } ${user?.id === entry.user_id ? "ring-2 ring-blue-500" : ""}`}
                >
                  {/* Rank Medal */}
                  <div className="text-2xl font-bold w-12 text-center">
                    {getMedalEmoji(entry.rank)}
                  </div>

                  {/* User Avatar */}
                  <div className="flex-1 flex items-center gap-3">
                    {entry.profile_picture_url ? (
                      <img
                        src={entry.profile_picture_url}
                        alt={entry.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {entry.full_name?.charAt(0) || "U"}
                      </div>
                    )}

                    <div>
                      <p
                        className={`font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {entry.full_name || entry.username}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        @{entry.username}
                      </p>
                    </div>
                  </div>

                  {/* Steps Count */}
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        theme === "dark" ? "text-cyan-400" : "text-blue-600"
                      }`}
                    >
                      {entry.steps.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {activeTab === "monthly" ? "this month" : "total"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* User's Rank Card (if not in top 10) */}
            {user?.id &&
              userRank &&
              userRank > 10 &&
              displayData.length > 0 && (
                <div className="mt-8">
                  <p
                    className={`text-sm font-semibold mb-3 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Your Ranking
                  </p>
                  {getUserRankContext(displayData, user.id).map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        user.id === entry.user_id
                          ? theme === "dark"
                            ? "bg-blue-900/30 border border-blue-700 ring-2 ring-blue-500"
                            : "bg-blue-50 border border-blue-200 ring-2 ring-blue-500"
                          : theme === "dark"
                            ? "bg-gray-800"
                            : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="text-2xl font-bold w-12 text-center">
                        #{entry.rank}
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        {entry.profile_picture_url ? (
                          <img
                            src={entry.profile_picture_url}
                            alt={entry.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {entry.full_name?.charAt(0) || "U"}
                          </div>
                        )}

                        <div>
                          <p
                            className={`font-semibold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {entry.full_name || entry.username}
                          </p>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            @{entry.username}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            theme === "dark" ? "text-cyan-400" : "text-blue-600"
                          }`}
                        >
                          {entry.steps.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
