import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "follow"
  | "achievement"
  | "meeting"
  | "goal_achieved"
  | "message";

export function useNotificationTrigger() {
  const sendNotification = useCallback(
    async (
      userId: string,
      actorId: string,
      type: NotificationType,
      title: string,
      message: string,
      relatedId?: string,
    ) => {
      try {
        const { error } = await supabase.from("notifications").insert([
          {
            user_id: userId,
            actor_id: actorId,
            type,
            title,
            content: message,
            post_id: type === "follow" || type === "message" ? relatedId : null,
            comment_id: type === "achievement" ? relatedId : null,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.debug("Error sending notification:", error);
          return false;
        }

        return true;
      } catch (err) {
        console.debug("Error in sendNotification:", err);
        return false;
      }
    },
    [],
  );

  const notifyFollowRequest = useCallback(
    async (userId: string, followerName: string, followerUserId: string) => {
      return sendNotification(
        userId,
        followerUserId,
        "follow",
        `${followerName} followed you`,
        `${followerName} is now following your profile`,
      );
    },
    [sendNotification],
  );

  const notifyAchievementUnlocked = useCallback(
    async (userId: string, achievementTitle: string, achievementId: string) => {
      return sendNotification(
        userId,
        userId,
        "achievement",
        `Achievement Unlocked! 🏆`,
        `You've unlocked the "${achievementTitle}" achievement`,
        achievementId,
      );
    },
    [sendNotification],
  );

  const notifyGoalAchieved = useCallback(
    async (
      userId: string,
      goalName: string,
      trainerName: string,
      trainerId: string,
    ) => {
      return sendNotification(
        userId,
        trainerId,
        "goal_achieved",
        `Goal Achieved! 🎉`,
        `Congratulations! You've achieved the goal: "${goalName}" - ${trainerName} is proud of you!`,
      );
    },
    [sendNotification],
  );

  const notifyMeetingScheduled = useCallback(
    async (
      userId: string,
      trainerName: string,
      trainerId: string,
      meetingDate: string,
    ) => {
      return sendNotification(
        userId,
        trainerId,
        "meeting",
        `Meeting Scheduled 📅`,
        `${trainerName} has scheduled a meeting for ${new Date(meetingDate).toLocaleDateString()}`,
      );
    },
    [sendNotification],
  );

  const notifyMessage = useCallback(
    async (
      userId: string,
      senderName: string,
      senderId: string,
      message: string,
    ) => {
      return sendNotification(
        userId,
        senderId,
        "message",
        `New Message from ${senderName}`,
        message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      );
    },
    [sendNotification],
  );

  return {
    sendNotification,
    notifyFollowRequest,
    notifyAchievementUnlocked,
    notifyGoalAchieved,
    notifyMeetingScheduled,
    notifyMessage,
  };
}
