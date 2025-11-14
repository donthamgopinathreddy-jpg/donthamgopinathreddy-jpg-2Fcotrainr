import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit2,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader,
  Lock,
  Fingerprint,
  Smile,
  Share2,
  Download,
  Upload,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cmToFeetInchesString, cmToFeetInches, inchesToCm } from "@/lib/utils";
import { useFollowerCounts } from "@/hooks/useFollowerCounts";
import { useReferrals } from "@/hooks/useReferrals";
import { useAchievements } from "@/hooks/useAchievements";
import DailyStepsReward from "@/components/DailyStepsReward";

interface UserType {
  role: "client" | "trainer";
  name: string;
  gender: string;
  height: number;
  weight: number;
  followers: number;
  following: number;
  profilePhoto?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const {
    user: authUser,
    userProfile,
    signOut,
    updateProfile: authUpdateProfile,
  } = useAuth();
  const { counts: followerCounts } = useFollowerCounts(userProfile?.id);
  const { referralCode } = useReferrals();
  const { userAchievements, getTotalPoints } = useAchievements();
  const { theme = "light" } = useTheme() || { theme: "light" };

  const [user, setUser] = useState<UserType>({
    role: userProfile?.role || "client",
    name: userProfile?.full_name || "User",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
    followers: 0,
    following: 0,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [dailySteps, setDailySteps] = useState(8450); // Example value, can be passed as prop

  // Security & Login state
  const [securitySettings, setSecuritySettings] = useState({
    usePIN: false,
    fingerprint: false,
    faceRecognition: false,
  });
  const [isSavingBiometrics, setIsSavingBiometrics] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: userProfile?.full_name || "User",
    email: userProfile?.email || "",
    phone: userProfile?.phone_number || "",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
  });

