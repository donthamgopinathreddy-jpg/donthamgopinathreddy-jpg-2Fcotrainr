import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { useTheme } from "@/contexts/ThemeContext";

export default function Achievements() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { allAchievements, unlockedAchievements, loading } = useAchievements();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const ids = new Set(unlockedAchievements.map((ua) => ua.achievement_id));
    setUnlockedIds(ids);

    // Calculate total XP
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
      className={`min-h-screen pb-20 ${
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            🏆 Achievements
          </h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div
          className={`rounded-xl border ${
            theme === "dark"
              ? "bg-gradient-to-br from-orange-900/20 to-transparent border-orange-700/50"
              : "bg-gradient-to-br from-orange-50 to-transparent border-orange-200"
          } p-6 mb-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Achievements Unlocked
              </p>
              <p className="text-4xl font-bold text-orange-500 mt-1">
                {unlockedList.length}/{allAchievements.length}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total XP
              </p>
              <p className="text-4xl font-bold text-yellow-500 mt-1">
                {totalXP}
              </p>
            </div>
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

        {/* Unlocked Achievements */}
        {unlockedList.length > 0 && (
          <div className="mb-10">
            <h2
              className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              <Unlock className="w-5 h-5 text-green-500" />
              Unlocked ({unlockedList.length})
            </h2>
            <div className="grid gap-4">
              {unlockedList.map((achievement) => {
                const userAchievement = unlockedAchievements.find(
                  (ua) => ua.achievement_id === achievement.id,
                );
                const unlockedDate = userAchievement?.unlocked_at
                  ? new Date(userAchievement.unlocked_at).toLocaleDateString()
                  : "";

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-lg border ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                        : "bg-white border-gray-200 hover:shadow-md"
                    } p-4 transition-all cursor-pointer`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{achievement.icon || "🏆"}</div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } mb-2`}
                        >
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2">
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
            <div className="grid gap-4">
              {lockedList.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/30"
                      : "bg-gray-50 border-gray-200"
                  } p-4 opacity-75`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl grayscale opacity-50">
                      {achievement.icon || "🔒"}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {achievement.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        } mb-2`}
                      >
                        {getAchievementDescription(achievement.type)}
                      </p>
                      <span className="text-xs bg-gray-500/20 text-gray-600 px-2 py-1 rounded-full">
                        +{achievement.points} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
