import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { WeeklyInsightData } from "./useAIWeeklyInsights";

export const useWeeklyHealthData = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyInsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  };

  const fetchWeeklyData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const weekStartDate = getWeekStartDate();
      const weekEndDate = new Date();
      const weekStartStr = weekStartDate.toISOString().split("T")[0];
      const weekEndStr = weekEndDate.toISOString().split("T")[0];

      // Fetch user goal from diet preferences
      const { data: dietPrefs, error: dietError } = await supabase
        .from("user_diet_preferences")
        .select("goal")
        .eq("user_id", user.id)
        .single();

      if (dietError) {
        console.debug("Diet preferences fetch warning:", dietError.message);
      }

      // Fetch health sync data for the week
      const { data: healthData, error: healthError } = await supabase
        .from("health_sync_data")
        .select("steps, sync_date")
        .eq("user_id", user.id)
        .gte("sync_date", weekStartStr)
        .lte("sync_date", weekEndStr)
        .order("sync_date", { ascending: true });

      if (healthError) throw new Error(`Failed to fetch health data: ${healthError.message}`);

      // Fetch meals for the week
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select("calories, protein_g, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", `${weekStartStr}T00:00:00`)
        .lte("logged_at", `${weekEndStr}T23:59:59`);

      if (mealsError) throw new Error(`Failed to fetch meals: ${mealsError.message}`);

      // Fetch previous week's health data for comparison
      const prevWeekStart = new Date(weekStartDate);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekStartDate);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
      const prevWeekStartStr = prevWeekStart.toISOString().split("T")[0];
      const prevWeekEndStr = prevWeekEnd.toISOString().split("T")[0];

      const { data: prevHealthData, error: prevHealthError } = await supabase
        .from("health_sync_data")
        .select("steps")
        .eq("user_id", user.id)
        .gte("sync_date", prevWeekStartStr)
        .lte("sync_date", prevWeekEndStr);

      if (prevHealthError) console.debug("Failed to fetch previous week data:", prevHealthError);

      // Calculate totals
      const stepsTotal = healthData?.reduce((sum, d) => sum + (d.steps || 0), 0) || 0;
      const prevStepsTotal = prevHealthData?.reduce((sum, d) => sum + (d.steps || 0), 0) || 0;
      const stepsVsLastWeek = prevStepsTotal > 0 ? ((stepsTotal - prevStepsTotal) / prevStepsTotal) * 100 : 0;

      const caloriesConsumed = mealsData?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
      const proteinIntakeG = mealsData?.reduce((sum, m) => sum + (m.protein_g || 0), 0) || 0;

      // Estimate calories burned (roughly 1.2-1.5x BMR per day + activity)
      // Using a simple estimate: 500 calories per 10,000 steps + 300 base per day
      const estimatedCaloriesBurned = Math.round((stepsTotal / 10000) * 500 + 300 * 7);

      // Estimate hydration (assume 8 glasses per day)
      const hydrationGlasses = 56; // 8 glasses * 7 days

      // Get user's goal from diet preferences or default to "Maintain"
      let userGoal: "Lose Fat" | "Build Muscle" | "Maintain" = "Maintain";
      if (dietPrefs?.goal) {
        const goalMap: Record<string, "Lose Fat" | "Build Muscle" | "Maintain"> = {
          lose_fat: "Lose Fat",
          build_muscle: "Build Muscle",
          maintain: "Maintain",
        };
        userGoal = goalMap[dietPrefs.goal] || "Maintain";
      }

      // Default subscription level to "free" (no profile subscription column exists)
      const subscriptionLevel = "free" as "free" | "basic" | "premium";

      const data: WeeklyInsightData = {
        userId: user.id,
        weekStartDate,
        weekEndDate,
        stepsTotal,
        stepsVsLastWeek: Math.round(stepsVsLastWeek * 10) / 10,
        workoutMinutesTotal: 120, // This would need actual workout tracking data
        workoutMinutesVsLastWeek: 10,
        caloriesBurned: estimatedCaloriesBurned,
        caloriesConsumed,
        proteinIntakeG,
        hydrationGlasses,
        goal: userGoal,
        subscriptionLevel,
      };

      setWeeklyData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch weekly data";
      setError(message);
      console.debug("Weekly data fetch error:", message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  return {
    weeklyData,
    loading,
    error,
    refetch: fetchWeeklyData,
  };
};
