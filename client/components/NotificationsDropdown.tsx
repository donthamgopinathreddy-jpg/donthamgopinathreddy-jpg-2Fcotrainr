import { useState } from "react";
import {
  Bell,
  X,
  CheckCircle,
  Users,
  Trophy,
  Calendar,
  MessageSquare,
  Loader,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function NotificationsDropdown() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userProfile?.id);
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "meeting":
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case "goal_achieved":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "achievement":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full transition-all hover:scale-110 ${
          theme === "dark"
            ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
            : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notifications Panel */}
          <div
            className={`absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl shadow-2xl z-50 overflow-hidden ${
              theme === "dark"
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-200"
            } sm:w-96 md:w-80`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Bell className="w-5 h-5 text-pink-500" />
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto sm:max-h-screen md:max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div
                  className={`p-8 text-center ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 transition-all cursor-pointer hover:opacity-80 ${
                        !notification.is_read
                          ? theme === "dark"
                            ? "bg-gray-800/50 border-pink-500"
                            : "bg-blue-50/50 border-pink-500"
                          : theme === "dark"
                            ? "bg-gray-900 border-transparent"
                            : "bg-white border-transparent"
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Icon */}
                        <div className="mt-1 flex-shrink-0 hidden sm:block">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0 items-center">
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-gray-500"
                                : "hover:bg-gray-200 text-gray-400"
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                className={`p-4 border-t text-center ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if available
                  }}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
