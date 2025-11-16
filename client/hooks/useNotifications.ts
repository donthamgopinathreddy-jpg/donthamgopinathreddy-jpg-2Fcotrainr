import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface NotificationData {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "comment" | "follow";
  post_id?: string;
  comment_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "like" | "comment" | "follow";
  title: string;
  message: string;
  related_user_id?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

function transformNotification(data: NotificationData): Notification {
  let title = "";
  let message = "";

  switch (data.type) {
    case "like":
      title = "New Like";
      message = data.content || "Someone liked your post";
      break;
    case "comment":
      title = "New Comment";
      message = data.content || "Someone commented on your post";
      break;
    case "follow":
      title = "New Follower";
      message = "Someone followed you";
      break;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    type: data.type,
    title,
    message,
    related_user_id: data.actor_id,
    related_id: data.post_id || data.comment_id,
    is_read: data.is_read,
    created_at: data.created_at,
  };
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId || !isMounted.current) {
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

      if (!isMounted.current) return;

      if (fetchError) {
        console.debug(
          "Fetch notifications error:",
          fetchError?.code,
          fetchError?.message
        );
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
        return;
      }

      if (data && Array.isArray(data)) {
        const transformed = (data as NotificationData[]).map(
          transformNotification
        );
        setNotifications(transformed);
        const unread = transformed.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
        setError(null);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      if (isMounted.current) {
        console.debug(
          "Fetch notifications error:",
          err instanceof Error ? err.message : String(err)
        );
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (updateError) {
          console.debug("Mark as read error:", updateError?.code);
          return false;
        }

        if (isMounted.current) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        return true;
      } catch (err) {
        console.debug(
          "Mark as read error:",
          err instanceof Error ? err.message : String(err)
        );
        return false;
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId);

      if (updateError) {
        console.debug("Mark all as read error:", updateError?.code);
        return false;
      }

      if (isMounted.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
      return true;
    } catch (err) {
      console.debug(
        "Mark all as read error:",
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (deleteError) {
        console.debug("Delete notification error:", deleteError?.code);
        return false;
      }

      if (isMounted.current) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
      return true;
    } catch (err) {
      console.debug(
        "Delete notification error:",
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (userId) {
      const fetchWithDelay = setTimeout(() => {
        fetchNotifications();
      }, 100);

      return () => {
        clearTimeout(fetchWithDelay);
        isMounted.current = false;
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [userId, fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      if (isMounted.current) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

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
