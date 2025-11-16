import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DietPreferences {
  id: string;
  user_id: string;
  goal: "lose_fat" | "build_muscle" | "maintain" | null;
  diet_type: "veg" | "non_veg" | "vegan" | null;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  target_calories: number | null;
  meals_per_day: number | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

const DEMO_DIET_PREFERENCES: DietPreferences = {
  id: "pref-demo",
  user_id: "demo-user",
  goal: "build_muscle",
  diet_type: "non_veg",
  likes: ["chicken", "rice", "broccoli"],
  dislikes: ["mushrooms", "olives"],
  allergies: [],
  target_calories: 2500,
  meals_per_day: 5,
  budget: 5000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useDietPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DietPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user?.id) {
      setPreferences(DEMO_DIET_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("diet_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.debug("Diet preferences fetch error:", fetchError?.code);
        setPreferences(null);
        setError(null);
        return;
      }

      setPreferences(data as DietPreferences | null);
      setError(null);
    } catch (err) {
      console.debug(
        "Diet preferences catch error:",
        err instanceof Error ? err.message : "unknown"
      );
      setPreferences(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    updates: Partial<Omit<DietPreferences, "id" | "user_id" | "created_at">>
  ) => {
    if (!user?.id) {
      setError("User not authenticated");
      return false;
    }

    try {
      setLoading(true);

      const data = {
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (preferences) {
        // Update existing
        const { error: updateError } = await supabase
          .from("diet_preferences")
          .update(data)
          .eq("id", preferences.id);

        if (updateError) {
          console.debug("Update error:", updateError?.code);
          setError("Failed to update preferences");
          return false;
        }
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from("diet_preferences")
          .insert([data]);

        if (insertError) {
          console.debug("Insert error:", insertError?.code);
          setError("Failed to create preferences");
          return false;
        }
      }

      // Refetch to get updated data
      await fetchPreferences();
      return true;
    } catch (err) {
      console.debug(
        "Update preferences error:",
        err instanceof Error ? err.message : "unknown"
      );
      setError("Failed to update preferences");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  };
};
