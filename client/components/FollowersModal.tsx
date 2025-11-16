import { useState } from "react";
import { X, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFollowers } from "@/hooks/useFollowers";
import { useAuth } from "@/contexts/AuthContext";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function FollowersModal({ isOpen, onClose, userId }: FollowersModalProps) {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { followers, following, loading } = useFollowers(userId || userProfile?.id);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");

  if (!isOpen) return null;

  const displayList = activeTab === "followers" ? followers : following;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark" ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {activeTab === "followers" ? "Followers" : "Following"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-0 border-b ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
              activeTab === "followers"
                ? `border-blue-500 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`
                : `border-transparent ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
              activeTab === "following"
                ? `border-blue-500 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`
                : `border-transparent ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div
              className={`flex items-center justify-center py-12 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : displayList.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center py-12 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-center">
                {activeTab === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y" className={theme === "dark" ? "divide-gray-800" : "divide-gray-200"}>
              {displayList.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 flex items-center gap-3 transition-colors hover:opacity-80 ${
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar */}
                  <img
                    src={user.profile_picture_url || "https://via.placeholder.com/48"}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {user.full_name}
                    </p>
                    {user.username && (
                      <p className={`text-sm truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        @{user.username}
                      </p>
                    )}
                    {user.bio && (
                      <p className={`text-xs line-clamp-1 mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
