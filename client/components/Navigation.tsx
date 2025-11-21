import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  MessageCircle,
  User,
  Award,
  Settings,
  Utensils,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessages } from "@/hooks/useMessages";
import { isUserAdmin } from "@/lib/adminAuth";

const Navigation = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const { totalUnreadMessages } = useMessages();

  const isActive = (path: string) => location.pathname === path;
  const isTrainer = userProfile?.role === "trainer";
  const isAdmin = isUserAdmin(userProfile);

  // Don't show navigation for admin users
  if (isAdmin) {
    return null;
  }

  let navItems = isTrainer
    ? [
        {
          path: "/",
          label: "Home",
          icon: Home,
          color: "from-blue-500 to-cyan-500",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Award,
          color: "from-purple-500 to-pink-500",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          color: "from-yellow-500 to-green-500",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          color: "from-orange-500 to-red-500",
        },
      ]
    : [
        {
          path: "/",
          label: "Home",
          icon: Home,
          color: "from-blue-500 to-cyan-500",
        },
        {
          path: "/discover",
          label: "Discover",
          icon: MapPin,
          color: "from-indigo-500 to-purple-500",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Award,
          color: "from-purple-500 to-pink-500",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          color: "from-yellow-500 to-green-500",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          color: "from-orange-500 to-red-500",
        },
      ];

  // Add admin link only for admin users
  if (isAdmin) {
    navItems = [
      ...navItems,
      {
        path: "/admin",
        label: "Admin",
        icon: Settings,
        color: "from-red-500 to-orange-500",
      },
    ];
  }

  const handleNavClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        theme === "dark"
          ? "bg-gray-950/95 border-t border-gray-800/50"
          : "bg-white/95 border-t border-gray-100/50"
      } backdrop-blur-xl shadow-2xl`}
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto w-full px-3 py-2">
        <div className="flex justify-between items-center gap-2">
          {navItems.map(({ path, label, icon: Icon, color }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className="flex-1 relative group"
              >
                {/* Animated Background */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    active
                      ? `bg-gradient-to-br ${color} opacity-100 shadow-lg shadow-blue-500/30`
                      : theme === "dark"
                        ? "bg-gray-800/50 group-hover:bg-gray-700/60 opacity-0 group-hover:opacity-100"
                        : "bg-gray-100/50 group-hover:bg-gray-200/60 opacity-0 group-hover:opacity-100"
                  }`}
                />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center py-3 px-2 transition-all duration-300">
                  {/* Icon Container */}
                  <div className="relative mb-1">
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        active
                          ? "text-white"
                          : theme === "dark"
                            ? "text-gray-400 group-hover:text-gray-200"
                            : "text-gray-600 group-hover:text-gray-800"
                      }`}
                    />

                    {/* Unread Badge */}
                    {path === "/messages" && totalUnreadMessages > 0 && (
                      <div
                        className={`absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-red-500 to-pink-500 shadow-lg`}
                      >
                        {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[8px] sm:text-xs font-semibold transition-all duration-300 leading-tight ${
                      active
                        ? "text-white"
                        : theme === "dark"
                          ? "text-gray-500 group-hover:text-gray-400"
                          : "text-gray-600 group-hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Animated Bottom Line for Active */}
                  {active && (
                    <div
                      className={`absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-white transform -translate-x-1/2 opacity-60`}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
