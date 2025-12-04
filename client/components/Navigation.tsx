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
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Trophy,
          color: "from-yellow-500 to-orange-500",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
        },
      ]
    : [
        {
          path: "/",
          label: "Home",
          icon: Home,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        },
        {
          path: "/discover",
          label: "Discover",
          icon: MapPin,
          color: "from-indigo-500 to-purple-500",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        },
        {
          path: "/achievements",
          label: "Quest",
          icon: Trophy,
          color: "from-yellow-500 to-orange-500",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
        },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        },
        {
          path: "/profile",
          label: "Profile",
          icon: User,
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
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
            ({ path, label, icon: Icon }: any) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleNavClick}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 relative transition-colors duration-200 ${
                    active
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {/* Icon */}
                  <Icon size={24} className="text-current" />

                  {/* Label */}
                  <span className="text-xs font-medium text-current">{label}</span>

                  {/* Active indicator line */}
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
                  )}

                  {/* Unread Badge with pulse animation */}
                  {path === "/messages" && totalUnreadMessages > 0 && (
                    <div className="absolute top-0 right-1 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold text-white bg-red-500 shadow-lg animate-pulse">
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
