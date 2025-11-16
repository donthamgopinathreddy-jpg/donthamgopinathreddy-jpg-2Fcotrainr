import { useState, useEffect } from "react";
import { Smile, Loader } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMoodLogs } from "@/hooks/useMoodLogs";
import { useAuth } from "@/contexts/AuthContext";
import MoodSuggestions from "./MoodSuggestions";
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

  const getMoodColor = (value: number) => {
    switch (value) {
      case 1:
        return "from-red-500 to-orange-500";
      case 2:
        return "from-yellow-500 to-orange-500";
      case 3:
        return "from-blue-500 to-cyan-500";
      case 4:
        return "from-green-500 to-emerald-500";
      case 5:
        return "from-purple-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50 shadow-lg hover:shadow-xl hover:shadow-pink-500/10"
          : "bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20 border border-pink-200/40 shadow-lg hover:shadow-xl hover:shadow-pink-300/20"
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className={`text-lg font-bold flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <Smile className="w-6 h-6 text-pink-500 animate-bounce" />
          How are you feeling?
        </h3>
        <div className="text-2xl">{selectedMood ? moods[selectedMood - 1].emoji : "😊"}</div>
      </div>

      {/* Mood Selector */}
      <div className="flex justify-between gap-3 mb-5">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            disabled={isSaving || loading}
            className={`flex-1 py-4 rounded-2xl font-bold text-2xl transition-all duration-300 hover:scale-115 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform ${
              selectedMood === mood.value
                ? `bg-gradient-to-br ${getMoodColor(mood.value)} text-white shadow-xl scale-110 shadow-${mood.value === 1 ? "red" : mood.value === 2 ? "yellow" : mood.value === 3 ? "blue" : mood.value === 4 ? "green" : "purple"}-500/40`
                : theme === "dark"
                  ? "bg-gray-700/40 border-2 border-gray-600/50 text-gray-300 hover:border-pink-500/50 hover:bg-gray-700/60"
                  : "bg-white/60 border-2 border-gray-300/40 text-gray-700 hover:border-pink-400/60 hover:bg-white/80 backdrop-blur-sm"
            }`}
          >
            {isSaving && selectedMood === mood.value ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              mood.emoji
            )}
          </button>
        ))}
      </div>

      {/* Label & Description */}
      {selectedMood && (
        <p
          className={`text-base font-bold text-center mb-4 ${
            theme === "dark" ? "text-pink-300" : "text-pink-700"
          }`}
        >
          {moods.find((m) => m.value === selectedMood)?.label}
        </p>
      )}

      {/* Status Message */}
      {todayMood && (
        <div
          className={`p-4 rounded-2xl text-sm text-center font-bold flex items-center justify-center gap-2 ${
            theme === "dark"
              ? "bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700/50 text-green-300"
              : "bg-gradient-to-r from-green-100/60 to-emerald-100/60 border border-green-400/40 text-green-700"
          }`}
        >
          <span className="text-xl">✓</span> Mood logged! Keep it up
        </div>
      )}

      {!todayMood && !loading && (
        <div
          className={`p-4 rounded-2xl text-sm text-center font-semibold ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/40 text-blue-300"
              : "bg-gradient-to-r from-blue-100/60 to-cyan-100/60 border border-blue-400/40 text-blue-700"
          }`}
        >
          💡 Track your mood daily to see your wellness journey!
        </div>
      )}

      {selectedMood && (
        <div className="mt-6">
          <MoodSuggestions moodValue={selectedMood} />
        </div>
      )}
    </div>
  );
}
