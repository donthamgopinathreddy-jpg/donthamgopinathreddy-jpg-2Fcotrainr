import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CompetitionParticipant {
  user_id: string;
  full_name: string;
  username: string;
  profile_picture_url?: string;
  current_score: number;
  rank: number;
  medal: string;
  is_current_user: boolean;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  icon: string;
  metric: "steps" | "workouts" | "meals" | "streak";
  participants: CompetitionParticipant[];
  my_rank: number | null;
  my_score: number;
  start_date: string;
  end_date: string;
  status: "active" | "upcoming" | "ended";
}

export const useSocialCompetitions = () => {
  const { user, userProfile } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  // Get week date range
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

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  // Fetch weekly step competition
  const fetchCompetitions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { startOfWeek, endOfWeek } = getWeekDateRange();

      // Fetch all users' weekly steps
      const { data: stepsData, error: stepsError } = await supabase
        .from("health_sync_data")
        .select("user_id, steps, sync_date")
        .gte("sync_date", startOfWeek.toISOString().split("T")[0])
        .lte("sync_date", endOfWeek.toISOString().split("T")[0]);

      if (stepsError) {
        console.debug("Error fetching steps data:", stepsError);
        return;
      }

      // Sum steps per user
      const userStepsMap: { [key: string]: number } = {};
      (stepsData || []).forEach((record: any) => {
        userStepsMap[record.user_id] =
          (userStepsMap[record.user_id] || 0) + (record.steps || 0);
      });

      // Get user details
      const userIds = Object.keys(userStepsMap);
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url")
        .in("id", userIds);

      if (usersError) {
        console.debug("Error fetching users:", usersError);
        return;
      }

      // Build competition participants
      const participants: CompetitionParticipant[] = (usersData || [])
        .map((userRecord: any, index: number) => ({
          user_id: userRecord.id,
          username: userRecord.username,
          full_name: userRecord.full_name,
          profile_picture_url: userRecord.profile_picture_url,
          current_score: userStepsMap[userRecord.id] || 0,
          rank: 0,
          medal: "",
          is_current_user: userRecord.id === user.id,
        }))
        .sort((a, b) => b.current_score - a.current_score)
        .map((participant, index) => ({
          ...participant,
          rank: index + 1,
          medal: getMedalEmoji(index + 1),
        }));

      // Find user's score
      const userParticipant = participants.find((p) => p.is_current_user);
      const userScore = userParticipant?.current_score || 0;
      const userRank = userParticipant?.rank || null;

      // Create step competition
      const stepsCompetition: Competition = {
        id: "weekly_steps",
        title: "Weekly Step Challenge",
        description: "Who can walk the most steps this week?",
        icon: "👟",
        metric: "steps",
        participants: participants.slice(0, 10), // Top 10
        my_rank: userRank,
        my_score: userScore,
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString(),
        status: "active",
      };

      // Create additional competitions (mock data for now)
      const workoutCompetition: Competition = {
        id: "weekly_workouts",
        title: "Workout Warriors",
        description: "Complete the most workouts this week",
        icon: "💪",
        metric: "workouts",
        participants: participants
          .map((p) => ({
            ...p,
            current_score: Math.floor(Math.random() * 15),
          }))
          .sort((a, b) => b.current_score - a.current_score)
          .slice(0, 10)
          .map((p, idx) => ({
            ...p,
            rank: idx + 1,
            medal: getMedalEmoji(idx + 1),
            is_current_user: p.user_id === user.id,
          })),
        my_rank: null,
        my_score: 0,
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString(),
        status: "active",
      };

      const streakCompetition: Competition = {
        id: "active_streaks",
        title: "Streak Masters",
        description: "Maintain the longest daily streak",
        icon: "🔥",
        metric: "streak",
        participants: participants
          .map((p) => ({
            ...p,
            current_score: Math.floor(Math.random() * 30),
          }))
          .sort((a, b) => b.current_score - a.current_score)
          .slice(0, 10)
          .map((p, idx) => ({
            ...p,
            rank: idx + 1,
            medal: getMedalEmoji(idx + 1),
            is_current_user: p.user_id === user.id,
          })),
        my_rank: null,
        my_score: 0,
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString(),
        status: "active",
      };

      setCompetitions([
        stepsCompetition,
        workoutCompetition,
        streakCompetition,
      ]);
    } catch (error) {
      console.debug("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [user?.id]);

  return {
    competitions,
    loading,
    refetch: fetchCompetitions,
  };
};
