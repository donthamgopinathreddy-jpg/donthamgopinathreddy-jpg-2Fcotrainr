import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit2,
  LogOut,
  Camera,
  Lock,
  Bell,
  Shield,
  Award,
  Users,
  TrendingUp,
  Sun,
  Moon,
  Copy,
  Check,
  Upload,
  Download,
  Mail,
  Phone,
  ChevronRight,
  Verified,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface UserType {
  role: "client" | "trainer";
  name: string;
  username?: string;
  gender: string;
  height: number;
  weight: number;
  profilePhoto?: string;
  subscriptionPlan?: string;
  isVerified?: boolean;
  categories?: string[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { theme = "light", toggleTheme } = useTheme();

  const [user, setUser] = useState<UserType>({
    role: userProfile?.role || "client",
    name: userProfile?.full_name || "User",
    username: userProfile?.username || "username",
    gender: userProfile?.gender || "Not specified",
    height: userProfile?.height_cm || 170,
    weight: userProfile?.weight_kg || 70,
    profilePhoto:
      userProfile?.avatar ||
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop",
    subscriptionPlan: "Premium",
    isVerified: userProfile?.role === "trainer",
    categories: userProfile?.role === "trainer" ? ["Gym", "Yoga"] : [],
  });

  const [referralCopied, setReferralCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const copyReferral = () => {
    navigator.clipboard.writeText("TRAINER123REF");
    setReferralCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            <Edit2 size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto">
        {/* Cover Photo & Profile Header */}
        <div className="bg-white border-b border-gray-200">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
            <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
              <Camera size={20} className="text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg">
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.name}
                    </h2>
                    {user.isVerified && (
                      <Verified
                        size={24}
                        className="text-blue-500 fill-blue-500"
                      />
                    )}
                  </div>
                  <p className="text-gray-600 font-medium">@{user.username}</p>
                </div>

                {/* Subscription Badge */}
                {user.subscriptionPlan && (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                    {user.subscriptionPlan}
                  </div>
                )}
              </div>

              {/* Category Badges (Trainer) */}
              {user.role === "trainer" &&
                user.categories &&
                user.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">1.2K</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">342</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">48</p>
                  <p className="text-sm text-gray-600">
                    {user.role === "trainer" ? "Clients" : "Sessions"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="bg-white">
          {/* Personal Info Section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h3>
            <div className="space-y-3">
              <SettingItem
                label="Edit Profile"
                description="Update name, bio, and profile picture"
                icon={<Edit2 size={20} />}
                onClick={() => setShowEditModal(true)}
              />
              <SettingItem
                label="Height & Weight"
                description={`${user.height}cm • ${user.weight}kg`}
                icon={<User size={20} />}
                onClick={() => setShowEditModal(true)}
              />
              <SettingItem
                label="Contact Info"
                description="Email and phone number"
                icon={<Phone size={20} />}
                onClick={() => {}}
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={20} />
              Security
            </h3>
            <div className="space-y-3">
              <SettingItem
                label="Change Password"
                description="Update your password"
                icon={<Lock size={20} />}
                onClick={() => setShowPasswordModal(true)}
              />
              <SettingItem
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
                icon={<Shield size={20} />}
                onClick={() => {}}
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={20} />
              Preferences
            </h3>
            <div className="space-y-3">
              <SettingItem
                label="Notification Settings"
                description="Manage your notifications"
                icon={<Bell size={20} />}
                onClick={() => {}}
              />
              <SettingToggle
                label="Private Profile"
                description="Make your profile private"
                icon={<Shield size={20} />}
                defaultValue={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="App Theme"
                description={theme === "light" ? "Light mode" : "Dark mode"}
                icon={
                  theme === "light" ? <Sun size={20} /> : <Moon size={20} />
                }
                defaultValue={theme === "dark"}
                onChange={toggleTheme}
              />
            </div>
          </div>

          {/* Referral Section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Referral Program
            </h3>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-gray-700 mb-3">Your referral code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono font-bold text-orange-700 bg-white px-4 py-2 rounded-lg">
                  TRAINER123REF
                </code>
                <button
                  onClick={copyReferral}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
                >
                  {referralCopied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Share this code with friends and earn rewards!
              </p>
            </div>
          </div>

          {/* Trainer-Specific Section */}
          {user.role === "trainer" && (
            <>
              <div className="border-b border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Trainer Tools
                </h3>
                <div className="space-y-3">
                  <SettingItem
                    label="Verification Status"
                    description="View and manage your certifications"
                    icon={<Verified size={20} />}
                    onClick={() => {}}
                  />
                  <SettingItem
                    label="Upload Documents"
                    description="Add certificates and ID"
                    icon={<Upload size={20} />}
                    onClick={() => {}}
                  />
                  <SettingItem
                    label="Manage Clients"
                    description="View your clients and sessions"
                    icon={<Users size={20} />}
                    onClick={() => navigate("/trainer-dashboard")}
                  />
                  <SettingItem
                    label="Analytics"
                    description="View your performance metrics"
                    icon={<TrendingUp size={20} />}
                    onClick={() => {}}
                  />
                </div>
              </div>
            </>
          )}

          {/* About Section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">App Version: 2.0.0</p>
              <p className="text-sm text-gray-600">
                Member since: January 2024
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <input
              type="text"
              placeholder="Full Name"
              defaultValue={user.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Bio"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Height (cm)"
                defaultValue={user.height}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                defaultValue={user.weight}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  toast.success("Profile updated!");
                }}
                className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function SettingItem({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
    >
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

function SettingToggle({
  label,
  description,
  icon,
  defaultValue,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => {
          const newValue = !value;
          setValue(newValue);
          onChange(newValue);
        }}
        className={`w-12 h-7 rounded-full transition-all ${
          value ? "bg-orange-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
