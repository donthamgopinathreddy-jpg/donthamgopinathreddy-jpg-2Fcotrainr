import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ClientGoal {
  id: string;
  trainer_id: string;
  client_id: string;
  goal_name: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  duration_days: number;
  created_at: string;
  status: "active" | "completed" | "abandoned";
  progress_percentage: number;
  trainer?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export function useClientGoals(clientId?: string) {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("goals")
        .select(
          `
          id,
          trainer_id,
          client_id,
          goal_name,
          description,
          target_value,
          current_value,
          unit,
          duration_days,
          created_at,
          status,
          users!goals_trainer_id_fkey (
            full_name,
            profile_picture_url
          )
        `
        )
        .eq("client_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.debug("Fetch goals error:", fetchError?.code);
        setError(fetchError?.message || "Failed to fetch goals");
        setGoals([]);
        return;
      }

      if (data) {
        const formattedGoals: ClientGoal[] = data.map((goal: any) => ({
          ...goal,
          progress_percentage: Math.round(
            (goal.current_value / goal.target_value) * 100
          ),
          trainer: goal.users,
        }));
        setGoals(formattedGoals);
        setError(null);
      }
    } catch (err) {
      console.debug(
        "Fetch goals catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setError("Failed to fetch goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [clientId]);

  return { goals, loading, error, refetch: fetchGoals };
}
