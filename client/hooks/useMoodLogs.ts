import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface MoodLog {
  id: string;
  user_id: string;
  mood_value: number;
  mood_emoji: string;
  notes?: string;
  date: string;
  created_at: string;
}

export function useMoodLogs(userId?: string) {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<MoodLog | null>(null);

  const getMoodEmoji = (value: number): string => {
    switch (value) {
      case 1:
        return "😢";
      case 2:
        return "😐";
      case 3:
        return "😌";
      case 4:
        return "😊";
      case 5:
        return "🤩";
      default:
        return "😌";
    }
  };

  const fetchMoodLogs = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get last 7 days of mood logs
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error: fetchError } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (fetchError) {
        console.debug("Fetch mood logs error:", fetchError?.code);
        setError(fetchError?.message || "Failed to fetch mood logs");
        setMoodLogs([]);
        return;
      }

      if (data) {
        setMoodLogs(data);

        // Check if there's a mood log for today
        const today = new Date().toISOString().split("T")[0];
        const todayLog = data.find((log) => log.date === today);
        setTodayMood(todayLog || null);
        setError(null);
      }
    } catch (err) {
      console.debug(
        "Fetch mood logs catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setError("Failed to fetch mood logs");
      setMoodLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const addMoodLog = async (moodValue: number, notes?: string) => {
    if (!userId) {
      setError("User ID is required");
      return false;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const moodEmoji = getMoodEmoji(moodValue);

      const { error: insertError } = await supabase.from("mood_logs").insert([
        {
          user_id: userId,
          mood_value: moodValue,
          mood_emoji: moodEmoji,
          notes: notes || null,
          date: today,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.debug("Add mood log error:", insertError?.code);
        setError(insertError?.message || "Failed to add mood log");
        return false;
      }

      setTodayMood({
        id: `mood-${today}`,
        user_id: userId,
        mood_value: moodValue,
        mood_emoji: moodEmoji,
        notes: notes,
        date: today,
        created_at: new Date().toISOString(),
      });

      setError(null);
      await fetchMoodLogs();
      return true;
    } catch (err) {
      console.debug(
        "Add mood log catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setError("Failed to add mood log");
      return false;
    }
  };

  useEffect(() => {
    fetchMoodLogs();
  }, [userId]);

  return {
    moodLogs,
    todayMood,
    loading,
    error,
    addMoodLog,
    refetch: fetchMoodLogs,
  };
}
