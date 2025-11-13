import { useAchievements } from "@/hooks/useAchievements";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

interface AchievementBadgesProps {
  userId?: string;
  compact?: boolean;
}

const AchievementBadges = ({ userId, compact = false }: AchievementBadgesProps) => {
  const { theme } = useTheme();
  const { userAchievements, getTotalPoints } = useAchievements();
  const [showAll, setShowAll] = useState(false);

  const displayAchievements = compact && !showAll ? userAchievements.slice(0, 3) : userAchievements;
  const hasMore = userAchievements.length > 3 && compact;

  if (userAchievements.length === 0) {
    return (
      <div
        className={`p-4 rounded-lg text-center ${
          theme === "dark"
            ? "bg-gray-800/50 text-gray-400"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <p className="text-sm">No achievements yet. Keep working!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points Summary */}
      <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50"
            : "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
        }`}
      >
        <p
          className={`text-sm ${theme === "dark" ? "text-yellow-400" : "text-yellow-700"}`}
        >
          Total Points
        </p>
        <p
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-yellow-300" : "text-orange-600"
          }`}
        >
          {getTotalPoints()}
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {displayAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-transform hover:scale-105 ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 hover:border-blue-500"
                : "bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md"
            }`}
            title={achievement.description}
          >
            <div className="text-3xl">{achievement.icon}</div>
            <p
              className={`text-xs font-semibold line-clamp-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {achievement.title}
            </p>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              +{achievement.points} pts
            </p>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            theme === "dark"
              ? "bg-gray-800 text-blue-400 hover:bg-gray-700"
              : "bg-gray-100 text-blue-600 hover:bg-gray-200"
          }`}
        >
          {showAll ? "Show Less" : `View All ${userAchievements.length} Achievements`}
        </button>
      )}
    </div>
  );
};

export default AchievementBadges;
