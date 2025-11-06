import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Edit2, LogOut, Briefcase, Heart, Users, Award, MapPin, Camera } from "lucide-react";
import GlassyTile from "@/components/GlassyTile";

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

const MOCK_USER: UserType = {
  role: "client",
  name: "Admin User",
  gender: "Male",
  height: 180,
  weight: 75,
  isFollowing: false,
  followers: 0,
  following: 0,
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType>(MOCK_USER);
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser((prev) => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
    }));
  };

  const handleSaveEdit = () => {
    setUser((prev) => ({
      ...prev,
      name: editForm.name,
      gender: editForm.gender,
      height: editForm.height,
      weight: editForm.weight,
    }));
    setShowEditModal(false);
  };

  const isTrainer = user.role === "trainer";

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 px-4 py-12 text-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
          {isTrainer && (
            <p className="text-sm text-gray-700 mb-3">
              ⭐ {user.rating || 4.8} • {user.yearsExperience || 0}+ years experience
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{user.followers}</div>
              <p className="text-xs text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{user.following}</div>
              <p className="text-xs text-gray-600">Following</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 py-8 space-y-6">
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
              <Heart className={`w-5 h-5 ${isFollowing ? "fill-current" : ""}`} />
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}

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
                  {(user.weight / ((user.height / 100) ** 2)).toFixed(1)}
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
                    <p className="font-semibold text-gray-900">{user.location}</p>
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
            <GlassyTile
              icon={<Briefcase className="w-8 h-8" />}
              title="Become a Trainer"
              subtitle="Share your expertise and earn"
              onClick={() => navigate("/trainer-signup")}
              variant="primary"
            />
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
              onClick={() => navigate("/subscription")}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Subscription</span>
            </button>
            <button className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors text-red-600">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.height}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weight}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
