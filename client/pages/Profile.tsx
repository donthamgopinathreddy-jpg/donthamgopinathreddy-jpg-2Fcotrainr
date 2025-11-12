import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit2,
  LogOut,
  Briefcase,
  Heart,
  Users,
  Award,
  MapPin,
  Camera,
  CheckCircle,
  Share2,
  Copy,
  Check,
  Loader,
} from "lucide-react";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserType {
  role: "client" | "trainer";
  name: string;
  gender: string;
  height: number;
  weight: number;
  isFollowing: boolean;
  followers: number;
  following: number;
  profilePhoto?: string;
  qualifications?: string[];
  yearsExperience?: number;
  specialties?: string[];
  location?: string;
  rating?: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, userProfile, signOut, updateProfile: authUpdateProfile } = useAuth();

  const [user, setUser] = useState<UserType>({
    role: userProfile?.role || "client",
    name: userProfile?.full_name || "User",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
    isFollowing: false,
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showTrainerReferralModal, setShowTrainerReferralModal] =
    useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [trainerReferralCopied, setTrainerReferralCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile?.full_name || "User",
    email: userProfile?.email || "",
    phone: userProfile?.phone_number || "",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
    dateOfBirth: userProfile?.date_of_birth || "",
    age: userProfile?.age || 25,
  });

  // Sync state with userProfile whenever it changes
  useEffect(() => {
    if (userProfile) {
      const newUserState = {
        role: userProfile.role || "client",
        name: userProfile.full_name || "User",
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
        isFollowing: false,
        followers: 0,
        following: 0,
      };
      setUser(newUserState);
      setEditForm({
        name: userProfile.full_name || "User",
        email: userProfile.email || "",
        phone: userProfile.phone_number || "",
        gender: userProfile.gender || "Not specified",
        height: userProfile.height_cm || 170,
        weight: userProfile.weight_kg || 70,
        dateOfBirth: userProfile.date_of_birth || "",
        age: userProfile.age || 25,
      });
    }
  }, [userProfile]);

  // Generate referral link
  const referralCode =
    userProfile?.id?.substring(0, 8).toUpperCase() || "REFER";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    toast.success("✓ Referral link copied!");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleShareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join CoTrainr",
        text: "Join me on CoTrainr! Get personalized training and nutrition guidance.",
        url: referralLink,
      });
    } else {
      handleCopyReferralLink();
    }
  };

  // Trainer Referral Functions
  const trainerReferralCode =
    userProfile?.id?.substring(0, 8).toUpperCase() || "COACH";
  const trainerReferralLink = `${window.location.origin}/trainer-signup?ref=${trainerReferralCode}`;

  const handleCopyTrainerReferralLink = () => {
    navigator.clipboard.writeText(trainerReferralLink);
    setTrainerReferralCopied(true);
    toast.success("✓ Trainer referral link copied!");
    setTimeout(() => setTrainerReferralCopied(false), 2000);
  };

  const handleShareTrainerReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join CoTrainr as a Trainer",
        text: "Join CoTrainr as a trainer! Build your coaching business and reach more clients.",
        url: trainerReferralLink,
      });
    } else {
      handleCopyTrainerReferralLink();
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser((prev) => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
    }));
  };


  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      if (!authUser) {
        toast.error("User not found");
        return;
      }

      // Calculate age from date of birth if provided
      let ageValue = editForm.age;
      if (editForm.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(editForm.dateOfBirth);
        ageValue = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          ageValue--;
        }
      }

      // Update profile using AuthContext method
      await authUpdateProfile({
        full_name: editForm.name,
        email: editForm.email,
        phone_number: editForm.phone,
        gender: editForm.gender,
        height_cm: editForm.height,
        weight_kg: editForm.weight,
        date_of_birth: editForm.dateOfBirth,
        age: ageValue,
      });

      // Update local state
      setUser((prev) => ({
        ...prev,
        name: editForm.name,
        gender: editForm.gender,
        height: editForm.height,
        weight: editForm.weight,
      }));

      toast.success("✓ Profile updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0] || !userProfile?.id) return;

    const file = e.target.files[0];
    setIsSaving(true);

    try {
      // Read as data URL and store directly
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        try {
          // Save data URL to database
          await authUpdateProfile({
            profile_picture_url: dataUrl,
          });

          // Update local state
          setUser((prev) => ({
            ...prev,
            profilePhoto: dataUrl,
          }));

          toast.success("✓ Profile photo updated!");
        } catch (error: any) {
          console.error("Error saving profile photo:", error);
          toast.error("Failed to save profile photo");
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing profile photo:", error);
      toast.error("Failed to process profile photo");
      setIsSaving(false);
    }
  };

  const isTrainer = user.role === "trainer";

  return (
    <div className="min-h-screen bg-white pb-24 l-shape-bg fitness-gradient-1">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3 w-full">
        <Logo size="sm" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 px-4 sm:px-6 py-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {user.profilePhoto || userProfile?.profile_picture_url ? (
                <img
                  src={user.profilePhoto || userProfile?.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors group-hover:scale-110">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
          {isTrainer && (
            <p className="text-sm text-gray-700 mb-3">
              ⭐ {user.rating || 4.8} • {user.yearsExperience || 0}+ years
              experience
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {user.followers}
              </div>
              <p className="text-xs text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {user.following}
              </div>
              <p className="text-xs text-gray-600">Following</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 sm:px-6 py-8 space-y-4 sm:space-y-6">
          {/* Follow Button (if not own profile) */}
          {!isTrainer && (
            <button
              onClick={handleFollow}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                isFollowing
                  ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFollowing ? "fill-current" : ""}`}
              />
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}

          {/* Account Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-gray-900">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Username</p>
                <p className="font-semibold text-gray-900 break-all">
                  {userProfile?.username || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email Address</p>
                <p className="font-semibold text-gray-900 break-all">
                  {userProfile?.email || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Gender</p>
                <p className="font-semibold text-gray-900">{user.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Height</p>
                <p className="font-semibold text-gray-900">{user.height} cm</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Weight</p>
                <p className="font-semibold text-gray-900">{user.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">BMI</p>
                <p className="font-semibold text-gray-900">
                  {(user.weight / (user.height / 100) ** 2).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Trainer-specific sections */}
          {isTrainer && (
            <>
              {/* Specialties */}
              {user.specialties && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-gray-900">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {user.qualifications && user.qualifications.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-gray-900">Qualifications</h3>
                  </div>
                  <ul className="space-y-2">
                    {user.qualifications.map((qual, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location */}
              {user.location && (
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Training Location</p>
                    <p className="font-semibold text-gray-900">
                      {user.location}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Stats */}
          {!isTrainer && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                <p className="text-xs text-gray-600">Sessions</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                <p className="text-xs text-gray-600">Hours</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                <p className="text-xs text-gray-600">Streak</p>
              </div>
            </div>
          )}

          {/* Join as Trainer CTA - only for clients */}
          {!isTrainer && (
            <div>
              <div
                onClick={() => navigate("/trainer-signup")}
                className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 active:scale-95 hover:scale-105 shadow-lg hover:shadow-2xl l-shape-bg mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #06B6D4 25%, #3B82F6 50%, #8B5CF6 75%, #10B981 100%)",
                  backgroundSize: "300% 300%",
                  animation: "gradientFlow 8s ease infinite",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <div className="relative z-10 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Become a Trainer
                    </h3>
                    <p className="text-sm text-white/90">
                      Share your expertise and earn
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action Tiles */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Invite Friends Tile */}
                <div
                  onClick={() => setShowReferralModal(true)}
                  className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-2 text-center h-full justify-center">
                    <div className="p-2 bg-green-600/20 rounded-full">
                      <Users className="w-5 h-5 text-green-700" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Invite Friends
                    </h4>
                    <p className="text-xs text-gray-700">Earn rewards</p>
                  </div>
                </div>

                {/* Upgrade to Premium Tile */}
                <div
                  onClick={() => navigate("/subscription")}
                  className="bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-2 text-center h-full justify-center">
                    <div className="p-2 bg-orange-600/20 rounded-full">
                      <CheckCircle className="w-5 h-5 text-orange-700" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Go Premium
                    </h4>
                    <p className="text-xs text-gray-700">Unlock all</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trainer Referral Tiles */}
          {isTrainer && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Refer a Cotrainer Tile */}
              <div
                onClick={() => setShowTrainerReferralModal(true)}
                className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-2 text-center h-full justify-center">
                  <div className="p-2 bg-blue-600/20 rounded-full">
                    <Briefcase className="w-5 h-5 text-blue-700" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Refer Trainer
                  </h4>
                  <p className="text-xs text-gray-700">Earn bonus</p>
                </div>
              </div>

              {/* Upgrade to Premium Tile */}
              <div
                onClick={() => navigate("/subscription")}
                className="bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-2 text-center h-full justify-center">
                  <div className="p-2 bg-orange-600/20 rounded-full">
                    <CheckCircle className="w-5 h-5 text-orange-700" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Go Premium
                  </h4>
                  <p className="text-xs text-gray-700">More features</p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Edit Profile</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await signOut();
                  toast.success("Logged out successfully");
                  // Navigate to login after a short delay to ensure state is cleared
                  setTimeout(() => {
                    navigate("/login", { replace: true });
                  }, 500);
                } catch (error) {
                  console.error("Logout error:", error);
                  toast.error("Failed to logout");
                }
              }}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={editForm.height}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          height: Number(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Age:</strong> {editForm.age} years
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Age auto-updates from your date of birth
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-200 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

        {/* Referral Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4">
            <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl p-5 md:p-6 space-y-5 md:space-y-6 max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Invite Friends
                </h2>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Referral Info */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Share your referral link with friends and earn rewards when
                  they join CoTrainr!
                </p>

                {/* Referral Link Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-700">
                    Your Referral Link
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="flex-1 bg-white border border-green-300 rounded-lg px-3 py-2 text-xs md:text-sm text-gray-700 focus:outline-none overflow-hidden text-ellipsis"
                    />
                    <button
                      onClick={handleCopyReferralLink}
                      className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap text-xs md:text-sm ${
                        referralCopied
                          ? "bg-green-600 text-white"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {referralCopied ? (
                        <>
                          <Check className="w-3 md:w-4 h-3 md:h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 md:w-4 h-3 md:h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Referral Code</p>
                  <p className="text-base md:text-lg font-bold text-green-600">
                    {referralCode}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  {/* Friend Benefits */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Friend Gets
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>20% OFF first month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">
                          ��
                        </span>
                        <span>2 free trainer sessions</span>
                      </li>
                    </ul>
                  </div>

                  {/* Your Benefits */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      You Get
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>1 week Pro features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>20% bonus on next purchase</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 sm:pt-4">
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 bg-gray-200 text-gray-900 font-medium py-2.5 md:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={handleShareReferral}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-2.5 md:py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Share2 className="w-3 md:w-4 h-3 md:h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trainer Referral Modal */}
        {showTrainerReferralModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4">
            <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl p-5 md:p-6 space-y-5 md:space-y-6 max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Refer a Cotrainer
                </h2>
                <button
                  onClick={() => setShowTrainerReferralModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Referral Info */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Share your trainer code with other trainers and earn
                  commission when they join CoTrainr!
                </p>

                {/* Trainer Referral Link Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-700">
                    Your Trainer Referral Link
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={trainerReferralLink}
                      className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs md:text-sm text-gray-700 focus:outline-none overflow-hidden text-ellipsis"
                    />
                    <button
                      onClick={handleCopyTrainerReferralLink}
                      className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 whitespace-nowrap text-xs md:text-sm ${
                        trainerReferralCopied
                          ? "bg-blue-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {trainerReferralCopied ? (
                        <>
                          <Check className="w-3 md:w-4 h-3 md:h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 md:w-4 h-3 md:h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Trainer Referral Code */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Coach Code</p>
                  <p className="text-base md:text-lg font-bold text-blue-600">
                    {trainerReferralCode}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  {/* Referred Trainer Benefits */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      New Trainer Gets
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>Onboarding support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>50% platform fee waived (3 months)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Your Benefits as Referrer */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      You Get
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>₹2000 per referral</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>Featured trainer profile</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 sm:pt-4">
                <button
                  onClick={() => setShowTrainerReferralModal(false)}
                  className="flex-1 bg-gray-200 text-gray-900 font-medium py-2.5 md:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={handleShareTrainerReferral}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2.5 md:py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Share2 className="w-3 md:w-4 h-3 md:h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
