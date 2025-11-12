import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Loader, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useFollows } from "@/hooks/useFollows";
import { toast } from "sonner";

interface UserData {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  bio?: string;
  role: "client" | "trainer";
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isFollowing, toggleFollow } = useFollows();
  const { userProfile: currentUser, updateProfile } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, username, full_name, profile_picture_url, bio, role")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
          toast.error("User not found");
          navigate("/feed");
          return;
        }

        setUser(userData as UserData);
        setBioText(userData.bio || "");

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error fetching posts:", postsError);
          setPosts([]);
        } else {
          setPosts(postsData || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, navigate]);

  const handleFollow = async () => {
    if (!userId) return;

    setIsTogglingFollow(true);
    try {
      const success = await toggleFollow(userId);
      if (success) {
        toast.success(
          isFollowing(userId) ? "Unfollowed" : "Following!"
        );
      } else {
        toast.error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Something went wrong");
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSaveBio = async () => {
    if (!userId) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("users")
        .update({ bio: bioText })
        .eq("id", userId);

      if (error) {
        toast.error("Failed to save bio");
        return;
      }

      // Update local state
      if (user) {
        setUser({ ...user, bio: bioText });
      }

      setEditingBio(false);
      toast.success("Bio updated!");
    } catch (error) {
      console.error("Error saving bio:", error);
      toast.error("Failed to save bio");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen pb-24 flex items-center justify-center ${
          theme === "light" ? "bg-white" : "bg-gray-950"
        }`}
      >
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`min-h-screen pb-24 ${
          theme === "light" ? "bg-white" : "bg-gray-950"
        }`}
      >
        <div className="max-w-md mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/feed")}
            className={`flex items-center gap-2 mb-4 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <p className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
            User not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "light" ? "bg-white" : "bg-gray-950"
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b px-4 py-4 ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <button
            onClick={() => navigate("/feed")}
            className={`flex items-center gap-2 mb-4 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </button>
        </div>

        {/* User Info */}
        <div
          className={`border-b px-4 py-6 ${
            theme === "light"
              ? "bg-gray-50 border-gray-200"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                  theme === "light" ? "bg-gray-300 text-gray-700" : "bg-gray-700 text-white"
                }`}
              >
                {user.full_name.charAt(0)}
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {user.full_name}
                </h1>
                <p
                  className={theme === "light" ? "text-gray-600" : "text-gray-400"}
                >
                  @{user.username}
                </p>
                {user.role === "trainer" && (
                  <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded mt-1 inline-block">
                    Trainer
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleFollow}
              disabled={isTogglingFollow}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isFollowing(user.id)
                  ? theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {isFollowing(user.id) ? "Following" : "Follow"}
            </button>
          </div>

          {user.bio && (
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              {user.bio}
            </p>
          )}
        </div>

        {/* Posts */}
        <div className="px-4 py-6 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p
                className={theme === "light" ? "text-gray-500" : "text-gray-400"}
              >
                No posts yet
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`rounded-xl p-4 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <p
                  className={`text-sm mb-3 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {post.content}
                </p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full rounded-lg mb-3 max-h-64 object-cover"
                  />
                )}

                {post.video_url && (
                  <video
                    src={post.video_url}
                    className="w-full rounded-lg mb-3 max-h-64 object-cover"
                    controls
                  />
                )}

                <div className="flex items-center justify-between text-xs">
                  <span
                    className={theme === "light" ? "text-gray-500" : "text-gray-400"}
                  >
                    {formatDate(post.created_at)}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedPosts.has(post.id)
                            ? "fill-red-500 text-red-500"
                            : theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                        }`}
                      />
                      <span
                        className={theme === "light" ? "text-gray-600" : "text-gray-400"}
                      >
                        {post.likes_count}
                      </span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle
                        className={theme === "light" ? "text-gray-500" : "text-gray-400"}
                      />
                      <span
                        className={theme === "light" ? "text-gray-600" : "text-gray-400"}
                      >
                        {post.comments_count}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
