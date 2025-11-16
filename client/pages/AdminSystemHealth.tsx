import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import {
  Activity,
  Database,
  Zap,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const AdminSystemHealth: React.FC = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  const systemStats = [
    {
      label: "API Status",
      status: "operational",
      uptime: "99.9%",
      icon: Server,
      color: "green",
    },
    {
      label: "Database",
      status: "operational",
      uptime: "99.8%",
      icon: Database,
      color: "green",
    },
    {
      label: "Storage",
      status: "operational",
      uptime: "99.95%",
      icon: Zap,
      color: "green",
    },
    {
      label: "Authentication",
      status: "operational",
      uptime: "100%",
      icon: CheckCircle,
      color: "green",
    },
  ];

  const recentIncidents = [
    {
      id: 1,
      title: "Database Maintenance",
      status: "resolved",
      date: "2 days ago",
      duration: "30 minutes",
    },
    {
      id: 2,
      title: "API Performance Update",
      status: "resolved",
      date: "1 week ago",
      duration: "15 minutes",
    },
  ];

  return (
    <AdminLayout
      title="System Health"
      description="Monitor system status and performance"
    >
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses =
            stat.color === "green"
              ? "from-green-100 to-green-200 border-green-300"
              : "from-yellow-100 to-yellow-200 border-yellow-300";

          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${colorClasses} rounded-xl p-6 backdrop-blur-md border border-white/40`}
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{stat.label}</h4>
                <Icon className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 capitalize">
                    {stat.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.uptime}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Response Time
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">API</span>
                <span className="text-sm font-bold text-green-600">45ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Database
                </span>
                <span className="text-sm font-bold text-green-600">82ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Storage
                </span>
                <span className="text-sm font-bold text-green-600">120ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            Resource Usage
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">CPU</span>
                <span className="text-sm font-bold text-blue-600">34%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Memory</span>
                <span className="text-sm font-bold text-purple-600">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "58%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Disk</span>
                <span className="text-sm font-bold text-pink-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          Recent Incidents
        </h3>

        <div className="space-y-4">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {incident.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {incident.date}
                      </span>
                      <span>{incident.duration}</span>
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {incident.status.charAt(0).toUpperCase() +
                      incident.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No recent incidents
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemHealth;
