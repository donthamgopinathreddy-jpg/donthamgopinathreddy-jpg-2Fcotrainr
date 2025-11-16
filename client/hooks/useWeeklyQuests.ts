import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  unit: string;
  category: "steps" | "workout" | "water" | "meals" | "streak";
  difficulty: "easy" | "medium" | "hard";
  reward_xp: number;
  completed: boolean;
  progress: number;
  ends_at: string;
}

export const useWeeklyQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQuestRewards, setTotalQuestRewards] = useState(0);

  const defaultQuests: Quest[] = [
    {
      id: "quest_steps_10k",
      title: "Daily Walker",
      description: "Walk 10,000 steps",
      icon: "👟",
      target: 10000,
      unit: "steps",
      category: "steps",
      difficulty: "easy",
      reward_xp: 100,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quest_steps_50k",
      title: "Marathon Runner",
      description: "Walk 50,000 steps this week",
      icon: "🏃",
      target: 50000,
      unit: "steps",
      category: "steps",
      difficulty: "medium",
      reward_xp: 250,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quest_workout_3",
      title: "Fitness Warrior",
      description: "Complete 3 workouts",
      icon: "💪",
      target: 3,
      unit: "workouts",
      category: "workout",
      difficulty: "medium",
      reward_xp: 200,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quest_water_7",
      title: "Hydration Expert",
      description: "Hit water goal 4 days",
      icon: "💧",
      target: 4,
      unit: "days",
      category: "water",
      difficulty: "easy",
      reward_xp: 150,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quest_meals_5",
      title: "Nutrition Master",
      description: "Log 5 healthy meals",
      icon: "🥗",
      target: 5,
      unit: "meals",
      category: "meals",
      difficulty: "easy",
      reward_xp: 120,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quest_streak_7",
      title: "Consistency King",
      description: "Maintain 7-day streak",
      icon: "🔥",
      target: 7,
      unit: "days",
      category: "streak",
      difficulty: "hard",
      reward_xp: 300,
      completed: false,
      progress: 0,
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Fetch weekly quest progress
  const fetchQuestProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get week date range
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
      );
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch completed quests
      const { data: completedData } = await supabase
        .from("quest_completions")
        .select("quest_id")
        .eq("user_id", user.id)
        .gte("completed_at", startOfWeek.toISOString());

      const completed = (completedData || []).map((q: any) => q.quest_id);
      setCompletedQuests(completed);

      // Fetch user's current stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's steps
      const { data: stepsData } = await supabase
        .from("health_sync_data")
        .select("steps")
        .eq("user_id", user.id)
        .eq("sync_date", today.toISOString().split("T")[0])
        .single();

      const todaySteps = stepsData?.steps || 0;

      // Get week's total steps
      const { data: weeklyStepsData } = await supabase
        .from("health_sync_data")
        .select("steps")
        .eq("user_id", user.id)
        .gte("sync_date", startOfWeek.toISOString().split("T")[0]);

      const weeklySteps = (weeklyStepsData || []).reduce(
        (sum: number, record: any) => sum + (record.steps || 0),
        0,
      );

      // Update quest progress
      const updatedQuests = defaultQuests.map((quest) => {
        let progress = 0;
        const isCompleted = completed.includes(quest.id);

        if (quest.category === "steps" && quest.id === "quest_steps_10k") {
          progress = Math.min(todaySteps, quest.target);
        } else if (
          quest.category === "steps" &&
          quest.id === "quest_steps_50k"
        ) {
          progress = Math.min(weeklySteps, quest.target);
        }

        return {
          ...quest,
          completed: isCompleted,
          progress,
        };
      });

      setQuests(updatedQuests);

      // Calculate total reward
      const totalReward = updatedQuests
        .filter((q) => q.completed)
        .reduce((sum, q) => sum + q.reward_xp, 0);
      setTotalQuestRewards(totalReward);
    } catch (error) {
      console.debug("Error fetching quest progress:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark quest as completed
  const completeQuest = async (questId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from("quest_completions").insert({
        user_id: user.id,
        quest_id: questId,
        completed_at: new Date().toISOString(),
      });

      if (!error) {
        setCompletedQuests([...completedQuests, questId]);
        await fetchQuestProgress();
      }
    } catch (error) {
      console.debug("Error completing quest:", error);
    }
  };

  useEffect(() => {
    fetchQuestProgress();
  }, [user?.id]);

  return {
    quests,
    completedQuests,
    loading,
    totalQuestRewards,
    completeQuest,
    refetch: fetchQuestProgress,
  };
};
