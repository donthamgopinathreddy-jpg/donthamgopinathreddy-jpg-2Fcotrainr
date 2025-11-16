import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  user_id: string;
  type: "follow" | "meeting" | "goal_achieved" | "goal_reminder" | "achievement" | "message";
  title: string;
  message: string;
  related_user_id?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fetchError) {
        console.debug("Fetch notifications error:", fetchError?.code, fetchError?.message);
        setError(null); // Don't show error to user, just log it
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (data) {
        setNotifications(data);
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
        setError(null);
      }
    } catch (err) {
      console.debug(
        "Fetch notifications catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setNotifications([]);
      setUnreadCount(0);
      // Don't show error UI to user
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (updateError) {
        console.debug("Mark as read error:", updateError?.code);
        return false;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.debug(
        "Mark as read catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (updateError) {
        console.debug("Mark all as read error:", updateError?.code);
        return false;
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.debug(
        "Mark all as read catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (deleteError) {
        console.debug("Delete notification error:", deleteError?.code);
        return false;
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      return true;
    } catch (err) {
      console.debug(
        "Delete notification catch error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
