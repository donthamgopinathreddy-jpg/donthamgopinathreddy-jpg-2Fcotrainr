import { useState, useEffect } from "react";
import { Smile, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMoodLogs } from "@/hooks/useMoodLogs";
import { useAuth } from "@/contexts/AuthContext";
import MoodSuggestions from "./MoodSuggestions";
import { toast } from "sonner";

export default function MoodTrackerDB() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { todayMood, loading, error, addMoodLog } = useMoodLogs(
    userProfile?.id,
  );
  const [selectedMood, setSelectedMood] = useState<number | null>(
    todayMood?.mood_value || null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const moods = [
    {
      emoji: "😢",
      label: "Poor",
      value: 1,
      gradient: "from-red-500 via-red-400 to-orange-500",
      darkGradient: "from-red-600 via-red-500 to-orange-600",
      shadow: "shadow-red-500/40",
    },
    {
      emoji: "😐",
      label: "Fair",
      value: 2,
      gradient: "from-yellow-500 via-yellow-400 to-orange-500",
      darkGradient: "from-yellow-600 via-yellow-500 to-orange-600",
      shadow: "shadow-yellow-500/40",
    },
    {
      emoji: "😌",
      label: "Good",
      value: 3,
      gradient: "from-blue-500 via-cyan-400 to-blue-400",
      darkGradient: "from-blue-600 via-cyan-500 to-blue-500",
      shadow: "shadow-blue-500/40",
    },
    {
      emoji: "😊",
      label: "Great",
      value: 4,
      gradient: "from-green-500 via-emerald-400 to-teal-500",
      darkGradient: "from-green-600 via-emerald-500 to-teal-600",
      shadow: "shadow-green-500/40",
    },
    {
      emoji: "🤩",
      label: "Amazing",
      value: 5,
      gradient: "from-purple-500 via-pink-400 to-rose-500",
      darkGradient: "from-purple-600 via-pink-500 to-rose-600",
      shadow: "shadow-purple-500/40",
    },
  ];

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood_value);
    }
  }, [todayMood]);

  const handleMoodSelect = async (moodValue: number) => {
    setSelectedMood(moodValue);
    setIsSaving(true);
    setShowDropdown(false);

    const success = await addMoodLog(moodValue);
    setIsSaving(false);

    if (success) {
      toast.success("Mood logged! 🎉");
    } else {
      toast.error("Failed to log mood");
    }
  };

  const currentMood = moods.find((m) => m.value === selectedMood);

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl shadow-pink-500/20"
          : "bg-gradient-to-br from-white via-pink-50/20 to-rose-50/30 shadow-2xl shadow-pink-300/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${theme === "dark" ? "bg-pink-500/20" : "bg-pink-200/50"}`}
          >
            <Smile
              className={`w-6 h-6 ${theme === "dark" ? "text-pink-400" : "text-pink-600"}`}
            />
          </div>
          <h3
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            How are you feeling?
          </h3>
        </div>
        <div className="text-4xl animate-bounce">
          {selectedMood ? moods[selectedMood - 1].emoji : "😊"}
        </div>
      </div>

      {/* Custom Dropdown Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isSaving || loading}
          className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
            currentMood
              ? theme === "dark"
                ? `bg-gradient-to-r ${currentMood.darkGradient} text-white shadow-xl ${currentMood.shadow}`
                : `bg-gradient-to-r ${currentMood.gradient} text-white shadow-xl ${currentMood.shadow}`
              : theme === "dark"
                ? "bg-gray-800 text-gray-300 hover:bg-gray-750"
                : "bg-white text-gray-700 hover:bg-pink-50/30 backdrop-blur-sm"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="flex items-center gap-3">
            <span className="text-2xl">{currentMood?.emoji || "😊"}</span>
            <span>{currentMood?.label || "Select your mood"}</span>
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm ${
              theme === "dark" ? "bg-gray-800/95" : "bg-white/95"
            }`}
          >
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                disabled={isSaving}
                className={`w-full px-4 py-4 flex items-center gap-3 text-left font-semibold transition-all duration-200 ${
                  selectedMood === mood.value
                    ? theme === "dark"
                      ? `bg-gradient-to-r ${mood.darkGradient} text-white`
                      : `bg-gradient-to-r ${mood.gradient} text-white`
                    : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700/50"
                      : "text-gray-700 hover:bg-pink-100/40"
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <div>
                  <p className="font-bold">{mood.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Emoji Buttons (Alternative selection) */}
      <div className="mb-6">
        <p
          className={`text-xs font-semibold mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Or tap directly:
        </p>
        <div className="flex justify-between gap-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              disabled={isSaving || loading}
              className={`flex-1 py-3 rounded-xl text-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform ${
                selectedMood === mood.value
                  ? theme === "dark"
                    ? `bg-gradient-to-b ${mood.darkGradient} shadow-xl ${mood.shadow}`
                    : `bg-gradient-to-b ${mood.gradient} shadow-xl ${mood.shadow}`
                  : theme === "dark"
                    ? "bg-gray-700/50 hover:bg-gray-700/70"
                    : "bg-white/60 hover:bg-white/80 backdrop-blur-sm"
              }`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {todayMood && (
        <div
          className={`p-4 rounded-2xl text-center font-bold text-sm mb-4 transition-all flex items-center justify-center gap-2 ${
            theme === "dark"
              ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300"
              : "bg-gradient-to-r from-green-100/70 to-emerald-100/70 text-green-700"
          }`}
        >
          <span className="text-xl animate-bounce">✨</span>
          <span>Mood logged! Great job tracking your wellness</span>
        </div>
      )}

      {!todayMood && !loading && (
        <div
          className={`p-4 rounded-2xl text-center text-sm font-semibold mb-4 ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-blue-300"
              : "bg-gradient-to-r from-blue-100/70 to-cyan-100/70 text-blue-700"
          }`}
        >
          💡 How are you feeling right now? Track your mood daily!
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
