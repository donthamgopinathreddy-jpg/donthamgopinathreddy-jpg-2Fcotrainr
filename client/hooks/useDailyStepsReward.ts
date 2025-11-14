import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useDailyStepsReward = (dailySteps: number = 0) => {
  const { user, userProfile } = useAuth();
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isClaimable, setIsClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if reward was already claimed today
  useEffect(() => {
    if (!user?.id) return;

    const checkDailyReward = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split("T")[0];

        const { data, error: fetchError } = await supabase
          .from("daily_rewards")
          .select("id")
          .eq("user_id", user.id)
          .eq("reward_date", today)
          .eq("reward_type", "daily_steps")
          .maybeSingle();

        if (fetchError) {
          console.debug("Daily reward check error:", fetchError?.code);
          setError("Failed to check daily reward");
          return;
        }

        // If a record exists, reward was already claimed
        setRewardClaimed(!!data);
        setIsClaimable(dailySteps >= 10000 && !data);
      } catch (err) {
        console.debug("Daily reward check catch error:", err instanceof Error ? err.code : "unknown");
        setError("Failed to check daily reward");
      } finally {
        setLoading(false);
      }
    };

    checkDailyReward();
  }, [user?.id, dailySteps]);

  // Claim the reward
  const claimReward = async (): Promise<boolean> => {
    if (!user?.id || dailySteps < 10000 || rewardClaimed) {
      return false;
    }

    setIsClaiming(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Create a record in daily_rewards table
      const { error: insertError } = await supabase
        .from("daily_rewards")
        .insert([
          {
            user_id: user.id,
            reward_type: "daily_steps",
            coins_earned: 10,
            reward_date: today,
            claimed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.debug("Daily reward insert error:", insertError?.code);
        setError("Failed to claim reward");
        setIsClaiming(false);
        return false;
      }

      // Update user's coin balance (update the referral coins or create a coins table)
      // For now, we'll assume you have a coins column in users table or a separate coins_balance table
      const { error: updateError } = await supabase
        .from("users")
        .update({
          referral_coins: (userProfile?.referral_coins || 0) + 10,
        })
        .eq("id", user.id);

      if (updateError) {
        console.debug("Daily reward update error:", updateError?.code);
        setError("Failed to update coins");
        setIsClaiming(false);
        return false;
      }

      setRewardClaimed(true);
      setIsClaimable(false);
      return true;
    } catch (err) {
      console.debug("Claim reward catch error:", err instanceof Error ? err.code : "unknown");
      setError("Failed to claim reward");
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    rewardClaimed,
    isClaimable,
    isClaiming,
    loading,
    error,
    claimReward,
  };
};
