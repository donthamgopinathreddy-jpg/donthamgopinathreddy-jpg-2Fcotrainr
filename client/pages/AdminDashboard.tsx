import { useState, useEffect } from "react";
import {
  Users,
  LogOut,
  Menu,
  X,
  Eye,
  Trash2,
  Shield,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import AdminSidebar from "@/components/AdminSidebar";

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  created_at: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  phone_number?: string;
  age?: number;
  profile_picture_url?: string;
}

interface LoginLog {
  id: string;
  email: string;
  login_status: string;
  login_time: string;
  ip_address: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "logs">(
    "overview",
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrainers: 0,
    totalClients: 0,
    lastLoginCount: 0,
  });

  // Redirect if not admin
  useEffect(() => {
    if (userProfile && userProfile.role !== "admin") {
      navigate("/");
      return;
    }
  }, [userProfile, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch users (excluding demo users)
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*");

        if (!usersError && usersData) {
          // Filter out demo users (demo users have IDs starting with "demo-user")
          const realUsers = usersData.filter(
            (u) => !u.id.startsWith("demo-user") && !u.id.includes("demo")
          );
          setUsers(realUsers);

          const trainers = realUsers.filter((u) => u.role === "trainer").length;
          const clients = realUsers.filter((u) => u.role === "client").length;

          setStats({
            totalUsers: realUsers.length,
            totalTrainers: trainers,
            totalClients: clients,
            lastLoginCount: 0,
          });
        }

        // Fetch login logs
        const { data: logsData, error: logsError } = await supabase
          .from("user_login_logs")
          .select("*")
          .order("login_time", { ascending: false })
          .limit(50);

        if (!logsError && logsData) {
          setLoginLogs(logsData);
          const lastLogin = logsData.filter(
            (l) => l.login_status === "success",
          ).length;
          setStats((prev) => ({ ...prev, lastLoginCount: lastLogin }));
        }

        // Fetch activity logs
        const { data: activityData, error: activityError } = await supabase
          .from("user_activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!activityError && activityData) {
          setActivityLogs(activityData);
        }
      } catch (error: any) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [userProfile]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // Delete user from public.users table
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteError) {
        toast.error("Failed to delete user");
        return;
      }

      // Log admin action
      await supabase.from("admin_action_logs").insert({
        admin_id: userProfile?.id,
        action_type: "user_deleted",
        target_user_id: userId,
        description: `Admin deleted user ${userId}`,
      });

      // Refresh users (excluding demo users)
      const { data: usersData } = await supabase.from("users").select("*");
      if (usersData) {
        const realUsers = usersData.filter(
          (u) => !u.id.startsWith("demo-user") && !u.id.includes("demo")
        );
        setUsers(realUsers);
        toast.success("User deleted successfully");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto`}
      >
        <AdminSidebar isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {userProfile?.full_name || userProfile?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "logs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Activity Logs
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4">
                  <svg viewBox="0 0 50 50">
                    <circle
                      className="opacity-30"
                      cx="25"
                      cy="25"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      className="text-blue-600"
                      cx="25"
                      cy="25"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray="100"
                      strokeDashoffset="75"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </p>
                    </div>
                    <Users className="text-blue-600" size={32} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Trainers</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalTrainers}
                      </p>
                    </div>
                    <Shield className="text-green-600" size={32} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Clients</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalClients}
                      </p>
                    </div>
                    <Activity className="text-purple-600" size={32} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Recent Logins</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.lastLoginCount}
                      </p>
                    </div>
                    <Clock className="text-orange-600" size={32} />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      <Activity
                        size={20}
                        className="text-blue-600 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 capitalize">
                          {log.activity_type.replace(/_/g, " ")}
                        </p>
                        {log.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {log.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && !loading && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Gender
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Height
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Weight
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Age
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {user.profile_picture_url && (
                              <img
                                src={user.profile_picture_url}
                                alt={user.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <span className="font-medium">
                              {user.full_name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {user.username || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : user.role === "trainer"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {user.gender || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {user.height_cm ? `${user.height_cm} cm` : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {user.weight_kg ? `${user.weight_kg} kg` : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {user.age || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {user.phone_number || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center gap-1 ml-auto"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && !loading && (
            <div className="space-y-6">
              {/* Login Logs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Login History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loginLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                log.login_status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {log.login_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(log.login_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {log.ip_address || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Logs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  User Activity
                </h2>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      <Activity
                        size={20}
                        className="text-blue-600 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 capitalize">
                          {log.activity_type.replace(/_/g, " ")}
                        </p>
                        {log.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {log.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
