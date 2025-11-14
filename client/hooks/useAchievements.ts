import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  type: string;
  points: number;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UserAchievement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Fetch all achievements
  const fetchAllAchievements = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setAllAchievements((data as Achievement[]) || []);
    } catch (err) {
      console.debug("Fetch all achievements error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to fetch achievements");
    }
  };

  // Fetch user's unlocked achievements
  const fetchUnlockedAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_achievements")
        .select(
          `
          id,
          user_id,
          achievement_id,
          unlocked_at,
          achievements(id, title, description, icon, type, points, created_at)
        `,
        )
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      if (fetchError) throw fetchError;
      setUnlockedAchievements((data as UserAchievement[]) || []);
    } catch (err) {
      console.debug("Fetch achievements error:", err instanceof Error ? err.code : "unknown");
    } finally {
      setLoading(false);
    }
  };

  // Unlock achievement for user
  const unlockAchievement = async (achievementId: string) => {
    if (!user?.id) return;

    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId)
        .maybeSingle();

      if (existing) {
        // Already unlocked
        return false;
      }

      // Unlock new achievement
      const { error: insertError } = await supabase
        .from("user_achievements")
        .insert([
          {
            user_id: user.id,
            achievement_id: achievementId,
            unlocked_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      // Find and show the newly unlocked achievement
      const achievement = allAchievements.find((a) => a.id === achievementId);
      if (achievement) {
        setNewlyUnlocked(achievement);
        // Clear notification after 5 seconds
        setTimeout(() => setNewlyUnlocked(null), 5000);
      }

      // Refetch unlocked achievements
      await fetchUnlockedAchievements();
      return true;
    } catch (err) {
      console.debug("Unlock achievement error:", err instanceof Error ? err.code : "unknown");
      return false;
    }
  };

  // Check and unlock achievements based on conditions
  const checkAndUnlockAchievements = async (conditions: {
    currentStreak?: number;
    totalSteps?: number;
    waterDaysCompleted?: number;
  }) => {
    const { currentStreak, totalSteps, waterDaysCompleted } = conditions;
    const unlockedIds = new Set(
      unlockedAchievements.map((ua) => ua.achievement_id),
    );

    // Check streak achievements
    if (currentStreak && currentStreak >= 3 && !unlockedIds.has("STREAK_3")) {
      const achievement = allAchievements.find((a) => a.type === "STREAK_3");
      if (achievement) await unlockAchievement(achievement.id);
    }
    if (currentStreak && currentStreak >= 7 && !unlockedIds.has("STREAK_7")) {
      const achievement = allAchievements.find((a) => a.type === "STREAK_7");
      if (achievement) await unlockAchievement(achievement.id);
    }
    if (currentStreak && currentStreak >= 15 && !unlockedIds.has("STREAK_15")) {
      const achievement = allAchievements.find((a) => a.type === "STREAK_15");
      if (achievement) await unlockAchievement(achievement.id);
    }
    if (currentStreak && currentStreak >= 30 && !unlockedIds.has("STREAK_30")) {
      const achievement = allAchievements.find((a) => a.type === "STREAK_30");
      if (achievement) await unlockAchievement(achievement.id);
    }

    // Check step achievements
    if (totalSteps && totalSteps >= 50000 && !unlockedIds.has("STEPS_50K")) {
      const achievement = allAchievements.find((a) => a.type === "STEPS_50K");
      if (achievement) await unlockAchievement(achievement.id);
    }
    if (totalSteps && totalSteps >= 100000 && !unlockedIds.has("STEPS_100K")) {
      const achievement = allAchievements.find((a) => a.type === "STEPS_100K");
      if (achievement) await unlockAchievement(achievement.id);
    }
    if (totalSteps && totalSteps >= 500000 && !unlockedIds.has("STEPS_500K")) {
      const achievement = allAchievements.find((a) => a.type === "STEPS_500K");
      if (achievement) await unlockAchievement(achievement.id);
    }

    // Check water achievements
    if (
      waterDaysCompleted &&
      waterDaysCompleted >= 7 &&
      !unlockedIds.has("WATER_7D")
    ) {
      const achievement = allAchievements.find((a) => a.type === "WATER_7D");
      if (achievement) await unlockAchievement(achievement.id);
    }
  };

  useEffect(() => {
    fetchAllAchievements();
  }, []);

  useEffect(() => {
    fetchUnlockedAchievements();
  }, [user?.id]);

  // Format unlocked achievements with achievement details
  const userAchievements = unlockedAchievements
    .map((ua) => {
      const achievement = allAchievements.find(
        (a) => a.id === ua.achievement_id,
      );
      return {
        id: ua.id,
        title: achievement?.title || "Unknown",
        description: achievement?.description || "",
        icon: achievement?.icon || "🎯",
        points: achievement?.points || 0,
        unlocked_at: ua.unlocked_at,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime(),
    );

  // Calculate total points
  const getTotalPoints = () => {
    return userAchievements.reduce(
      (sum, achievement) => sum + achievement.points,
      0,
    );
  };

  return {
    allAchievements,
    unlockedAchievements,
    userAchievements,
    loading,
    error,
    newlyUnlocked,
    getTotalPoints,
    fetchAllAchievements,
    fetchUnlockedAchievements,
    unlockAchievement,
    checkAndUnlockAchievements,
  };
};
