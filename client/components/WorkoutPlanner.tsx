import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useWorkoutPlanner } from "@/hooks/useWorkoutPlanner";
import { toast } from "sonner";
import { Plus, Trash2, Zap, Lock } from "lucide-react";
import WeeklyCalendar from "@/components/WorkoutPlanner/WeeklyCalendar";
import ChooseWorkoutPanel from "@/components/WorkoutPlanner/ChooseWorkoutPanel";
import WorkoutSummary from "@/components/WorkoutPlanner/WorkoutSummary";

export default function WorkoutPlanner() {
  const { userProfile } = useAuth();
  const { workouts } = useWorkouts();

  const plan = (userProfile?.subscription_plan || "free") as
    | "free"
    | "basic"
    | "premium";

  const planner = useWorkoutPlanner(workouts);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showChoosePanel, setShowChoosePanel] = useState(false);

  // Filter workouts based on subscription
  const getAvailableWorkouts = () => {
    if (plan === "free") {
      return workouts.filter(
        (w) =>
          w.level === "beginner" &&
          ["gym", "warmups", "stretching"].includes(w.category)
      );
    }
    return workouts;
  };

  const availableWorkouts = getAvailableWorkouts();

  const handleSelectDay = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setShowChoosePanel(true);
  };

  const handleSelectWorkout = (workout: any) => {
    if (selectedDay !== null) {
      planner.addWorkoutToDay(selectedDay, workout);
      toast.success(`${workout.title} added!`);
      setShowChoosePanel(false);
    }
  };

  const handleRemoveWorkout = (dayIndex: number, workoutId: string) => {
    planner.removeWorkoutFromDay(dayIndex, workoutId);
    toast.success("Workout removed");
  };

  const handleClearDay = (dayIndex: number) => {
    planner.clearDay(dayIndex);
    toast.success("Day cleared");
  };

  const handleGeneratePlan = () => {
    planner.generateSuggestedPlan();
    toast.success("Suggested plan generated!");
  };

  const handleClearPlan = () => {
    planner.clearPlan();
    toast.success("Plan cleared");
  };

  const stats = planner.getPlanStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Weekly Workout Planner
        </h2>

        {/* Goal & Category Selection */}
        <div className="space-y-4">
          {/* Goal Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Fitness Goal
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "muscle_gain", label: "💪 Muscle Gain" },
                { id: "fat_loss", label: "🔥 Fat Loss" },
                { id: "general_fitness", label: "✨ General Fitness" },
              ].map((goal) => (
                <button
                  key={goal.id}
                  onClick={() =>
                    planner.setSelectedGoal(
                      goal.id as any
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    planner.selectedGoal === goal.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Workout Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                "gym",
                "yoga",
                "boxing",
                "zumba",
                "stretching",
                "warmups",
              ].map((category) => {
                const isLocked =
                  plan === "free" &&
                  !["gym", "warmups", "stretching"].includes(category);

                return (
                  <button
                    key={category}
                    onClick={() =>
                      !isLocked &&
                      planner.setSelectedCategory(
                        category as any
                      )
                    }
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative ${
                      planner.selectedCategory === category
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                        : isLocked
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    {isLocked && (
                      <Lock className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Difficulty Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {["beginner", "intermediate", "advanced"].map((level) => {
                const isLocked =
                  plan === "free" && level !== "beginner";

                return (
                  <button
                    key={level}
                    onClick={() =>
                      !isLocked &&
                      planner.setSelectedLevel(level as any)
                    }
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      planner.selectedLevel === level
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                        : isLocked
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                    {isLocked && (
                      <Lock className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
            {plan === "free" && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                💡 Upgrade to unlock Intermediate and Advanced levels
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGeneratePlan}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Suggest Plan
          </button>
          <button
            onClick={handleClearPlan}
            className="flex-1 px-4 py-3 bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear Plan
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendar
        planner={planner}
        onSelectDay={handleSelectDay}
        onRemoveWorkout={handleRemoveWorkout}
        onClearDay={handleClearDay}
        plan={plan}
      />

      {/* Summary */}
      <WorkoutSummary stats={stats} />

      {/* Choose Workout Panel */}
      {showChoosePanel && selectedDay !== null && (
        <ChooseWorkoutPanel
          isOpen={showChoosePanel}
          onClose={() => setShowChoosePanel(false)}
          onSelectWorkout={handleSelectWorkout}
          planner={planner}
          availableWorkouts={availableWorkouts}
          plan={plan}
        />
      )}
    </div>
  );
}
