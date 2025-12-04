import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  MessageCircle,
  User,
  Award,
  Settings,
  Trophy,
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
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Trophy,
          gradient: "from-yellow-500 to-orange-500",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          gradient: "from-green-500 to-emerald-500",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          gradient: "from-orange-500 to-red-500",
        },
      ]
    : [
        {
          path: "/",
          label: "Home",
          icon: Home,
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          path: "/discover",
          label: "Discover",
          icon: MapPin,
          gradient: "from-indigo-500 to-purple-500",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Trophy,
          gradient: "from-yellow-500 to-orange-500",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          gradient: "from-green-500 to-emerald-500",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          gradient: "from-orange-500 to-red-500",
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
      className="w-full bg-white border-t border-gray-200 transition-all duration-500"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="w-full">
        <div className="flex justify-around items-stretch">
          {navItems.map(
            ({ path, label, icon: Icon, gradient }: any) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleNavClick}
                  className={`flex flex-col items-center justify-center py-3 px-4 flex-1 relative transition-all duration-200 ${
                    active
                      ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {/* Icon only, no text */}
                  <Icon size={24} className="text-current" />

                  {/* Unread Badge with pulse animation */}
                  {path === "/messages" && totalUnreadMessages > 0 && (
                    <div className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold text-white bg-red-500 shadow-lg animate-pulse">
                      {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                    </div>
                  )}
                </Link>
              );
            },
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
