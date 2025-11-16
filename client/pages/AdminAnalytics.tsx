import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Loader,
} from "lucide-react";

const AdminAnalytics: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useAdminDashboard();

  const [approvalRate, setApprovalRate] = useState(0);
  const [rejectionRate, setRejectionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data: verifications, error } = await supabase
          .from("trainer_verifications")
          .select("verification_status");

        if (error) throw error;

        if (verifications) {
          const approved = verifications.filter(
            (v) => v.verification_status === "approved"
          ).length;
          const total = verifications.length;

          if (total > 0) {
            setApprovalRate(Math.round((approved / total) * 100));
            setRejectionRate(100 - Math.round((approved / total) * 100));
          }
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  return (
    <AdminLayout
      title="Analytics Dashboard"
      description="View platform analytics and insights"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase">
                Total Users
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold uppercase">
                Total Trainers
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats.totalTrainers}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold uppercase">
                Verified
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats.approvedVerifications}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold uppercase">
                Pending
              </p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {stats.pendingVerifications}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Approval Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Approval Rate</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Approved
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {approvalRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Rejected
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {rejectionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${rejectionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Breakdown</h3>
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Trainers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalTrainers}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {((stats.totalTrainers / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 font-semibold">Clients</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.totalClients}
                </p>
              </div>
              <span className="text-sm font-semibold text-purple-600">
                {((stats.totalClients / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Verification Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-semibold">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {stats.pendingVerifications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold">Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.approvedVerifications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold">Rejected</p>
                <p className="text-3xl font-bold text-red-900 mt-1">
                  {stats.rejectedVerifications}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
