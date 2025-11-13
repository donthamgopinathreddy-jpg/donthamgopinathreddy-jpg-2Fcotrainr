import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  points: number;
}

export interface UserAchievement extends Achievement {
  unlocked_at: string;
}

export const useAchievements = () => {
  const { user, userProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all available achievements
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: false });

      if (error) {
        console.error("Error fetching achievements:", error);
        return;
      }

      setAchievements(data || []);
    } catch (error) {
      console.error("Error in fetchAchievements:", error);
    }
  };

  // Fetch user's unlocked achievements
  const fetchUserAchievements = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(
          `
          id,
          unlocked_at,
          achievement_id,
          achievements:achievement_id (
            id,
            title,
            description,
            icon,
            type,
            points
          )
        `
        )
        .eq("user_id", targetUserId)
        .order("unlocked_at", { ascending: false });

      if (error) {
        console.error("Error fetching user achievements:", error);
        return;
      }

      // Flatten the data
      const formattedAchievements = (data || []).map((item: any) => ({
        ...item.achievements,
        unlocked_at: item.unlocked_at,
      }));

      setUserAchievements(formattedAchievements);
    } catch (error) {
      console.error("Error in fetchUserAchievements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Unlock an achievement for a user
  const unlockAchievement = async (achievementId: string) => {
    if (!user?.id) return false;

    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId)
        .single();

      if (existing) {
        return true; // Already unlocked
      }

      // Insert new achievement
      const { error } = await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: achievementId,
      });

      if (error) {
        console.error("Error unlocking achievement:", error);
        return false;
      }

      // Refresh user achievements
      await fetchUserAchievements(user.id);
      return true;
    } catch (error) {
      console.error("Error in unlockAchievement:", error);
      return false;
    }
  };

  // Get total points from achievements
  const getTotalPoints = (): number => {
    return userAchievements.reduce((sum, ach) => sum + (ach.points || 0), 0);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserAchievements();
    }
  }, [user?.id]);

  return {
    achievements,
    userAchievements,
    loading,
    fetchAchievements,
    fetchUserAchievements,
    unlockAchievement,
    getTotalPoints,
  };
};
