import { Flame } from "lucide-react";
import { useStreaks } from "@/hooks/useStreaks";
import { useTheme } from "@/contexts/ThemeContext";

interface StreaksCardProps {
  compact?: boolean;
}

export default function StreaksCard({ compact = false }: StreaksCardProps) {
  const { streak, loading } = useStreaks();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div
        className={`rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-white border-gray-200"
        } p-4 animate-pulse`}
      >
        <div className="h-4 bg-gray-300 rounded w-20 mb-2" />
        <div className="h-8 bg-gray-300 rounded w-16" />
      </div>
    );
  }

  if (!streak) {
    return (
      <div
        className={`rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-white border-gray-200"
        } p-4`}
      >
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          🔥 Start tracking your daily activity to build streaks!
        </p>
      </div>
    );
  }

  const getMilestoneEmoji = (days: number) => {
    if (days >= 30) return "👑";
    if (days >= 15) return "🏆";
    if (days >= 7) return "🔥";
    if (days >= 3) return "✨";
    return "";
  };

  const getMilestoneText = (days: number) => {
    if (days >= 30) return "30-Day Beast!";
    if (days >= 15) return "Half-Month Hero!";
    if (days >= 7) return "One Week Strong!";
    if (days >= 3) return "3-Day Warmup!";
    return "Keep Going!";
  };

  if (compact) {
    return (
      <div
        className={`rounded-lg border ${
          theme === "dark"
            ? "bg-gradient-to-br from-orange-900/30 to-transparent border-orange-700/50"
            : "bg-gradient-to-br from-orange-50 to-transparent border-orange-200"
        } p-4 flex items-center gap-3`}
      >
        <div className="text-3xl flex items-center gap-1">
          <Flame className="w-6 h-6 text-orange-500" />
          <span>{streak.current_streak}</span>
        </div>
        <div>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Current Streak
          </p>
          <p className="text-xs text-orange-500 font-semibold">
            {getMilestoneText(streak.current_streak)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border shadow-md transition-all hover:shadow-lg ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border-orange-700/30"
          : "bg-gradient-to-br from-orange-100 to-amber-50 border-orange-300"
      } p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`font-bold text-lg flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <Flame
            className={`w-6 h-6 ${
              streak.current_streak > 0 ? "text-orange-500" : "text-gray-400"
            }`}
          />
          Daily Streak
        </h3>
        <div className="text-3xl animate-bounce">
          {getMilestoneEmoji(streak.current_streak)}
        </div>
      </div>

      <div className="mb-6">
        <div
          className={`rounded-2xl p-6 text-center transition-all ${
            theme === "dark"
              ? "bg-gradient-to-br from-orange-900/40 to-orange-900/20 border border-orange-800/50"
              : "bg-gradient-to-br from-orange-200 to-orange-100 border border-orange-400"
          }`}
        >
          <p
            className={`text-xs uppercase font-bold tracking-wide mb-2 ${
              theme === "dark" ? "text-orange-300" : "text-orange-700"
            }`}
          >
            Current Streak
          </p>
          <p
            className={`text-5xl font-black mb-2 ${
              theme === "dark" ? "text-orange-400" : "text-orange-600"
            }`}
          >
            {streak.current_streak}
          </p>
          <p
            className={`text-sm font-semibold ${
              theme === "dark" ? "text-orange-300" : "text-orange-700"
            }`}
          >
            Days in a row 🔥
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div
          className={`rounded-xl p-4 transition-all ${
            theme === "dark"
              ? "bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border border-yellow-800/30"
              : "bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-xs uppercase font-bold ${
                  theme === "dark" ? "text-yellow-300" : "text-yellow-700"
                } mb-1`}
              >
                Longest Streak
              </p>
              <p
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                {streak.longest_streak}
              </p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl p-4 border-2 ${
          theme === "dark"
            ? "bg-gradient-to-br from-purple-900/20 to-transparent border-purple-700/50"
            : "bg-gradient-to-br from-purple-100 to-transparent border-purple-300"
        }`}
      >
        <p
          className={`text-sm font-bold mb-3 ${
            theme === "dark" ? "text-purple-300" : "text-purple-700"
          }`}
        >
          {getMilestoneEmoji(streak.current_streak)}{" "}
          {getMilestoneText(streak.current_streak)}
        </p>
        <div className="flex gap-2 flex-wrap">
          {[3, 7, 15, 30].map((days) => (
            <div
              key={days}
              className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
                streak.current_streak >= days
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-400/30"
                  : theme === "dark"
                    ? "bg-gray-700/50 text-gray-400"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {days}d
            </div>
          ))}
        </div>
      </div>

      <p
        className={`text-xs mt-4 font-semibold text-center ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        ✨ Log any activity today to continue your streak!
      </p>
    </div>
  );
}
