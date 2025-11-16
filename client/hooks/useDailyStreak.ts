import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface StreakData {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export const useDailyStreak = () => {
  const { userProfile } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [streakJustIncremented, setStreakJustIncremented] = useState(false);

  // Fetch or create streak data
  const fetchOrCreateStreak = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    try {
      const { data: existingStreak, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userProfile.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.debug("Error fetching streak:", fetchError);
        setLoading(false);
        return;
      }

      if (existingStreak) {
        setStreak(existingStreak);
      } else {
        // Create new streak record
        const { data: newStreak } = await supabase
          .from("user_streaks")
          .insert({
            user_id: userProfile.id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: new Date().toISOString().split("T")[0],
          })
          .select()
          .single();

        if (newStreak) {
          setStreak(newStreak);
        }
      }
    } catch (error) {
      console.debug("Error in fetchOrCreateStreak:", error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  // Update streak based on daily login
  const updateStreak = useCallback(async () => {
    if (!userProfile?.id || !streak) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      const lastActiveDate = streak.last_active_date
        ? new Date(streak.last_active_date)
        : null;

      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;

      if (lastActiveDate) {
        lastActiveDate.setHours(0, 0, 0, 0);
        const daysDiff =
          (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff === 1) {
          // User logged in on consecutive day
          newCurrentStreak = streak.current_streak + 1;
          setStreakJustIncremented(true);
          setTimeout(() => setStreakJustIncremented(false), 3000);
        } else if (daysDiff > 1) {
          // Streak broken
          newCurrentStreak = 1;
        }
      } else {
        newCurrentStreak = 1;
      }

      // Update longest streak if current is higher
      newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);

      // Update in database
      const { error } = await supabase
        .from("user_streaks")
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: todayStr,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userProfile.id);

      if (!error) {
        setStreak({
          ...streak,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: todayStr,
        });
      }
    } catch (error) {
      console.debug("Error updating streak:", error);
    }
  }, [userProfile?.id, streak]);

  // Initialize on mount
  useEffect(() => {
    fetchOrCreateStreak();
  }, [fetchOrCreateStreak]);

  // Update streak when component mounts (daily login check)
  useEffect(() => {
    if (streak) {
      updateStreak();
    }
  }, [streak?.id]); // Only run when streak is first loaded

  return {
    streak,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
    lastActiveDate: streak?.last_active_date || null,
    loading,
    streakJustIncremented,
    updateStreak,
    refetch: fetchOrCreateStreak,
  };
};
