import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBackButton } from "@/hooks/useBackButton";
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
  ArrowLeft,
  Shield,
  Award,
  Users,
  TrendingUp,
  Bell,
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
  const [coverImage, setCoverImage] = useState<string | null>(
    userProfile?.cover_image_url || null,
  );

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
    idUrl: "",
    selfieUrl: "",
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

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0] || !userProfile?.id) return;

    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsSaving(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
          await authUpdateProfile({
            cover_image_url: dataUrl,
          });

          setCoverImage(dataUrl);
          toast.success("🖼️ Cover image updated!");
        } catch (error: any) {
          console.error("Error saving cover image:", error);
          const errorMsg =
            error?.message || String(error) || "Failed to save cover image";
          toast.error(errorMsg);
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing cover image:", error);
      const errorMsg =
        error?.message || String(error) || "Failed to process cover image";
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
            [type === "id" ? "idUrl" : "selfieUrl"]: dataUrl,
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
      const { data: existingVerification, error: checkError } = await supabase
        .from("trainer_verifications")
        .select("id")
        .eq("user_id", userProfile?.id)
        .single();

      if (checkError && checkError?.code !== "PGRST116") {
        console.debug("Check verification error:", checkError?.code);
      }

      let verificationError = null;

      if (existingVerification?.id) {
        const { error } = await supabase
          .from("trainer_verifications")
          .update({
            id_document_url: verificationDocs.idUrl,
            selfie_url: verificationDocs.selfieUrl,
            verification_status: "pending",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingVerification.id);
        verificationError = error;
      } else {
        const { error } = await supabase.from("trainer_verifications").insert({
          user_id: userProfile?.id,
          id_document_url: verificationDocs.idUrl,
          selfie_url: verificationDocs.selfieUrl,
          verification_status: "pending",
          submitted_at: new Date().toISOString(),
        });
        verificationError = error;
      }

      if (verificationError) {
        console.debug(
          "Verification submission error:",
          verificationError?.code,
        );
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
      className="min-h-screen bg-background"
    >
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* HEADER WITH NAVIGATION */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-orange-100 hover:bg-orange-200 text-orange-700"
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

        {/* PROFILE HERO SECTION */}
        <div
          className="relative rounded-2xl overflow-visible shadow-lg transition-all bg-card border border-border/40"
        >
          {/* Cover Image with Bell Icon */}
          <div className="relative h-56 group overflow-hidden rounded-t-2xl">
            <img
              src={
                coverImage ||
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>

            {/* Bell Notification - Top Left */}
            <button
              className={`absolute top-4 left-4 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-20 ${
                theme === "dark"
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-white/30 hover:bg-white/50 text-white"
              }`}
              title="Notifications"
              onClick={() => toast.info("Notifications coming soon!")}
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Cover Image Edit Button - Top Right */}
            <label
              className={`absolute top-4 right-4 p-3 rounded-full cursor-pointer transition-all shadow-lg hover:scale-110 z-20 ${
                theme === "dark"
                  ? "bg-white/20 hover:bg-white/30 text-white opacity-0 group-hover:opacity-100"
                  : "bg-white/30 hover:bg-white/50 text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
              <Camera className="w-5 h-5" />
            </label>
          </div>

          {/* Profile Info Section */}
          <div
            className={`relative px-6 pt-6 pb-8 ${
              theme === "dark"
                ? "bg-gray-800"
                : "bg-white border-t border-gray-200"
            }`}
          >
            <div className="flex gap-6">
              {/* Profile Picture - Bottom Left Overlapping */}
              <div className="relative -mt-20 flex-shrink-0">
                <div
                  className={`w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden border-4 shadow-xl transition-all hover:shadow-2xl ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-800"
                      : "bg-orange-50 border-white"
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
                      className={`w-16 h-16 ${theme === "dark" ? "text-gray-400" : "text-orange-400"}`}
                    />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Welcome Text Section */}
              <div className="flex-1 pt-4">
                <p
                  className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Welcome
                </p>
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {user.name}
                </h1>
                {user.username && (
                  <p
                    className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    @{user.username}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      isTrainer
                        ? theme === "dark"
                          ? "bg-yellow-900/40 text-yellow-300"
                          : "bg-yellow-100 text-yellow-700"
                        : theme === "dark"
                          ? "bg-blue-900/40 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isTrainer ? "⭐ Trainer" : "🏃 Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => navigate("/followers-following")}
                className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-700/50 hover:bg-gray-600/50"
                    : "bg-orange-50 hover:bg-orange-100"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-orange-600"}`}
                >
                  {user.followers}
                </div>
                <p
                  className={`text-xs font-medium mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Followers
                </p>
              </button>
              <button
                onClick={() => navigate("/followers-following")}
                className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-700/50 hover:bg-gray-600/50"
                    : "bg-blue-50 hover:bg-blue-100"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-blue-600"}`}
                >
                  {user.following}
                </div>
                <p
                  className={`text-xs font-medium mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Following
                </p>
              </button>
              <button
                onClick={() => toast.success("Coming soon!")}
                className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-700/50 hover:bg-gray-600/50"
                    : "bg-purple-50 hover:bg-purple-100"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-purple-600"}`}
                >
                  {getTotalPoints()}
                </div>
                <p
                  className={`text-xs font-medium mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Points
                </p>
              </button>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* QUICK INFO SECTION */}
        <div
          className={`grid grid-cols-2 gap-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium opacity-75">Email</p>
              <p className="text-sm font-semibold truncate">
                {userProfile?.email || "Not set"}
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium opacity-75">Phone</p>
              <p className="text-sm font-semibold">
                {userProfile?.phone_number || "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div
          className={`rounded-2xl p-6 space-y-4 shadow-md transition-all ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-gray-700"
              : "bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2
              className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Security & Login
            </h2>
          </div>

          <div className="space-y-3">
            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700/50 hover:bg-gray-600/50"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span
                className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
              >
                Device PIN / Password
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

            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700/50 hover:bg-gray-600/50"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-orange-500" />
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                >
                  Fingerprint
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

            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700/50 hover:bg-gray-600/50"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Smile className="w-5 h-5 text-orange-500" />
                <span
                  className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                >
                  Face Recognition
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

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className={`text-sm font-semibold transition-colors ${
                  theme === "dark"
                    ? "text-orange-400 hover:text-orange-300"
                    : "text-orange-600 hover:text-orange-700"
                }`}
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
          className={`rounded-2xl p-6 space-y-6 shadow-md transition-all ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-amber-700/30"
              : "bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2
              className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              💰 Referral Coins
            </h2>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              {hasDiscount && (
                <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  10% Discount Unlocked
                </div>
              )}
              <p className="text-sm font-medium opacity-90 mb-2">
                Current Balance
              </p>
              <h3 className="text-5xl font-bold mb-2">{referralCoins}</h3>
              <p className="text-orange-100">Coins available</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  {hasDiscount
                    ? "🎉 Discount Unlocked!"
                    : `Unlock 10% Discount`}
                </p>
                <p
                  className={`text-xs font-bold ${hasDiscount ? "text-green-500" : "text-orange-600"}`}
                >
                  {hasDiscount
                    ? "Complete"
                    : `${Math.round((referralCoins / discountThreshold) * 100)}%`}
                </p>
              </div>
              <div
                className={`w-full h-2.5 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    hasDiscount
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-orange-400 to-orange-500"
                  }`}
                  style={{
                    width: `${Math.min((referralCoins / discountThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <h3
                className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Earning Opportunities
              </h3>
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-lg flex items-center justify-between text-sm ${
                    theme === "dark"
                      ? "bg-gray-700/50 hover:bg-gray-600/50"
                      : "bg-orange-100 hover:bg-orange-200"
                  } transition-all`}
                >
                  <span
                    className={
                      theme === "dark" ? "text-gray-200" : "text-orange-900"
                    }
                  >
                    Invite a friend who joins
                  </span>
                  <span
                    className={`font-bold ${theme === "dark" ? "text-orange-300" : "text-orange-600"}`}
                  >
                    +100
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg flex items-center justify-between text-sm ${
                    theme === "dark"
                      ? "bg-gray-700/50 hover:bg-gray-600/50"
                      : "bg-amber-100 hover:bg-amber-200"
                  } transition-all`}
                >
                  <span
                    className={
                      theme === "dark" ? "text-gray-200" : "text-amber-900"
                    }
                  >
                    Complete 5 workouts weekly
                  </span>
                  <span
                    className={`font-bold ${theme === "dark" ? "text-amber-300" : "text-amber-600"}`}
                  >
                    +50
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg flex items-center justify-between text-sm ${
                    theme === "dark"
                      ? "bg-gray-700/50 hover:bg-gray-600/50"
                      : "bg-red-100 hover:bg-red-200"
                  } transition-all`}
                >
                  <span
                    className={
                      theme === "dark" ? "text-gray-200" : "text-red-900"
                    }
                  >
                    Maintain a 7-day streak
                  </span>
                  <span
                    className={`font-bold ${theme === "dark" ? "text-red-300" : "text-red-600"}`}
                  >
                    +75
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DailyStepsReward
            dailySteps={dailySteps}
            onRewardClaimed={() => {
              toast.success("🎉 Reward claimed!");
            }}
          />

          <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
            <h3
              className={`text-sm font-bold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              <Users className="w-5 h-5" />
              Invite Friends
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
                  Your Referral Code
                </p>
                <p
                  className={`text-2xl font-bold mt-2 font-mono tracking-wider ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                >
                  {referralCodeDisplay}
                </p>
              </div>

              <div
                className={`rounded-xl p-4 space-y-3 ${
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
                <div className="flex items-center gap-2">
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
                    className={`p-2.5 rounded-lg transition-all ${
                      referralCopied
                        ? "text-green-600"
                        : theme === "dark"
                          ? "text-blue-400 hover:bg-blue-800/50"
                          : "text-blue-600 hover:bg-blue-100"
                    }`}
                    title={referralCopied ? "Copied!" : "Copy link"}
                  >
                    {referralCopied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

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
                className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
                  theme === "dark"
                    ? "bg-orange-900/30 hover:bg-orange-900/50 text-orange-400"
                    : "bg-orange-100 hover:bg-orange-200 text-orange-600"
                }`}
              >
                <Share2 className="w-5 h-5" />
                Share Referral Link
              </button>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS SECTION */}
        {userAchievements.length > 0 && (
          <div
            className={`rounded-2xl p-6 space-y-6 shadow-md transition-all ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-yellow-700/30"
                : "bg-gradient-to-br from-yellow-50 to-amber-50/30 border border-yellow-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              <h2
                className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                🏆 Achievements
              </h2>
            </div>

            <div className="overflow-x-auto pb-2 -mx-6 px-6">
              <div className="flex gap-4 min-w-min">
                {topAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center gap-2 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-2 ${
                        theme === "dark"
                          ? "bg-yellow-900/30 border-yellow-700"
                          : "bg-yellow-100 border-yellow-300"
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
                className={`rounded-2xl p-6 text-center border-2 shadow-md ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-700"
                    : "bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-300"
                }`}
              >
                <div className="text-6xl mb-4">{featuredAchievement.icon}</div>
                <h3
                  className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {featuredAchievement.title}
                </h3>
                <p
                  className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Keep up the great work!
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() =>
                      toast.success("Instagram share coming soon!")
                    }
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Share
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
          </div>
        )}

        {/* SHARED DIET PLANS SECTION */}
        {!isTrainer && sharedDietPlans.length > 0 && (
          <div
            className={`rounded-2xl p-6 space-y-4 shadow-md transition-all ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-700/50 border border-gray-700"
                : "bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2
                className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Shared Diet Plans
              </h2>
            </div>

            <div className="space-y-3">
              {sharedDietPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => navigate(`/diet-plan/${plan.id}`)}
                  className={`w-full rounded-xl p-4 text-left transition-all hover:shadow-md hover:scale-105 ${
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
                      className={`p-2 rounded font-medium ${
                        theme === "dark"
                          ? "bg-gray-600/50 text-gray-300"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {plan.duration_days} days
                    </div>
                    <div
                      className={`p-2 rounded font-medium ${
                        theme === "dark"
                          ? "bg-gray-600/50 text-gray-300"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {plan.target_calories} cal
                    </div>
                    <div
                      className={`p-2 rounded font-medium ${
                        theme === "dark"
                          ? "bg-gray-600/50 text-gray-300"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {plan.meals_per_day} meals
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
