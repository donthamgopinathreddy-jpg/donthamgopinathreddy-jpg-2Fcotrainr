import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  LogOut,
  Heart,
  TrendingUp,
  Award,
  Zap,
  User,
  Mail,
  MapPin,
  FileText,
  Camera,
  Save,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface EditModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  children: React.ReactNode;
}

function EditModal({
  isOpen,
  title,
  onClose,
  onSave,
  children,
}: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function MobileProfile() {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
  const { theme = "light", toggleTheme } = useTheme();
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    achievements: 0,
    coins: 0,
  });
  const [loading, setLoading] = useState(true);

  // Edit modals state
  const [editModals, setEditModals] = useState({
    basic: false,
    physical: false,
    contact: false,
    bio: false,
  });

  // Form states - pre-filled with current data
  const [basicForm, setBasicForm] = useState({
    username: userProfile?.username || "",
    full_name: userProfile?.full_name || "",
  });

  const [physicalForm, setPhysicalForm] = useState({
    height_cm: userProfile?.height_cm?.toString() || "",
    weight_kg: userProfile?.weight_kg?.toString() || "",
    gender: userProfile?.gender || "",
  });

  const [contactForm, setContactForm] = useState({
    phone_number: userProfile?.phone_number || "",
    country_code: userProfile?.country_code || "+1",
  });

  const [bioForm, setBioForm] = useState({
    bio: userProfile?.bio || "",
  });

  // Calculate BMI
  const bmi =
    userProfile?.weight_kg && userProfile?.height_cm
      ? (
          userProfile.weight_kg /
          ((userProfile.height_cm / 100) * (userProfile.height_cm / 100))
        ).toFixed(1)
      : null;

  const getBMIStatus = (bmi: number | null) => {
    if (!bmi) return "Not set";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    return "Obese";
  };

  // Update form states when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setBasicForm({
        username: userProfile.username || "",
        full_name: userProfile.full_name || "",
      });
      setPhysicalForm({
        height_cm: userProfile.height_cm?.toString() || "",
        weight_kg: userProfile.weight_kg?.toString() || "",
        gender: userProfile.gender || "",
      });
      setContactForm({
        phone_number: userProfile.phone_number || "",
        country_code: userProfile.country_code || "+1",
      });
      setBioForm({
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("coins_balance")
          .eq("id", userProfile.id)
          .single();

        if (!userError && userData) {
          setStats((prev) => ({
            ...prev,
            coins: userData.coins_balance || 0,
          }));
        }

        // TODO: Add follows table queries for followers/following
        // For now using placeholder values - implement when follows table is ready
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userProfile?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveBasic = async () => {
    try {
      if (!basicForm.full_name.trim() || !basicForm.username.trim()) {
        toast.error("Please fill in all fields");
        return;
      }
      await updateProfile({
        username: basicForm.username,
        full_name: basicForm.full_name,
      });
      toast.success("Basic info updated!");
      setEditModals((prev) => ({ ...prev, basic: false }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSavePhysical = async () => {
    try {
      const height = parseFloat(physicalForm.height_cm as any);
      const weight = parseFloat(physicalForm.weight_kg as any);

      if (!physicalForm.height_cm || !physicalForm.weight_kg) {
        toast.error("Please fill in all fields");
        return;
      }

      if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        toast.error("Please enter valid numbers");
        return;
      }

      await updateProfile({
        height_cm: height,
        weight_kg: weight,
        gender: physicalForm.gender,
      });
      toast.success("Physical info updated!");
      setEditModals((prev) => ({ ...prev, physical: false }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveContact = async () => {
    try {
      await updateProfile({
        phone_number: contactForm.phone_number,
        country_code: contactForm.country_code,
      });
      toast.success("Contact info updated!");
      setEditModals((prev) => ({ ...prev, contact: false }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveBio = async () => {
    try {
      await updateProfile({
        bio: bioForm.bio,
      });
      toast.success("Bio updated!");
      setEditModals((prev) => ({ ...prev, bio: false }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await updateProfile({ cover_image_url: dataUrl });
        toast.success("Cover image updated!");
        setEditModals((prev) => ({ ...prev, avatar: false }));
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await updateProfile({ profile_picture_url: dataUrl });
        toast.success("Profile image updated!");
        setEditModals((prev) => ({ ...prev, avatar: false }));
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${theme === "dark" ? "bg-gradient-to-b from-gray-900 to-gray-800" : "bg-gradient-to-b from-gray-50 to-white"}`}>
      {/* Header with Back Button */}
      <div className={`sticky top-0 z-40 border-b ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
          >
            <ArrowLeft size={24} />
            Back
          </button>
          <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>My Profile</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Cover Image Section */}
      <div
        className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 relative overflow-hidden"
        style={
          userProfile?.cover_image_url
            ? {
                backgroundImage: `url('${userProfile.cover_image_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <button
          onClick={() => {
            document.getElementById("coverImageInput")?.click();
          }}
          className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg hover:bg-white"
        >
          <Camera size={20} className="text-gray-800" />
        </button>
        <input
          id="coverImageInput"
          type="file"
          accept="image/*"
          onChange={handleCoverImageUpload}
          className="hidden"
        />
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-12 relative z-10 mb-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {/* Avatar Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-end gap-4 flex-1">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {userProfile?.profile_picture_url ? (
                    <img
                      src={userProfile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <button
                  onClick={() => {
                    document.getElementById("avatarImageInput")?.click();
                  }}
                  className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full hover:bg-purple-600 text-white"
                >
                  <Camera size={16} />
                </button>
                <input
                  id="avatarImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile?.full_name || userProfile?.username}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      userProfile?.role === "trainer"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {userProfile?.role === "trainer"
                      ? "🏋️ Trainer"
                      : "👤 Client"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setEditModals((prev) => ({ ...prev, basic: true }))
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Edit2 size={20} className="text-purple-600" />
            </button>
          </div>

          {/* Bio */}
          {userProfile?.bio && (
            <p className="text-gray-700 text-sm mb-4 italic">
              "{userProfile.bio}"
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{bmi || "—"}</p>
              <p className="text-xs text-gray-600">BMI</p>
              <p className="text-xs text-gray-500">
                {getBMIStatus(bmi ? parseFloat(bmi) : null)}
              </p>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-pink-600">{stats.coins}</p>
              <p className="text-xs text-gray-600">Coins</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {userProfile?.height_cm || "—"}
              </p>
              <p className="text-xs text-gray-600">Height (cm)</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {userProfile?.weight_kg || "—"}
              </p>
              <p className="text-xs text-gray-600">Weight (kg)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Activity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Heart className="text-red-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">
              {stats.followers || 0}
            </p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <TrendingUp className="text-green-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">
              {stats.following || 0}
            </p>
            <p className="text-xs text-gray-600">Following</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Award className="text-yellow-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">
              {stats.achievements || 0}
            </p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Zap className="text-orange-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-600">Streak Days</p>
          </div>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Personal Details
        </h3>
        <div className="space-y-3">
          {/* Physical Info Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Height & Weight</p>
              <p className="text-sm font-semibold text-gray-900">
                {userProfile?.height_cm}cm • {userProfile?.weight_kg}kg
              </p>
            </div>
            <button
              onClick={() =>
                setEditModals((prev) => ({ ...prev, physical: true }))
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Edit2 size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={16} className="text-purple-600" />
                <p className="text-xs text-gray-500">Email</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-pink-600" />
                <p className="text-xs text-gray-500">Phone & Country</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {userProfile?.country_code}{" "}
                {userProfile?.phone_number || "Not set"}
              </p>
            </div>
            <button
              onClick={() =>
                setEditModals((prev) => ({ ...prev, contact: true }))
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Edit2 size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Gender Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Gender</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {userProfile?.gender || "Not specified"}
            </p>
          </div>

          {/* Bio Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-blue-600" />
                <p className="text-xs text-gray-500">Bio</p>
              </div>
              <p className="text-sm text-gray-700">
                {userProfile?.bio || "Add a bio to your profile"}
              </p>
            </div>
            <button
              onClick={() => setEditModals((prev) => ({ ...prev, bio: true }))}
              className="p-2 hover:bg-gray-100 rounded-lg ml-2"
            >
              <Edit2 size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Settings</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
            <p className="font-semibold text-gray-900">Notification Settings</p>
            <p className="text-xs text-gray-500 mt-1">
              Manage your notifications
            </p>
          </button>

          <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
            <p className="font-semibold text-gray-900">Privacy Settings</p>
            <p className="text-xs text-gray-500 mt-1">Control your privacy</p>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                Theme
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {theme === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
          </button>

          <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
            <p className="font-semibold text-gray-900">About CoTrainr</p>
            <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200 text-left"
        >
          <div className="flex items-center gap-2">
            <LogOut size={20} className="text-red-600" />
            <p className="font-semibold text-red-600">Logout</p>
          </div>
        </button>
      </div>

      {/* EDIT MODALS */}

      {/* Basic Info Modal */}
      <EditModal
        isOpen={editModals.basic}
        title="Edit Basic Info"
        onClose={() => setEditModals((prev) => ({ ...prev, basic: false }))}
        onSave={handleSaveBasic}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={basicForm.full_name}
              onChange={(e) =>
                setBasicForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={basicForm.username}
              onChange={(e) =>
                setBasicForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your username"
            />
          </div>

          <button
            onClick={handleSaveBasic}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </EditModal>

      {/* Physical Info Modal */}
      <EditModal
        isOpen={editModals.physical}
        title="Edit Physical Info"
        onClose={() => setEditModals((prev) => ({ ...prev, physical: false }))}
        onSave={handleSavePhysical}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={physicalForm.height_cm}
              onChange={(e) =>
                setPhysicalForm((prev) => ({
                  ...prev,
                  height_cm: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Height in cm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={physicalForm.weight_kg}
              onChange={(e) =>
                setPhysicalForm((prev) => ({
                  ...prev,
                  weight_kg: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Weight in kg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={physicalForm.gender}
              onChange={(e) =>
                setPhysicalForm((prev) => ({
                  ...prev,
                  gender: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            onClick={handleSavePhysical}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </EditModal>

      {/* Contact Info Modal */}
      <EditModal
        isOpen={editModals.contact}
        title="Edit Contact Info"
        onClose={() => setEditModals((prev) => ({ ...prev, contact: false }))}
        onSave={handleSaveContact}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country Code
            </label>
            <input
              type="text"
              value={contactForm.country_code}
              onChange={(e) =>
                setContactForm((prev) => ({
                  ...prev,
                  country_code: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactForm.phone_number}
              onChange={(e) =>
                setContactForm((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Phone number"
            />
          </div>

          <button
            onClick={handleSaveContact}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </EditModal>

      {/* Bio Modal */}
      <EditModal
        isOpen={editModals.bio}
        title="Edit Bio"
        onClose={() => setEditModals((prev) => ({ ...prev, bio: false }))}
        onSave={handleSaveBio}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio (Max 300 characters)
            </label>
            <textarea
              value={bioForm.bio}
              onChange={(e) =>
                setBioForm((prev) => ({
                  ...prev,
                  bio: e.target.value.slice(0, 300),
                }))
              }
              maxLength={300}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {bioForm.bio.length}/300 characters
            </p>
          </div>

          <button
            onClick={handleSaveBio}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </EditModal>
    </div>
  );
}
