import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  X,
  Loader,
  Trash2,
  CheckCircle,
  Users,
  Trophy,
  Calendar,
  MessageSquare,
  User,
  Heart,
  MessageCircle,
  UserCheck,
  MessageCircleHeart,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useFollows } from "@/hooks/useFollows";
import { supabase } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface NotificationWithUser {
  id: string;
  user_id: string;
  type:
    | "like"
    | "comment"
    | "follow"
    | "meeting"
    | "goal_achieved"
    | "achievement"
    | "message";
  title: string;
  message: string;
  related_user_id?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  actor_id?: string;
  content?: string;
  post_image_url?: string;
  actor?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    username: string;
  };
}

interface GroupedNotifications {
  today: NotificationWithUser[];
  yesterday: NotificationWithUser[];
  last7Days: NotificationWithUser[];
  older: NotificationWithUser[];
}

export default function NotificationsPageEnhanced() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userProfile?.id);
  const { isFollowing, toggleFollow } = useFollows();
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [notificationsWithUsers, setNotificationsWithUsers] = useState<
    NotificationWithUser[]
  >([]);
  const [isTogglingFollow, setIsTogglingFollow] = useState<
    Map<string, boolean>
  >(new Map());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Batch fetch all actor users for better performance
  useEffect(() => {
    const enrichNotifications = async () => {
      if (notifications.length === 0) {
        setNotificationsWithUsers([]);
        return;
      }

      try {
        // Get all unique actor IDs
        const actorIds = new Set<string>();
        notifications.forEach((notif) => {
          const actorId = notif.related_user_id || (notif as any).actor_id;
          if (actorId) actorIds.add(actorId);
        });

        // Batch fetch all user data in one query
        let usersData: { [key: string]: any } = {};
        if (actorIds.size > 0) {
          try {
            const { data: users, error: usersError } = await supabase
              .from("users")
              .select("id, full_name, profile_picture_url, username")
              .in("id", Array.from(actorIds));

            if (!usersError && users) {
              users.forEach((user) => {
                usersData[user.id] = user;
              });
            }
          } catch (userErr) {
            console.debug("Error fetching user data:", userErr);
            // Continue without user data
          }
        }

        // Fetch comment content for comment notifications
        const commentNotifs = notifications.filter(
          (n) => (n as any).type === "comment" && (n as any).comment_id
        );
        let commentData: { [key: string]: any } = {};
        if (commentNotifs.length > 0) {
          try {
            const commentIds = commentNotifs.map((n) => (n as any).comment_id);
            const { data: comments, error: commentError } = await supabase
              .from("post_comments")
              .select("id, content")
              .in("id", commentIds);

            if (!commentError && comments) {
              comments.forEach((comment) => {
                commentData[comment.id] = comment.content;
              });
            }
          } catch (commentErr) {
            console.debug("Error fetching comment content:", commentErr);
            // Continue without comment content
          }
        }

        // Fetch post images for like and comment notifications
        const postNotifs = notifications.filter(
          (n) =>
            ((n as any).type === "like" || (n as any).type === "comment") &&
            (n as any).post_id
        );
        let postData: { [key: string]: any } = {};
        if (postNotifs.length > 0) {
          try {
            const postIds = postNotifs.map((n) => (n as any).post_id);
            const { data: posts, error: postError } = await supabase
              .from("posts")
              .select("id, image_url")
              .in("id", postIds);

            if (!postError && posts) {
              posts.forEach((post) => {
                postData[post.id] = post.image_url;
              });
            }
          } catch (postErr) {
            console.debug("Error fetching post images:", postErr);
            // Continue without post images
          }
        }

        // Enrich notifications
        const enriched = notifications.map((notif) => {
          const enrichedNotif = { ...notif } as NotificationWithUser;
          const actorId = notif.related_user_id || (notif as any).actor_id;

          if (actorId && usersData[actorId]) {
            enrichedNotif.actor = usersData[actorId];
            enrichedNotif.actor_id = actorId;
          }

          // Add comment content if available
          if ((notif as any).type === "comment") {
            const commentId = (notif as any).comment_id;
            if (commentId && commentData[commentId]) {
              enrichedNotif.content = commentData[commentId];
            }
          }

          return enrichedNotif;
        });

        setNotificationsWithUsers(enriched);
      } catch (error) {
        console.debug("Error enriching notifications:", error);
        setNotificationsWithUsers(
          notifications.map((n) => ({ ...n }) as NotificationWithUser),
        );
      }
    };

    enrichNotifications();
  }, [notifications]);

  // Memoized grouped notifications
  const groupedNotifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: GroupedNotifications = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: [],
    };

    notificationsWithUsers.forEach((notif) => {
      const notifDate = new Date(notif.created_at);
      const notifDateOnly = new Date(
        notifDate.getFullYear(),
        notifDate.getMonth(),
        notifDate.getDate(),
      );

      if (notifDateOnly.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (notifDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else if (notifDateOnly.getTime() >= sevenDaysAgo.getTime()) {
        groups.last7Days.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  }, [notificationsWithUsers]);

  const selectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach((id) => {
      deleteNotification(id);
    });
    setSelectedNotifications(new Set());
  };

  const handleToggleFollow = async (userId: string) => {
    setIsTogglingFollow((prev) => new Map(prev).set(userId, true));
    try {
      await toggleFollow(userId);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsTogglingFollow((prev) => new Map(prev).set(userId, false));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case "meeting":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case "goal_achieved":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "achievement":
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifDate.toLocaleDateString();
  };

  const getNotificationMessage = (
    notification: NotificationWithUser
  ): { title: string; message: string; commentContent?: string } => {
    const actorName = notification.actor?.full_name || "Someone";

    switch (notification.type) {
      case "like":
        return {
          title: actorName,
          message: `${actorName} liked your post`,
        };
      case "comment":
        return {
          title: actorName,
          message: `${actorName} commented on your post`,
          commentContent: notification.content,
        };
      case "follow":
        return {
          title: actorName,
          message: `${actorName} followed you`,
        };
      default:
        return {
          title: notification.title,
          message: notification.message,
        };
    }
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: NotificationWithUser;
  }) => {
    let longPressTimer: NodeJS.Timeout;

    const handleLongPress = () => {
      if (!isMultiSelectMode) {
        setIsMultiSelectMode(true);
        setSelectedNotifications(new Set([notification.id]));
      }
    };

    const handleMouseDown = () => {
      longPressTimer = setTimeout(handleLongPress, 500);
    };

    const handleMouseUp = () => {
      clearTimeout(longPressTimer);
    };

    const handleTouchStart = () => {
      longPressTimer = setTimeout(handleLongPress, 500);
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer);
    };

    const { title, message, commentContent } = getNotificationMessage(notification);

    return (
      <div
        className={`p-4 rounded-xl border transition-all ${
          !notification.is_read
            ? theme === "dark"
              ? "bg-gray-800/50 border-gray-700 shadow-sm"
              : "bg-blue-50/50 border-gray-200 shadow-sm"
            : theme === "dark"
              ? "bg-gray-900/30 border-gray-800"
              : "bg-white border-gray-200"
        } ${isMultiSelectMode ? "cursor-pointer" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (isMultiSelectMode) {
            selectNotification(notification.id);
          }
        }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox - only in multi-select mode */}
          {isMultiSelectMode && (
            <input
              type="checkbox"
              checked={selectedNotifications.has(notification.id)}
              onChange={() => selectNotification(notification.id)}
              className="mt-1 rounded cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </p>
            <p
              className={`text-sm mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {message}
            </p>
            {commentContent && (
              <p
                className={`text-sm mt-2 p-3 rounded-lg border-l-2 border-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-700/50 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                "{commentContent}"
              </p>
            )}
            <p
              className={`text-xs mt-2 ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {formatTime(notification.created_at)}
            </p>
          </div>

          {/* Delete Button - X */}
          {!isMultiSelectMode && (
            <button
              onClick={() => deleteNotification(notification.id)}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                theme === "dark"
                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
              title="Delete notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User card for interactions */}
        {notification.actor &&
          (notification.type === "follow" ||
            notification.type === "like" ||
            notification.type === "comment") && (
            <div className="mt-3 p-2.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 flex items-center gap-2.5">
              <button
                onClick={() => {
                  const actorId = notification.actor?.id;
                  if (actorId) navigate(`/profile/${actorId}`);
                }}
                className="flex-shrink-0"
              >
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  {notification.actor.profile_picture_url ? (
                    <img
                      src={notification.actor.profile_picture_url}
                      alt={notification.actor.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              <button
                onClick={() => {
                  const actorId = notification.actor?.id;
                  if (actorId) navigate(`/profile/${actorId}`);
                }}
                className="flex-1 text-left min-w-0 hover:opacity-80 transition-opacity"
              >
                <p
                  className={`text-sm font-semibold truncate ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {notification.actor.full_name}
                </p>
                {notification.actor.username && (
                  <p
                    className={`text-xs truncate ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    @{notification.actor.username}
                  </p>
                )}
              </button>

              {notification.type === "follow" && (
                <button
                  onClick={() => handleToggleFollow(notification.actor!.id)}
                  disabled={
                    isTogglingFollow.get(notification.actor!.id) || false
                  }
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                    isFollowing(notification.actor!.id)
                      ? theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isTogglingFollow.get(notification.actor!.id) ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : isFollowing(notification.actor!.id) ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              )}
            </div>
          )}
      </div>
    );
  };

  const NotificationSection = ({
    title,
    notifications: notifs,
  }: {
    title: string;
    notifications: NotificationWithUser[];
  }) => {
    if (notifs.length === 0) return null;

    return (
      <div className="mb-6">
        <h2
          className={`text-sm font-bold px-1 py-2 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {title}
        </h2>
        <div className="space-y-2">
          {notifs.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        } border-b p-4`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-white"
                  : "hover:bg-gray-100 text-black"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className={`text-2xl font-bold flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              <Bell className="w-6 h-6 text-pink-500" />
              Notifications
            </h1>
          </div>

          {/* Action Buttons */}
          {notificationsWithUsers.length > 0 && (
            <div className="flex gap-2 items-center">
              {isMultiSelectMode ? (
                <>
                  <button
                    onClick={() => {
                      setIsMultiSelectMode(false);
                      setSelectedNotifications(new Set());
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                  {selectedNotifications.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedNotifications.size})
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : notificationsWithUsers.length === 0 ? (
          <div
            className={`text-center py-12 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">All caught up!</p>
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div>
            {groupedNotifications.today.length > 0 && (
              <NotificationSection
                title="Today"
                notifications={groupedNotifications.today}
              />
            )}
            {groupedNotifications.yesterday.length > 0 && (
              <NotificationSection
                title="Yesterday"
                notifications={groupedNotifications.yesterday}
              />
            )}
            {groupedNotifications.last7Days.length > 0 && (
              <NotificationSection
                title="Last 7 Days"
                notifications={groupedNotifications.last7Days}
              />
            )}
            {groupedNotifications.older.length > 0 && (
              <NotificationSection
                title="Older"
                notifications={groupedNotifications.older}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
