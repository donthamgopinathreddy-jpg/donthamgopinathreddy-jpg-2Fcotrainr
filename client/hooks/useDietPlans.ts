import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DietPlanMeal {
  id: string;
  diet_plan_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  quantity_g?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  notes?: string;
  created_at: string;
}

export interface DietPlan {
  id: string;
  trainer_id: string;
  client_id: string;
  name: string;
  description?: string;
  duration_days?: number;
  meals_per_day: number;
  target_calories?: number;
  macros_protein_g?: number;
  macros_carbs_g?: number;
  macros_fat_g?: number;
  notes?: string;
  status: "active" | "completed" | "paused";
  shared_at?: string;
  created_at: string;
  updated_at: string;
  meals?: DietPlanMeal[];
}

export const useDietPlans = () => {
  const { user } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch diet plans for trainer (all clients)
  const fetchTrainerDietPlans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDietPlans((data as DietPlan[]) || []);
    } catch (err) {
      console.error("Error fetching diet plans:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch diet plans",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch diet plans for client
  const fetchClientDietPlans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("diet_plans")
        .select(
          "*, users!diet_plans_trainer_id(full_name, profile_picture_url)",
        )
        .eq("client_id", user.id)
        .eq("status", "active")
        .order("shared_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDietPlans((data as DietPlan[]) || []);
    } catch (err) {
      console.error("Error fetching client diet plans:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch diet plans",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create a new diet plan
  const createDietPlan = async (
    clientId: string,
    planData: Partial<DietPlan>,
  ) => {
    if (!user?.id) return;

    try {
      const { data, error: insertError } = await supabase
        .from("diet_plans")
        .insert([
          {
            trainer_id: user.id,
            client_id: clientId,
            ...planData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return data as DietPlan;
    } catch (err) {
      console.error("Error creating diet plan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create diet plan",
      );
      return null;
    }
  };

  // Update diet plan
  const updateDietPlan = async (planId: string, updates: Partial<DietPlan>) => {
    try {
      const { error: updateError } = await supabase
        .from("diet_plans")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId);

      if (updateError) throw updateError;

      // Update local state
      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? { ...plan, ...updates, updated_at: new Date().toISOString() }
            : plan,
        ),
      );
      return true;
    } catch (err) {
      console.error("Error updating diet plan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update diet plan",
      );
      return false;
    }
  };

  // Share diet plan with client
  const shareDietPlan = async (planId: string) => {
    return updateDietPlan(planId, {
      shared_at: new Date().toISOString(),
    });
  };

  // Delete diet plan
  const deleteDietPlan = async (planId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("diet_plans")
        .delete()
        .eq("id", planId);

      if (deleteError) throw deleteError;

      setDietPlans((prev) => prev.filter((plan) => plan.id !== planId));
      return true;
    } catch (err) {
      console.error("Error deleting diet plan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete diet plan",
      );
      return false;
    }
  };

  // Add meal to diet plan
  const addMealToDietPlan = async (
    dietPlanId: string,
    meal: Omit<DietPlanMeal, "id" | "diet_plan_id" | "created_at">,
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from("diet_plan_meals")
        .insert([
          {
            diet_plan_id: dietPlanId,
            ...meal,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return data as DietPlanMeal;
    } catch (err) {
      console.error("Error adding meal:", err);
      return null;
    }
  };

  // Remove meal from diet plan
  const removeMealFromDietPlan = async (mealId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("diet_plan_meals")
        .delete()
        .eq("id", mealId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error("Error removing meal:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchTrainerDietPlans();
  }, [user?.id]);

  return {
    dietPlans,
    loading,
    error,
    fetchTrainerDietPlans,
    fetchClientDietPlans,
    createDietPlan,
    updateDietPlan,
    shareDietPlan,
    deleteDietPlan,
    addMealToDietPlan,
    removeMealFromDietPlan,
  };
};
