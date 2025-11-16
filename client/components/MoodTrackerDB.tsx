import { useState, useEffect } from "react";
import { Smile, Loader } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMoodLogs } from "@/hooks/useMoodLogs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MoodTrackerDB() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { todayMood, loading, error, addMoodLog } = useMoodLogs(userProfile?.id);
  const [selectedMood, setSelectedMood] = useState<number | null>(
    todayMood?.mood_value || null
  );
  const [isSaving, setIsSaving] = useState(false);

  const moods = [
    { emoji: "😢", label: "Poor", value: 1 },
    { emoji: "😐", label: "Fair", value: 2 },
    { emoji: "😌", label: "Good", value: 3 },
    { emoji: "😊", label: "Great", value: 4 },
    { emoji: "🤩", label: "Amazing", value: 5 },
  ];

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood_value);
    }
  }, [todayMood]);

  const handleMoodSelect = async (moodValue: number) => {
    setSelectedMood(moodValue);
    setIsSaving(true);

    const success = await addMoodLog(moodValue);
    setIsSaving(false);

    if (success) {
      toast.success("Mood logged! 🎉");
    } else {
      toast.error("Failed to log mood");
    }
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
          : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md hover:shadow-lg"
      }`}
    >
      <h3
        className={`text-lg font-bold flex items-center gap-2 mb-4 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <Smile className="w-5 h-5 text-pink-500" />
        How are you feeling today?
      </h3>

      {error && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            theme === "dark"
              ? "bg-red-900/30 text-red-300"
              : "bg-red-50 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      {/* Mood Selector */}
      <div className="flex justify-between gap-2 mb-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            disabled={isSaving || loading}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedMood === mood.value
                ? theme === "dark"
                  ? "bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg scale-110"
                  : "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-110"
                : theme === "dark"
                  ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:border-gray-500"
                  : "bg-gray-100/50 border border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            {isSaving && selectedMood === mood.value ? (
              <Loader className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              mood.emoji
            )}
          </button>
        ))}
      </div>

      {/* Label */}
      {selectedMood && (
        <p
          className={`text-sm font-semibold text-center ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {moods.find((m) => m.value === selectedMood)?.label}
        </p>
      )}

      {/* Status Message */}
      {todayMood && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs text-center font-semibold ${
            theme === "dark"
              ? "bg-green-900/30 text-green-300"
              : "bg-green-50 text-green-700"
          }`}
        >
          ✓ Mood already logged today
        </div>
      )}

      {!todayMood && !loading && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs text-center ${
            theme === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          💡 Logging your mood helps us understand your wellness journey
        </div>
      )}
    </div>
  );
}
