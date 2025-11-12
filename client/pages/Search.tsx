import { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  UserPlus,
  UserCheck,
  Star,
  Loader,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearch } from "@/hooks/useSearch";
import { useFollows } from "@/hooks/useFollows";
import { toast } from "sonner";

export default function Search() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: searchResults,
    loading: searchLoading,
    searchUsers,
  } = useSearch();
  const { isFollowing, toggleFollow } = useFollows();
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleFollow = async (userId: string) => {
    setIsTogglingId(userId);
    try {
      const success = await toggleFollow(userId);
      if (success) {
        toast.success(isFollowing(userId) ? "Unfollowed" : "Following!");
      } else {
        toast.error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Something went wrong");
    } finally {
      setIsTogglingId(null);
    }
  };

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b ${
            theme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          } px-4 py-6`}
        >
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Search Users
          </h1>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Find and follow trainers and users
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Loading State */}
          {searchLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Search Results */}
          {!searchLoading && searchResults.length > 0 ? (
            <div className="space-y-3">
              <p
                className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"} found
              </p>

              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-2xl p-4 flex items-center justify-between transition-colors ${
                    theme === "dark"
                      ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800"
                      : "bg-gradient-to-br from-yellow-50/40 to-amber-50/40 border border-yellow-200/30 backdrop-blur-md hover:border-yellow-300/50"
                  }`}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      {user.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center font-bold ${
                            theme === "dark"
                              ? "bg-gray-600 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {user.full_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold truncate ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user.full_name}
                        </h3>
                        {user.verified && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        @{user.username}
                      </p>

                      {/* User Details */}
                      {user.rating && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{user.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollow(user.id)}
                    disabled={isTogglingId === user.id}
                    className={`ml-2 flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap disabled:opacity-50 flex-shrink-0 ${
                      isFollowing(user.id)
                        ? theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {isTogglingId === user.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : isFollowing(user.id) ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : !searchLoading && searchQuery && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon
                className={`w-12 h-12 mx-auto mb-4 ${
                  theme === "dark" ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                No users found
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Try searching for a different username or name
              </p>
            </div>
          ) : null}

          {/* Tips */}
          {!searchQuery && (
            <div
              className={`rounded-lg p-4 ${
                theme === "dark"
                  ? "bg-gray-800/50 border border-gray-700/50"
                  : "bg-blue-50/50 border border-blue-200/30"
              }`}
            >
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                💡 <strong>Tip:</strong> Search by username (e.g., @priya_singh)
                or full name to find and follow trainers and users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
