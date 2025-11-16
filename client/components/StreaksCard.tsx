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
        className={`rounded-2xl border-2 ${
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
        className={`rounded-2xl border-2 p-6 text-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800/80 to-gray-900 border-gray-700/60"
            : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300/60"
        }`}
      >
        <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p
          className={`text-base font-semibold ${
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
    return "🚀";
  };

  const getMilestoneText = (days: number) => {
    if (days >= 30) return "30-Day Beast!";
    if (days >= 15) return "Half-Month Hero!";
    if (days >= 7) return "One Week Strong!";
    if (days >= 3) return "3-Day Warmup!";
    return "Getting Started!";
  };

  if (compact) {
    return (
      <div
        className={`rounded-xl border-2 p-4 flex items-center gap-3 transition-all hover:shadow-lg ${
          theme === "dark"
            ? "bg-gradient-to-br from-orange-900/40 via-orange-900/20 to-transparent border-orange-700/60 shadow-lg shadow-orange-500/20"
            : "bg-gradient-to-br from-orange-200/60 via-orange-100/40 to-transparent border-orange-400/60 shadow-lg shadow-orange-400/20"
        }`}
      >
        <div className={`text-3xl flex items-center gap-1 p-3 rounded-lg ${
          theme === "dark"
            ? "bg-orange-900/60 shadow-lg shadow-orange-500/30"
            : "bg-gradient-to-br from-orange-300 to-orange-400 shadow-lg shadow-orange-400/30"
        }`}>
          <Flame className={`w-6 h-6 ${theme === "dark" ? "text-orange-400" : "text-white"}`} />
          <span className={theme === "dark" ? "text-orange-300 font-bold" : "text-white font-bold"}>
            {streak.current_streak}
          </span>
        </div>
        <div>
          <p
            className={`text-sm font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
          >
            Current Streak
          </p>
          <p className={`text-xs font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}>
            {getMilestoneText(streak.current_streak)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border-2 shadow-2xl transition-all hover:shadow-2xl hover:scale-105 ${
        theme === "dark"
          ? "bg-gradient-to-br from-orange-900/40 via-gray-900 to-gray-950 border-orange-700/60 shadow-orange-500/20"
          : "bg-gradient-to-br from-orange-200/50 via-white to-amber-50/40 border-orange-400/60 shadow-orange-400/20"
      } p-8`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            theme === "dark"
              ? "bg-orange-900/60 shadow-lg shadow-orange-500/30"
              : "bg-gradient-to-br from-orange-300 to-orange-400 shadow-lg shadow-orange-400/30"
          }`}>
            <Flame
              className={`w-6 h-6 ${
                streak.current_streak > 0
                  ? theme === "dark"
                    ? "text-orange-400"
                    : "text-white"
                  : "text-gray-400"
              }`}
            />
          </div>
          <h3
            className={`font-bold text-xl ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Daily Streak
          </h3>
        </div>
        <div className="text-4xl animate-bounce">
          {getMilestoneEmoji(streak.current_streak)}
        </div>
      </div>

      {/* Main Streak Display */}
      <div
        className={`rounded-3xl p-8 text-center transition-all mb-6 border-2 ${
          theme === "dark"
            ? "bg-gradient-to-br from-orange-900/60 via-orange-900/40 to-orange-900/20 border-orange-700/80 shadow-xl shadow-orange-500/30"
            : "bg-gradient-to-br from-orange-300 via-orange-200 to-orange-100 border-orange-400 shadow-xl shadow-orange-400/40"
        }`}
      >
        <p
          className={`text-xs uppercase font-bold tracking-widest mb-3 ${
            theme === "dark" ? "text-orange-300" : "text-orange-700"
          }`}
        >
          🔥 Current Streak
        </p>
        <p
          className={`text-7xl font-black mb-3 ${
            theme === "dark" ? "text-orange-300" : "text-orange-600"
          }`}
        >
          {streak.current_streak}
        </p>
        <p
          className={`text-lg font-bold ${
            theme === "dark" ? "text-orange-200" : "text-orange-700"
          }`}
        >
          Days in a row
        </p>
      </div>

      {/* Longest Streak */}
      <div
        className={`rounded-2xl p-6 mb-6 transition-all border-2 ${
          theme === "dark"
            ? "bg-gradient-to-r from-yellow-900/50 via-yellow-900/30 to-yellow-900/10 border-yellow-700/60 shadow-lg shadow-yellow-500/20"
            : "bg-gradient-to-r from-yellow-200/70 via-yellow-100/50 to-yellow-50/40 border-yellow-400/60 shadow-lg shadow-yellow-400/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-xs uppercase font-bold tracking-wide mb-1 ${
                theme === "dark" ? "text-yellow-300" : "text-yellow-700"
              }`}
            >
              🏆 Longest Streak
            </p>
            <p
              className={`text-4xl font-black ${
                theme === "dark" ? "text-yellow-300" : "text-yellow-600"
              }`}
            >
              {streak.longest_streak}
            </p>
          </div>
          <div className="text-5xl animate-pulse">🏆</div>
        </div>
      </div>

      {/* Milestone Badges */}
      <div
        className={`rounded-2xl p-6 border-2 mb-6 ${
          theme === "dark"
            ? "bg-gradient-to-br from-purple-900/40 to-purple-900/10 border-purple-700/60"
            : "bg-gradient-to-br from-purple-200/60 to-purple-50/40 border-purple-400/60"
        }`}
      >
        <p
          className={`text-sm font-bold mb-4 ${
            theme === "dark" ? "text-purple-300" : "text-purple-700"
          }`}
        >
          {getMilestoneEmoji(streak.current_streak)} {getMilestoneText(streak.current_streak)}
        </p>
        <div className="flex gap-3 flex-wrap">
          {[3, 7, 15, 30].map((days) => (
            <div
              key={days}
              className={`text-sm px-4 py-3 rounded-xl font-bold transition-all transform ${
                streak.current_streak >= days
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/40 scale-105"
                    : "bg-gradient-to-r from-orange-400 via-orange-300 to-amber-400 text-white shadow-lg shadow-orange-400/40 scale-105"
                  : theme === "dark"
                    ? "bg-gray-700/60 border border-gray-600/50 text-gray-400"
                    : "bg-gray-200/70 border border-gray-300/50 text-gray-600"
              }`}
            >
              {days}d
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <p
        className={`text-sm font-bold text-center py-4 px-4 rounded-2xl ${
          theme === "dark"
            ? "bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-700/50 text-blue-300"
            : "bg-gradient-to-r from-blue-100/70 to-cyan-100/70 border border-blue-400/50 text-blue-700"
        }`}
      >
        ✨ Log any activity today to keep your streak alive!
      </p>
    </div>
  );
}
