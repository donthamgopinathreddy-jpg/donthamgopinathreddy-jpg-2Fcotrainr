import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  trainer_verifications: boolean;
  user_activity: boolean;
  system_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Try to fetch existing preferences
      const { data, error: fetchError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        // PGRST116 = no rows found (expected for first-time users)
        // Other errors like table not found should be handled gracefully
        if (fetchError.code !== "PGRST116") {
          console.error("Error fetching preferences:", fetchError.message || JSON.stringify(fetchError));
        }
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if they don't exist
        const defaultPrefs = {
          user_id: userId,
          email_notifications: true,
          in_app_notifications: true,
          trainer_verifications: true,
          user_activity: true,
          system_alerts: true,
        };

        try {
          const { data: newPrefs, error: createError } = await supabase
            .from("notification_preferences")
            .insert(defaultPrefs)
            .select()
            .single();

          if (createError) {
            console.warn("Could not create preferences (table may not exist):", createError.message);
            // Use defaults in memory if table doesn't exist
            setPreferences({
              id: "temp",
              user_id: userId,
              ...defaultPrefs,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as NotificationPreferences);
          } else if (newPrefs) {
            setPreferences(newPrefs);
          }
        } catch (err) {
          console.warn("Error creating preferences (table may not exist):", err);
          // Use defaults in memory if table doesn't exist
          setPreferences({
            id: "temp",
            user_id: userId,
            ...defaultPrefs,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as NotificationPreferences);
        }
      }
    } catch (err) {
      console.error("Notification preferences error:", err);
      setError("Failed to fetch notification preferences");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!userId || !preferences) return;

      try {
        const { error: updateError } = await supabase
          .from("notification_preferences")
          .update(updates)
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating preferences:", updateError);
          setError("Failed to update notification preferences");
          return false;
        }

        // Update local state
        setPreferences((prev) =>
          prev ? { ...prev, ...updates } : null
        );
        setError(null);
        return true;
      } catch (err) {
        console.error("Update preferences error:", err);
        setError("Failed to update notification preferences");
        return false;
      }
    },
    [userId, preferences]
  );

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId, fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