  // Load biometric settings from database
  useEffect(() => {
    if (userProfile?.id) {
      const loadBiometricSettings = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("fingerprint_enabled, face_recognition_enabled")
            .eq("id", userProfile.id)
            .single();

          if (error) {
            console.error("Error loading biometric settings:", error);
            return;
          }

          if (data) {
            setSecuritySettings((prev) => ({
              ...prev,
              fingerprint: data.fingerprint_enabled || false,
              faceRecognition: data.face_recognition_enabled || false,
            }));
          }
        } catch (error) {
          console.error("Error fetching biometric settings:", error);
        }
      };

      loadBiometricSettings();
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile && followerCounts) {
      setUser({
        role: userProfile.role || "client",
        name: userProfile.full_name || "User",
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
        followers: followerCounts.followers_count,
        following: followerCounts.following_count,
        profilePhoto: userProfile.profile_picture_url,
      });
      setEditForm({
        name: userProfile.full_name || "User",
        email: userProfile.email || "",
        phone: userProfile.phone_number || "",
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
      });
    }
  }, [userProfile, followerCounts]);

  // Generate referral link
  const referralCodeDisplay =
    referralCode || userProfile?.id?.substring(0, 8)?.toUpperCase() || "REFER";
  const referralLink = `${window.location.origin}?ref=${referralCodeDisplay}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    toast.success("✓ Referral link copied!");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0] || !userProfile?.id) return;

    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsSaving(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
          await authUpdateProfile({
            profile_picture_url: dataUrl,
          });

          setUser((prev) => ({
            ...prev,
            profilePhoto: dataUrl,
          }));

          toast.success("��� Profile photo updated!");
        } catch (error: any) {
          console.error("Error saving profile photo:", error);
          const errorMsg =
            error?.message || String(error) || "Failed to save profile photo";
          toast.error(errorMsg);
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing profile photo:", error);
      const errorMsg =
        error?.message || String(error) || "Failed to process profile photo";
      toast.error(errorMsg);
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      if (!authUser) {
        toast.error("User not found");
        return;
      }

      await authUpdateProfile({
        full_name: editForm.name,
        email: editForm.email,
        phone_number: editForm.phone,
        gender: editForm.gender,
        height_cm: editForm.height,
        weight_kg: editForm.weight,
      });

      setUser((prev) => ({
        ...prev,
        name: editForm.name,
        gender: editForm.gender,
        height: editForm.height,
        weight: editForm.weight,
      }));

      toast.success("✓ Profile updated successfully!");
      setShowEditModal(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      const errorMsg =
        error?.message || String(error) || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBiometricToggle = async (
    setting: "fingerprint" | "faceRecognition",
  ) => {
    if (!userProfile?.id) return;

    const newValue = !securitySettings[setting];
    setIsSavingBiometrics(true);

    try {
      const updateData =
        setting === "fingerprint"
          ? { fingerprint_enabled: newValue }
          : { face_recognition_enabled: newValue };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userProfile.id);

      if (error) throw error;

      setSecuritySettings((prev) => ({
        ...prev,
        [setting]: newValue,
      }));

      toast.success(
        `✓ ${setting === "fingerprint" ? "Fingerprint" : "Face Recognition"} ${newValue ? "enabled" : "disabled"}!`,
      );
    } catch (error: any) {
      console.error("Error updating biometric setting:", error);
      toast.error("Failed to update security setting");
    } finally {
      setIsSavingBiometrics(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (error) throw error;

      toast.success("✓ Password updated successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMsg =
        error?.message || String(error) || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const isTrainer = user.role === "trainer";
  const referralCoins = 320;
  const nextRewardCoins = 500;

  // Sample achievements data
  const topAchievements = userAchievements.slice(0, 3);
  const featuredAchievement = userAchievements[0];

  return (
    <div
      className={`min-h-screen pb-24 ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}
    >
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* HEADER SECTION */}
        <div
          className={`rounded-3xl p-6 text-center shadow-sm ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-orange-50 to-amber-50"
          }`}
        >
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-orange-100"
              }`}
            >
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User
                  className={`w-12 h-12 ${theme === "dark" ? "text-gray-400" : "text-orange-600"}`}
                />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-orange-600 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {user.name}
          </h1>

          <div
            className={`text-sm font-semibold inline-block px-4 py-1 rounded-full mb-4 ${
              theme === "dark"
                ? "bg-orange-900/30 text-orange-300"
                : "bg-orange-200 text-orange-800"
            }`}
          >
            {isTrainer ? "⭐ Trainer" : "Member"}
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {user.followers}
              </div>
              <p
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Followers
              </p>
            </div>
            <div className="h-8 w-px bg-orange-300"></div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {user.following}
              </div>
              <p
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Following
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ACCOUNT SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-4 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            <Mail className="w-5 h-5 text-orange-500" />
            Account
          </h2>

          <div className="space-y-3">
            <div>
              <p
                className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Email Address
              </p>
              <p
                className={`text-sm mt-1 break-all ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
              >
                {userProfile?.email || "Not set"}
              </p>
            </div>

            <div>
              <p
                className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Phone Number
              </p>
              <p
                className={`text-sm mt-1 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
              >
                {userProfile?.phone_number || "+91 9876543210"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className={`text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors`}
          >
            → Edit personal details
          </button>
        </div>

        {/* SECURITY & LOGIN SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-4 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            <Lock className="w-5 h-5 text-orange-500" />
            Security & Login
          </h2>

          <div className="space-y-3">
            {/* PIN Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100/50 dark:bg-gray-700/50">
              <span
                className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
              >
                Use device PIN / password
              </span>
              <button
                onClick={() =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    usePIN: !prev.usePIN,
                  }))
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  securitySettings.usePIN ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    securitySettings.usePIN ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Fingerprint Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100/50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-orange-500" />
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                >
                  Enable Fingerprint Unlock
                </span>
              </div>
              <button
                onClick={() => handleBiometricToggle("fingerprint")}
                disabled={isSavingBiometrics}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                  securitySettings.fingerprint ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    securitySettings.fingerprint ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Face Recognition Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100/50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-orange-500" />
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                >
                  Enable Face Recognition
                </span>
              </div>
              <button
                onClick={() => handleBiometricToggle("faceRecognition")}
                disabled={isSavingBiometrics}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                  securitySettings.faceRecognition
                    ? "bg-orange-500"
                    : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    securitySettings.faceRecognition ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Info Box */}
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                theme === "dark"
                  ? "bg-blue-900/30 border border-blue-800"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <Lock
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
              />
              <p
                className={`text-xs ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}
              >
                Your biometric data is never stored on our servers. All
                authentication happens locally on your device.
              </p>
            </div>

            {/* Change Password Section */}
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors mt-2"
              >
                → Change Password
              </button>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          current: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      className={`w-full pr-10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === "dark"
                          ? "bg-gray-900 border border-gray-700 text-white"
                          : "bg-gray-50 border border-gray-300 text-gray-900"
                      }`}
                    />
                    <button
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className={`absolute right-3 top-2.5 ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"}`}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          new: e.target.value,
                        }))
                      }
                      placeholder="Enter new password"
                      className={`w-full pr-10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === "dark"
                          ? "bg-gray-900 border border-gray-700 text-white"
                          : "bg-gray-50 border border-gray-300 text-gray-900"
                      }`}
                    />
                    <button
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className={`absolute right-3 top-2.5 ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"}`}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirm: e.target.value,
                        }))
                      }
                      placeholder="Confirm new password"
                      className={`w-full pr-10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === "dark"
                          ? "bg-gray-900 border border-gray-700 text-white"
                          : "bg-gray-50 border border-gray-300 text-gray-900"
                      }`}
                    />
                    <button
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className={`absolute right-3 top-2.5 ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"}`}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ current: "", new: "", confirm: "" });
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REFERRAL COINS SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-6 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              💰 Referral Coins
            </h2>

            {/* Coins Balance */}
            <div
              className={`rounded-2xl p-6 text-center mb-4 bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg`}
            >
              <p className="text-sm font-semibold opacity-90 mb-2">
                Current Balance
              </p>
              <h3 className="text-4xl font-bold mb-1">{referralCoins}</h3>
              <p className="text-sm opacity-80">Coins</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Next Reward at {nextRewardCoins} coins
                </p>
                <p
                  className={`text-xs font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}
                >
                  {Math.round((referralCoins / nextRewardCoins) * 100)}%
                </p>
              </div>
              <div
                className={`w-full h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
                  style={{
                    width: `${(referralCoins / nextRewardCoins) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Earning Opportunities */}
          <div>
            <h3
              className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Earning Opportunities
            </h3>
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                  >
                    Invite a friend who joins
                  </p>
                </div>
                <span className="text-orange-500 font-bold">+100</span>
              </div>

              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                  >
                    Complete 5 workouts in a week
                  </p>
                </div>
                <span className="text-orange-500 font-bold">+50</span>
              </div>

              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                  >
                    Maintain a 7-day streak
                  </p>
                </div>
                <span className="text-orange-500 font-bold">+75</span>
              </div>
            </div>
          </div>

          {/* Daily Steps Reward Component */}
          <DailyStepsReward
            dailySteps={dailySteps}
            onRewardClaimed={() => {
              toast.success("🎉 Reward claimed! Check your coins.");
            }}
          />

          {/* Referral Sharing Subsection */}
          <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
            <h3
              className={`text-sm font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              🎯 Invite Friends
            </h3>

            <div className="space-y-3">
              {/* Referral Code Box */}
              <div
                className={`rounded-xl p-4 ${
                  theme === "dark"
                    ? "bg-green-900/30 border border-green-800"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <p
                  className={`text-xs font-semibold ${theme === "dark" ? "text-green-300" : "text-green-700"}`}
                >
                  Referral Code
                </p>
                <p
                  className={`text-lg font-bold mt-2 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                >
                  {referralCodeDisplay}
                </p>
              </div>

              {/* Referral Link Box */}
              <div
                className={`rounded-xl p-4 space-y-2 ${
                  theme === "dark"
                    ? "bg-blue-900/30 border border-blue-800"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <p
                  className={`text-xs font-semibold ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}
                >
                  Referral Link
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none overflow-hidden text-ellipsis ${
                      theme === "dark"
                        ? "bg-gray-900 border border-blue-700 text-gray-300"
                        : "bg-white border border-blue-300 text-gray-700"
                    }`}
                  />
                  <button
                    onClick={handleCopyReferralLink}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap text-xs ${
                      referralCopied
                        ? "bg-green-600 text-white"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {referralCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Sharing */}
              <div>
                <p
                  className={`text-xs font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Share on Social
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(`Join me on CoTrainr! ${referralLink}`)}`,
                        "_blank",
                      )
                    }
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() =>
                      window.open(`https://instagram.com`, "_blank")
                    }
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `sms:?body=${encodeURIComponent(`Join me on CoTrainr! ${referralLink}`)}`,
                        "_blank",
                      )
                    }
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    SMS
                  </button>
                </div>
              </div>

              <p
                className={`text-xs text-center pt-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Each friend who joins gives you{" "}
                <span className="font-bold text-orange-500">100 coins</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-6 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            🏆 Achievements
          </h2>

          {/* Achievement Badges Horizontal Scroll */}
          {userAchievements.length > 0 ? (
            <>
              <div className="overflow-x-auto pb-2 -mx-6 px-6">
                <div className="flex gap-3 min-w-min">
                  {topAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center gap-2 flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                          theme === "dark"
                            ? "bg-yellow-900/30 border border-yellow-700"
                            : "bg-yellow-100 border-2 border-yellow-400"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <p
                        className={`text-xs font-semibold text-center max-w-[80px] line-clamp-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {achievement.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Achievement Card */}
              {featuredAchievement && (
                <div
                  className={`rounded-2xl p-6 text-center border-2 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-700"
                      : "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300"
                  }`}
                >
                  <div className="text-5xl mb-4 flex justify-center">
                    {featuredAchievement.icon}
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {featuredAchievement.title}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Great job keeping up the pace!
                  </p>
                  <p
                    className={`text-xs mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Unlocked{" "}
                    {new Date(
                      featuredAchievement.unlocked_at,
                    ).toLocaleDateString()}
                  </p>

                  {/* Social Sharing Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        toast.success("Share feature coming soon!")
                      }
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </button>
                    <button
                      onClick={() =>
                        toast.success("Share feature coming soon!")
                      }
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() =>
                        toast.success("Download feature coming soon!")
                      }
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div
                className={`rounded-lg p-3 text-center text-sm font-semibold ${
                  theme === "dark"
                    ? "bg-purple-900/30 border border-purple-800 text-purple-300"
                    : "bg-purple-50 border border-purple-200 text-purple-700"
                }`}
              >
                Total Points:{" "}
                <span className="text-lg">{getTotalPoints()}</span>
              </div>
            </>
          ) : (
            <div
              className={`rounded-lg p-6 text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                No achievements yet. Complete workouts to unlock achievements!
              </p>
            </div>
          )}
        </div>

        {/* TRAINER VERIFICATION SECTION (conditional) */}
        {isTrainer && (
          <div
            className={`rounded-2xl p-6 space-y-4 shadow-sm border-2 border-amber-400 ${
              theme === "dark"
                ? "bg-gradient-to-br from-amber-900/30 to-orange-900/30"
                : "bg-gradient-to-br from-amber-50 to-orange-50"
            }`}
          >
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              ✓ Trainer Verification
            </h2>

            <div className="space-y-3">
              {/* Upload ID Step */}
              <div
                className={`rounded-xl p-4 flex items-center gap-4 ${
                  theme === "dark"
                    ? "bg-gray-700/50 border border-gray-600"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Upload ID Document
                  </p>
                  <p
                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Upload a clear photo of your government ID
                  </p>
                </div>
                <button
                  className={`p-2 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>

              {/* Selfie Step */}
              <div
                className={`rounded-xl p-4 flex items-center gap-4 ${
                  theme === "dark"
                    ? "bg-gray-700/50 border border-gray-600"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Take a Selfie for Verification
                  </p>
                  <p
                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    A quick photo to verify your identity
                  </p>
                </div>
                <button
                  className={`p-2 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Info Box */}
              <div
                className={`rounded-xl p-4 flex items-start gap-3 ${
                  theme === "dark"
                    ? "bg-green-900/30 border border-green-800"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <Lock
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                />
                <p
                  className={`text-xs ${theme === "dark" ? "text-green-300" : "text-green-700"}`}
                >
                  Your documents are encrypted and only used for identity
                  verification. We never share your data.
                </p>
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Start Verification
              </button>
            </div>
          </div>
        )}

        {/* ADDITIONAL MENU ITEMS */}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/user/${userProfile?.username}`)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <User
              className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            />
            <span
              className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              View My Public Profile
            </span>
          </button>

          <button
            onClick={async () => {
              try {
                await signOut();
                toast.success("Logged out successfully");
                setTimeout(() => {
                  navigate("/login", { replace: true });
                }, 500);
              } catch (error) {
                console.error("Logout error:", error);
                toast.error("Failed to logout");
              }
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-800/50 border border-gray-700/50 hover:bg-red-900/30 text-red-400"
                : "bg-white border border-gray-200 hover:bg-red-50 text-red-600"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Edit Profile
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`text-2xl leading-none ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Gender
                </label>
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Height
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Feet
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      min="0"
                      max="10"
                      value={
                        editForm.height > 0
                          ? cmToFeetInches(editForm.height).feet
                          : ""
                      }
                      onChange={(e) => {
                        const feet = parseInt(e.target.value) || 0;
                        const inches =
                          editForm.height > 0
                            ? cmToFeetInches(editForm.height).inches
                            : 0;
                        const totalInches = feet * 12 + inches;
                        setEditForm((prev) => ({
                          ...prev,
                          height: inchesToCm(totalInches),
                        }));
                      }}
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === "dark"
                          ? "border border-gray-700 bg-gray-900 text-white"
                          : "border border-gray-300 bg-white text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Inches
                    </label>
                    <input
                      type="number"
                      placeholder="11"
                      min="0"
                      max="11"
                      value={
                        editForm.height > 0
                          ? cmToFeetInches(editForm.height).inches
                          : ""
                      }
                      onChange={(e) => {
                        const feet =
                          editForm.height > 0
                            ? cmToFeetInches(editForm.height).feet
                            : 0;
                        const inches = parseInt(e.target.value) || 0;
                        const totalInches = feet * 12 + inches;
                        setEditForm((prev) => ({
                          ...prev,
                          height: inchesToCm(totalInches),
                        }));
                      }}
                      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        theme === "dark"
                          ? "border border-gray-700 bg-gray-900 text-white"
                          : "border border-gray-300 bg-white text-gray-900"
                      }`}
                    />
                  </div>
                </div>
                {editForm.height > 0 && (
                  <p
                    className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {cmToFeetInchesString(editForm.height)} ({editForm.height}{" "}
                    cm)
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      weight: Number(e.target.value),
                    }))
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className={`flex-1 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
