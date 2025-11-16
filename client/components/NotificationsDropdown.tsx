import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
        onClick={() => navigate("/notifications")}
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

    </div>
  );
}
