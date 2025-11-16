import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface StepAchievement {
  id: string;
  title: string;
  description: string;
  stepThreshold: number;
  icon: string;
  type: string;
}

const STEP_ACHIEVEMENTS: StepAchievement[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Take your first step",
    stepThreshold: 1,
    icon: "👣",
    type: "first_step",
  },
  {
    id: "hundred_steps",
    title: "Stepping Up",
    description: "Reach 100 steps in a day",
    stepThreshold: 100,
    icon: "⚡",
    type: "step_100",
  },
  {
    id: "thousand_steps",
    title: "Stride Master",
    description: "Reach 1,000 steps in a day",
    stepThreshold: 1000,
    icon: "🚶",
    type: "step_1000",
  },
  {
    id: "five_thousand_steps",
    title: "Marathon Starter",
    description: "Reach 5,000 steps in a day",
    stepThreshold: 5000,
    icon: "🏃",
    type: "step_5000",
  },
  {
    id: "ten_thousand_steps",
    title: "Step Champion",
    description: "Reach 10,000 steps in a day",
    stepThreshold: 10000,
    icon: "🏆",
    type: "step_10000",
  },
  {
    id: "fifteen_thousand_steps",
    title: "Ultra Walker",
    description: "Reach 15,000 steps in a day",
    stepThreshold: 15000,
    icon: "🌟",
    type: "step_15000",
  },
  {
    id: "twenty_thousand_steps",
    title: "Legendary Stepper",
    description: "Reach 20,000 steps in a day",
    stepThreshold: 20000,
    icon: "👑",
    type: "step_20000",
  },
  {
    id: "fifty_thousand_steps",
    title: "Marathon Master",
    description: "Reach 50,000 steps in a day",
    stepThreshold: 50000,
    icon: "🎯",
    type: "step_50000",
  },
];

export const useStepAchievements = (dailySteps: number) => {
  const { userProfile } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    [],
  );
  const [newlyUnlocked, setNewlyUnlocked] = useState<StepAchievement | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Fetch unlocked achievements
  const fetchUnlockedAchievements = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, achievements(type)")
        .eq("user_id", userProfile.id);

      if (!error && data) {
        const achievementTypes = data
          .map((item: any) => item.achievements?.type)
          .filter(Boolean);
        setUnlockedAchievements(achievementTypes);
      }
    } catch (error) {
      console.debug("Error fetching unlocked achievements:", error);
    }
  }, [userProfile?.id]);

  // Initialize achievements
  useEffect(() => {
    if (userProfile?.id) {
      fetchUnlockedAchievements();
    }
  }, [userProfile?.id, fetchUnlockedAchievements]);

  // Check for new achievements to unlock
  useEffect(() => {
    const checkAndUnlockAchievements = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);

        // Find achievements that should be unlocked based on daily steps
        const achievementsToUnlock = STEP_ACHIEVEMENTS.filter((achievement) => {
          return (
            dailySteps >= achievement.stepThreshold &&
            !unlockedAchievements.includes(achievement.type)
          );
        });

        // Unlock each new achievement
        for (const achievement of achievementsToUnlock) {
          // First, find or create the achievement in the database
          let achievementId: string;

          const { data: existingAchievement } = await supabase
            .from("achievements")
            .select("id")
            .eq("type", achievement.type)
            .single();

          if (existingAchievement) {
            achievementId = existingAchievement.id;
          } else {
            // Create new achievement if it doesn't exist
            const { data: newAchievement, error: createError } = await supabase
              .from("achievements")
              .insert({
                title: achievement.title,
                description: achievement.description,
                type: achievement.type,
                icon: achievement.icon,
                points: Math.ceil(achievement.stepThreshold / 1000) * 10 || 10,
              })
              .select("id")
              .single();

            if (createError || !newAchievement) {
              console.debug(
                "Error creating achievement:",
                createError || "No data returned",
              );
              continue;
            }

            achievementId = newAchievement.id;
          }

          // Unlock for current user
          const { error: unlockError } = await supabase
            .from("user_achievements")
            .insert({
              user_id: userProfile.id,
              achievement_id: achievementId,
              unlocked_at: new Date().toISOString(),
            });

          if (!unlockError) {
            // Show notification for newly unlocked achievement
            setNewlyUnlocked(achievement);
            setTimeout(() => setNewlyUnlocked(null), 5000);

            // Update local state
            setUnlockedAchievements((prev) => [...prev, achievement.type]);
          }
        }
      } catch (error) {
        console.debug("Error checking achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the check
    const timer = setTimeout(() => {
      checkAndUnlockAchievements();
    }, 1000);

    return () => clearTimeout(timer);
  }, [dailySteps, userProfile?.id, unlockedAchievements]);

  return {
    unlockedAchievements,
    newlyUnlocked,
    loading,
    allAchievements: STEP_ACHIEVEMENTS,
    refetch: fetchUnlockedAchievements,
  };
};
