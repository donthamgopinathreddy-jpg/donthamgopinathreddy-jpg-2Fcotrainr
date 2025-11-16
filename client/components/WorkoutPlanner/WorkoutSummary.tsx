import React from "react";
import { Activity, Clock, Flame, Zap } from "lucide-react";

interface WorkoutSummaryProps {
  stats: {
    totalWorkouts: number;
    totalMinutes: number;
    totalCalories: number;
    categoryBreakdown: Record<string, number>;
  };
}

export default function WorkoutSummary({ stats }: WorkoutSummaryProps) {
  const categoryIcons = {
    gym: "🏋️",
    yoga: "🧘",
    boxing: "🥊",
    zumba: "💃",
    stretching: "🤸",
    warmups: "🔥",
  };

  const avgMinutesPerWorkout =
    stats.totalWorkouts > 0
      ? Math.round(stats.totalMinutes / stats.totalWorkouts)
      : 0;
  const avgCaloriesPerWorkout =
    stats.totalWorkouts > 0
      ? Math.round(stats.totalCalories / stats.totalWorkouts)
      : 0;

  const activeCategoryCount = Object.values(stats.categoryBreakdown).filter(
    (count) => count > 0,
  ).length;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/50">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Workouts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalWorkouts}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total Workouts
          </p>
        </div>

        {/* Total Minutes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalMinutes}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Minutes
          </p>
        </div>

        {/* Total Calories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalCalories}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Calories
          </p>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeCategoryCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Categories
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {activeCategoryCount > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Breakdown by Category
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.categoryBreakdown).map(
              ([category, count]) => {
                if (count === 0) return null;

                const percentage =
                  stats.totalWorkouts > 0
                    ? Math.round((count / stats.totalWorkouts) * 100)
                    : 0;

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {categoryIcons[category as keyof typeof categoryIcons]}{" "}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Average Stats */}
      {stats.totalWorkouts > 0 && (
        <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avg per Workout
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {avgMinutesPerWorkout} min
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avg Calories
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {avgCaloriesPerWorkout} cal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalWorkouts === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Start building your workout plan by adding exercises to your week
          </p>
        </div>
      )}
    </div>
  );
}
