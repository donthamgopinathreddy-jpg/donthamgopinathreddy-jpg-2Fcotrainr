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
      className="relative z-50 w-full bg-white/95 border-t border-gray-100/50 backdrop-blur-xl shadow-2xl"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="w-full px-2 py-3">
        <div className="flex justify-around items-center gap-1">
          {navItems.map(
            ({ path, label, icon: Icon, bgColor, textColor }: any) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleNavClick}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-4 rounded-2xl transition-all duration-300 flex-1 ${
                    active
                      ? `${bgColor} ${textColor} shadow-md`
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                  }`}
                >
                  <div className="relative">
                    <Icon size={24} />

                    {/* Unread Badge */}
                    {path === "/messages" && totalUnreadMessages > 0 && (
                      <div className="absolute -top-2 -right-2 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-pink-500 shadow-lg">
                        {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold leading-tight">
                    {label}
                  </span>
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
