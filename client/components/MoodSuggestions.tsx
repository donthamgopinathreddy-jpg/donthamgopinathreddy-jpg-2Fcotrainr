import { useTheme } from "@/contexts/ThemeContext";
import { Heart, Lightbulb, Music, Trees, Book, Zap } from "lucide-react";

interface MoodSuggestionsProps {
  moodValue?: number;
}

interface ActionLink {
  icon: React.ComponentType<any>;
  text: string;
  color: string;
  url: string;
}

export default function MoodSuggestions({ moodValue }: MoodSuggestionsProps) {
  const { theme } = useTheme();

  const handleActionClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const suggestions = {
    1: {
      title: "Let's lift your mood! 💪",
      message: "You're having a rough day. Try these to feel better:",
      actions: [
        { icon: Music, text: "Listen to uplifting music", color: "text-purple-500" },
        { icon: Trees, text: "Take a short walk outside", color: "text-green-500" },
        { icon: Heart, text: "Reach out to a friend", color: "text-red-500" },
        { icon: Book, text: "Read something inspiring", color: "text-blue-500" },
      ],
      bgClass:
        theme === "dark"
          ? "bg-gradient-to-br from-red-900/40 to-orange-900/30 border border-red-700/40"
          : "bg-gradient-to-br from-red-100/60 to-orange-100/40 border border-red-300/40",
      textClass: theme === "dark" ? "text-red-300" : "text-red-700",
    },
    2: {
      title: "Improve your mood 🌤️",
      message: "Let's make your day a bit brighter:",
      actions: [
        { icon: Lightbulb, text: "Take a mindfulness break", color: "text-yellow-500" },
        { icon: Zap, text: "Do a quick workout", color: "text-orange-500" },
        { icon: Music, text: "Dance to your favorite song", color: "text-pink-500" },
        { icon: Trees, text: "Get some fresh air", color: "text-green-500" },
      ],
      bgClass:
        theme === "dark"
          ? "bg-gradient-to-br from-yellow-900/40 to-orange-900/30 border border-yellow-700/40"
          : "bg-gradient-to-br from-yellow-100/60 to-orange-100/40 border border-yellow-300/40",
      textClass: theme === "dark" ? "text-yellow-300" : "text-yellow-700",
    },
    3: {
      title: "Keep it steady 😌",
      message: "You're doing well! Maintain this balanced mood:",
      actions: [
        { icon: Heart, text: "Practice gratitude", color: "text-blue-500" },
        { icon: Trees, text: "Meditate for 5 minutes", color: "text-teal-500" },
        { icon: Book, text: "Journal your thoughts", color: "text-indigo-500" },
        { icon: Lightbulb, text: "Set a small goal", color: "text-cyan-500" },
      ],
      bgClass:
        theme === "dark"
          ? "bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border border-blue-700/40"
          : "bg-gradient-to-br from-blue-100/60 to-cyan-100/40 border border-blue-300/40",
      textClass: theme === "dark" ? "text-blue-300" : "text-blue-700",
    },
    4: {
      title: "You're doing great! 😊",
      message: "Keep spreading this positive energy:",
      actions: [
        { icon: Heart, text: "Share your happiness with others", color: "text-green-500" },
        { icon: Zap, text: "Channel energy into a project", color: "text-emerald-500" },
        { icon: Music, text: "Celebrate your wins", color: "text-lime-500" },
        { icon: Lightbulb, text: "Help someone in need", color: "text-green-400" },
      ],
      bgClass:
        theme === "dark"
          ? "bg-gradient-to-br from-green-900/40 to-emerald-900/30 border border-green-700/40"
          : "bg-gradient-to-br from-green-100/60 to-emerald-100/40 border border-green-300/40",
      textClass: theme === "dark" ? "text-green-300" : "text-green-700",
    },
    5: {
      title: "Amazing mood! 🤩",
      message: "You're on top of the world! Make the most of it:",
      actions: [
        { icon: Zap, text: "Take on a big challenge", color: "text-purple-500" },
        { icon: Heart, text: "Spread positivity around", color: "text-pink-500" },
        { icon: Music, text: "Do something fun & creative", color: "text-violet-500" },
        { icon: Lightbulb, text: "Inspire others", color: "text-fuchsia-500" },
      ],
      bgClass:
        theme === "dark"
          ? "bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-700/40"
          : "bg-gradient-to-br from-purple-100/60 to-pink-100/40 border border-purple-300/40",
      textClass: theme === "dark" ? "text-purple-300" : "text-purple-700",
    },
  };

  if (!moodValue || moodValue < 1 || moodValue > 5) {
    return null;
  }

  const suggestion = suggestions[moodValue as keyof typeof suggestions];

  return (
    <div className={`rounded-3xl p-6 transition-all duration-300 ${suggestion.bgClass}`}>
      <h4 className={`text-lg font-bold mb-2 ${suggestion.textClass}`}>{suggestion.title}</h4>
      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
        {suggestion.message}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {suggestion.actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 p-3 rounded-xl backdrop-blur-sm transition-all hover:scale-105 ${
                theme === "dark"
                  ? "bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50"
                  : "bg-white/40 hover:bg-white/60 border border-white/60"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
              <span className="text-xs font-semibold line-clamp-2">{action.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
