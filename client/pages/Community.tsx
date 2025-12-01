import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ImageIcon,
  Loader,
  X,
  Send,
  Users,
  Flame,
  ArrowRight,
  Search,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
  };
  is_liked?: boolean;
}

interface CommunityUser {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  bio?: string;
  is_following?: boolean;
}

const Community = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme } = useTheme();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string>("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "users">("feed");
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Fetch community feed
  useEffect(() => {
    if (activeTab === "feed") {
      fetchPosts();
    } else {
      fetchCommunityUsers();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/posts");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const { data } = await response.json();
      const error = null;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load feed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityUsers = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/community/users", window.location.origin);
      if (userProfile?.id) {
        url.searchParams.append("excludeId", userProfile.id);
      }

      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const { data } = await response.json();
      setCommunityUsers(data || []);
    } catch (error) {
      console.error("Error fetching community users:", error);
      toast.error("Failed to load users");
      setCommunityUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPostImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) {
      toast.error("Please add content or an image");
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (postImage) {
        const formData = new FormData();
        formData.append("file", postImage);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postContent,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      toast.success("Post created!");
      setPostContent("");
      setPostImage(null);
      setPostImagePreview("");
      setShowPostForm(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black"
          : "bg-gradient-to-br from-orange-50 via-white to-blue-50"
      } pb-24`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 border-b ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-xl`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  CoCircle
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Connect & Inspire
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`flex border-t ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => {
                setActiveTab("feed");
                setShowPostForm(false);
              }}
              className={`flex-1 py-4 px-4 font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === "feed"
                  ? `border-orange-500 ${
                      theme === "dark" ? "text-orange-400" : "text-orange-600"
                    }`
                  : `border-transparent ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`
              }`}
            >
              <Flame size={20} />
              Feed
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                setShowPostForm(false);
              }}
              className={`flex-1 py-4 px-4 font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === "users"
                  ? `border-purple-500 ${
                      theme === "dark" ? "text-purple-400" : "text-purple-600"
                    }`
                  : `border-transparent ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`
              }`}
            >
              <Users size={20} />
              People
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "feed" ? (
          <>
            {/* Create Post Section */}
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                className={`w-full mb-6 p-4 rounded-2xl border-2 border-dashed transition-all hover:border-opacity-100 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-900/50 hover:bg-gray-900"
                    : "border-orange-200 bg-orange-50/50 hover:bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-3 text-center">
                  <div className="flex-1 text-left">
                    <p
                      className={`font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      What's on your mind?
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      Share your fitness journey with the community
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className={theme === "dark" ? "text-gray-500" : "text-orange-400"}
                  />
                </div>
              </button>
            ) : (
              /* Post Form */
              <div
                className={`mb-6 rounded-2xl border-2 p-4 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
                    {userProfile?.profile_picture_url ? (
                      <img
                        src={userProfile.profile_picture_url}
                        alt={userProfile.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {getInitials(userProfile?.full_name)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your fitness journey..."
                      className={`w-full rounded-lg p-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      rows={4}
                    />
                  </div>
                </div>

                {postImagePreview && (
                  <div className="relative mb-4 rounded-lg overflow-hidden">
                    <img
                      src={postImagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover"
                    />
                    <button
                      onClick={() => {
                        setPostImage(null);
                        setPostImagePreview("");
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100/10 hover:bg-gray-100/20 cursor-pointer transition-all">
                    <ImageIcon size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setPostContent("");
                      setPostImage(null);
                      setPostImagePreview("");
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() && !postImage}
                    className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Post Header */}
                    <div className="p-4 border-b border-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {post.user.profile_picture_url ? (
                            <img
                              src={post.user.profile_picture_url}
                              alt={post.user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {getInitials(post.user.full_name)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {post.user.full_name}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark" ? "text-gray-500" : "text-gray-600"
                            }`}
                          >
                            {timeAgo(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 py-3">
                      <p
                        className={
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }
                      >
                        {post.content}
                      </p>
                    </div>

                    {/* Post Image */}
                    {post.image_url && (
                      <div className="px-4 py-2">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full rounded-lg max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Post Stats */}
                    <div
                      className={`px-4 py-2 text-sm flex gap-4 border-t ${
                        theme === "dark"
                          ? "border-gray-800 text-gray-400"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <span>{post.likes_count} likes</span>
                      <span>{post.comments_count} comments</span>
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 py-2 flex gap-2 border-t border-gray-800/30">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:bg-opacity-20 ${
                          post.is_liked
                            ? "text-red-500 hover:bg-red-500"
                            : theme === "dark"
                              ? "text-gray-400 hover:bg-red-500"
                              : "text-gray-600 hover:bg-red-500"
                        }`}
                      >
                        <Heart
                          size={18}
                          className={post.is_liked ? "fill-current" : ""}
                        />
                        Like
                      </button>
                      <button
                        onClick={() =>
                          setShowComments(
                            showComments === post.id ? null : post.id
                          )
                        }
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:bg-blue-500 hover:bg-opacity-20 ${
                          theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        <MessageCircle size={18} />
                        Comment
                      </button>
                      <button
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:bg-green-500 hover:bg-opacity-20 ${
                          theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    theme === "dark"
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-orange-100 to-pink-100"
                  }`}
                >
                  <Flame
                    size={40}
                    className={theme === "dark" ? "text-gray-600" : "text-orange-400"}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No posts yet
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Be the first to share your fitness journey!
                </p>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  Create Post
                </button>
              </div>
            )}
          </>
        ) : (
          /* Users Tab */
          <>
            <div className="mb-4 relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchCommunityUsers();
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200"
                }`}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin" />
              </div>
            ) : communityUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {communityUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-lg cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {getInitials(user.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.full_name}
                      </p>
                      {user.bio && (
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {user.bio}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        user.is_following
                          ? theme === "dark"
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-900"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      }`}
                    >
                      {user.is_following ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    theme === "dark"
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-purple-100 to-pink-100"
                  }`}
                >
                  <Users
                    size={40}
                    className={theme === "dark" ? "text-gray-600" : "text-purple-400"}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No members found
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Try adjusting your search
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
