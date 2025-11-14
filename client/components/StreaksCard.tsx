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

  if (!streak) return null;

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
      className={`rounded-lg border ${
        theme === "dark"
          ? "bg-gray-800/50 border-gray-700/50"
          : "bg-white border-gray-200"
      } p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`font-bold text-lg ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          🔥 Daily Streak
        </h3>
        <div className="text-2xl">
          {getMilestoneEmoji(streak.current_streak)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`rounded-lg p-4 ${
            theme === "dark" ? "bg-orange-900/20" : "bg-orange-50"
          }`}
        >
          <p
            className={`text-xs uppercase font-semibold ${
              theme === "dark" ? "text-orange-300" : "text-orange-600"
            } mb-2`}
          >
            Current
          </p>
          <p className="text-2xl font-bold text-orange-500">
            {streak.current_streak}
          </p>
          <p className="text-xs mt-1 text-orange-400">days in a row</p>
        </div>

        <div
          className={`rounded-lg p-4 ${
            theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
          }`}
        >
          <p
            className={`text-xs uppercase font-semibold ${
              theme === "dark" ? "text-yellow-300" : "text-yellow-600"
            } mb-2`}
          >
            Longest
          </p>
          <p className="text-2xl font-bold text-yellow-500">
            {streak.longest_streak}
          </p>
          <p className="text-xs mt-1 text-yellow-400">days total</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg p-4 border border-orange-200/50">
        <p className="text-sm font-semibold mb-3">
          {getMilestoneEmoji(streak.current_streak)}{" "}
          {getMilestoneText(streak.current_streak)}
        </p>
        <div className="flex gap-2 flex-wrap">
          {[3, 7, 15, 30].map((days) => (
            <div
              key={days}
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                streak.current_streak >= days
                  ? "bg-orange-500 text-white"
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
        className={`text-xs mt-4 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Log any activity today to continue your streak! ✨
      </p>
    </div>
  );
}
