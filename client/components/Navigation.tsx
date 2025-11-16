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
  Dumbbell,
  Award,
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
        { path: "/achievements", label: "Achievements", icon: Award },
        { path: "/messages", label: "Messages", icon: MessageCircle },
        { path: "/profile", label: "Profile", icon: User },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/discover", label: "Discover", icon: MapPin },
        { path: "/achievements", label: "Achievements", icon: Award },
        { path: "/messages", label: "Messages", icon: MessageCircle },
        { path: "/profile", label: "Profile", icon: User },
      ];

  const handleNavClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        theme === "dark"
          ? "bg-gray-900/95 border-t border-gray-800/50 backdrop-blur-md"
          : "bg-white/95 border-t border-gray-100 backdrop-blur-md"
      }`}
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto w-full px-2 py-1">
        <div className="flex justify-between items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={`flex-1 relative flex flex-col items-center justify-center py-2.5 px-2 transition-all duration-300 active:scale-95 rounded-xl group`}
              >
                {/* Background */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    active
                      ? theme === "dark"
                        ? "bg-blue-500/20"
                        : "bg-blue-100/60"
                      : theme === "dark"
                        ? "bg-transparent group-hover:bg-gray-800/50"
                        : "bg-transparent group-hover:bg-gray-100/50"
                  }`}
                />

                {/* Icon and Badge Container */}
                <div className="relative z-10 mb-0.5">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      active
                        ? theme === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                        : theme === "dark"
                          ? "text-gray-400 group-hover:text-gray-300"
                          : "text-gray-600 group-hover:text-gray-800"
                    }`}
                  />
                  {path === "/messages" && totalUnreadMessages > 0 && (
                    <div
                      className={`absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold text-white ${
                        active
                          ? "bg-red-500"
                          : theme === "dark"
                            ? "bg-red-500"
                            : "bg-red-500"
                      }`}
                    >
                      {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium leading-none transition-all duration-300 z-10 ${
                    active
                      ? theme === "dark"
                        ? "text-blue-400"
                        : "text-blue-600"
                      : theme === "dark"
                        ? "text-gray-500 group-hover:text-gray-400"
                        : "text-gray-600 group-hover:text-gray-800"
                  }`}
                >
                  {label}
                </span>

                {/* Active indicator dot */}
                {active && (
                  <div
                    className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-300 ${
                      theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
