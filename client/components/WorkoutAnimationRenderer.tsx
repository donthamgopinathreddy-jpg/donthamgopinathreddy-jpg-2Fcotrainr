import React from "react";
import { getWorkoutById } from "@/lib/workoutAnimations";

interface WorkoutAnimationRendererProps {
  workoutId: string;
  className?: string;
}

export default function WorkoutAnimationRenderer({
  workoutId,
  className = "w-full h-full",
}: WorkoutAnimationRendererProps) {
  const workout = getWorkoutById(workoutId);

  if (!workout) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Animation not found</p>
        </div>
      </div>
    );
  }

  const AnimationComponent = workout.animationComponent;

  return (
    <div className={className}>
      <AnimationComponent />
    </div>
  );
}
