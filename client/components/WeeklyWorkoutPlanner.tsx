import { X, Plus } from "lucide-react";
import { Workout } from "@/hooks/useWorkouts";

interface WeeklyWorkoutPlannerProps {
  weeklyPlan: Record<string, string>;
  workouts: Workout[];
  onSelectDay: (day: string) => void;
  onRemoveWorkout: (day: string) => void;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyWorkoutPlanner({
  weeklyPlan,
  workouts,
  onSelectDay,
  onRemoveWorkout,
}: WeeklyWorkoutPlannerProps) {
  const getWorkoutById = (id: string) => {
    return workouts.find((w) => w.id === id);
  };

  return (
    <div className="space-y-6">
      {/* 7-Day Calendar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayKey = String(index);
          const assignedWorkoutId = weeklyPlan[dayKey];
          const assignedWorkout = assignedWorkoutId
            ? getWorkoutById(assignedWorkoutId)
            : null;

          return (
            <div
              key={day}
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-4 hover:shadow-lg transition-all min-h-64 flex flex-col"
            >
              {/* Day Header */}
              <div className="font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-white/30 dark:border-gray-700/30">
                {day}
              </div>

              {/* Workout Slot */}
              {assignedWorkout ? (
                <div className="flex-1 flex flex-col justify-between">
                  {/* Workout Info */}
                  <div className="space-y-2">
                    {assignedWorkout.thumbnail_url && (
                      <img
                        src={assignedWorkout.thumbnail_url}
                        alt={assignedWorkout.title}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                        {assignedWorkout.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {assignedWorkout.duration_minutes} min
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        🔥 {assignedWorkout.calories_burned} cal
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveWorkout(dayKey)}
                    className="w-full mt-4 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectDay(dayKey)}
                  className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
                >
                  <div className="text-center space-y-2">
                    <Plus className="w-8 h-8 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium">Add Workout</p>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> Plan your workouts for the week to stay
          consistent with your fitness goals. Mix different workout types for
          balanced fitness.
        </p>
      </div>
    </div>
  );
}
