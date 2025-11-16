import { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMoodLogs } from "@/hooks/useMoodLogs";
import { useAuth } from "@/contexts/AuthContext";

export default function WeeklyMoodDropdown() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { moodLogs } = useMoodLogs(userProfile?.id);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get last 7 days of mood logs
  const last7Days = moodLogs.slice(0, 7);

  // Calculate average mood
  const averageMood =
    last7Days.length > 0
      ? Math.round(
          (last7Days.reduce((sum, log) => sum + log.mood_value, 0) /
            last7Days.length) *
            10,
        ) / 10
      : 0;

  const getMoodColor = (value: number) => {
    switch (value) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-yellow-500";
      case 3:
        return "text-blue-500";
      case 4:
        return "text-green-500";
      case 5:
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getMoodLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Great";
      case 5:
        return "Amazing";
      default:
        return "Unknown";
    }
  };

  const getMoodTrend = () => {
    if (last7Days.length < 2) return null;
    const recent =
      last7Days.slice(0, 3).reduce((sum, log) => sum + log.mood_value, 0) / 3;
    const older =
      last7Days.slice(3, 6).reduce((sum, log) => sum + log.mood_value, 0) / 3;
    if (recent > older) return "up";
    if (recent < older) return "down";
    return "neutral";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-900/40 hover:from-purple-900/60 hover:via-pink-900/50 hover:to-purple-900/60 shadow-lg shadow-purple-500/20"
            : "bg-gradient-to-r from-purple-200/50 via-pink-200/40 to-purple-200/50 hover:from-purple-200/70 hover:via-pink-200/60 hover:to-purple-200/70 shadow-lg shadow-purple-400/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${
              theme === "dark" ? "bg-purple-900/60" : "bg-purple-300/60"
            }`}
          >
            <TrendingUp
              className={`w-5 h-5 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            />
          </div>
          <div className="text-left">
            <p
              className={`text-sm font-bold ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Weekly Mood
            </p>
            <p
              className={`text-lg font-bold flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {averageMood > 0 ? `${averageMood}/5` : "No data"}
              {getMoodTrend() === "up" && (
                <span className="text-green-500">↗</span>
              )}
              {getMoodTrend() === "down" && (
                <span className="text-red-500">↘</span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            showDropdown ? "rotate-180" : ""
          } ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}
        />
      </button>

      {/* Dropdown Content */}
      {showDropdown && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm ${
            theme === "dark" ? "bg-gray-900/95" : "bg-white/95"
          }`}
        >
          {last7Days.length > 0 ? (
            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              <p
                className={`text-xs font-bold uppercase tracking-wide mb-3 px-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Last 7 Days
              </p>
              {last7Days.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800/50 hover:bg-gray-800/80"
                      : "bg-gray-100/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{log.mood_emoji}</span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getMoodLabel(log.mood_value)}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatDate(log.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-200/50"
                    }`}
                  >
                    {log.mood_value}/5
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`p-6 text-center ${
                theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No mood entries yet
              </p>
              <p
                className={`text-xs mt-1 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Start logging your mood to see your weekly trends!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
