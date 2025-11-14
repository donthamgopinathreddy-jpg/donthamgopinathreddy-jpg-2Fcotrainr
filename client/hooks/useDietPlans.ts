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

      if (fetchError) {
        console.debug("Diet plans fetch error:", fetchError?.code);
        setError("Failed to load diet plans");
        setDietPlans([]);
        return;
      }
      setDietPlans((data as DietPlan[]) || []);
      setError(null);
    } catch (err) {
      console.debug("Diet plans catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to fetch diet plans");
      setDietPlans([]);
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

      if (fetchError) {
        console.debug("Client diet plans fetch error:", fetchError?.code);
        setError("Failed to load diet plans");
        setDietPlans([]);
        return;
      }
      setDietPlans((data as DietPlan[]) || []);
      setError(null);
    } catch (err) {
      console.debug("Client diet plans catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to fetch diet plans");
      setDietPlans([]);
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

      if (insertError) {
        console.debug("Create diet plan error:", insertError?.code);
        setError("Failed to create diet plan");
        return null;
      }
      setError(null);
      return data as DietPlan;
    } catch (err) {
      console.debug("Create diet plan catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to create diet plan");
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

      if (updateError) {
        console.debug("Update diet plan error:", updateError?.code);
        setError("Failed to update diet plan");
        return false;
      }

      // Update local state
      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? { ...plan, ...updates, updated_at: new Date().toISOString() }
            : plan,
        ),
      );
      setError(null);
      return true;
    } catch (err) {
      console.debug("Update diet plan catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to update diet plan");
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

      if (deleteError) {
        console.debug("Delete diet plan error:", deleteError?.code);
        setError("Failed to delete diet plan");
        return false;
      }

      setDietPlans((prev) => prev.filter((plan) => plan.id !== planId));
      setError(null);
      return true;
    } catch (err) {
      console.debug("Delete diet plan catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to delete diet plan");
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

      if (insertError) {
        console.debug("Add meal error:", insertError?.code);
        return null;
      }
      return data as DietPlanMeal;
    } catch (err) {
      console.debug("Add meal catch error:", err instanceof Error ? err.code : "unknown");
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

      if (deleteError) {
        console.debug("Remove meal error:", deleteError?.code);
        return false;
      }
      return true;
    } catch (err) {
      console.debug("Remove meal catch error:", err instanceof Error ? err.code : "unknown");
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
