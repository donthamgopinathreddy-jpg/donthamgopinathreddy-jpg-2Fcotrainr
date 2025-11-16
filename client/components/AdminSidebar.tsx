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

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 border-l-4 border-blue-600",
    purple: "bg-purple-100 text-purple-600 border-l-4 border-purple-600",
    pink: "bg-pink-100 text-pink-600 border-l-4 border-pink-600",
    orange: "bg-orange-100 text-orange-600 border-l-4 border-orange-600",
    green: "bg-green-100 text-green-600 border-l-4 border-green-600",
    red: "bg-red-100 text-red-600 border-l-4 border-red-600",
    yellow: "bg-yellow-100 text-yellow-600 border-l-4 border-yellow-600",
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg border border-gray-200 shadow-lg hover:bg-gray-50"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 md:translate-x-0 overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CoTrainr Admin
            </h1>
            <p className="text-xs text-gray-600 mt-1">Dashboard</p>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-200">
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
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? colorClasses[item.color as keyof typeof colorClasses]
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                onSettingsChange?.(!showSettings);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                showSettings
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Settings</span>
            </button>

            <button
              onClick={() => {
                onActivityLogChange?.(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium text-sm">Activity Log</span>
            </button>

            <button
              onClick={() => {
                onNotificationPrefsChange?.(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium text-sm">Notifications</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className="md:pl-64" />
    </>
  );
};

export default AdminSidebar;
