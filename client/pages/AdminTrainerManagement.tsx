import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Camera,
  Loader,
  Award,
} from "lucide-react";

interface Trainer {
  id: string;
  full_name: string;
  email: string;
  verified_trainer: boolean;
  verification_status: string;
  created_at: string;
}

const AdminTrainerManagement: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, verified_trainer, verification_status, created_at")
        .eq("role", "trainer")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (err) {
      console.error("Error fetching trainers:", err);
    } finally {
      setLoading(false);
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

  const verifiedCount = trainers.filter((t) => t.verified_trainer).length;
  const pendingCount = trainers.filter((t) => t.verification_status === "pending").length;

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
          <h1 className="text-4xl font-bold text-gray-900">Trainer Management</h1>
          <p className="text-gray-600 mt-2">Manage trainers and their profiles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold uppercase">Total Trainers</p>
                <p className="text-4xl font-black text-green-900 mt-2">{trainers.length}</p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-semibold uppercase">Verified</p>
                <p className="text-4xl font-black text-emerald-900 mt-2">{verifiedCount}</p>
              </div>
              <Award className="w-12 h-12 text-emerald-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-semibold uppercase">Pending</p>
                <p className="text-4xl font-black text-teal-900 mt-2">{pendingCount}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-teal-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Trainer List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">All Trainers</h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {trainers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No trainers found</p>
              ) : (
                trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{trainer.full_name}</p>
                      <p className="text-sm text-gray-600">{trainer.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {trainer.verified_trainer && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <Star className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trainer.verification_status === "approved"
                            ? "bg-green-100 text-green-700"
                            : trainer.verification_status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {trainer.verification_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTrainerManagement;
