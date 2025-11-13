import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  MessageCircle,
  Utensils,
  User,
  BarChart3,
  Bell,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessages } from "@/hooks/useMessages";

const Navigation = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const { totalUnreadMessages } = useMessages();

  const isActive = (path: string) => location.pathname === path;
  const isTrainer = userProfile?.role === "trainer";

  const navItems = isTrainer
    ? [
        { path: "/", label: "Home", icon: Home },
        { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { path: "/messages", label: "Messages", icon: MessageCircle },
        { path: "/profile", label: "Profile", icon: User },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/discover", label: "Discover", icon: MapPin },
        { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { path: "/messages", label: "Messages", icon: MessageCircle },
        { path: "/profile", label: "Profile", icon: User },
      ];

  const handleNavClick = () => {
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        theme === "dark"
          ? "bg-gray-900 border-t border-gray-800"
          : "bg-white border-t border-gray-200"
      } shadow-2xl`}
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex justify-around max-w-md mx-auto w-full">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={handleNavClick}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-200 relative active:scale-90 ${
                theme === "dark"
                  ? `hover:bg-gray-800 ${
                      active
                        ? "text-blue-500"
                        : "text-gray-400 hover:text-gray-300"
                    }`
                  : `hover:bg-gray-50 ${
                      active
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`
              } rounded-lg`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 mb-1 transition-all ${active ? "scale-110" : "scale-100"}`}
                />
                {path === "/messages" && totalUnreadMessages > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full shadow-lg shadow-blue-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
