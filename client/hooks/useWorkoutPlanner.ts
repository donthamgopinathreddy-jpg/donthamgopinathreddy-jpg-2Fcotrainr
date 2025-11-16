import { useState } from "react";
import { Workout } from "@/hooks/useWorkouts";
import { getWorkoutsByCategoryAndLevel } from "@/lib/workoutAnimations";

export type WorkoutGoal = "fat_loss" | "muscle_gain" | "general_fitness";
export type WorkoutCategory =
  | "gym"
  | "yoga"
  | "boxing"
  | "zumba"
  | "stretching"
  | "warmups";
export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

export interface DayPlan {
  day: string;
  dayIndex: number;
  workouts: Workout[];
  notes?: string;
}

export interface WeeklyPlan {
  [dayIndex: number]: Workout[];
}

export interface PlannerState {
  weeklyPlan: WeeklyPlan;
  selectedCategory: WorkoutCategory;
  selectedLevel: WorkoutLevel;
  selectedGoal: WorkoutGoal;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const useWorkoutPlanner = (availableWorkouts: Workout[]) => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory>("gym");
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>("beginner");
  const [selectedGoal, setSelectedGoal] =
    useState<WorkoutGoal>("general_fitness");

  // Add/update workout for a specific day
  const addWorkoutToDay = (dayIndex: number, workout: Workout) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [dayIndex]: [...(prev[dayIndex] || []), workout],
    }));
  };

  // Remove specific workout from day
  const removeWorkoutFromDay = (dayIndex: number, workoutId: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [dayIndex]: (prev[dayIndex] || []).filter((w) => w.id !== workoutId),
    }));
  };

  // Clear all workouts from a day
  const clearDay = (dayIndex: number) => {
    setWeeklyPlan((prev) => {
      const newPlan = { ...prev };
      delete newPlan[dayIndex];
      return newPlan;
    });
  };

  // Get workouts for a specific day
  const getWorkoutsForDay = (dayIndex: number): Workout[] => {
    return weeklyPlan[dayIndex] || [];
  };

  // Calculate plan stats
  const getPlanStats = () => {
    let totalMinutes = 0;
    let totalCalories = 0;
    let totalWorkouts = 0;
    const categoryBreakdown: Record<WorkoutCategory, number> = {
      gym: 0,
      yoga: 0,
      boxing: 0,
      zumba: 0,
      stretching: 0,
      warmups: 0,
    };

    Object.values(weeklyPlan).forEach((dayWorkouts) => {
      dayWorkouts.forEach((workout) => {
        totalMinutes += workout.duration_minutes;
        totalCalories += workout.calories_burned;
        totalWorkouts += 1;
        categoryBreakdown[workout.category] += 1;
      });
    });

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      categoryBreakdown,
    };
  };

  // Filter workouts by category and level
  const getFilteredWorkouts = (
    category: WorkoutCategory,
    level: WorkoutLevel,
  ): Workout[] => {
    return availableWorkouts.filter(
      (w) => w.category === category && w.level === level,
    );
  };

  // Auto-generate plan based on category, level, and goal
  const generateSuggestedPlan = () => {
    const newPlan: WeeklyPlan = {};

    if (selectedCategory === "gym") {
      generateGymPlan(newPlan);
    } else if (selectedCategory === "boxing") {
      generateBoxingPlan(newPlan);
    } else if (selectedCategory === "zumba") {
      generateZumbaPlan(newPlan);
    } else if (selectedCategory === "yoga") {
      generateYogaPlan(newPlan);
    } else if (selectedCategory === "stretching") {
      generateStretchingPlan(newPlan);
    } else if (selectedCategory === "warmups") {
      generateWarmupsPlan(newPlan);
    }

    setWeeklyPlan(newPlan);
  };

  // Gym-specific generation logic
  const generateGymPlan = (newPlan: WeeklyPlan) => {
    const gymWorkouts = getFilteredWorkouts("gym", selectedLevel);

    if (selectedLevel === "beginner") {
      // Single muscle per day
      const muscleGroups = [
        "chest",
        "back",
        "shoulders",
        "arms",
        "legs",
        "abs",
      ];
      const muscleWorkouts: Record<string, Workout[]> = {};

      muscleGroups.forEach((muscle) => {
        muscleWorkouts[muscle] = gymWorkouts.filter((w) =>
          w.description?.toLowerCase().includes(muscle),
        );
      });

      // Assign 3 exercises per day
      for (let i = 0; i < 6; i++) {
        const muscle = muscleGroups[i];
        const workouts = muscleWorkouts[muscle].slice(0, 3);
        if (workouts.length > 0) {
          newPlan[i] = workouts;
        }
      }
      // Sunday: Stretch/mobility
      const stretchingWorkouts = getFilteredWorkouts("stretching", "beginner");
      if (stretchingWorkouts.length > 0) {
        newPlan[6] = [stretchingWorkouts[0]];
      }
    } else if (selectedLevel === "intermediate") {
      // Push/Pull/Legs/Core split
      const pushWorkouts = gymWorkouts.filter((w) =>
        w.title.toLowerCase().includes("push"),
      );
      const pullWorkouts = gymWorkouts.filter((w) =>
        w.title.toLowerCase().includes("pull"),
      );
      const legWorkouts = gymWorkouts.filter(
        (w) =>
          w.title.toLowerCase().includes("leg") ||
          w.title.toLowerCase().includes("squat"),
      );

      newPlan[0] = pushWorkouts.slice(0, 2); // Mon: Push
      newPlan[1] = pullWorkouts.slice(0, 2); // Tue: Pull
      newPlan[2] = legWorkouts.slice(0, 2); // Wed: Legs

      // Thu: Conditioning (Boxing/Zumba)
      const conditioningWorkouts = getFilteredWorkouts("boxing", selectedLevel);
      if (conditioningWorkouts.length > 0) {
        newPlan[3] = [conditioningWorkouts[0]];
      }

      // Fri: Core
      const coreWorkouts = gymWorkouts.filter(
        (w) =>
          w.title.toLowerCase().includes("crunch") ||
          w.title.toLowerCase().includes("plank"),
      );
      if (coreWorkouts.length > 0) {
        newPlan[4] = [coreWorkouts[0]];
      }

      // Sat: Yoga
      const yogaWorkouts = getFilteredWorkouts("yoga", selectedLevel);
      if (yogaWorkouts.length > 0) {
        newPlan[5] = [yogaWorkouts[0]];
      }

      // Sun: Rest (optional light warmup)
      const warmupWorkouts = getFilteredWorkouts("warmups", selectedLevel);
      if (warmupWorkouts.length > 0) {
        newPlan[6] = [warmupWorkouts[0]];
      }
    } else if (selectedLevel === "advanced") {
      // Strength + Conditioning
      const advancedWorkouts = gymWorkouts.filter(
        (w) =>
          w.title.toLowerCase().includes("advanced") ||
          w.title.toLowerCase().includes("clap") ||
          w.title.toLowerCase().includes("pistol"),
      );

      newPlan[0] = advancedWorkouts.slice(0, 2); // Mon: Chest/Shoulders
      newPlan[1] = advancedWorkouts.slice(2, 4); // Tue: Back/Arms
      newPlan[2] = advancedWorkouts.slice(4, 6); // Wed: Legs Power

      // Thu: HIIT/Boxing
      const boxingWorkouts = getFilteredWorkouts("boxing", selectedLevel);
      if (boxingWorkouts.length > 0) {
        newPlan[3] = [boxingWorkouts[0]];
      }

      // Fri: Core + Mobility
      const coreWorkouts = gymWorkouts.filter(
        (w) =>
          w.title.toLowerCase().includes("plank") ||
          w.title.toLowerCase().includes("crunch"),
      );
      if (coreWorkouts.length > 0) {
        newPlan[4] = [coreWorkouts[0]];
      }

      // Sat: Yoga
      const yogaWorkouts = getFilteredWorkouts("yoga", selectedLevel);
      if (yogaWorkouts.length > 0) {
        newPlan[5] = [yogaWorkouts[0]];
      }

      // Sun: Rest
    }
  };

  // Boxing-specific generation
  const generateBoxingPlan = (newPlan: WeeklyPlan) => {
    const boxingWorkouts = getFilteredWorkouts("boxing", selectedLevel);

    if (boxingWorkouts.length > 0) {
      // 3-4 boxing sessions per week
      newPlan[0] = [boxingWorkouts[0]];
      newPlan[2] = [boxingWorkouts[1]];
      newPlan[4] = [boxingWorkouts[2]];
      if (boxingWorkouts.length > 3) {
        newPlan[6] = [boxingWorkouts[3]];
      }
    }

    // Fill other days with complementary workouts
    const yogaWorkouts = getFilteredWorkouts("yoga", selectedLevel);
    if (yogaWorkouts.length > 0) {
      newPlan[3] = [yogaWorkouts[0]];
    }

    const stretchingWorkouts = getFilteredWorkouts("stretching", selectedLevel);
    if (stretchingWorkouts.length > 0) {
      newPlan[5] = [stretchingWorkouts[0]];
    }
  };

  // Zumba-specific generation
  const generateZumbaPlan = (newPlan: WeeklyPlan) => {
    const zumbaWorkouts = getFilteredWorkouts("zumba", selectedLevel);

    if (zumbaWorkouts.length > 0) {
      // 3-4 Zumba sessions per week
      newPlan[0] = [zumbaWorkouts[0]];
      newPlan[2] = [zumbaWorkouts[1]];
      newPlan[4] = [zumbaWorkouts[2]];
      if (zumbaWorkouts.length > 3) {
        newPlan[6] = [zumbaWorkouts[3]];
      }
    }

    // Warm up and cool down
    const warmupWorkouts = getFilteredWorkouts("warmups", selectedLevel);
    if (warmupWorkouts.length > 0) {
      newPlan[1] = [warmupWorkouts[0]];
    }

    const stretchingWorkouts = getFilteredWorkouts("stretching", selectedLevel);
    if (stretchingWorkouts.length > 0) {
      newPlan[5] = [stretchingWorkouts[0]];
    }
  };

  // Yoga-specific generation
  const generateYogaPlan = (newPlan: WeeklyPlan) => {
    const yogaWorkouts = getFilteredWorkouts("yoga", selectedLevel);

    if (yogaWorkouts.length > 0) {
      // Daily yoga practice
      for (let i = 0; i < Math.min(yogaWorkouts.length, 7); i++) {
        newPlan[i] = [yogaWorkouts[i]];
      }
    }
  };

  // Stretching-specific generation
  const generateStretchingPlan = (newPlan: WeeklyPlan) => {
    const stretchingWorkouts = getFilteredWorkouts("stretching", selectedLevel);

    if (stretchingWorkouts.length > 0) {
      // Stretching every day with variety
      for (let i = 0; i < Math.min(stretchingWorkouts.length, 7); i++) {
        newPlan[i] = [stretchingWorkouts[i]];
      }
    }
  };

  // Warmups-specific generation
  const generateWarmupsPlan = (newPlan: WeeklyPlan) => {
    const warmupWorkouts = getFilteredWorkouts("warmups", selectedLevel);

    if (warmupWorkouts.length > 0) {
      // Warmups before main workouts
      for (let i = 0; i < 5; i++) {
        newPlan[i] = [warmupWorkouts[i % warmupWorkouts.length]];
      }
    }
  };

  // Apply goal-based adjustments
  const applyGoalAdjustments = () => {
    // Goal adjustments can prioritize certain workout types
    // This would modify the generated plan based on the goal
    // For now, we'll keep the basic generation
  };

  // Clear entire plan
  const clearPlan = () => {
    setWeeklyPlan({});
  };

  return {
    weeklyPlan,
    selectedCategory,
    selectedLevel,
    selectedGoal,
    setSelectedCategory,
    setSelectedLevel,
    setSelectedGoal,
    addWorkoutToDay,
    removeWorkoutFromDay,
    clearDay,
    getWorkoutsForDay,
    getPlanStats,
    getFilteredWorkouts,
    generateSuggestedPlan,
    applyGoalAdjustments,
    clearPlan,
  };
};
