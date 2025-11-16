import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  totalUsers: number;
  totalTrainers: number;
  totalClients: number;
  verifiedTrainers: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
  todaySignups: number;
  weekSignups: number;
  totalSessions: number;
  activeSessions: number;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTrainers: 0,
    totalClients: 0,
    verifiedTrainers: 0,
    pendingVerifications: 0,
    approvedVerifications: 0,
    rejectedVerifications: 0,
    todaySignups: 0,
    weekSignups: 0,
    totalSessions: 0,
    activeSessions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, role, created_at");

        if (usersError) throw usersError;

        // Fetch trainer verifications
        const { data: verificationsData, error: verificationsError } = await supabase
          .from("trainer_verifications")
          .select("id, verification_status, created_at");

        if (verificationsError) throw verificationsError;

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const users = usersData || [];
        const verifications = verificationsData || [];

        const totalUsers = users.length;
        const totalTrainers = users.filter((u) => u.role === "trainer").length;
        const totalClients = users.filter((u) => u.role === "client").length;

        const todaySignups = users.filter((u) => {
          const createdAt = new Date(u.created_at);
          return createdAt >= today;
        }).length;

        const weekSignups = users.filter((u) => {
          const createdAt = new Date(u.created_at);
          return createdAt >= weekAgo;
        }).length;

        const verifiedTrainers = users.filter((u) => u.role === "trainer").length;
        const pendingVerifications = verifications.filter(
          (v) => v.verification_status === "pending"
        ).length;
        const approvedVerifications = verifications.filter(
          (v) => v.verification_status === "approved"
        ).length;
        const rejectedVerifications = verifications.filter(
          (v) => v.verification_status === "rejected"
        ).length;

        setStats({
          totalUsers,
          totalTrainers,
          totalClients,
          verifiedTrainers,
          pendingVerifications,
          approvedVerifications,
          rejectedVerifications,
          todaySignups,
          weekSignups,
          totalSessions: 0,
          activeSessions: 0,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error fetching dashboard stats:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time updates
    const usersSubscription = supabase
      .channel("users-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        fetchStats();
      })
      .subscribe();

    const verificationsSubscription = supabase
      .channel("verifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trainer_verifications" },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      usersSubscription.unsubscribe();
      verificationsSubscription.unsubscribe();
    };
  }, []);

  return { stats, loading, error };
}
