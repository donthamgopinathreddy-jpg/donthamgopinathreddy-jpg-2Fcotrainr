import React from "react";
import { Clock, Flame, X } from "lucide-react";
import { Workout } from "@/hooks/useWorkouts";
import WorkoutAnimationRenderer from "@/components/WorkoutAnimationRenderer";
import { getWorkoutById } from "@/lib/workoutAnimations";

interface DayCardProps {
  workout: Workout;
  onRemove?: () => void;
  showAnimation?: boolean;
}

export default function DayCard({
  workout,
  onRemove,
  showAnimation = true,
}: DayCardProps) {
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

  const animatedWorkout = getWorkoutById(workout.id);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all group/card">
      {/* Animation Preview */}
      {showAnimation && animatedWorkout && (
        <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
          <WorkoutAnimationRenderer
            workoutId={workout.id}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-2 mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
            levelColors[workout.level]
          }`}
        >
          {workout.level}
        </span>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-bold">
          {categoryEmojis[workout.category as keyof typeof categoryEmojis]}{" "}
          {workout.category}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {workout.title}
      </h4>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-orange-500" />
          <span>{workout.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-red-500" />
          <span>{workout.calories_burned} cal</span>
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 bg-red-500/80 text-white rounded-lg hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
