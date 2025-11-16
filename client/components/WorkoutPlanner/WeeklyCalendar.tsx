import React from "react";
import { Plus, X } from "lucide-react";
import WorkoutCard from "@/components/WorkoutPlanner/DayCard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeeklyCalendarProps {
  planner: any;
  onSelectDay: (dayIndex: number) => void;
  onRemoveWorkout: (dayIndex: number, workoutId: string) => void;
  onClearDay: (dayIndex: number) => void;
  plan: "free" | "basic" | "premium";
}

export default function WeeklyCalendar({
  planner,
  onSelectDay,
  onRemoveWorkout,
  onClearDay,
  plan,
}: WeeklyCalendarProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Weekly Schedule
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS.map((day, dayIndex) => {
          const workouts = planner.getWorkoutsForDay(dayIndex);

          return (
            <div
              key={dayIndex}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              {/* Day Header */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {day}
                </p>
              </div>

              {/* Workouts List */}
              <div className="space-y-3 mb-4 min-h-24">
                {workouts.length > 0 ? (
                  workouts.map((workout) => (
                    <div key={workout.id} className="group relative">
                      <WorkoutCard
                        workout={workout}
                        onRemove={() => onRemoveWorkout(dayIndex, workout.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                    No workouts planned
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                {workouts.length > 0 && (
                  <button
                    onClick={() => onClearDay(dayIndex)}
                    className="w-full px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Day
                  </button>
                )}

                <button
                  onClick={() => onSelectDay(dayIndex)}
                  className="w-full px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {workouts.length > 0 ? "Add More" : "Add Workout"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
