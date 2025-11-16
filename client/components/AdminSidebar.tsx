import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  BarChart3,
  Users,
  Shield,
  MessageSquare,
  Activity,
  Zap,
  Settings,
  LogOut,
  Home,
  Camera,
  Loader,
  Bell,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  showSettings?: boolean;
  onSettingsChange?: (show: boolean) => void;
  onLogout?: () => void;
  onProfilePictureUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPic?: boolean;
  showActivityLog?: boolean;
  onActivityLogChange?: (show: boolean) => void;
  showNotificationPrefs?: boolean;
  onNotificationPrefsChange?: (show: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  showSettings = false,
  onSettingsChange,
  onLogout,
  onProfilePictureUpload,
  uploadingPic = false,
  showActivityLog = false,
  onActivityLogChange,
  showNotificationPrefs = false,
  onNotificationPrefsChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      icon: Home,
      label: "Trainer Verification",
      path: "/admin",
      color: "blue",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics",
      color: "purple",
    },
    {
      icon: Users,
      label: "User Management",
      path: "/admin/users",
      color: "pink",
    },
    {
      icon: Shield,
      label: "Trainer Management",
      path: "/admin/trainers",
      color: "orange",
    },
    {
      icon: MessageSquare,
      label: "Communication",
      path: "/admin/communication",
      color: "green",
    },
    {
      icon: Activity,
      label: "System Health",
      path: "/admin/system",
      color: "red",
    },
    {
      icon: Zap,
      label: "Quick Stats",
      path: "/admin/stats",
      color: "yellow",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Removed colorClasses - using flat black theme

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-4 z-35 md:hidden p-2 text-gray-900 hover:text-gray-600 transition-colors"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-black text-white z-40 transition-transform duration-300 md:translate-x-0 overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">
              CoTrainr Admin
            </h1>
            <p className="text-xs text-gray-400 mt-1">Dashboard</p>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer group">
                {userProfile?.profile_picture_url ? (
                  <img
                    src={userProfile.profile_picture_url}
                    alt={userProfile.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                  </div>
                )}

                <div className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                  {uploadingPic ? (
                    <Loader className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 text-white" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPic}
                  onChange={onProfilePictureUpload}
                />
              </label>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userProfile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 ${
                    active
                      ? "bg-gray-800 text-white border-l-4 border-orange-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => onSettingsChange?.(!showSettings)}
              className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 ${
                showSettings
                  ? "bg-gray-800 text-white border-l-4 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Settings</span>
            </button>

            <button
              onClick={() => onActivityLogChange?.(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium text-sm">Activity Log</span>
            </button>

            <button
              onClick={() => onNotificationPrefsChange?.(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium text-sm">Notifications</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-400 transition-all duration-200 font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};

export default AdminSidebar;
