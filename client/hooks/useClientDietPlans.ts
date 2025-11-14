import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientDietPlan {
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
  users?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export const useClientDietPlans = () => {
  const { user, userProfile } = useAuth();
  const [dietPlans, setDietPlans] = useState<ClientDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch diet plans shared with the current client
  const fetchSharedDietPlans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("diet_plans")
        .select("*, users!diet_plans_trainer_id(full_name, profile_picture_url)")
        .eq("client_id", user.id)
        .eq("status", "active")
        .not("shared_at", "is", null)
        .order("shared_at", { ascending: false });

      if (fetchError) {
        console.debug("Fetch shared diet plans error:", fetchError?.code);
        setError("Failed to load diet plans");
        setDietPlans([]);
        return;
      }

      setDietPlans((data as ClientDietPlan[]) || []);
      setError(null);
    } catch (err) {
      console.debug("Fetch shared diet plans catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to fetch diet plans");
      setDietPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && userProfile?.role === "client") {
      fetchSharedDietPlans();
    }
  }, [user?.id, userProfile?.role]);

  return {
    dietPlans,
    loading,
    error,
    fetchSharedDietPlans,
  };
};
