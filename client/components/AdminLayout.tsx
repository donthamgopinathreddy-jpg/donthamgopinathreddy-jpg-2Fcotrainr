import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useNotificationPreferences, type NotificationPreferences } from "@/hooks/useNotificationPreferences";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "@/lib/supabase";
import { X, Bell, Clock, LogOut, User, ChevronDown } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, description }) => {
  const { userProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { logs: activityLogs } = useActivityLog(userProfile?.id);
  const { preferences: notifPrefs, updatePreferences: updateNotifPrefs } =
    useNotificationPreferences(userProfile?.id);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      setUploadingPic(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const canvas = document.createElement("canvas");
      const img = new Image();

      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          img.onload = () => {
            try {
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

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Password changed successfully!",
        variant: "default",
      });

      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setShowPasswordFields(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Password change error:", errorMsg);

      toast({
        title: "Error",
        description: errorMsg || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        showSettings={showSettings}
        onSettingsChange={setShowSettings}
        onLogout={handleLogout}
        onProfilePictureUpload={handleProfilePictureUpload}
        uploadingPic={uploadingPic}
        showActivityLog={showActivityLog}
        onActivityLogChange={setShowActivityLog}
        showNotificationPrefs={showNotificationPrefs}
        onNotificationPrefsChange={setShowNotificationPrefs}
      />

      {/* Main Content */}
      <main className="md:ml-64 transition-all duration-300">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 md:px-8 py-6">
            <div className="max-w-7xl">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {description && <p className="text-gray-600 mt-1">{description}</p>}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {userProfile?.profile_picture_url ? (
                      <img
                        src={userProfile.profile_picture_url}
                        alt={userProfile.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{userProfile?.full_name}</p>
                        <p className="text-xs text-gray-500">{userProfile?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                      >
                        <User className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm border-t border-gray-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="px-4 md:px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Picture</h3>
                    <div className="flex flex-col items-center gap-4">
                      <label className="relative cursor-pointer group w-full">
                        {userProfile?.profile_picture_url ? (
                          <img
                            src={userProfile.profile_picture_url}
                            alt={userProfile.full_name}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-6xl">
                            {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
                          <div className="bg-pink-600 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPic}
                          onChange={handleProfilePictureUpload}
                        />
                      </label>
                      <p className="text-xs text-gray-500 text-center">Click to change picture</p>
                    </div>
                  </div>

                  {/* Admin Info & Password */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 font-medium text-sm">Email</p>
                        <p className="text-gray-900 text-sm mt-1">{userProfile?.email}</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => setShowActivityLog(true)}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        View Activity Log
                      </button>
                      <button
                        onClick={() => setShowNotificationPrefs(true)}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        Notification Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="px-4 md:px-8 py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPasswordChange(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setShowPasswordFields(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!showPasswordFields ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Update your admin password to keep your account secure.
                  </p>
                  <button
                    onClick={() => setShowPasswordFields(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Update Password
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      disabled={changingPassword}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      disabled={changingPassword}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setShowPasswordFields(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={changingPassword}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {showPasswordFields && (
                <button
                  onClick={handlePasswordChange}
                  disabled={!newPassword || !confirmPassword || changingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowActivityLog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
              <button
                onClick={() => setShowActivityLog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500">No activity recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{log.action}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-sm text-gray-600 mb-1">{log.description}</p>
                      )}
                      {log.resource_type && (
                        <p className="text-xs text-gray-500">Resource: {log.resource_type}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotificationPrefs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNotificationPrefs(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <button
                onClick={() => setShowNotificationPrefs(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {notifPrefs ? (
                <div className="space-y-4">
                  {[
                    {
                      key: "email_notifications",
                      label: "Email Notifications",
                      desc: "Receive notifications via email",
                    },
                    {
                      key: "in_app_notifications",
                      label: "In-App Notifications",
                      desc: "See notifications in the app",
                    },
                    {
                      key: "trainer_verifications",
                      label: "Trainer Verifications",
                      desc: "Alerts for trainer verification updates",
                    },
                    {
                      key: "user_activity",
                      label: "User Activity",
                      desc: "Notifications about user activity",
                    },
                    {
                      key: "system_alerts",
                      label: "System Alerts",
                      desc: "Critical system notifications",
                    },
                  ].map((pref) => (
                    <label
                      key={pref.key}
                      className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={
                          notifPrefs[pref.key as keyof NotificationPreferences] as unknown as boolean
                        }
                        onChange={(e) => {
                          updateNotifPrefs({
                            [pref.key]: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Loading preferences...</p>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowNotificationPrefs(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
