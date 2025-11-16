import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  description?: string;
  resource_type?: string;
  resource_id?: string;
  created_at: string;
}

export function useActivityLog(adminId?: string) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    if (!adminId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Error fetching activity logs:", fetchError);
        setError("Failed to fetch activity logs");
        return;
      }

      setLogs(data || []);
    } catch (err) {
      console.error("Activity log error:", err);
      setError("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  const logActivity = useCallback(
    async (
      action: string,
      description?: string,
      resourceType?: string,
      resourceId?: string,
    ) => {
      if (!adminId) return;

      try {
        const { error } = await supabase.from("activity_logs").insert({
          admin_id: adminId,
          action,
          description,
          resource_type: resourceType,
          resource_id: resourceId,
        });

        if (error) {
          console.error("Error logging activity:", error);
        } else {
          // Refresh logs
          await fetchActivityLogs();
        }
      } catch (err) {
        console.error("Activity log insert error:", err);
      }
    },
    [adminId, fetchActivityLogs],
  );

  useEffect(() => {
    if (adminId) {
      fetchActivityLogs();
    }
  }, [adminId, fetchActivityLogs]);

  return {
    logs,
    loading,
    error,
    logActivity,
    refetch: fetchActivityLogs,
  };
}
