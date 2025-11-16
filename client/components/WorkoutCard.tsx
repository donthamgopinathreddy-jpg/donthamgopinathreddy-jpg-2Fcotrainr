import { Clock, Flame } from "lucide-react";
import { Workout } from "@/hooks/useWorkouts";

interface WorkoutCardProps {
  workout: Workout;
  isLocked?: boolean;
}

export default function WorkoutCard({ workout, isLocked = false }: WorkoutCardProps) {
  const levelColors = {
    basic: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  const categoryEmojis = {
    gym: "🏋️",
    yoga: "🧘",
    boxing: "🥊",
    zumba: "💃",
    stretching: "🤸",
    warmups: "🔥",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${
        isLocked ? "opacity-50" : "hover:scale-105"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {workout.thumbnail_url ? (
          <img
            src={workout.thumbnail_url}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {categoryEmojis[workout.category]}
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Level badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${
            levelColors[workout.level]
          }`}
        >
          {workout.level}
        </div>

        {/* Lock icon for locked content */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-sm font-semibold">Locked</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
          {workout.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{workout.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-red-500" />
            <span>{workout.calories_burned} cal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
