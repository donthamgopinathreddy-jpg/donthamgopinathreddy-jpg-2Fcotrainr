import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Camera,
  Loader,
  Users,
} from "lucide-react";

const AdminCommunication: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [title, setTitle] = useState("");

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

      const { error: updateError } = await updateProfile({ profile_picture_url: imageData });

      if (updateError) {
        throw new Error(updateError.message);
      }

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

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Notification sent to ${recipientType}`,
      variant: "default",
    });

    setTitle("");
    setMessage("");
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
          <h1 className="text-4xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-2">Send notifications and messages to users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-semibold uppercase">Sent Today</p>
                <p className="text-4xl font-black text-orange-900 mt-2">12</p>
              </div>
              <Send className="w-12 h-12 text-orange-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-semibold uppercase">Pending</p>
                <p className="text-4xl font-black text-amber-900 mt-2">3</p>
              </div>
              <Bell className="w-12 h-12 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-semibold uppercase">Delivered</p>
                <p className="text-4xl font-black text-yellow-900 mt-2">89</p>
              </div>
              <MessageSquare className="w-12 h-12 text-yellow-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Send Notification */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Send Notification</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Send To
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["all", "trainers", "clients", "admin"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRecipientType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      recipientType === type
                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                        : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    {type === "all" ? "All Users" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendNotification}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-400/50 transition-all duration-200"
            >
              <Send className="w-5 h-5" />
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunication;
