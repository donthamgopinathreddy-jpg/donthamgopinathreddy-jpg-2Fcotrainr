import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ImageIcon,
  Video,
  Loader,
  X,
  Send,
  Users,
  User,
  Follow,
  Unfollow,
  Search,
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
      const { data, error } = await supabase
        .from("posts")
        .select("*, users(id, full_name, profile_picture_url)")
        .order("created_at", { ascending: false })
        .limit(20);

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
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, profile_picture_url, bio")
        .neq("id", userProfile?.id)
        .limit(30);

      if (error) throw error;
      setCommunityUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load community");
      setCommunityUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (postImage && userProfile?.id) {
        const timestamp = Date.now();
        const filename = `${userProfile.id}/${timestamp}_${postImage.name}`;

        const { data, error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filename, postImage);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filename);
        imageUrl = publicUrl;
      }

      // Create post
      const { data, error } = await supabase.from("posts").insert({
        user_id: userProfile?.id,
        content: postContent,
        image_url: imageUrl,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;

      toast.success("Post created successfully! 🎉");
      setPostContent("");
      setPostImage(null);
      setPostImagePreview("");
      setShowPostForm(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const newLikesCount = post.is_liked
        ? post.likes_count - 1
        : post.likes_count + 1;

      const { error } = await supabase
        .from("posts")
        .update({ likes_count: newLikesCount })
        .eq("id", postId);

      if (error) throw error;

      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, likes_count: newLikesCount, is_liked: !p.is_liked }
            : p,
        ),
      );
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      if (!userProfile?.id) return;

      const { error } = await supabase.from("follows").insert({
        follower_id: userProfile.id,
        following_id: userId,
      });

      if (error) throw error;

      setCommunityUsers(
        communityUsers.map((u) =>
          u.id === userId ? { ...u, is_following: true } : u,
        ),
      );
      toast.success("Following user! 👥");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      if (!userProfile?.id) return;

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", userProfile.id)
        .eq("following_id", userId);

      if (error) throw error;

      setCommunityUsers(
        communityUsers.map((u) =>
          u.id === userId ? { ...u, is_following: false } : u,
        ),
      );
      toast.success("Unfollowed user");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    }
  };

  const filteredUsers = communityUsers.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black"
          : "bg-gradient-to-br from-white via-gray-50 to-white"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 py-6 border-b transition-all duration-300 ${
            theme === "dark"
              ? "bg-gray-900/80 border-gray-800/50 backdrop-blur"
              : "bg-white/80 border-gray-200/50 backdrop-blur"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Community
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Share, connect & grow together
              </p>
            </div>
            <Users size={28} className="text-blue-500" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "feed"
                  ? theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : theme === "dark"
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "users"
                  ? theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : theme === "dark"
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Discover
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "feed" ? (
          <div className="space-y-6 py-6">
            {/* Create Post Button */}
            {!showPostForm && (
              <button
                onClick={() => setShowPostForm(true)}
                className={`w-full rounded-2xl backdrop-blur-xl p-4 border text-left transition-all duration-300 hover:shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30 hover:border-gray-600/50"
                    : "bg-gradient-to-br from-white/60 to-white/40 border-white/40 hover:border-white/60"
                }`}
              >
                <p
                  className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  What's on your mind? ✨
                </p>
                <div className="flex gap-2 mt-3">
                  <ImageIcon size={18} className="text-blue-500" />
                  <Video size={18} className="text-purple-500" />
                </div>
              </button>
            )}

            {/* Post Form */}
            {showPostForm && (
              <div
                className={`rounded-2xl backdrop-blur-xl p-6 border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
                    : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Create Post
                  </h3>
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setPostContent("");
                      setPostImage(null);
                      setPostImagePreview("");
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Text Area */}
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? Share your fitness journey..."
                  rows={4}
                  className={`w-full rounded-lg p-3 mb-4 resize-none border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500"
                      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                  }`}
                />

                {/* Image Preview */}
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
                      className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <label className="flex-1 cursor-pointer">
                    <div
                      className={`p-3 rounded-lg text-center transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                    >
                      <ImageIcon size={18} className="mx-auto" />
                      <span className="text-xs font-semibold mt-1 block">
                        Add Image
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <div
                    className={`flex-1 p-3 rounded-lg text-center cursor-not-allowed opacity-50 ${
                      theme === "dark"
                        ? "bg-purple-900/30 text-purple-300"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <Video size={18} className="mx-auto" />
                    <span className="text-xs font-semibold mt-1 block">
                      Add Video
                    </span>
                  </div>
                </div>

                {/* Post Button */}
                <button
                  onClick={handleCreatePost}
                  disabled={loading || (!postContent.trim() && !postImage)}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || (!postContent.trim() && !postImage)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:scale-105"
                  } bg-gradient-to-r from-blue-500 to-cyan-500 text-white`}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Post
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Posts Feed */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-2xl backdrop-blur-xl p-6 border transition-all duration-300 hover:shadow-lg ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
                      : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
                  }`}
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {post.user.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {post.user.full_name}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p
                    className={`mb-4 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full rounded-lg mb-4 object-cover max-h-96"
                    />
                  )}

                  {/* Post Actions */}
                  <div className="flex gap-4 pt-4 border-t border-gray-700/30">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        post.is_liked
                          ? theme === "dark"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-red-100 text-red-600"
                          : theme === "dark"
                            ? "text-gray-400 hover:bg-gray-700/30"
                            : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={post.is_liked ? "currentColor" : "none"}
                      />
                      <span className="text-sm font-semibold">
                        {post.likes_count}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setShowComments(
                          showComments === post.id ? null : post.id,
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:bg-gray-700/30"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm font-semibold">
                        {post.comments_count}
                      </span>
                    </button>

                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:bg-gray-700/30"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Share2 size={18} />
                      <span className="text-sm font-semibold">Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700/30">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className={`flex-1 rounded-lg p-2 text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === "dark"
                              ? "bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500"
                              : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                          }`}
                        />
                        <button className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                className={`text-center py-12 rounded-2xl ${
                  theme === "dark" ? "bg-gray-800/20" : "bg-white/30"
                }`}
              >
                <p
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No posts yet. Be the first to share! 🚀
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Users/Discovery Tab */
          <div className="space-y-6 py-6">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-3 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Search community members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Users Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className={`rounded-xl p-4 backdrop-blur-xl border text-left transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/30"
                        : "bg-gradient-to-br from-white/60 to-white/40 border-white/40"
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mb-3">
                      {user.full_name?.charAt(0) || "U"}
                    </div>

                    <h3
                      className={`font-bold text-sm mb-1 truncate ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.full_name}
                    </h3>

                    {user.bio && (
                      <p
                        className={`text-xs mb-3 line-clamp-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user.bio}
                      </p>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        user.is_following
                          ? handleUnfollowUser(user.id)
                          : handleFollowUser(user.id);
                      }}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                        user.is_following
                          ? theme === "dark"
                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg"
                      }`}
                    >
                      {user.is_following ? "Following" : "+ Follow"}
                    </button>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-12 rounded-2xl ${
                  theme === "dark" ? "bg-gray-800/20" : "bg-white/30"
                }`}
              >
                <p
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No users found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
