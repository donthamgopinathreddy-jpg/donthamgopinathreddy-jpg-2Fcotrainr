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
  const isMountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId || !isMountedRef.current) {
      return;
    }

    // Check if user is demo user to use mock data
    const isDemoMode =
      userId.startsWith("demo-user") || userId.includes("demo");

    if (isDemoMode) {
      // For demo users, return empty notifications immediately
      if (isMountedRef.current) {
        setLoading(true);
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
      return;
    }

    // For real users, try to fetch but silently fail on any error
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let data: NotificationData[] = [];

      try {
        const response = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (response.error) {
          // Check if it's a "not found" error (table doesn't exist)
          const errorMsg = response.error?.message || "";
          if (
            errorMsg.includes("does not exist") ||
            errorMsg.includes("relation") ||
            response.error?.code === "PGRST116"
          ) {
            // Table doesn't exist yet - use empty array
            console.debug("Notifications table not yet created");
            data = [];
          } else {
            console.debug(
              "Supabase notifications error:",
              response.error?.message || response.error,
            );
            data = [];
          }
        } else if (response.data && Array.isArray(response.data)) {
          data = response.data;
        }
      } catch (e) {
        // Network error or other fetch issue - silently handle
        console.debug(
          "Fetch notifications error:",
          e instanceof Error ? e.message : String(e),
        );
        data = [];
      }

      if (!isMountedRef.current) return;

      if (data.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        const transformed = data.map(transformNotification);
        setNotifications(transformed);
        const unread = transformed.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }

      setError(null);
    } catch (err) {
      // Catch any unexpected errors
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        // Always update local state
        if (isMountedRef.current) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Skip database update for demo users
        if (
          !userId ||
          userId.startsWith("demo-user") ||
          userId.includes("demo")
        ) {
          return true;
        }

        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (updateError) {
          console.debug("Mark as read error:", updateError?.code);
          return false;
        }

        return true;
      } catch (err) {
        console.debug(
          "Mark as read error:",
          err instanceof Error ? err.message : String(err),
        );
        // Still return true since we updated local state
        return true;
      }
    },
    [userId],
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;

    try {
      // Always update local state
      if (isMountedRef.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }

      // Skip database update for demo users
      if (userId.startsWith("demo-user") || userId.includes("demo")) {
        return true;
      }

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId);

      if (updateError) {
        console.debug("Mark all as read error:", updateError?.code);
        return false;
      }

      return true;
    } catch (err) {
      console.debug(
        "Mark all as read error:",
        err instanceof Error ? err.message : String(err),
      );
      // Still return true since we updated local state
      return true;
    }
  }, [userId]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        // Always update local state
        if (isMountedRef.current) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId),
          );
        }

        // Skip database update for demo users
        if (
          !userId ||
          userId.startsWith("demo-user") ||
          userId.includes("demo")
        ) {
          return true;
        }

        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (deleteError) {
          console.debug("Delete notification error:", deleteError?.code);
          return false;
        }

        return true;
      } catch (err) {
        console.debug(
          "Delete notification error:",
          err instanceof Error ? err.message : String(err),
        );
        // Still return true since we updated local state
        return true;
      }
    },
    [userId],
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (userId) {
      const fetchWithDelay = setTimeout(() => {
        fetchNotifications();
      }, 100);

      return () => {
        clearTimeout(fetchWithDelay);
      };
    }
  }, [userId, fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
