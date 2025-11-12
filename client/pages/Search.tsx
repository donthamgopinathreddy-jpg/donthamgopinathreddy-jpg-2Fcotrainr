import { useState, useMemo } from "react";
import { Search as SearchIcon, UserPlus, UserCheck, MapPin, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  location?: string;
  bio?: string;
  followers?: number;
  rating?: number;
  verified?: boolean;
  role: "client" | "trainer";
}

// Mock user data - in production, this would come from Supabase
const MOCK_USERS: User[] = [
  {
    id: "user_1",
    username: "priya_singh",
    full_name: "Priya Singh",
    profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    location: "Mumbai, India",
    bio: "Fitness enthusiast | Personal trainer",
    followers: 234,
    rating: 4.8,
    verified: true,
    role: "trainer",
  },
  {
    id: "user_2",
    username: "amit_kumar",
    full_name: "Amit Kumar",
    profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    location: "Delhi, India",
    bio: "Gym & CrossFit trainer",
    followers: 456,
    rating: 4.9,
    verified: true,
    role: "trainer",
  },
  {
    id: "user_3",
    username: "neha_verma",
    full_name: "Neha Verma",
    profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    location: "Bangalore, India",
    bio: "Yoga instructor & wellness coach",
    followers: 321,
    rating: 4.7,
    verified: true,
    role: "trainer",
  },
  {
    id: "user_4",
    username: "rahul_fitness",
    full_name: "Rahul Sharma",
    profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    location: "Pune, India",
    bio: "Strength & conditioning coach",
    followers: 189,
    rating: 4.6,
    verified: false,
    role: "trainer",
  },
  {
    id: "user_5",
    username: "sarah_wellness",
    full_name: "Sarah Williams",
    profile_picture_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    location: "Hyderabad, India",
    bio: "Nutrition & fitness expert",
    followers: 267,
    rating: 4.9,
    verified: true,
    role: "trainer",
  },
];

export default function Search() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Search users by username or full name
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_USERS;

    const query = searchQuery.toLowerCase();
    return MOCK_USERS.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.full_name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleFollow = (userId: string) => {
    const newFollowed = new Set(followedUsers);
    if (newFollowed.has(userId)) {
      newFollowed.delete(userId);
      toast.success("Unfollowed");
    } else {
      newFollowed.add(userId);
      toast.success("Following!");
    }
    setFollowedUsers(newFollowed);
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

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <p
                className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
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
                      className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${
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
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        {user.location && (
                          <div
                            className={`flex items-center gap-1 ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.rating && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{user.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollow(user.id)}
                    className={`ml-2 flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                      followedUsers.has(user.id)
                        ? theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {followedUsers.has(user.id) ? (
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
          ) : (
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
          )}

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
                💡 <strong>Tip:</strong> Search by username (e.g., @priya_singh) or full name to find and follow trainers and users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
