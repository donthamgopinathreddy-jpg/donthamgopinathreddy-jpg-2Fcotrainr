import React, { useState } from "react";
import { X, Lock } from "lucide-react";
import { Workout } from "@/hooks/useWorkouts";
import DayCard from "@/components/WorkoutPlanner/DayCard";

interface ChooseWorkoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout: (workout: Workout) => void;
  planner: any;
  availableWorkouts: Workout[];
  plan: "free" | "basic" | "premium";
}

export default function ChooseWorkoutPanel({
  isOpen,
  onClose,
  onSelectWorkout,
  planner,
  availableWorkouts,
  plan,
}: ChooseWorkoutPanelProps) {
  const [filterLevel, setFilterLevel] = useState<string>(planner.selectedLevel);

  if (!isOpen) return null;

  // Filter workouts by selected category and level
  const filteredWorkouts = availableWorkouts.filter(
    (w) => w.category === planner.selectedCategory && w.level === filterLevel,
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Workout
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {planner.selectedCategory.charAt(0).toUpperCase() +
                planner.selectedCategory.slice(1)}{" "}
              • {filterLevel.charAt(0).toUpperCase() + filterLevel.slice(1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
            Difficulty Level
          </label>
          <div className="flex gap-2">
            {["beginner", "intermediate", "advanced"].map((level) => {
              const isLocked = plan === "free" && level !== "beginner";

              return (
                <button
                  key={level}
                  onClick={() => !isLocked && setFilterLevel(level)}
                  disabled={isLocked}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative ${
                    filterLevel === level
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : isLocked
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  {isLocked && <Lock className="w-3 h-3 inline ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workouts List */}
        <div className="overflow-y-auto flex-1 p-6">
          {filteredWorkouts.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {filteredWorkouts.length} workout
                {filteredWorkouts.length !== 1 ? "s" : ""} available
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="cursor-pointer transform transition-all hover:scale-105"
                    onClick={() => onSelectWorkout(workout)}
                  >
                    <DayCard workout={workout} showAnimation={true} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No workouts found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try selecting a different level or category
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {plan === "free" && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800/50 p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400 text-center">
              💡 Upgrade to Premium to unlock all levels and categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
