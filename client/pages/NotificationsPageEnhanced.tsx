import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useFollows } from "@/hooks/useFollows";
import { supabase } from "@/lib/supabase";

interface NotificationWithUser {
  id: string;
  user_id: string;
  type: "like" | "comment" | "follow" | "meeting" | "goal_achieved" | "achievement" | "message";
  title: string;
  message: string;
  related_user_id?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    username: string;
  };
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
  const [longPressNotifId, setLongPressNotifId] = useState<string | null>(null);

  useEffect(() => {
    const enrichNotifications = async () => {
      const enriched: NotificationWithUser[] = [];

      for (const notif of notifications) {
        const enrichedNotif = { ...notif } as NotificationWithUser;

        if (
          notif.type === "follow" &&
          notif.related_user_id
        ) {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("id, full_name, profile_picture_url, username")
              .eq("id", notif.related_user_id)
              .single();

            if (userData) {
              enrichedNotif.actor = userData;
            }
          } catch (error) {
            console.debug("Error fetching actor user:", error);
          }
        }

        enriched.push(enrichedNotif);
      }

      setNotificationsWithUsers(enriched);
    };

    enrichNotifications();
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <Users className="w-6 h-6 text-blue-500" />;
      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case "goal_achieved":
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case "achievement":
        return <Trophy className="w-6 h-6 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-6 h-6 text-green-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "follow":
        return theme === "dark"
          ? "bg-blue-900/30 border-blue-700/50"
          : "bg-blue-50 border-blue-200";
      case "meeting":
        return theme === "dark"
          ? "bg-purple-900/30 border-purple-700/50"
          : "bg-purple-50 border-purple-200";
      case "goal_achieved":
      case "achievement":
        return theme === "dark"
          ? "bg-amber-900/30 border-amber-700/50"
          : "bg-amber-50 border-amber-200";
      case "message":
        return theme === "dark"
          ? "bg-green-900/30 border-green-700/50"
          : "bg-green-50 border-green-200";
      default:
        return theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200";
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

  const handleSelectNotification = (id: string) => {
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

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b p-4`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
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
            <p className="text-lg font-semibold mb-2">No notifications yet</p>
            <p className="text-sm">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificationsWithUsers.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 rounded-2xl border-l-4 transition-all ${
                  !notification.is_read
                    ? theme === "dark"
                      ? "bg-gray-800/50 border-pink-500 shadow-md"
                      : "bg-blue-50/50 border-pink-500 shadow-md"
                    : theme === "dark"
                      ? "bg-gray-800/20 border-transparent"
                      : "bg-white border-transparent"
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1 rounded cursor-pointer"
                  />

                  {/* Icon and User Info (for follow notifications) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-bold mb-1 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`text-base mb-3 ${
                            theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-gray-500"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Follow notification with user card */}
                    {notification.type === "follow" &&
                      notification.actor && (
                        <div
                          className={`mt-4 p-3 rounded-xl border ${
                            theme === "dark"
                              ? "bg-gray-700/30 border-gray-600"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <button
                              onClick={() =>
                                navigate(`/profile/${notification.actor?.id}`)
                              }
                              className="flex-shrink-0"
                            >
                              <div
                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all ${
                                  theme === "dark"
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {notification.actor.profile_picture_url ? (
                                  <img
                                    src={notification.actor.profile_picture_url}
                                    alt={notification.actor.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                            </button>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() =>
                                  navigate(`/profile/${notification.actor?.id}`)
                                }
                                className="text-left hover:opacity-80 transition-opacity"
                              >
                                <p
                                  className={`font-semibold text-sm ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {notification.actor.full_name}
                                </p>
                                {notification.actor.username && (
                                  <p
                                    className={`text-xs ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    @{notification.actor.username}
                                  </p>
                                )}
                              </button>
                            </div>

                            {/* Follow Button */}
                            <button
                              onClick={() =>
                                handleToggleFollow(notification.actor!.id)
                              }
                              disabled={
                                isTogglingFollow.get(notification.actor!.id) ||
                                false
                              }
                              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
                                isFollowing(notification.actor!.id)
                                  ? theme === "dark"
                                    ? "bg-gray-700 text-white hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                  : "bg-orange-500 text-white hover:bg-orange-600"
                              }`}
                            >
                              {isTogglingFollow.get(notification.actor!.id) ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : isFollowing(notification.actor!.id) ? (
                                "Following"
                              ) : (
                                "Follow"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      theme === "dark"
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                    title="Delete notification"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
