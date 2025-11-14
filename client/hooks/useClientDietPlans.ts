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

const DEMO_CLIENT_DIET_PLANS: ClientDietPlan[] = [
  {
    id: "plan-1",
    trainer_id: "demo-user-trainer",
    client_id: "demo-user-client",
    name: "High Protein Muscle Gain",
    description: "Designed to build lean muscle mass with high protein intake",
    duration_days: 30,
    meals_per_day: 4,
    target_calories: 2800,
    macros_protein_g: 200,
    macros_carbs_g: 300,
    macros_fat_g: 90,
    notes: "Focus on compound exercises with this plan",
    status: "active",
    shared_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      full_name: "Demo Trainer",
      profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoTrainer",
    },
  },
  {
    id: "plan-2",
    trainer_id: "demo-user-trainer",
    client_id: "demo-user-client",
    name: "Low Carb Weight Loss",
    description: "Reduce carbs while maintaining protein for sustainable weight loss",
    duration_days: 60,
    meals_per_day: 3,
    target_calories: 1800,
    macros_protein_g: 150,
    macros_carbs_g: 150,
    macros_fat_g: 60,
    notes: "Ideal for consistent fat loss",
    status: "active",
    shared_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      full_name: "Demo Trainer",
      profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoTrainer",
    },
  },
];

export const useClientDietPlans = () => {
  const { user, userProfile } = useAuth();
  const [dietPlans, setDietPlans] = useState<ClientDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch diet plans shared with the current client
  const fetchSharedDietPlans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Demo mode: return mock diet plans
      if (isDemoMode()) {
        setDietPlans(DEMO_CLIENT_DIET_PLANS);
        setError(null);
        setLoading(false);
        return;
      }

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
