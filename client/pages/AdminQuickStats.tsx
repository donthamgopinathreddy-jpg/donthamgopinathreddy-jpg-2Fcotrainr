import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Settings,
  LogOut,
  Camera,
  Loader,
  Zap,
} from "lucide-react";

const AdminQuickStats: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [stats, setStats] = useState({
    todaySignups: 0,
    thisWeekSignups: 0,
    pendingVerifications: 0,
    completedVerifications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: users } = await supabase
        .from("users")
        .select("id, created_at, role");

      const { data: trainers } = await supabase
        .from("users")
        .select("id, verification_status")
        .eq("role", "trainer");

      if (users) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const todayCount = users.filter(
          (u) => new Date(u.created_at) >= today
        ).length;

        const weekCount = users.filter(
          (u) => new Date(u.created_at) >= thisWeek
        ).length;

        setStats((prev) => ({
          ...prev,
          todaySignups: todayCount,
          thisWeekSignups: weekCount,
        }));
      }

      if (trainers) {
        const pending = trainers.filter(
          (t) => t.verification_status === "pending"
        ).length;
        const completed = trainers.filter(
          (t) => t.verification_status === "approved" ||
                 t.verification_status === "rejected"
        ).length;

        setStats((prev) => ({
          ...prev,
          pendingVerifications: pending,
          completedVerifications: completed,
        }));
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      setUploadingPic(true);

      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const MAX_SIZE = 400;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_SIZE) {
                  height = Math.round((height * MAX_SIZE) / width);
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width = Math.round((width * MAX_SIZE) / height);
                  height = MAX_SIZE;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Failed to get canvas context");
              ctx.drawImage(img, 0, 0, width, height);
              const compressedData = canvas.toDataURL("image/jpeg", 0.8);
              resolve(compressedData);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = result;
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      await updateProfile({ profile_picture_url: imageData });

      toast({
        title: "Success",
        description: "Profile picture saved!",
        variant: "default",
      });

      e.target.value = "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: errorMsg || "Failed to save profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingPic(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <label className="relative cursor-pointer group">
                {userProfile?.profile_picture_url ? (
                  <img
                    src={userProfile.profile_picture_url}
                    alt={userProfile.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                  </div>
                )}

                <div className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
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
                  onChange={handleProfilePictureUpload}
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {userProfile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Today's Stats</h1>
          <p className="text-gray-600 mt-2">Quick overview of today's platform activity</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-red-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold uppercase">Today's Signups</p>
                <p className="text-4xl font-black text-red-900 mt-2">{stats.todaySignups}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-red-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-pink-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-semibold uppercase">This Week</p>
                <p className="text-4xl font-black text-pink-900 mt-2">{stats.thisWeekSignups}</p>
              </div>
              <Users className="w-12 h-12 text-pink-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-rose-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600 font-semibold uppercase">Pending Review</p>
                <p className="text-4xl font-black text-rose-900 mt-2">{stats.pendingVerifications}</p>
              </div>
              <Clock className="w-12 h-12 text-rose-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-fuchsia-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fuchsia-600 font-semibold uppercase">Completed</p>
                <p className="text-4xl font-black text-fuchsia-900 mt-2">{stats.completedVerifications}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-fuchsia-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "View All Trainers", icon: Users, color: "red" },
              { label: "Send Notification", icon: Zap, color: "pink" },
              { label: "Check System Health", icon: TrendingUp, color: "rose" },
              { label: "View Analytics", icon: Users, color: "fuchsia" },
              { label: "Manage Users", icon: Users, color: "red" },
              { label: "View Audit Logs", icon: Clock, color: "pink" },
            ].map((action, idx) => {
              const Icon = action.icon;
              const colorClasses = {
                red: "from-red-400 to-red-600 hover:shadow-red-400/50",
                pink: "from-pink-400 to-pink-600 hover:shadow-pink-400/50",
                rose: "from-rose-400 to-rose-600 hover:shadow-rose-400/50",
                fuchsia: "from-fuchsia-400 to-fuchsia-600 hover:shadow-fuchsia-400/50",
              };

              return (
                <button
                  key={idx}
                  onClick={() => console.log(`Action: ${action.label}`)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${
                    colorClasses[action.color as keyof typeof colorClasses]
                  } text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                  <Icon className="w-5 h-5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickStats;
