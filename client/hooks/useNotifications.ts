import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "comment" | "follow";
  post_id?: string;
  comment_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    username: string;
    full_name: string;
    profile_picture_url?: string;
  };
}

export const useNotifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, actor_id, type, post_id, comment_id, content, is_read, created_at")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Fetch actor info for each notification
      const notificationIds = (data || []).map((n) => n.actor_id);
      const uniqueActorIds = [...new Set(notificationIds)];

      let actorMap: { [key: string]: any } = {};

      if (uniqueActorIds.length > 0) {
        const { data: actorsData } = await supabase
          .from("users")
          .select("id, username, full_name, profile_picture_url")
          .in("id", uniqueActorIds);

        if (actorsData) {
          actorMap = Object.fromEntries(actorsData.map((a) => [a.id, a]));
        }
      }

      const notificationsWithActors = (data || []).map((n) => ({
        ...n,
        actor: actorMap[n.actor_id],
      }));

      setNotifications(notificationsWithActors);

      // Count unread
      const unread = notificationsWithActors.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userProfile?.id) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userProfile.id)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchNotifications();

      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [userProfile?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
