import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface StreakData {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export const useStreaks = () => {
  const { user, userProfile } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's streak
  const fetchStreak = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching streak:", error);
      }

      setStreak(data || null);
    } catch (error) {
      console.error("Error in fetchStreak:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update streak (usually called after logging steps for the day)
  const updateStreak = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      // Get or create streak record
      let { data: existingStreak } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!existingStreak) {
        // Create new streak
        const { data: newStreak } = await supabase
          .from("user_streaks")
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today,
          })
          .select()
          .single();

        setStreak(newStreak);
      } else {
        const lastActiveDate = existingStreak.last_active_date;
        let newCurrentStreak = existingStreak.current_streak;

        // Check if it's a new day
        if (lastActiveDate !== today) {
          const lastDate = new Date(lastActiveDate);
          const currentDate = new Date(today);
          const daysDiff =
            (currentDate.getTime() - lastDate.getTime()) /
            (1000 * 60 * 60 * 24);

          if (daysDiff === 1) {
            // Consecutive day - increment streak
            newCurrentStreak = existingStreak.current_streak + 1;
          } else if (daysDiff > 1) {
            // Streak broken - reset
            newCurrentStreak = 1;
          }
        }

        const newLongestStreak = Math.max(
          newCurrentStreak,
          existingStreak.longest_streak,
        );

        // Update streak
        const { data: updatedStreak } = await supabase
          .from("user_streaks")
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_active_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        setStreak(updatedStreak);
      }
    } catch (error) {
      console.error("Error updating streak:", error);
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
    fetchStreak,
    updateStreak,
  };
};
