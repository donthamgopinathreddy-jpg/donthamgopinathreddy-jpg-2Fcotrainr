import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Mail,
  MapPin,
  UserCheck,
  Shield,
  Loader,
  Calendar,
} from "lucide-react";

interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  country?: string;
  role: string;
  created_at: string;
  updated_at: string;
  profile_picture_url?: string;
}

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUser(data);
      setNewRole(data.role);
    } catch (err) {
      console.error("Error fetching user:", err);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!user || newRole === user.role) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", user.id)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        setUser({ ...user, role: newRole });
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
      } else {
        throw new Error("No data returned from update");
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      toast({
        title: "Error",
        description: `Failed to update user role: ${err instanceof Error ? err.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  if (loading) {
    return (
      <AdminLayout title="User Details" description="Loading...">
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User Not Found" description="">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={user.full_name}
      description="User account and role management"
    >
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            User Information
          </h2>

          <div className="space-y-6">
            {/* Profile Picture */}
            {user.profile_picture_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={user.profile_picture_url}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            )}

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Full Name
                </label>
                <p className="text-gray-900 font-medium">{user.full_name}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Location
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {user.country || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Account Created
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Management Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Management
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Current Role
              </label>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === "trainer"
                      ? "bg-purple-100 text-purple-700"
                      : user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Change Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              >
                <option value="client" className="text-gray-900">Client</option>
                <option value="trainer" className="text-gray-900">Trainer</option>
                <option value="admin" className="text-gray-900">Admin</option>
              </select>
            </div>

            <button
              onClick={handleRoleChange}
              disabled={updating || newRole === user.role}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {updating ? "Updating..." : "Update Role"}
            </button>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p>
                <strong>Note:</strong> Changing a user's role will update their
                permissions and access across the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
