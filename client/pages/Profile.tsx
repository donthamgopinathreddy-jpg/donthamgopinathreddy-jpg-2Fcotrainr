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
  Instagram,
  MessageCircle,
  Sun,
  Moon,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cmToFeetInchesString, cmToFeetInches, inchesToCm } from "@/lib/utils";
import { useFollowerCounts } from "@/hooks/useFollowerCounts";
import { useReferrals } from "@/hooks/useReferrals";
import { useAchievements } from "@/hooks/useAchievements";
import { useHealthSync } from "@/hooks/useHealthSync";
import { useClientDietPlans } from "@/hooks/useClientDietPlans";
import DailyStepsReward from "@/components/DailyStepsReward";

interface UserType {
  role: "client" | "trainer";
  name: string;
  username?: string;
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
  const { theme = "light", toggleTheme } = useTheme();
  const { todaySteps: syncedSteps, isAvailable: isHealthSyncAvailable } =
    useHealthSync();
  const { dietPlans: sharedDietPlans, loading: loadingDietPlans } =
    useClientDietPlans();

  const [user, setUser] = useState<UserType>({
    role: userProfile?.role || "client",
    name: userProfile?.full_name || "User",
    username: userProfile?.username,
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
  const [dailySteps, setDailySteps] = useState(0);

  const [securitySettings, setSecuritySettings] = useState({
    usePIN: false,
    fingerprint: false,
    faceRecognition: false,
  });
  const [isSavingBiometrics, setIsSavingBiometrics] = useState(false);

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

  const [editForm, setEditForm] = useState({
    name: userProfile?.full_name || "User",
    username: userProfile?.username || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone_number || "",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
  });

  const [verificationDocs, setVerificationDocs] = useState({
    idUploaded: false,
    selfieUploaded: false,
  });
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  useEffect(() => {
    if (isHealthSyncAvailable && syncedSteps > 0) {
      setDailySteps(syncedSteps);
    }
  }, [syncedSteps, isHealthSyncAvailable]);

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
            console.debug("Load biometric settings error:", error?.code);
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
          console.debug(
            "Fetch biometric settings catch error:",
            error instanceof Error ? error.code : "unknown",
          );
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
        username: userProfile.username,
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
        followers: followerCounts.followers_count,
        following: followerCounts.following_count,
        profilePhoto: userProfile.profile_picture_url,
      });
      setEditForm({
        name: userProfile.full_name || "User",
        username: userProfile.username || "",
        email: userProfile.email || "",
        phone: userProfile.phone_number || "",
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
      });
    }
  }, [userProfile, followerCounts]);

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

          toast.success("📸 Profile photo updated!");
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
        username: editForm.username,
        email: editForm.email,
        phone_number: editForm.phone,
        gender: editForm.gender,
        height_cm: editForm.height,
        weight_kg: editForm.weight,
      });

      setUser((prev) => ({
        ...prev,
        name: editForm.name,
        username: editForm.username,
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

  const handleVerificationUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "selfie",
  ) => {
    if (!e.target.files?.[0] || !userProfile?.id) return;

    const file = e.target.files[0];
    setIsUploadingDocs(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
          const columnName =
            type === "id" ? "id_verification_url" : "selfie_verification_url";
          const { error: updateError } = await supabase
            .from("users")
            .update({
              [columnName]: dataUrl,
              [`${type}_verified_at`]: new Date().toISOString(),
            })
            .eq("id", userProfile.id);

          if (updateError) {
            toast.error(`Failed to upload ${type === "id" ? "ID" : "selfie"}`);
            console.debug("Upload error:", updateError?.code);
            return;
          }

          setVerificationDocs((prev) => ({
            ...prev,
            [type === "id" ? "idUploaded" : "selfieUploaded"]: true,
          }));

          toast.success(
            `${type === "id" ? "ID" : "Selfie"} uploaded successfully!`,
          );
        } catch (error: any) {
          console.debug(
            "Save verification error:",
            error instanceof Error ? error.code : "unknown",
          );
          toast.error("Failed to save verification document");
        } finally {
          setIsUploadingDocs(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.debug(
        "Read verification file error:",
        error instanceof Error ? error.code : "unknown",
      );
      toast.error("Failed to read file");
      setIsUploadingDocs(false);
    }
  };

  const handleStartVerification = async () => {
    if (!verificationDocs.idUploaded || !verificationDocs.selfieUploaded) {
      toast.error("Please upload both ID and selfie");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          trainer_verified: true,
          trainer_verified_at: new Date().toISOString(),
        })
        .eq("id", userProfile?.id);

      if (error) {
        console.debug("Verification error:", error?.code);
        toast.error("Failed to submit verification");
        return;
      }

      toast.success(
        "✓ Trainer verification submitted! We'll review it within 24 hours.",
      );
    } catch (error: any) {
      console.debug(
        "Submit verification error:",
        error instanceof Error ? error.code : "unknown",
      );
      toast.error("Failed to submit verification");
    } finally {
      setIsSaving(false);
    }
  };

  const isTrainer = user.role === "trainer";
  const referralCoins = userProfile?.referral_coins || 0;
  const nextRewardCoins = 500;
  const discountThreshold = 1000;
  const hasDiscount = referralCoins >= discountThreshold;

  const topAchievements = userAchievements.slice(0, 3);
  const featuredAchievement = userAchievements[0];

  return (
    <div
      className={`min-h-screen pb-24 ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}
    >
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* HEADER SECTION */}
        <div
          className={`rounded-3xl p-6 text-center shadow-md transition-all hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 via-orange-900/20 to-gray-900"
              : "bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100"
          }`}
        >
          {/* Theme Toggle Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                  : "bg-orange-200 hover:bg-orange-300 text-orange-800"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

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
            className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {user.name}
          </h1>

          {user.username && (
            <p
              className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              @{user.username}
            </p>
          )}

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
            <button
              onClick={() => navigate("/followers")}
              className="text-center hover:opacity-80 transition-opacity flex-1"
            >
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
            </button>
            <div className="h-8 w-px bg-orange-300"></div>
            <button
              onClick={() => navigate("/following")}
              className="text-center hover:opacity-80 transition-opacity flex-1"
            >
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
            </button>
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
          className={`rounded-2xl p-6 space-y-4 shadow-md transition-all hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-gray-700"
              : "bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200"
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
        </div>

        {/* SECURITY & LOGIN SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-4 shadow-md transition-all hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-gray-700"
              : "bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-200"
          }`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            <Lock className="w-5 h-5 text-orange-500" />
            Security & Login
          </h2>

          <div className="space-y-3">
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
          className={`rounded-2xl p-6 space-y-6 shadow-md transition-all hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-amber-700/30"
              : "bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-300"
          }`}
        >
          <div>
            <h2
              className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              💰 Referral Coins
            </h2>

            <div
              className={`rounded-2xl p-6 text-center mb-4 bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg relative`}
            >
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <span>✓</span>
                  <span>10% Discount</span>
                </div>
              )}
              <p className="text-sm font-semibold opacity-90 mb-2">
                Current Balance
              </p>
              <h3 className="text-4xl font-bold mb-1">{referralCoins}</h3>
              <p className="text-sm opacity-80">Coins</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  {hasDiscount
                    ? "Discount Unlocked! 🎉"
                    : `10% Discount at ${discountThreshold} coins`}
                </p>
                <p
                  className={`text-xs font-bold ${hasDiscount ? "text-green-500" : theme === "dark" ? "text-orange-400" : "text-orange-600"}`}
                >
                  {hasDiscount
                    ? "Unlocked!"
                    : `${Math.round((referralCoins / discountThreshold) * 100)}%`}
                </p>
              </div>
              <div
                className={`w-full h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    hasDiscount
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-orange-400 to-amber-500"
                  }`}
                  style={{
                    width: `${Math.min((referralCoins / discountThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3
              className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Earning Opportunities
            </h3>
            <div className="space-y-2">
              <div
                className={`p-4 rounded-lg flex items-center justify-between transition-all ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-orange-900/40 to-orange-900/20 border border-orange-800/30 hover:bg-gradient-to-r hover:from-orange-900/60 hover:to-orange-900/40"
                    : "bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-300 hover:from-orange-200 hover:to-orange-100"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-orange-200" : "text-orange-900"}`}
                  >
                    Invite a friend who joins
                  </p>
                </div>
                <span
                  className={`font-bold text-lg ${theme === "dark" ? "text-orange-300" : "text-orange-600"}`}
                >
                  +100
                </span>
              </div>

              <div
                className={`p-4 rounded-lg flex items-center justify-between transition-all ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-amber-900/40 to-amber-900/20 border border-amber-800/30 hover:bg-gradient-to-r hover:from-amber-900/60 hover:to-amber-900/40"
                    : "bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300 hover:from-amber-200 hover:to-amber-100"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-amber-200" : "text-amber-900"}`}
                  >
                    Complete 5 workouts in a week
                  </p>
                </div>
                <span
                  className={`font-bold text-lg ${theme === "dark" ? "text-amber-300" : "text-amber-600"}`}
                >
                  +50
                </span>
              </div>

              <div
                className={`p-4 rounded-lg flex items-center justify-between transition-all ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-red-900/40 to-red-900/20 border border-red-800/30 hover:bg-gradient-to-r hover:from-red-900/60 hover:to-red-900/40"
                    : "bg-gradient-to-r from-red-100 to-red-50 border border-red-300 hover:from-red-200 hover:to-red-100"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-red-200" : "text-red-900"}`}
                  >
                    Maintain a 7-day streak
                  </p>
                </div>
                <span
                  className={`font-bold text-lg ${theme === "dark" ? "text-red-300" : "text-red-600"}`}
                >
                  +75
                </span>
              </div>
            </div>
          </div>

          <DailyStepsReward
            dailySteps={dailySteps}
            onRewardClaimed={() => {
              toast.success("🎉 Reward claimed! Check your coins.");
            }}
          />

          <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
            <h3
              className={`text-sm font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              🎯 Invite Friends
            </h3>

            <div className="space-y-3">
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

              <div
                className={`rounded-xl p-4 space-y-2 ${
                  theme === "dark"
                    ? "bg-blue-900/30 border border-blue-800"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-semibold ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}
                  >
                    Referral Link
                  </p>
                  <button
                    onClick={handleCopyReferralLink}
                    title={referralCopied ? "Copied!" : "Copy link"}
                    className={`p-2 rounded-lg transition-all ${
                      referralCopied
                        ? "text-green-600"
                        : theme === "dark"
                          ? "text-blue-400 hover:bg-blue-800/50"
                          : "text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {referralCopied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none overflow-hidden text-ellipsis ${
                    theme === "dark"
                      ? "bg-gray-900 border border-blue-700 text-gray-300"
                      : "bg-white border border-blue-300 text-gray-700"
                  }`}
                />
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Join me on CoTrainr!",
                          text: `Join me on CoTrainr fitness coaching app and get 100 bonus coins!`,
                          url: referralLink,
                        })
                        .catch((error) => {
                          if (error.name !== "AbortError") {
                            toast.error("Unable to share. Please try again.");
                            console.error("Share error:", error);
                          }
                        });
                    } else {
                      handleCopyReferralLink();
                      toast.info("Share not supported. Link copied instead!");
                    }
                  }}
                  title="Share referral link"
                  className={`p-3 rounded-full transition-all ${
                    theme === "dark"
                      ? "bg-orange-900/30 hover:bg-orange-900/50 text-orange-400"
                      : "bg-orange-100 hover:bg-orange-200 text-orange-600"
                  }`}
                >
                  <Share2 className="w-6 h-6" />
                </button>
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
          className={`rounded-2xl p-6 space-y-6 shadow-md transition-all hover:shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-yellow-700/30"
              : "bg-gradient-to-br from-yellow-50 to-amber-50/30 border border-yellow-300"
          }`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            🏆 Achievements
          </h2>

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

        {/* SHARED DIET PLANS SECTION (for clients) */}
        {!isTrainer && sharedDietPlans.length > 0 && (
          <div
            className={`rounded-2xl p-6 space-y-4 shadow-md transition-all hover:shadow-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-gray-700"
                : "bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200"
            }`}
          >
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              <Flame className="w-5 h-5 text-orange-500" />
              Shared Diet Plans
            </h2>

            <div className="space-y-3">
              {sharedDietPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => navigate(`/diet-plan/${plan.id}`)}
                  className={`w-full rounded-xl p-4 text-left transition-all hover:shadow-md ${
                    theme === "dark"
                      ? "bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {plan.name}
                      </p>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        By {plan.users?.full_name || "Your Trainer"}
                      </p>
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </div>

                  {plan.description && (
                    <p
                      className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {plan.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div
                      className={`p-2 rounded ${theme === "dark" ? "bg-gray-600/50" : "bg-orange-100"}`}
                    >
                      <p
                        className={
                          theme === "dark" ? "text-gray-300" : "text-orange-700"
                        }
                      >
                        {plan.duration_days} days
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded ${theme === "dark" ? "bg-gray-600/50" : "bg-orange-100"}`}
                    >
                      <p
                        className={
                          theme === "dark" ? "text-gray-300" : "text-orange-700"
                        }
                      >
                        {plan.target_calories} cal
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded ${theme === "dark" ? "bg-gray-600/50" : "bg-orange-100"}`}
                    >
                      <p
                        className={
                          theme === "dark" ? "text-gray-300" : "text-orange-700"
                        }
                      >
                        {plan.meals_per_day} meals
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
                <label
                  className={`p-2 rounded-full cursor-pointer ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleVerificationUpload(e, "id")}
                    className="hidden"
                  />
                </label>
              </div>

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
                <label
                  className={`p-2 rounded-full cursor-pointer ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleVerificationUpload(e, "selfie")}
                    className="hidden"
                  />
                </label>
              </div>

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

              <button
                onClick={handleStartVerification}
                disabled={
                  isUploadingDocs ||
                  isSaving ||
                  !verificationDocs.idUploaded ||
                  !verificationDocs.selfieUploaded
                }
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Start Verification
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ADDITIONAL MENU ITEMS */}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/user/${userProfile?.username}`)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all shadow-sm hover:shadow-md ${
              theme === "dark"
                ? "bg-gradient-to-r from-gray-800 to-gray-700/50 border border-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-200"
                : "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 hover:from-blue-100 hover:to-cyan-100 text-blue-900"
            }`}
          >
            <User
              className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
            />
            <span className="font-semibold">View My Public Profile</span>
          </button>

          <button
            onClick={() =>
              toast.info("Premium subscription features coming soon!")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all shadow-sm hover:shadow-md font-semibold ${
              theme === "dark"
                ? "bg-gradient-to-r from-purple-800 to-indigo-800 border border-purple-700 hover:from-purple-700 hover:to-indigo-700 text-purple-100"
                : "bg-gradient-to-r from-purple-200 to-indigo-200 border border-purple-400 hover:from-purple-300 hover:to-indigo-300 text-purple-900"
            }`}
          >
            <span className="text-lg">⭐</span>
            <span>Upgrade to Premium</span>
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
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all shadow-sm hover:shadow-md ${
              theme === "dark"
                ? "bg-gradient-to-r from-red-900/80 to-orange-900/80 border border-red-800 hover:from-red-800 hover:to-orange-800 text-red-200"
                : "bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 hover:from-red-200 hover:to-orange-200 text-red-900"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl flex flex-col max-h-[90vh] shadow-2xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-white to-gray-50"
            }`}
          >
            {/* Sticky Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-6">
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
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="your_username"
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
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
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
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
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
                      setEditForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
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
            </div>

            {/* Sticky Footer */}
            <div
              className={`flex gap-3 p-6 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
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

      {/* FOLLOWERS MODAL */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userProfile?.id}
      />
    </div>
  );
}
