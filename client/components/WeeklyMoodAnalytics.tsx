import { useTheme } from "@/contexts/ThemeContext";
import { TrendingUp, Calendar } from "lucide-react";

interface MoodLog {
  id: string;
  user_id: string;
  mood_value: number;
  mood_emoji: string;
  date: string;
  created_at: string;
}

interface WeeklyMoodAnalyticsProps {
  moodLogs: MoodLog[];
}

export default function WeeklyMoodAnalytics({ moodLogs }: WeeklyMoodAnalyticsProps) {
  const { theme } = useTheme();

  const getMoodLabel = (value: number) => {
    const labels = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Amazing" };
    return labels[value as keyof typeof labels] || "Unknown";
  };

  const getMoodColor = (value: number) => {
    switch (value) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate statistics
  const totalMoods = moodLogs.length;
  const averageMood = totalMoods > 0 ? (moodLogs.reduce((sum, log) => sum + log.mood_value, 0) / totalMoods).toFixed(1) : "0";
  const highestMood = totalMoods > 0 ? Math.max(...moodLogs.map((log) => log.mood_value)) : 0;
  const lowestMood = totalMoods > 0 ? Math.min(...moodLogs.map((log) => log.mood_value)) : 0;

  // Get last 7 days including missing days
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const moodLog = moodLogs.find((log) => log.date === dateStr);

      days.push({
        date: dateStr,
        dayName,
        mood: moodLog?.mood_value || 0,
        hasData: !!moodLog,
      });
    }
    return days;
  };

  const sevenDaysData = getLast7DaysData();
  const moodDistribution = [1, 2, 3, 4, 5].map((value) => ({
    value,
    label: getMoodLabel(value),
    count: moodLogs.filter((log) => log.mood_value === value).length,
  }));

  const maxCount = Math.max(...moodDistribution.map((d) => d.count), 1);

  const getTrendMessage = () => {
    if (totalMoods === 0) return "Start tracking your mood to see trends!";
    const trend = moodLogs[0]?.mood_value - moodLogs[moodLogs.length - 1]?.mood_value;
    if (trend > 0) return "📈 Your mood is improving!";
    if (trend < 0) return "📉 Your mood is declining, take care of yourself";
    return "➡️ Your mood is stable";
  };

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50 shadow-lg"
          : "bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border border-indigo-200/40 shadow-lg"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-lg font-bold flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <TrendingUp className="w-6 h-6 text-indigo-500" />
          Weekly Mood Analytics
        </h3>
        <Calendar className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
            theme === "dark"
              ? "bg-blue-900/30 border border-blue-700/50"
              : "bg-blue-100/60 border border-blue-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold mb-1 ${
              theme === "dark" ? "text-blue-400" : "text-blue-700"
            }`}
          >
            Average Mood
          </p>
          <p
            className={`text-2xl font-bold ${theme === "dark" ? "text-blue-300" : "text-blue-900"}`}
          >
            {averageMood}
            <span className="text-sm">/5</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
            theme === "dark"
              ? "bg-purple-900/30 border border-purple-700/50"
              : "bg-purple-100/60 border border-purple-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold mb-1 ${
              theme === "dark" ? "text-purple-400" : "text-purple-700"
            }`}
          >
            Days Tracked
          </p>
          <p
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-purple-300" : "text-purple-900"
            }`}
          >
            {totalMoods}
            <span className="text-sm">/7</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
            theme === "dark"
              ? "bg-green-900/30 border border-green-700/50"
              : "bg-green-100/60 border border-green-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold mb-1 ${
              theme === "dark" ? "text-green-400" : "text-green-700"
            }`}
          >
            Best Mood
          </p>
          <p
            className={`text-2xl font-bold ${theme === "dark" ? "text-green-300" : "text-green-900"}`}
          >
            {getMoodLabel(highestMood)}
          </p>
        </div>

        <div
          className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
            theme === "dark"
              ? "bg-orange-900/30 border border-orange-700/50"
              : "bg-orange-100/60 border border-orange-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold mb-1 ${
              theme === "dark" ? "text-orange-400" : "text-orange-700"
            }`}
          >
            Trend
          </p>
          <p
            className={`text-xs font-bold ${
              theme === "dark" ? "text-orange-300" : "text-orange-700"
            }`}
          >
            {getTrendMessage()}
          </p>
        </div>
      </div>

      {/* 7-Day Mood Bars */}
      <div className="mb-6">
        <p
          className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          Last 7 Days
        </p>
        <div className="flex items-flex-end justify-between gap-2 h-24">
          {sevenDaysData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-2">
              <div className="relative w-full h-full flex items-flex-end justify-center group">
                {day.hasData ? (
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer ${getMoodColor(day.mood)}`}
                    style={{
                      height: `${(day.mood / 5) * 100}%`,
                      minHeight: "8px",
                    }}
                  >
                    <div
                      className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                        theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-800 text-white"
                      }`}
                    >
                      {getMoodLabel(day.mood)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full rounded-t-lg ${theme === "dark" ? "bg-gray-700/30" : "bg-gray-300/30"}`}
                    style={{ height: "8px" }}
                  />
                )}
              </div>
              <p
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {day.dayName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Distribution */}
      <div>
        <p
          className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          Mood Distribution
        </p>
        <div className="space-y-2">
          {moodDistribution.map((dist) => (
            <div key={dist.value} className="flex items-center gap-2">
              <span className="text-sm font-semibold w-16">{dist.label}</span>
              <div
                className={`flex-1 h-2 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getMoodColor(dist.value)}`}
                  style={{
                    width: `${maxCount > 0 ? (dist.count / maxCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-semibold w-6 text-right ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {dist.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
