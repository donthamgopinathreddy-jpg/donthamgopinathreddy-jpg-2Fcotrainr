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
  post_id?: string;
  comment_id?: string;
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
    post_id: data.post_id,
    comment_id: data.comment_id,
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
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    // For real users, try to fetch but silently fail on any error
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let data: NotificationData[] = [];
      let fetchAttempted = false;

      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Notifications fetch timeout")),
            8000,
          ),
        );

        // Create the fetch promise
        const fetchPromise = (async () => {
          fetchAttempted = true;
          // Fetch notifications - the RLS policy will handle filtering by auth.uid()
          const response = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

          return response;
        })();

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (response && typeof response === "object") {
          const typedResponse = response as {
            error: any;
            data: NotificationData[] | null;
          };

          if (typedResponse.error) {
            // Check if it's a "not found" error or permission error
            const errorMsg = typedResponse.error?.message || "";
            const errorCode = typedResponse.error?.code || "";

            if (
              errorMsg.includes("does not exist") ||
              errorMsg.includes("relation") ||
              errorCode === "PGRST116"
            ) {
              // Table doesn't exist yet - use empty array
              console.debug("Notifications table not yet created");
              data = [];
            } else if (
              errorCode === "PGRST301" ||
              errorMsg.includes("permission denied")
            ) {
              // RLS policy blocked - use empty array
              console.debug("RLS policy blocked notifications access");
              data = [];
            } else {
              console.debug(
                "Supabase notifications error:",
                typedResponse.error?.message || typedResponse.error,
              );
              data = [];
            }
          } else if (
            typedResponse.data &&
            Array.isArray(typedResponse.data)
          ) {
            data = typedResponse.data;
          }
        }
      } catch (e) {
        // Network error, timeout, or other fetch issue - silently handle
        const errorMsg =
          e instanceof Error ? e.message : String(e);
        console.debug(
          "Fetch notifications error:",
          errorMsg,
        );

        // Log if it's a fetch failure vs timeout
        if (errorMsg.includes("Failed to fetch")) {
          console.debug(
            "Network connectivity issue - notifications unavailable",
          );
        } else if (errorMsg.includes("timeout")) {
          console.debug("Notifications fetch timeout - trying again later");
        }

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

        // Add timeout for update operation
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Mark as read timeout")),
            5000,
          ),
        );

        const updatePromise = supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        const result = await Promise.race([updatePromise, timeoutPromise]);

        if (result && typeof result === "object") {
          const typedResult = result as { error: any };
          if (typedResult.error) {
            console.debug("Mark as read error:", typedResult.error?.code);
            return false;
          }
        }

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.debug("Mark as read error:", errorMsg);
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

      // Add timeout for update operation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Mark all as read timeout")),
          5000,
        ),
      );

      const updatePromise = supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId);

      const result = await Promise.race([updatePromise, timeoutPromise]);

      if (result && typeof result === "object") {
        const typedResult = result as { error: any };
        if (typedResult.error) {
          console.debug("Mark all as read error:", typedResult.error?.code);
          return false;
        }
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.debug("Mark all as read error:", errorMsg);
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

        // Add timeout for delete operation
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Delete notification timeout")),
            5000,
          ),
        );

        const deletePromise = supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        const result = await Promise.race([deletePromise, timeoutPromise]);

        if (result && typeof result === "object") {
          const typedResult = result as { error: any };
          if (typedResult.error) {
            console.debug("Delete notification error:", typedResult.error?.code);
            return false;
          }
        }

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.debug("Delete notification error:", errorMsg);
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

    // Also refetch when the window comes back into focus
    const handleWindowFocus = () => {
      if (isMountedRef.current) {
        fetchNotifications();
      }
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
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
