import { Dumbbell, Play } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Workout {
  id: string;
  title: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  calories: string;
  thumbnail: string;
  category: string;
}

export default function WorkoutLibraryGrid() {
  const { theme } = useTheme();

  const workouts: Workout[] = [
    {
      id: "1",
      title: "Morning Cardio Blast",
      duration: "20 min",
      difficulty: "Intermediate",
      calories: "250 kcal",
      thumbnail: "🏃",
      category: "Cardio",
    },
    {
      id: "2",
      title: "Full Body Strength",
      duration: "45 min",
      difficulty: "Advanced",
      calories: "380 kcal",
      thumbnail: "💪",
      category: "Strength",
    },
    {
      id: "3",
      title: "Yoga & Flexibility",
      duration: "30 min",
      difficulty: "Beginner",
      calories: "120 kcal",
      thumbnail: "🧘",
      category: "Yoga",
    },
    {
      id: "4",
      title: "HIIT Training",
      duration: "25 min",
      difficulty: "Advanced",
      calories: "320 kcal",
      thumbnail: "⚡",
      category: "HIIT",
    },
    {
      id: "5",
      title: "Core Power",
      duration: "15 min",
      difficulty: "Intermediate",
      calories: "180 kcal",
      thumbnail: "🫀",
      category: "Core",
    },
    {
      id: "6",
      title: "Stretching Routine",
      duration: "10 min",
      difficulty: "Beginner",
      calories: "60 kcal",
      thumbnail: "🤸",
      category: "Recovery",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return theme === "dark"
          ? "bg-green-900/40 text-green-300 border-green-700/50"
          : "bg-green-100/60 text-green-700 border-green-300";
      case "Intermediate":
        return theme === "dark"
          ? "bg-amber-900/40 text-amber-300 border-amber-700/50"
          : "bg-amber-100/60 text-amber-700 border-amber-300";
      case "Advanced":
        return theme === "dark"
          ? "bg-red-900/40 text-red-300 border-red-700/50"
          : "bg-red-100/60 text-red-700 border-red-300";
      default:
        return "";
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50"
          : "bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-6">
        <h3
          className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          } flex items-center gap-2`}
        >
          <Dumbbell className="w-5 h-5 text-orange-500" />
          Workout Library
        </h3>
        <p
          className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Pick a workout and get started
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <button
            key={workout.id}
            className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              theme === "dark" ? "hover:shadow-orange-500/20" : "hover:shadow-orange-400/30"
            }`}
          >
            {/* Thumbnail */}
            <div
              className={`relative h-32 flex items-center justify-center text-5xl rounded-2xl rounded-b-none transition-all duration-300 group-hover:brightness-110 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50"
                  : "bg-gradient-to-br from-gray-50/60 to-white/60"
              }`}
            >
              {workout.thumbnail}

              {/* Play Button Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl rounded-b-none`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                    theme === "dark"
                      ? "bg-white/90 text-gray-900"
                      : "bg-white/90 text-gray-900"
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div
              className={`rounded-2xl rounded-t-none p-4 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/30"
                  : "bg-gradient-to-br from-gray-50/60 to-white/60 border border-gray-200/40"
              }`}
            >
              <h4
                className={`font-bold text-sm mb-2 text-left ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {workout.title}
              </h4>

              <div className="flex flex-wrap gap-1 mb-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold border ${getDifficultyColor(workout.difficulty)}`}
                >
                  {workout.difficulty}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    theme === "dark"
                      ? "bg-gray-600/40 text-gray-300 border border-gray-500/30"
                      : "bg-gray-200/40 text-gray-700 border border-gray-300/30"
                  }`}
                >
                  {workout.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  ⏱️ {workout.duration}
                </span>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  🔥 {workout.calories}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
          theme === "dark"
            ? "bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 text-white"
            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        }`}
      >
        Browse All Workouts
      </button>
    </div>
  );
}
