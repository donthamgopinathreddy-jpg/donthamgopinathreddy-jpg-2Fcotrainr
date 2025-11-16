import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  LogOut,
  X,
  Camera,
  Loader,
} from "lucide-react";

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [approvalRate, setApprovalRate] = useState(85);
  const [rejectionRate, setRejectionRate] = useState(15);
  const [userGrowth, setUserGrowth] = useState([45, 52, 48, 61, 55, 67]);

  useEffect(() => {
    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const { data: trainers } = await supabase
          .from("users")
          .select("verification_status")
          .eq("role", "trainer");

        if (trainers) {
          const approved = trainers.filter(
            (t) => t.verification_status === "approved"
          ).length;
          const total = trainers.length;
          if (total > 0) {
            setApprovalRate(Math.round((approved / total) * 100));
            setRejectionRate(100 - Math.round((approved / total) * 100));
          }
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

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

      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_picture_url: imageData })
        .eq("id", userProfile.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      await updateProfile({ profile_picture_url: imageData });

      toast({
        title: "Success",
        description: "Profile picture saved successfully!",
        variant: "default",
      });

      e.target.value = "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Profile picture upload error:", errorMsg);
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
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page</p>
        </div>
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Trainer Verification"
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track platform performance and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-blue-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold uppercase">
                  Approval Rate
                </p>
                <p className="text-4xl font-black text-blue-900 mt-2">
                  {approvalRate}%
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold uppercase">
                  Rejection Rate
                </p>
                <p className="text-4xl font-black text-purple-900 mt-2">
                  {rejectionRate}%
                </p>
              </div>
              <XCircle className="w-12 h-12 text-purple-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-indigo-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-semibold uppercase">
                  Avg Review Time
                </p>
                <p className="text-4xl font-black text-indigo-900 mt-2">
                  2.3d
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-indigo-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl p-6 backdrop-blur-md border border-white/20 hover:shadow-lg hover:shadow-cyan-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-semibold uppercase">
                  Completion Rate
                </p>
                <p className="text-4xl font-black text-cyan-900 mt-2">
                  92%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-cyan-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Approval Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Approval Distribution
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Approved
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {approvalRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Rejected
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {rejectionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                    style={{ width: `${rejectionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Growth Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-3">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                User Growth (Last 6 Months)
              </h3>
            </div>

            <div className="flex items-end justify-around gap-2 h-32">
              {userGrowth.map((value, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-gradient-to-t from-green-400 to-green-600 rounded-lg w-8"
                    style={{ height: `${(value / 70) * 120}px` }}
                  />
                  <span className="text-xs text-gray-600">
                    {["J", "F", "M", "A", "M", "J"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Key Performance Indicators
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-semibold mb-2">
                Total Submissions
              </p>
              <p className="text-3xl font-bold text-orange-900">142</p>
              <p className="text-xs text-orange-600 mt-2">+12 this month</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <p className="text-sm text-red-600 font-semibold mb-2">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-red-900">18</p>
              <p className="text-xs text-red-600 mt-2">3.5 days avg wait</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-sm text-green-600 font-semibold mb-2">
                Verified Trainers
              </p>
              <p className="text-3xl font-bold text-green-900">89</p>
              <p className="text-xs text-green-600 mt-2">+5 this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
