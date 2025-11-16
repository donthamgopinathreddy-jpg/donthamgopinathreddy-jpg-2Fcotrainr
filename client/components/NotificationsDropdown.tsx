import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { unreadCount } = useNotifications(userProfile?.id);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => navigate("/notifications")}
        className={`relative p-3 transition-all hover:scale-110 ${
          theme === "dark" ? "text-white" : "text-white"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 bg-orange-600 text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
