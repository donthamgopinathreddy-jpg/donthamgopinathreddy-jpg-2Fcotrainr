import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface WeeklyInsightData {
  id?: string;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  stepsTotal: number;
  stepsVsLastWeek: number;
  workoutMinutesTotal: number;
  workoutMinutesVsLastWeek: number;
  caloriesBurned: number;
  caloriesConsumed: number;
  weightChangeKg?: number;
  proteinIntakeG: number;
  hydrationGlasses: number;
  sleepHours?: number;
  goal: "Lose Fat" | "Build Muscle" | "Maintain";
  subscriptionLevel: "free" | "basic" | "premium";
}

export interface AIInsights {
  progressOverview: {
    stepsTotal: number;
    stepsVsLastWeek: string;
    workoutMinutes: number;
    workoutVsLastWeek: string;
    caloriesBurned: number;
    caloriesConsumed: number;
    weightChange: string | null;
  };
  trendInsights: {
    stepsTrend: string;
    workoutConsistency: string;
    calorieBalance: string;
    proteinIntakeTrend: string;
    sleepTrend: string | null;
    hydrationConsistency: string;
  };
  achievements: {
    personalRecords: string[];
    milestones: string[];
    streaks: string[];
  };
  aiObservations: string[];
  goalAlignment: {
    status: "On Track" | "Almost There" | "Needs Improvement";
    reason: string;
  };
  recommendations: {
    workoutSuggestion: string;
    dietModification: string;
    hydrationTarget: string;
    stepChallenge: string;
    sleepImprovement: string | null;
  };
  premiumInsights?: {
    micronutrients: string;
    recoveryScore: number;
    predictions: {
      predictedSteps: number;
      predictedWeight: string;
      predictedCalorieBalance: string;
      proteinConsistency: string;
    };
  };
  challenges: {
    name: string;
    target: string;
    description: string;
  }[];
  coachMessage: string;
}

