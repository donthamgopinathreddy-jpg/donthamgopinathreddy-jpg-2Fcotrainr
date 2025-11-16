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

      // Check if demo user
      const isDemoMode = userId.startsWith("demo-user") || userId.includes("demo");

      if (isDemoMode) {
        // For demo users, just reset state
        setMoodLogs([]);
        setTodayMood(null);
        setError(null);
        return;
      }

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
        // If table doesn't exist, that's okay
        if (
          fetchError?.message?.includes("does not exist") ||
          fetchError?.code === "PGRST116"
        ) {
          console.debug("Mood logs table not yet created");
          setMoodLogs([]);
          setTodayMood(null);
          setError(null);
          return;
        }

        console.debug("Fetch mood logs error:", fetchError?.code);
        setError(null); // Don't show error to user
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
      setError(null);
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

      // Check if demo user
      const isDemoMode = userId.startsWith("demo-user") || userId.includes("demo");

      if (isDemoMode) {
        // For demo users, just update local state
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
        return true;
      }

      // First check if mood log already exists for today
      const { data: existingLog, error: fetchExistingError } = await supabase
        .from("mood_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (fetchExistingError && fetchExistingError?.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is expected for new mood logs
        if (!fetchExistingError?.message?.includes("does not exist")) {
          console.debug("Check existing mood error:", fetchExistingError?.code);
        }
      }

      let result;

      if (existingLog) {
        // Update existing mood log for today
        result = await supabase
          .from("mood_logs")
          .update({
            mood_value: moodValue,
            mood_emoji: moodEmoji,
            notes: notes || null,
          })
          .eq("id", existingLog.id);
      } else {
        // Insert new mood log
        result = await supabase.from("mood_logs").insert([
          {
            user_id: userId,
            mood_value: moodValue,
            mood_emoji: moodEmoji,
            notes: notes || null,
            date: today,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      const { error } = result;

      if (error) {
        console.debug("Add mood log error:", error?.code, error?.message);

        // If table doesn't exist, handle gracefully
        if (
          error?.message?.includes("does not exist") ||
          error?.code === "PGRST116"
        ) {
          // Table doesn't exist yet, but still save to local state
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
          return true;
        }

        setError(error?.message || "Failed to add mood log");
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

      // Still save to local state even if DB fails
      const today = new Date().toISOString().split("T")[0];
      setTodayMood({
        id: `mood-${today}`,
        user_id: userId,
        mood_value: moodValue,
        mood_emoji: getMoodEmoji(moodValue),
        notes: notes,
        date: today,
        created_at: new Date().toISOString(),
      });
      setError(null);
      return true;
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
