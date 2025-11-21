import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalTrainers: number;
  totalBookings: number;
  totalMessages: number;
}

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTrainers: 0,
    totalBookings: 0,
    totalMessages: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (userProfile && userProfile.role !== "admin") {
      navigate("/");
      return;
    }
  }, [userProfile, navigate]);

  // Fetch admin stats and data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch all users
        const { data: allUsers, error: usersError } = await supabase
          .from("users")
          .select("*");

        if (usersError) throw usersError;

        // Fetch all trainers
        const { data: allTrainers, error: trainersError } = await supabase
          .from("trainers")
          .select("*");

        if (trainersError) throw trainersError;

        // Fetch all bookings
        const { data: allBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*");

        if (bookingsError) throw bookingsError;

        // Fetch all messages
        const { data: allMessages, error: messagesError } = await supabase
          .from("messages")
          .select("*");

        if (messagesError) throw messagesError;

        setStats({
          totalUsers: allUsers?.length || 0,
          totalTrainers: allTrainers?.length || 0,
          totalBookings: allBookings?.length || 0,
          totalMessages: allMessages?.length || 0,
        });

        setUsers(allUsers || []);
        setTrainers(allTrainers || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.role === "admin") {
      fetchAdminData();
    }
  }, [userProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (!userProfile || userProfile.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 overflow-y-auto`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-slate-700 p-2 rounded"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "users", label: "Users", icon: Users },
            { id: "trainers", label: "Trainers", icon: BookOpen },
            { id: "bookings", label: "Bookings", icon: Calendar },
            { id: "messages", label: "Messages", icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === id
                  ? "bg-orange-500 text-white"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 text-gray-300 transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome, {userProfile?.full_name || "Admin"}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Users",
                    value: stats.totalUsers,
                    icon: Users,
                    color: "blue",
                  },
                  {
                    title: "Total Trainers",
                    value: stats.totalTrainers,
                    icon: BookOpen,
                    color: "purple",
                  },
                  {
                    title: "Total Bookings",
                    value: stats.totalBookings,
                    icon: Calendar,
                    color: "green",
                  },
                  {
                    title: "Total Messages",
                    value: stats.totalMessages,
                    icon: MessageSquare,
                    color: "orange",
                  },
                ].map(({ title, value, icon: Icon, color }) => (
                  <div
                    key={title}
                    className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {value}
                        </p>
                      </div>
                      <Icon className="w-12 h-12 text-gray-300 opacity-50" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                    View All Users
                  </button>
                  <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition">
                    View All Trainers
                  </button>
                  <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition">
                    View All Bookings
                  </button>
                  <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">
                    View All Messages
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.full_name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : user.role === "trainer"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trainers Tab */}
          {activeTab === "trainers" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  All Trainers
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Trainer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Experience
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Rate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Verified
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : trainers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No trainers found
                        </td>
                      </tr>
                    ) : (
                      trainers.map((trainer) => (
                        <tr key={trainer.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {trainer.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {trainer.years_of_experience || "—"} years
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ${trainer.hourly_rate || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {trainer.rating || "—"} ⭐
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {trainer.verified ? (
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <Shield className="w-4 h-4" /> Verified
                              </span>
                            ) : (
                              <span className="text-gray-500">Not Verified</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings & Messages Tabs - Placeholder */}
          {(activeTab === "bookings" || activeTab === "messages") && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {activeTab === "bookings" ? "Bookings Management" : "Messages Management"}
              </h3>
              <p className="text-gray-500">
                Comprehensive management tools coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
