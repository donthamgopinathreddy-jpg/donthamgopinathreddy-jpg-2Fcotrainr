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

  // Get different gradients for each page
  const getPageGradient = () => {
    if (location.pathname === "/") return "from-orange-400 to-yellow-500";
    if (location.pathname === "/discover") return "from-green-400 to-emerald-500";
    if (location.pathname === "/achievements") return "from-yellow-400 to-orange-500";
    if (location.pathname === "/messages") return "from-blue-400 to-cyan-500";
    if (location.pathname === "/profile") return "from-pink-400 to-rose-500";
    return "from-orange-400 to-yellow-500";
  };

  return (
    <nav
      className="w-full bg-white/80 backdrop-blur-xl shadow-lg transition-all duration-500"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="w-full px-2 py-3">
        <div className="flex justify-around items-center gap-3">
          {navItems.map(
            ({ path, label, icon: Icon, bgColor, textColor }: any) => {
              const active = isActive(path);

              // Different gradient for each nav item
              const getGradientForPath = (navPath: string) => {
                if (navPath === "/") return "from-orange-400 to-yellow-500";
                if (navPath === "/discover") return "from-green-400 to-emerald-500";
                if (navPath === "/achievements") return "from-yellow-400 to-orange-500";
                if (navPath === "/messages") return "from-blue-400 to-cyan-500";
                if (navPath === "/profile") return "from-pink-400 to-rose-500";
                return "from-orange-400 to-yellow-500";
              };

              const gradient = getGradientForPath(path);

              // Get shadow color for this gradient
              const getShadowColor = (navPath: string) => {
                if (navPath === "/") return "rgba(251, 146, 60, 0.3)";
                if (navPath === "/discover") return "rgba(74, 222, 128, 0.3)";
                if (navPath === "/achievements") return "rgba(253, 224, 71, 0.3)";
                if (navPath === "/messages") return "rgba(96, 165, 250, 0.3)";
                if (navPath === "/profile") return "rgba(244, 114, 182, 0.3)";
                return "rgba(251, 146, 60, 0.3)";
              };

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleNavClick}
                  className={`group relative flex flex-col items-center justify-center gap-0 py-2.5 px-4 rounded-2xl transition-all duration-300 flex-1 overflow-hidden ${
                    active
                      ? `bg-gradient-to-br ${gradient} text-white shadow-lg scale-105`
                      : "text-gray-600 hover:text-white hover:scale-110 active:scale-95"
                  }`}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: active ? `0 8px 24px ${getShadowColor(path)}` : "none",
                  }}
                >
                  {/* Animated background gradient on hover */}
                  {!active && (
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gray-100 to-gray-50" />
                  )}

                  {/* Icon with animation */}
                  <div className="relative z-10 group-hover:scale-110 group-active:scale-90 transition-transform duration-200">
                    <Icon
                      size={26}
                      className={`${active ? "text-white drop-shadow-lg" : "text-current"}`}
                    />

                    {/* Unread Badge with pulse animation */}
                    {path === "/messages" && totalUnreadMessages > 0 && (
                      <div className="absolute -top-2 -right-3 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-red-500 to-pink-500 shadow-lg animate-pulse">
                        {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                      </div>
                    )}
                  </div>

                  {/* Active indicator dot */}
                  {active && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-lg animate-pulse" />
                  )}
                </Link>
              );
            },
          )}
        </div>
      </div>

      {/* Top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
