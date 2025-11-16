import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  steps: number;
  rank: number;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Get the current week start and end dates
  const getWeekDateRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  // Get the current month start and end dates
  const getMonthDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startOfMonth, endOfMonth };
  };

  // Fetch weekly leaderboard (highest steps this week)
  const fetchWeeklyLeaderboard = async () => {
    setLoading(true);
    try {
      const { startOfWeek, endOfWeek } = getWeekDateRange();

      // Get all step data for this week
      const { data: stepsData, error: stepsError } = await supabase
        .from("health_sync_data")
        .select("user_id, steps, sync_date")
        .gte("sync_date", startOfWeek.toISOString().split("T")[0])
        .lte("sync_date", endOfWeek.toISOString().split("T")[0]);

      if (stepsError) {
        console.debug("Error fetching steps data:", stepsError);
        // Fallback to meals if steps data unavailable
        await fetchMonthlyLeaderboard();
        return;
      }

      // Sum steps per user for the week
      const userStepsMap: { [key: string]: number } = {};
      (stepsData || []).forEach((record: any) => {
        userStepsMap[record.user_id] =
          (userStepsMap[record.user_id] || 0) + (record.steps || 0);
      });

      // Get unique user IDs
      const userIds = Object.keys(userStepsMap);

      if (userIds.length === 0) {
        setLeaderboard([]);
        return;
      }

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url")
        .in("id", userIds);

      if (usersError) {
        console.debug("Error fetching users:", usersError);
        return;
      }

      // Combine and sort by steps descending
      const leaderboardData: LeaderboardEntry[] = (usersData || [])
        .map((userRecord: any) => ({
          user_id: userRecord.id,
          username: userRecord.username,
          full_name: userRecord.full_name,
          profile_picture_url: userRecord.profile_picture_url,
          steps: userStepsMap[userRecord.id] || 0,
        }))
        .sort((a, b) => b.steps - a.steps)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(leaderboardData);

      // Find current user's rank
      if (user?.id) {
        const userEntry = leaderboardData.find((e) => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.debug("Error in fetchWeeklyLeaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly leaderboard (highest steps of the month)
  const fetchMonthlyLeaderboard = async () => {
    setLoading(true);
    try {
      const { startOfMonth, endOfMonth } = getMonthDateRange();

      // Get all step data for this month
      const { data: stepsData, error: stepsError } = await supabase
        .from("health_sync_data")
        .select("user_id, steps, sync_date")
        .gte("sync_date", startOfMonth.toISOString().split("T")[0])
        .lte("sync_date", endOfMonth.toISOString().split("T")[0]);

      if (stepsError) {
        console.debug("Error fetching steps data:", stepsError);
        return;
      }

      // Sum steps per user for the month
      const userStepsMap: { [key: string]: number } = {};
      (stepsData || []).forEach((record: any) => {
        userStepsMap[record.user_id] =
          (userStepsMap[record.user_id] || 0) + (record.steps || 0);
      });

      // Get unique user IDs
      const userIds = Object.keys(userStepsMap);

      if (userIds.length === 0) {
        setMonthlyLeaderboard([]);
        return;
      }

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url")
        .in("id", userIds);

      if (usersError) {
        console.debug("Error fetching users:", usersError);
        return;
      }

      // Combine and sort by steps descending
      const leaderboardData: LeaderboardEntry[] = (usersData || [])
        .map((userRecord: any) => ({
          user_id: userRecord.id,
          username: userRecord.username,
          full_name: userRecord.full_name,
          profile_picture_url: userRecord.profile_picture_url,
          steps: userStepsMap[userRecord.id] || 0,
        }))
        .sort((a, b) => b.steps - a.steps)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setMonthlyLeaderboard(leaderboardData);

      // Find current user's rank
      if (user?.id) {
        const userEntry = leaderboardData.find((e) => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.debug("Error in fetchMonthlyLeaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch overall leaderboard (all-time)
  const fetchOverallLeaderboard = async () => {
    setLoading(true);
    try {
      // Get all meals and sum steps per user
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select("user_id");

      if (mealsError) {
        console.error("Error fetching meals:", mealsError);
        return;
      }

      // Count meals per user
      const userActivityMap: { [key: string]: number } = {};
      (mealsData || []).forEach((meal: any) => {
        userActivityMap[meal.user_id] =
          (userActivityMap[meal.user_id] || 0) + 1;
      });

      // Get unique user IDs
      const userIds = Object.keys(userActivityMap);

      if (userIds.length === 0) {
        setLeaderboard([]);
        return;
      }

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url")
        .in("id", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Combine and sort
      const leaderboardData: LeaderboardEntry[] = (usersData || [])
        .map((userRecord: any) => ({
          user_id: userRecord.id,
          username: userRecord.username,
          full_name: userRecord.full_name,
          profile_picture_url: userRecord.profile_picture_url,
          steps: userActivityMap[userRecord.id] * 10,
        }))
        .sort((a, b) => b.steps - a.steps)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error in fetchOverallLeaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get top 10 entries
  const getTop10 = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    return data.slice(0, 10);
  };

  // Get user's rank and surrounding entries
  const getUserRankContext = (
    data: LeaderboardEntry[],
    userId: string,
  ): LeaderboardEntry[] => {
    const userIndex = data.findIndex((e) => e.user_id === userId);
    if (userIndex === -1) return [];

    const start = Math.max(0, userIndex - 2);
    const end = Math.min(data.length, userIndex + 3);
    return data.slice(start, end);
  };

  useEffect(() => {
    fetchWeeklyLeaderboard();
    fetchMonthlyLeaderboard();
  }, []);

  return {
    leaderboard,
    monthlyLeaderboard,
    userRank,
    loading,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    fetchOverallLeaderboard,
    getTop10,
    getUserRankContext,
  };
};
