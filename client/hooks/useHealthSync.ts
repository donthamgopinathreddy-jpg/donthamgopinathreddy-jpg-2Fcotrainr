import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { healthSync, type HealthSyncResult } from "@/lib/healthSync";

export interface StoredHealthData {
  id: string;
  user_id: string;
  steps: number;
  sync_date: string;
  source: "google_fit" | "apple_health" | "manual";
  last_synced: string;
  created_at: string;
}

export const useHealthSync = () => {
  const { user } = useAuth();
  const [todaySteps, setTodaySteps] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">(
    "idle",
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Request health permissions
  const requestPermissions = useCallback(async () => {
    if (!healthSync.isHealthSyncAvailable()) {
      console.log("Health sync not available on this platform");
      return false;
    }

    try {
      const granted = await healthSync.requestHealthPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.debug(
        "Request permissions error:",
        error instanceof Error ? error.code : "unknown",
      );
      setHasPermission(false);
      return false;
    }
  }, []);

  // Sync today's steps
  const syncTodaySteps = useCallback(async () => {
    if (!user?.id || !healthSync.isHealthSyncAvailable()) {
      return false;
    }

    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      const result = await healthSync.getTodaySteps();

      // Save to Supabase
      const today = new Date().toISOString().split("T")[0];

      // Check if entry exists for today
      const { data: existing } = await supabase
        .from("health_sync_data")
        .select("id")
        .eq("user_id", user.id)
        .eq("sync_date", today)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from("health_sync_data")
          .update({
            steps: result.steps,
            source: result.source,
            last_synced: result.lastSyncTime,
          })
          .eq("id", existing.id);
      } else {
        // Insert new
        await supabase.from("health_sync_data").insert({
          user_id: user.id,
          steps: result.steps,
          sync_date: today,
          source: result.source,
          last_synced: result.lastSyncTime,
        });
      }

      setTodaySteps(result.steps);
      setLastSyncTime(result.lastSyncTime);
      setSyncStatus("idle");
      return true;
    } catch (error) {
      console.debug(
        "Sync steps error:",
        error instanceof Error ? error.code : "unknown",
      );
      setSyncStatus("error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id]);

  // Load today's steps from database
  const loadTodaySteps = useCallback(async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("health_sync_data")
        .select("*")
        .eq("user_id", user.id)
        .eq("sync_date", today)
        .maybeSingle();

      if (error) {
        console.debug("Load health data error:", error?.code);
        return;
      }

      if (data) {
        setTodaySteps(data.steps);
        setLastSyncTime(data.last_synced);
      }
    } catch (error) {
      console.debug(
        "Load today steps error:",
        error instanceof Error ? error.code : "unknown",
      );
    }
  }, [user?.id]);

  // Auto-sync on mount and periodically
  useEffect(() => {
    if (!user?.id) return;

    // Load from DB first
    loadTodaySteps();

    // Try to sync if available
    if (healthSync.isHealthSyncAvailable()) {
      syncTodaySteps();

      // Sync every 30 minutes
      const interval = setInterval(
        () => {
          syncTodaySteps();
        },
        30 * 60 * 1000,
      );

      return () => clearInterval(interval);
    }
  }, [user?.id, loadTodaySteps, syncTodaySteps]);

  // Get historical data
  const getHistoricalSteps = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("health_sync_data")
          .select("*")
          .eq("user_id", user.id)
          .gte("sync_date", startDate)
          .lte("sync_date", endDate)
          .order("sync_date", { ascending: false });

        if (error) {
          console.debug("Fetch historical steps error:", error?.code);
          return [];
        }

        return data as StoredHealthData[];
      } catch (error) {
        console.debug(
          "Get historical steps error:",
          error instanceof Error ? error.code : "unknown",
        );
        return [];
      }
    },
    [user?.id],
  );

  // Sync historical data (last 30 days)
  const syncHistoricalData = useCallback(async () => {
    if (!user?.id || !healthSync.isHealthSyncAvailable()) {
      return false;
    }

    setIsSyncing(true);

    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const results = await healthSync.syncStepsForRange(startDate, endDate);

      // Save all results to database
      for (const result of results) {
        const { data: existing } = await supabase
          .from("health_sync_data")
          .select("id")
          .eq("user_id", user.id)
          .eq("sync_date", result.date)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("health_sync_data")
            .update({
              steps: result.steps,
              source: result.source,
              last_synced: result.lastSyncTime,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("health_sync_data").insert({
            user_id: user.id,
            steps: result.steps,
            sync_date: result.date,
            source: result.source,
            last_synced: result.lastSyncTime,
          });
        }
      }

      return true;
    } catch (error) {
      console.debug(
        "Sync historical data error:",
        error instanceof Error ? error.code : "unknown",
      );
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id]);

  return {
    todaySteps,
    syncStatus,
    isSyncing,
    hasPermission,
    lastSyncTime,
    requestPermissions,
    syncTodaySteps,
    loadTodaySteps,
    getHistoricalSteps,
    syncHistoricalData,
    isAvailable: healthSync.isHealthSyncAvailable(),
    platformInfo: healthSync.getPlatformInfo(),
  };
};
