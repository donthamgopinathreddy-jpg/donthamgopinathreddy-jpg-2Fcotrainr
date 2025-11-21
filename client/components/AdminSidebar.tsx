import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, Activity, Home } from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/admin",
      color: "blue",
    },
    {
      icon: Users,
      label: "Users",
      path: "/admin/users",
      color: "pink",
    },
    {
      icon: Activity,
      label: "Activity",
      path: "/admin/activity",
      color: "green",
    },
  ];

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      {/* Logo/Title */}
      <div className="mb-8">
        {isOpen && <h1 className="text-xl font-bold">Admin</h1>}
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
            >
              <Icon size={20} className={`text-${item.color}-400`} />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
