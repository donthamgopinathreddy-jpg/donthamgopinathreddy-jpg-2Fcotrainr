import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Loader } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowers } from "@/hooks/useFollowers";
import { useFollows } from "@/hooks/useFollows";

export default function FollowingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { following, loading } = useFollowers(userProfile?.id);
  const { isFollowing, toggleFollow } = useFollows();
  const [followingStates, setFollowingStates] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [isTogglingFollow, setIsTogglingFollow] = useState<
    Map<string, boolean>
  >(new Map());

  useEffect(() => {
    const states = new Map<string, boolean>();
    following.forEach((user) => {
      states.set(user.id, isFollowing(user.id));
    });
    setFollowingStates(states);
  }, [following, isFollowing]);

  const handleToggleFollow = async (userId: string) => {
    setIsTogglingFollow((prev) => new Map(prev).set(userId, true));
    try {
      await toggleFollow(userId);
      setFollowingStates((prev) => {
        const newStates = new Map(prev);
        newStates.set(userId, !newStates.get(userId));
        return newStates;
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsTogglingFollow((prev) => new Map(prev).set(userId, false));
    }
  };

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b p-4`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Following
            </h1>
            <span
              className={`ml-auto text-lg font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {following.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : following.length === 0 ? (
          <div
            className={`text-center py-12 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">
              Not following anyone yet
            </p>
            <p className="text-sm">
              <button
                onClick={() => navigate("/discover")}
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                Discover trainers and users
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-800/80"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Avatar */}
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="text-left w-full hover:opacity-80 transition-opacity"
                  >
                    <p
                      className={`font-semibold text-sm ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.full_name}
                    </p>
                    {user.username && (
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        @{user.username}
                      </p>
                    )}
                    {user.bio && (
                      <p
                        className={`text-xs line-clamp-1 mt-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.bio}
                      </p>
                    )}
                  </button>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleToggleFollow(user.id)}
                  disabled={isTogglingFollow.get(user.id) || false}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
                    followingStates.get(user.id)
                      ? theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {isTogglingFollow.get(user.id) ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : followingStates.get(user.id) ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
