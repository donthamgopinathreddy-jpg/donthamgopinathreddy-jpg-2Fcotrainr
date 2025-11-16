import { useState } from "react";
import { Smile, TrendingUp } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface MoodEntry {
  day: string;
  mood: number;
  emoji: string;
}

export default function MoodTracker() {
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState(4);

  const moods = [
    { emoji: "😢", label: "Poor", value: 1 },
    { emoji: "😐", label: "Fair", value: 2 },
    { emoji: "😌", label: "Good", value: 3 },
    { emoji: "😊", label: "Great", value: 4 },
    { emoji: "🤩", label: "Amazing", value: 5 },
  ];

  const moodHistory: MoodEntry[] = [
    { day: "Mon", mood: 3, emoji: "😌" },
    { day: "Tue", mood: 4, emoji: "😊" },
    { day: "Wed", mood: 3, emoji: "😌" },
    { day: "Thu", mood: 5, emoji: "🤩" },
    { day: "Fri", mood: 4, emoji: "😊" },
    { day: "Sat", mood: 5, emoji: "🤩" },
    { day: "Sun", mood: 4, emoji: "😊" },
  ];

  const avgMood = Math.round(
    moodHistory.reduce((sum, m) => sum + m.mood, 0) / moodHistory.length
  );

  const maxMoodValue = 5;
  const normalizedValues = moodHistory.map((m) => (m.mood / maxMoodValue) * 100);

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-rose-900/20 via-purple-900/20 to-gray-900/50 border border-rose-700/30"
          : "bg-gradient-to-br from-rose-50 via-purple-50 to-white border border-rose-300/40"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className={`text-lg font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <Smile className="w-5 h-5 text-rose-500" />
            Daily Mood Tracker
          </h3>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            How are you feeling today?
          </p>
        </div>
        <div className="text-3xl">{moods[selectedMood - 1].emoji}</div>
      </div>

      {/* Mood Selector */}
      <div className="mb-6">
        <div className="flex justify-between gap-2 mb-4">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-110 ${
                selectedMood === mood.value
                  ? theme === "dark"
                    ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50 scale-110"
                    : "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-400/40 scale-110"
                  : theme === "dark"
                    ? "bg-gray-700/40 border border-gray-600/30 text-gray-400 hover:border-gray-500/50"
                    : "bg-gray-100/50 border border-gray-300/30 text-gray-600 hover:border-gray-300/60"
              }`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        <p
          className={`text-sm font-semibold text-center ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {moods[selectedMood - 1].label}
        </p>
      </div>

      {/* Trend Graph */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p
            className={`text-sm font-semibold flex items-center gap-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-green-500" />
            Weekly Trend
          </p>
          <span
            className={`text-sm font-bold ${
              theme === "dark" ? "text-rose-400" : "text-rose-600"
            }`}
          >
            Avg: {avgMood}/5
          </span>
        </div>

        {/* Mini Bar Chart */}
        <div className="flex items-end justify-between gap-1 h-20 mb-4 px-1">
          {normalizedValues.map((value, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 group hover:opacity-80 cursor-pointer ${
                  theme === "dark"
                    ? "bg-gradient-to-t from-rose-500 to-pink-400"
                    : "bg-gradient-to-t from-rose-400 to-pink-300"
                }`}
                style={{ height: `${value}%`, minHeight: "4px" }}
              />
              <span
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {moodHistory[idx].emoji}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Mon</span>
          <span>Sun</span>
        </div>
      </div>

      <button
        className={`w-full mt-6 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
          theme === "dark"
            ? "bg-gradient-to-r from-rose-600/80 to-pink-600/80 hover:from-rose-500 hover:to-pink-500 text-white"
            : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        }`}
      >
        Save Mood Entry
      </button>
    </div>
  );
}
