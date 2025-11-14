import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch streak data for current user
  const fetchStreak = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        // Log error without trying to read response body
        console.debug("Streak fetch error details:", fetchError?.code);
        // Create a default/empty streak on error
        setStreak({
          id: "temp",
          user_id: user?.id || "",
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setError(null);
        return;
      }

      if (data) {
        setStreak(data as Streak);
        setError(null);
      } else {
        // Create initial streak record if not exists
        const { data: newStreak, error: createError } = await supabase
          .from("streaks")
          .insert([
            {
              user_id: user.id,
              current_streak: 0,
              longest_streak: 0,
              last_active_date: null,
            },
          ])
          .select()
          .single();

        if (createError) {
          console.debug("Streak creation error code:", createError?.code);
          // Return default streak on error
          setStreak({
            id: "temp",
            user_id: user?.id || "",
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setError(null);
          return;
        }
        setStreak(newStreak as Streak);
        setError(null);
      }
    } catch (err: any) {
      // Don't block the app if streak fetch fails - it's optional
      console.debug("Streak hook error:", err?.code || "unknown");
      setError(null);
      // Return empty streak on error to allow app to continue
      setStreak({
        id: "temp",
        user_id: user?.id || "",
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Update streak based on daily activity
  const updateStreak = async () => {
    if (!user?.id || !streak) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const lastActive = streak.last_active_date;

      // Calculate new streak
      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;

      if (!lastActive) {
        // First activity
        newCurrentStreak = 1;
        newLongestStreak = 1;
      } else if (lastActive === today) {
        // Already counted today
        return;
      } else {
        // Check if consecutive day
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          newCurrentStreak += 1;
        } else {
          // Broken streak
          newCurrentStreak = 1;
        }

        // Update longest streak if current is higher
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
      }

      // Update in database
      const { error: updateError } = await supabase
        .from("streaks")
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.debug("Streak update error code:", updateError?.code || "unknown");
        // Don't throw - streak updates are non-critical
      } else {
        // Update local state only if update was successful
        setStreak((prev) =>
          prev
            ? {
                ...prev,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_active_date: today,
              }
            : null,
        );
      }

      return {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
      };
    } catch (err: any) {
      console.debug("Streak update error:", err?.code || "unknown");
      // Non-critical - don't block the app
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStreak();
    }
  }, [user?.id]);

  return {
    streak,
    loading,
    error,
    fetchStreak,
    updateStreak,
  };
};
