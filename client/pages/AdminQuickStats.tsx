import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Zap,
  Loader,
} from "lucide-react";

const AdminQuickStats: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { stats, loading } = useAdminDashboard();

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  return (
    <AdminLayout
      title="Quick Stats"
      description="Real-time platform statistics and metrics"
    >
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-6 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-red-400/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold uppercase">
                Today's Signups
              </p>
              <p className="text-4xl font-black text-red-900 mt-2">
                {stats.todaySignups}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-red-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-pink-400/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-600 font-semibold uppercase">
                This Week
              </p>
              <p className="text-4xl font-black text-pink-900 mt-2">
                {stats.weekSignups}
              </p>
            </div>
            <Users className="w-12 h-12 text-pink-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl p-6 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-rose-400/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-600 font-semibold uppercase">
                Pending Review
              </p>
              <p className="text-4xl font-black text-rose-900 mt-2">
                {stats.pendingVerifications}
              </p>
            </div>
            <Clock className="w-12 h-12 text-rose-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 rounded-xl p-6 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-fuchsia-400/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-fuchsia-600 font-semibold uppercase">
                Completed
              </p>
              <p className="text-4xl font-black text-fuchsia-900 mt-2">
                {stats.approvedVerifications}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-fuchsia-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Platform Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Platform Overview
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="text-sm font-semibold text-purple-600">
                  Total Trainers
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalTrainers}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div>
                <p className="text-sm font-semibold text-indigo-600">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">
                  {stats.totalClients}
                </p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Verification Status
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <p className="text-sm font-semibold text-amber-600">Pending</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {stats.pendingVerifications}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-semibold text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.approvedVerifications}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="text-sm font-semibold text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {stats.rejectedVerifications}
                </p>
              </div>
              <Zap className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "View All Trainers", color: "red" },
            { label: "Send Notification", color: "pink" },
            { label: "Check System Health", color: "rose" },
            { label: "View Analytics", color: "blue" },
            { label: "Manage Users", color: "purple" },
            { label: "View Audit Logs", color: "indigo" },
          ].map((action, idx) => {
            const colorClasses = {
              red: "from-red-400 to-red-600 hover:shadow-red-400/50",
              pink: "from-pink-400 to-pink-600 hover:shadow-pink-400/50",
              rose: "from-rose-400 to-rose-600 hover:shadow-rose-400/50",
              blue: "from-blue-400 to-blue-600 hover:shadow-blue-400/50",
              purple:
                "from-purple-400 to-purple-600 hover:shadow-purple-400/50",
              indigo:
                "from-indigo-400 to-indigo-600 hover:shadow-indigo-400/50",
            };

            return (
              <button
                key={idx}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${
                  colorClasses[action.color as keyof typeof colorClasses]
                } text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200`}
              >
                <Zap className="w-5 h-5" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-gray-700">
            Updating real-time data...
          </span>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuickStats;
