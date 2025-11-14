import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const TRAINING_MODE_OPTIONS = [
  { id: "gym", label: "Gym / Strength", emoji: "🏋️" },
  { id: "yoga", label: "Yoga / Mobility", emoji: "🧘" },
  { id: "boxing", label: "Boxing / Martial Arts", emoji: "🥊" },
  { id: "zumba", label: "Zumba / Dance", emoji: "💃" },
  { id: "hiit", label: "HIIT / Functional", emoji: "⚡" },
  { id: "running", label: "Running / Cycling", emoji: "🏃" },
];

export const MAIN_FOCUS_OPTIONS = [
  { id: "fat_loss", label: "Fat Loss", emoji: "🔥" },
  { id: "muscle_gain", label: "Muscle Gain", emoji: "💪" },
  { id: "general_fitness", label: "General Fitness", emoji: "🎯" },
  { id: "performance", label: "Performance", emoji: "⚡" },
];

interface TrainingPreferences {
  training_modes: string[];
  main_focus: string;
}

export const useTrainingModes = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState<TrainingPreferences>({
    training_modes: userProfile?.training_modes || [],
    main_focus: userProfile?.main_focus || "general_fitness",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's training preferences
  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("training_modes, main_focus")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setPreferences({
          training_modes: data.training_modes || [],
          main_focus: data.main_focus || "general_fitness",
        });
      }
    } catch (err) {
      console.debug("Error fetching training preferences:", (err as any)?.code);
      setError(
        err instanceof Error ? err.message : "Failed to fetch preferences",
      );
    } finally {
      setLoading(false);
    }
  };

  // Update training modes
  const updateTrainingModes = async (modes: string[]) => {
    if (!user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ training_modes: modes })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setPreferences((prev) => ({
        ...prev,
        training_modes: modes,
      }));

      // Update auth context
      if (updateProfile) {
        await updateProfile({ training_modes: modes } as any);
      }

      return true;
    } catch (err) {
      console.error("Error updating training modes:", err);
      setError(err instanceof Error ? err.message : "Failed to update modes");
      return false;
    }
  };

  // Update main focus
  const updateMainFocus = async (focus: string) => {
    if (!user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ main_focus: focus })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setPreferences((prev) => ({
        ...prev,
        main_focus: focus,
      }));

      // Update auth context
      if (updateProfile) {
        await updateProfile({ main_focus: focus } as any);
      }

      return true;
    } catch (err) {
      console.error("Error updating main focus:", err);
      setError(err instanceof Error ? err.message : "Failed to update focus");
      return false;
    }
  };

  // Toggle training mode
  const toggleMode = async (modeId: string) => {
    const newModes = preferences.training_modes.includes(modeId)
      ? preferences.training_modes.filter((m) => m !== modeId)
      : [...preferences.training_modes, modeId];

    return updateTrainingModes(newModes);
  };

  useEffect(() => {
    if (userProfile) {
      setPreferences({
        training_modes: userProfile.training_modes || [],
        main_focus: userProfile.main_focus || "general_fitness",
      });
    }
  }, [userProfile?.id]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updateTrainingModes,
    updateMainFocus,
    toggleMode,
  };
};