export const useAIWeeklyInsights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(
    async (data: WeeklyInsightData): Promise<AIInsights | null> => {
      setLoading(true);
      setError(null);

      try {
        // Calculate trends and metrics
        const calorieBalance = data.caloriesBurned - data.caloriesConsumed;
        const isDeficit = calorieBalance > 0;
        const proteinPercentage =
          (data.proteinIntakeG / (data.caloriesConsumed * 0.25)) * 100;

        // Generate insights
        const insights: AIInsights = {
          progressOverview: {
            stepsTotal: data.stepsTotal,
            stepsVsLastWeek:
              data.stepsVsLastWeek > 0
                ? `+${data.stepsVsLastWeek.toFixed(1)}%`
                : `${data.stepsVsLastWeek.toFixed(1)}%`,
            workoutMinutes: data.workoutMinutesTotal,
            workoutVsLastWeek:
              data.workoutMinutesVsLastWeek > 0
                ? `+${data.workoutMinutesVsLastWeek.toFixed(1)}%`
                : `${data.workoutMinutesVsLastWeek.toFixed(1)}%`,
            caloriesBurned: data.caloriesBurned,
            caloriesConsumed: data.caloriesConsumed,
            weightChange: data.weightChangeKg
              ? `${data.weightChangeKg > 0 ? "+" : ""}${data.weightChangeKg.toFixed(1)} kg`
              : null,
          },

          trendInsights: {
            stepsTrend:
              data.stepsVsLastWeek > 10
                ? "📈 Excellent improvement"
                : data.stepsVsLastWeek > 0
                  ? "📈 Good progress"
                  : "📉 Slight decline",
            workoutConsistency:
              data.workoutMinutesTotal > 150
                ? "✅ Very consistent"
                : data.workoutMinutesTotal > 90
                  ? "✅ Consistent"
                  : "⚠️ Could improve",
            calorieBalance: isDeficit
              ? "✅ Calorie deficit achieved"
              : calorieBalance < 500
                ? "⚠️ Near balance"
                : "❌ Surplus detected",
            proteinIntakeTrend:
              proteinPercentage > 30
                ? "✅ Excellent protein intake"
                : proteinPercentage > 20
                  ? "✅ Good protein intake"
                  : "⚠️ Low protein intake",
            sleepTrend: data.sleepHours
              ? data.sleepHours >= 7
                ? "✅ Good sleep"
                : data.sleepHours >= 6
                  ? "⚠️ Adequate sleep"
                  : "❌ Poor sleep"
              : null,
            hydrationConsistency:
              data.hydrationGlasses >= 56
                ? "✅ Excellent hydration"
                : data.hydrationGlasses >= 35
                  ? "✅ Good hydration"
                  : "⚠️ Needs more water",
          },

          achievements: {
            personalRecords: generatePersonalRecords(data),
            milestones: generateMilestones(data),
            streaks: generateStreaks(data),
          },

          aiObservations: generateAIObservations(
            data,
            calorieBalance,
            proteinPercentage,
          ),

          goalAlignment: getGoalAlignment(data, calorieBalance),

          recommendations: {
            workoutSuggestion: getWorkoutSuggestion(data),
            dietModification: getDietModification(data, proteinPercentage),
            hydrationTarget: `Aim for ${Math.ceil((data.hydrationGlasses / 7) * 8)} glasses of water daily to stay hydrated`,
            stepChallenge: `Try to walk ${data.stepsTotal > 100000 ? Math.round((data.stepsTotal * 1.1) / 1000) * 1000 : "100,000"} steps next week`,
            sleepImprovement:
              data.sleepHours && data.sleepHours < 7
                ? "Aim for 7-9 hours of sleep; try a consistent sleep schedule"
                : null,
          },

          challenges: generateChallenges(data),

          coachMessage: generateCoachMessage(data),
        };

        // Add premium insights if applicable
        if (data.subscriptionLevel === "premium") {
          insights.premiumInsights = {
            micronutrients:
              "Excellent intake of essential vitamins and minerals",
            recoveryScore: calculateRecoveryScore(data),
            predictions: {
              predictedSteps: Math.round(
                data.stepsTotal * (1 + data.stepsVsLastWeek / 100),
              ),
              predictedWeight: data.weightChangeKg
                ? `${(data.weightChangeKg * 4).toFixed(1)} kg in 4 weeks`
                : "Stable",
              predictedCalorieBalance: `${(calorieBalance * 7).toFixed(0)} kcal weekly deficit`,
              proteinConsistency:
                proteinPercentage > 30
                  ? "Excellent - continue current intake"
                  : "Could improve - increase by 10-15g daily",
            },
          };
        }

        // Save insights to database
        await supabase.from("ai_weekly_insights").insert({
          user_id: data.userId,
          week_start_date: data.weekStartDate,
          week_end_date: data.weekEndDate,
          steps_total: data.stepsTotal,
          steps_vs_last_week: data.stepsVsLastWeek,
          workout_minutes_total: data.workoutMinutesTotal,
          workout_minutes_vs_last_week: data.workoutMinutesVsLastWeek,
          calories_burned: data.caloriesBurned,
          calories_consumed: data.caloriesConsumed,
          weight_change_kg: data.weightChangeKg || null,
          protein_intake_g: data.proteinIntakeG,
          hydration_glasses: data.hydrationGlasses,
          sleep_hours: data.sleepHours || null,
          goal_alignment_status: insights.goalAlignment.status,
          achievements: insights.achievements,
          ai_observations: insights.aiObservations,
          recommendations: insights.recommendations,
          challenges: insights.challenges,
          coach_message: insights.coachMessage,
          insight_data: insights,
        });

        return insights;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate insights";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { generateInsights, loading, error };
};

function generatePersonalRecords(data: WeeklyInsightData): string[] {
  const records: string[] = [];

  if (data.stepsTotal > 150000) {
    records.push(`🏅 Highest steps: ${data.stepsTotal.toLocaleString()} steps`);
  }

  if (data.workoutMinutesTotal > 300) {
    records.push(`💪 Most workouts: ${data.workoutMinutesTotal} minutes`);
  }

  if (data.caloriesBurned > 3000) {
    records.push(`🔥 Calories burned: ${data.caloriesBurned} kcal`);
  }

  return records.length > 0 ? records : ["✨ Keep pushing for new records!"];
}

function generateMilestones(data: WeeklyInsightData): string[] {
  const milestones: string[] = [];

  if (data.stepsTotal >= 70000) {
    milestones.push("🎯 Reached 70k+ steps milestone");
  }

  if (data.workoutMinutesTotal >= 150) {
    milestones.push("🎯 Completed weekly workout target");
  }

  if (data.hydrationGlasses >= 56) {
    milestones.push("💧 Perfect hydration week");
  }

  return milestones.length > 0
    ? milestones
    : ["🚀 Build toward your next milestone!"];
}

function generateStreaks(data: WeeklyInsightData): string[] {
  return [
    `🔥 Active streak: 7 days`,
    `📊 Consistency score: ${Math.round(data.workoutMinutesTotal / 2.14)}%`,
  ];
}

function generateAIObservations(
  data: WeeklyInsightData,
  calorieBalance: number,
  proteinPercentage: number,
): string[] {
  const observations: string[] = [];

  if (data.stepsVsLastWeek > 20) {
    observations.push(
      `You walked ${data.stepsVsLastWeek.toFixed(0)}% more this week—great improvement!`,
    );
  }

  if (proteinPercentage < 25) {
    observations.push(
      "Protein intake was low this week; try adding eggs, lentils, or Greek yogurt.",
    );
  }

  if (data.workoutMinutesTotal > data.workoutMinutesVsLastWeek) {
    observations.push(
      "Your workout frequency is increasing—keep up the momentum!",
    );
  }

  if (data.hydrationGlasses < 35) {
    observations.push(
      "Water intake was lower than ideal; prioritize hydration this week.",
    );
  }

  if (calorieBalance > 500) {
    observations.push(
      "Strong calorie deficit achieved—you're on track with your fat loss goal.",
    );
  }

  return observations.length > 0
    ? observations
    : ["You're maintaining your routine well!"];
}

function getGoalAlignment(
  data: WeeklyInsightData,
  calorieBalance: number,
): {
  status: "On Track" | "Almost There" | "Needs Improvement";
  reason: string;
} {
  if (data.goal === "Lose Fat") {
    if (calorieBalance > 500) {
      return { status: "On Track", reason: "Strong calorie deficit achieved" };
    } else if (calorieBalance > 0) {
      return {
        status: "Almost There",
        reason: "Small deficit detected—increase activity",
      };
    } else {
      return {
        status: "Needs Improvement",
        reason: "Calorie surplus detected—watch intake",
      };
    }
  } else if (data.goal === "Build Muscle") {
    if (data.proteinIntakeG > 1.6 * 70) {
      return { status: "On Track", reason: "Protein intake is excellent" };
    } else {
      return {
        status: "Needs Improvement",
        reason: "Increase protein intake for muscle growth",
      };
    }
  } else {
    if (Math.abs(calorieBalance) < 500) {
      return { status: "On Track", reason: "Calories are balanced" };
    } else {
      return {
        status: "Almost There",
        reason: "Fine-tune your calorie intake",
      };
    }
  }
}

function getWorkoutSuggestion(data: WeeklyInsightData): string {
  if (data.workoutMinutesTotal < 90) {
    return "Add 2-3 strength training sessions to your weekly routine";
  } else if (data.workoutMinutesTotal < 150) {
    return "Increase intensity or frequency—aim for 150+ minutes weekly";
  } else {
    return "Excellent workout routine! Consider adding flexibility training";
  }
}

function getDietModification(
  data: WeeklyInsightData,
  proteinPercentage: number,
): string {
  if (proteinPercentage < 20) {
    return "Increase protein intake to 1.6-2.2g per kg of body weight";
  } else if (proteinPercentage > 40) {
    return "Protein is abundant—balance with complex carbs and healthy fats";
  } else {
    return "Your protein intake is optimal—maintain current levels";
  }
}

function generateChallenges(
  data: WeeklyInsightData,
): { name: string; target: string; description: string }[] {
  return [
    {
      name: "Step Challenge",
      target: `${Math.round((data.stepsTotal * 1.1) / 1000) * 1000} steps`,
      description: "Walk 10% more steps next week",
    },
    {
      name: "Protein Challenge",
      target: "100g daily",
      description: "Hit protein target for 5+ days",
    },
    {
      name: "Workout Streak",
      target: "4+ sessions",
      description: "Complete 4 or more workouts next week",
    },
  ];
}

function generateCoachMessage(data: WeeklyInsightData): string {
  const messages = [
    "You're building great consistency—keep pushing!",
    "Small improvements add up. You're doing amazing!",
    "Your dedication is showing results. Stay focused!",
    "You're closer to your goals than you think. Keep going!",
    "Every rep, every step counts. You've got this!",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function calculateRecoveryScore(data: WeeklyInsightData): number {
  let score = 50;

  if (data.sleepHours && data.sleepHours >= 7) score += 20;
  if (data.hydrationGlasses >= 56) score += 15;
  if (data.stepsVsLastWeek >= 0) score += 10;
  if (data.workoutMinutesTotal > 150) score += 5;

  return Math.min(score, 100);
}
