import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Activity,
  Database,
  Zap,
  Server,
  Settings,
  LogOut,
  Camera,
  Loader,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const AdminSystemHealth: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

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
      e.target.value = "";
    } catch (err) {
      console.error("Error:", err);
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

  const logs = [
    { id: 1, action: "Trainer Approved", user: "User #123", time: "2 mins ago", status: "success" },
    { id: 2, action: "User Suspended", user: "User #456", time: "15 mins ago", status: "warning" },
    { id: 3, action: "Notification Sent", user: "System", time: "1 hour ago", status: "success" },
    { id: 4, action: "Database Backup", user: "System", time: "2 hours ago", status: "success" },
    { id: 5, action: "Failed Login Attempt", user: "User #789", time: "3 hours ago", status: "error" },
  ];

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
          <h1 className="text-4xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-2">Monitor system status and audit logs</p>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold uppercase">API Status</p>
                <p className="text-3xl font-black text-slate-900 mt-2">100%</p>
              </div>
              <Server className="w-12 h-12 text-slate-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">Database</p>
                <p className="text-3xl font-black text-gray-900 mt-2">98%</p>
              </div>
              <Database className="w-12 h-12 text-gray-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 font-semibold uppercase">Response Time</p>
                <p className="text-3xl font-black text-zinc-900 mt-2">145ms</p>
              </div>
              <Zap className="w-12 h-12 text-zinc-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 font-semibold uppercase">Uptime</p>
                <p className="text-3xl font-black text-stone-900 mt-2">99.9%</p>
              </div>
              <Activity className="w-12 h-12 text-stone-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  {log.status === "success" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : log.status === "warning" ? (
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">{log.user}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemHealth;
