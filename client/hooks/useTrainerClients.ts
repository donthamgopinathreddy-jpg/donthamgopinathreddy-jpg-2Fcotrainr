import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientProgress {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  weight_kg: number;
  height_cm: number;
  goal_weight_kg?: number;
  goal_type: "weight_loss" | "muscle_gain" | "maintenance";
  sessions_completed: number;
  total_sessions: number;
  last_session_date?: string;
  progress_percentage: number;
  meal_logs_this_week: number;
  video_session_count: number;
  avg_session_duration_min: number;
  notes?: string;
  joined_date: string;
  current_stats: {
    calories_avg_daily: number;
    protein_g_avg_daily: number;
    workout_frequency_weekly: number;
    weight_progress_kg: number;
  };
}

const DEMO_CLIENTS: ClientProgress[] = [
  {
    id: "client-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    weight_kg: 82,
    height_cm: 180,
    goal_weight_kg: 78,
    goal_type: "weight_loss",
    sessions_completed: 8,
    total_sessions: 12,
    last_session_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress_percentage: 67,
    meal_logs_this_week: 18,
    video_session_count: 5,
    avg_session_duration_min: 45,
    notes: "Great progress! Keep up the consistent effort.",
    joined_date: "2024-01-15",
    current_stats: {
      calories_avg_daily: 1950,
      protein_g_avg_daily: 140,
      workout_frequency_weekly: 4,
      weight_progress_kg: -4,
    },
  },
  {
    id: "client-2",
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    weight_kg: 58,
    height_cm: 165,
    goal_weight_kg: 62,
    goal_type: "muscle_gain",
    sessions_completed: 12,
    total_sessions: 15,
    last_session_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress_percentage: 80,
    meal_logs_this_week: 21,
    video_session_count: 8,
    avg_session_duration_min: 52,
    notes: "Excellent form improvement. Ready for advanced exercises.",
    joined_date: "2023-12-01",
    current_stats: {
      calories_avg_daily: 2200,
      protein_g_avg_daily: 165,
      workout_frequency_weekly: 5,
      weight_progress_kg: 3,
    },
  },
  {
    id: "client-3",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    weight_kg: 88,
    height_cm: 175,
    goal_weight_kg: 82,
    goal_type: "weight_loss",
    sessions_completed: 5,
    total_sessions: 10,
    last_session_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress_percentage: 50,
    meal_logs_this_week: 12,
    video_session_count: 3,
    avg_session_duration_min: 40,
    notes: "Needs to increase workout frequency. Check in this week.",
    joined_date: "2024-02-10",
    current_stats: {
      calories_avg_daily: 2100,
      protein_g_avg_daily: 120,
      workout_frequency_weekly: 2,
      weight_progress_kg: -2,
    },
  },
  {
    id: "client-4",
    name: "Emma Davis",
    email: "emma@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    weight_kg: 65,
    height_cm: 170,
    goal_weight_kg: 64,
    goal_type: "maintenance",
    sessions_completed: 20,
    total_sessions: 20,
    last_session_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress_percentage: 100,
    meal_logs_this_week: 21,
    video_session_count: 15,
    avg_session_duration_min: 48,
    notes: "Achieved goal! Now focusing on maintaining and building consistency.",
    joined_date: "2023-10-20",
    current_stats: {
      calories_avg_daily: 2050,
      protein_g_avg_daily: 130,
      workout_frequency_weekly: 5,
      weight_progress_kg: 0,
    },
  },
];

export const useTrainerClients = () => {
  const { user, userProfile } = useAuth();
  const [clients, setClients] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProgress | null>(null);

  const fetchClients = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For demo users, return demo clients (only in development)
      if (import.meta.env.DEV && user.id.startsWith("demo-user")) {
        setClients(DEMO_CLIENTS);
      } else {
        // In production or for non-demo users, fetch from Supabase
        // const { data, error } = await supabase
        //   .from("trainer_clients")
        //   .select("*")
        //   .eq("trainer_id", user.id);
        // if (error) throw error;
        // setClients(data || []);
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const updateClientNotes = (clientId: string, notes: string) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, notes } : client
      )
    );
    setSelectedClient((prev) =>
      prev && prev.id === clientId ? { ...prev, notes } : prev
    );
  };

  const getClientStats = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  useEffect(() => {
    if (userProfile?.role === "trainer") {
      fetchClients();
    }
  }, [user, userProfile?.role]);

  return {
    clients,
    loading,
    selectedClient,
    setSelectedClient,
    getClientStats,
    updateClientNotes,
    refetch: fetchClients,
  };
};
