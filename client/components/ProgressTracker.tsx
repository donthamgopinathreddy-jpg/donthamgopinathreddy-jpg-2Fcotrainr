import { useEffect, useState } from "react";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useClientGoals } from "@/hooks/useClientGoals";
import { useAuth } from "@/contexts/AuthContext";

export default function ProgressTracker() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { goals, loading, error } = useClientGoals(userProfile?.id);

  if (loading) {
    return (
      <div
        className={`rounded-2xl p-6 ${theme === "dark" ? "bg-gray-800/50" : "bg-white border border-gray-200"}`}
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div
        className={`rounded-2xl p-6 text-center ${
          theme === "dark"
            ? "bg-gray-800/50"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
        }`}
      >
        <Target
          className={`w-8 h-8 mx-auto mb-2 ${theme === "dark" ? "text-gray-400" : "text-blue-400"}`}
        />
        <p
          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          No active goals yet. Ask your trainer to create a goal for you!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3
        className={`text-lg font-bold flex items-center gap-2 px-2 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <Target className="w-5 h-5 text-orange-500" />
        Your Goals
      </h3>

      {goals.map((goal) => (
        <div
          key={goal.id}
          className={`rounded-2xl p-5 transition-all hover:shadow-md ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-orange-600/50"
              : "bg-white border border-gray-200 hover:border-orange-400 hover:shadow-lg"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4
                className={`font-bold text-sm mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {goal.goal_name}
              </h4>
              {goal.description && (
                <p
                  className={`text-xs mb-2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {goal.description}
                </p>
              )}
            </div>

            {/* Trainer Info */}
            {goal.trainer && (
              <div className="text-right">
                <p
                  className={`text-xs font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  by {goal.trainer.full_name}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Progress
              </span>
              <span
                className={`text-sm font-bold ${
                  goal.progress_percentage >= 100
                    ? theme === "dark"
                      ? "text-green-400"
                      : "text-green-600"
                    : theme === "dark"
                      ? "text-orange-400"
                      : "text-orange-600"
                }`}
              >
                {goal.progress_percentage}%
              </span>
            </div>

            <div
              className={`relative h-3 rounded-full overflow-hidden ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-gray-200/50"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  goal.progress_percentage >= 100
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-orange-400 to-amber-500"
                }`}
                style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div
              className={`p-3 rounded-lg text-center ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Current
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {goal.current_value}
              </p>
            </div>

            <div
              className={`p-3 rounded-lg text-center ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Target
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  theme === "dark" ? "text-orange-400" : "text-orange-600"
                }`}
              >
                {goal.target_value}
              </p>
            </div>

            <div
              className={`p-3 rounded-lg text-center ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Unit
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {goal.unit}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              {goal.duration_days} days remaining
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
