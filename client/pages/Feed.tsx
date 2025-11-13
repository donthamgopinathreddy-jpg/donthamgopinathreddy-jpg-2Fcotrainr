import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  UserPlus,
  UserCheck,
  Paperclip,
  X,
  AtSign,
  Search as SearchIcon,
  Loader,
  ChevronDown,
} from "lucide-react";
import { usePosts, Post } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearch, SearchUser } from "@/hooks/useSearch";
import { useFollows } from "@/hooks/useFollows";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Feed() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const { posts, createPost, likePost, incrementComments, loading } =
    usePosts();
  const {
    results: searchResults,
    loading: searchLoading,
    searchUsers,
  } = useSearch();
  const { isFollowing, toggleFollow } = useFollows();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [selectedSearchUser, setSelectedSearchUser] = useState<SearchUser | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // Fetch posts for the selected user
  const fetchUserPosts = async (userId: string) => {
    setLoadingUserPosts(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Enrich with user details
        const { data: userData } = await supabase
          .from("users")
          .select("id, full_name, profile_picture_url, role")
          .eq("id", userId)
          .single();

        const enriched: Post[] = data.map((post) => ({
          ...post,
          author_name: userData?.full_name || "Unknown",
          author_avatar: userData?.profile_picture_url,
          author_role: userData?.role as "trainer" | "client" | undefined,
        }));

        setUserPosts(enriched);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setUserPosts([]);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  const handleSelectSearchUser = (user: SearchUser) => {
    setSelectedSearchUser(user);
    fetchUserPosts(user.id);
  };

  const AVAILABLE_USERS = [
    "Priya Singh",
    "Amit Kumar",
    "Neha Verma",
    "Sneha Patel",
    "Raj Patel",
    "Sarah Williams",
    "Mike Chen",
    "Emma Davis",
  ];

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith("video") ? "video" : "image";
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedMedia(event.target?.result as string);
      setMediaType(type);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMention = (userName: string) => {
    if (!mentions.includes(userName)) {
      setMentions([...mentions, userName]);
      setNewPostContent((prev) => {
        const withMention =
          prev + (prev ? " " : "") + `@${userName.replace(/\s+/g, "")}`;
        return withMention;
      });
    }
    setShowMentionSuggestions(false);
    setMentionSearch("");
  };

  const filteredUsers = AVAILABLE_USERS.filter(
    (user) =>
      user.toLowerCase().includes(mentionSearch.toLowerCase()) &&
      !mentions.includes(user),
  );

  const handleNewPost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Please write something to post");
      return;
    }

    setPostLoading(true);
    try {
      await createPost({
        content: newPostContent,
        image_url:
          mediaType === "image" ? selectedMedia || undefined : undefined,
        video_url:
          mediaType === "video" ? selectedMedia || undefined : undefined,
      });

      setNewPostContent("");
      setSelectedMedia(null);
      setMediaType(null);
      setMentions([]);
      setShowNewPost(false);
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setPostLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      await likePost(postId);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    try {
      await incrementComments(postId);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "light" ? "bg-white" : "bg-gray-950"
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b px-4 py-6 ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <h1
            className={`text-3xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}
          >
            Community Feed
          </h1>
          <p
            className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
          >
            Share your progress and inspiration
          </p>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`mt-4 w-full flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              theme === "light"
                ? "bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-900"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            }`}
          >
            <SearchIcon className="w-4 h-4" />
            <span className="text-sm">Find trainers and users...</span>
          </button>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div
            className={`border-b px-4 py-4 ${
              theme === "light"
                ? "bg-gray-50 border-gray-200"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                theme === "light"
                  ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  : "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
              }`}
            />

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {searchResults.length > 0 && (
                  <>
                    <p
                      className={`text-xs font-semibold ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "result" : "results"} found
                    </p>

                    {searchResults.map((user) => (
                      <div key={user.id} className="space-y-2">
                        <div
                          onClick={() => handleSelectSearchUser(user)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedSearchUser?.id === user.id
                              ? theme === "light"
                                ? "bg-blue-50 border border-blue-300"
                                : "bg-blue-900/40 border border-blue-700"
                              : theme === "light"
                                ? "bg-white border border-gray-200 hover:bg-gray-50"
                                : "bg-gray-700 border border-gray-600 hover:bg-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                                theme === "light"
                                  ? "bg-gray-300 text-gray-700"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {user.full_name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  theme === "light"
                                    ? "text-gray-900"
                                    : "text-white"
                                }`}
                              >
                                {user.full_name}
                              </p>
                              <p
                                className={`text-xs truncate ${
                                  theme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              >
                                @{user.username}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(user.id);
                            }}
                            disabled={isTogglingId === user.id}
                            className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 flex-shrink-0 ${
                              isFollowing(user.id)
                                ? theme === "light"
                                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  : "bg-gray-600 text-white hover:bg-gray-500"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                          >
                            {isTogglingId === user.id ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : isFollowing(user.id) ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Show posts for selected user */}
                        {selectedSearchUser?.id === user.id && (
                          <div className="ml-3 pl-3 border-l-2 border-primary space-y-3 pb-2">
                            {loadingUserPosts && (
                              <div className="flex items-center justify-center py-3">
                                <Loader className="w-4 h-4 animate-spin text-primary" />
                              </div>
                            )}
                            {!loadingUserPosts && userPosts.length === 0 && (
                              <p className={`text-xs italic ${
                                theme === "light" ? "text-gray-500" : "text-gray-400"
                              }`}>
                                No posts yet
                              </p>
                            )}
                            {!loadingUserPosts && userPosts.map((post) => (
                              <div
                                key={post.id}
                                className={`rounded-lg overflow-hidden border ${
                                  theme === "light"
                                    ? "bg-white border-gray-100"
                                    : "bg-gray-800 border-gray-700"
                                }`}
                              >
                                {/* Post Header */}
                                <div className={`px-3 py-2 border-b ${
                                  theme === "light"
                                    ? "border-gray-100"
                                    : "border-gray-700"
                                }`}>
                                  <p className={`text-xs font-semibold ${
                                    theme === "light"
                                      ? "text-gray-900"
                                      : "text-white"
                                  }`}>
                                    {formatDate(post.created_at)}
                                  </p>
                                </div>

                                {/* Post Content */}
                                <div className="px-3 py-2">
                                  <p className={`text-xs leading-relaxed ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-300"
                                  }`}>
                                    {post.content}
                                  </p>
                                </div>

                                {/* Post Image */}
                                {post.image_url && (
                                  <div className="w-full h-32 overflow-hidden">
                                    <img
                                      src={post.image_url}
                                      alt="Post"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                {/* Post Video */}
                                {post.video_url && (
                                  <div className="w-full h-32 overflow-hidden">
                                    <video
                                      src={post.video_url}
                                      className="w-full h-full object-cover"
                                      controls
                                    />
                                  </div>
                                )}

                                {/* Post Actions */}
                                <div className={`px-3 py-2 border-t flex items-center justify-around text-xs ${
                                  theme === "light"
                                    ? "border-gray-100"
                                    : "border-gray-700"
                                }`}>
                                  <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1 font-medium transition-colors ${
                                      likedPosts.has(post.id)
                                        ? "text-red-500"
                                        : theme === "light"
                                          ? "text-gray-600 hover:text-red-500"
                                          : "text-gray-400 hover:text-red-500"
                                    }`}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${likedPosts.has(post.id) ? "fill-red-500" : ""}`}
                                    />
                                    <span>{post.likes_count}</span>
                                  </button>
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    className={`flex items-center gap-1 font-medium transition-colors ${
                                      theme === "light"
                                        ? "text-gray-600 hover:text-primary"
                                        : "text-gray-400 hover:text-primary"
                                    }`}
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{post.comments_count}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {searchLoading && searchResults.length === 0 && (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}

                {!searchLoading &&
                  searchQuery &&
                  searchResults.length === 0 && (
                    <p
                      className={`text-xs text-center py-4 ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      No users found
                    </p>
                  )}
              </div>
            )}
          </div>
        )}

        {/* New Post Button */}
        <div className="px-4 py-4">
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <div className="px-4 pb-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <textarea
                placeholder="Share your fitness journey, tips, or motivation... ✨"
                value={newPostContent}
                onChange={(e) => {
                  setNewPostContent(e.target.value);
                  const lastWord = e.target.value.split(/\s+/).pop() || "";
                  if (lastWord.startsWith("@")) {
                    setMentionSearch(lastWord.slice(1));
                    setShowMentionSuggestions(true);
                  } else {
                    setShowMentionSuggestions(false);
                  }
                }}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              {/* Mention Suggestions */}
              {showMentionSuggestions && filteredUsers.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user}
                      onClick={() => handleAddMention(user)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <AtSign className="w-4 h-4 text-blue-600" />
                      <span className="text-foreground">{user}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Mentions Display */}
              {mentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mentions.map((mention) => (
                    <div
                      key={mention}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      @{mention}
                      <button
                        onClick={() => {
                          setMentions(mentions.filter((m) => m !== mention));
                          setNewPostContent((prev) =>
                            prev
                              .replace(`@${mention.replace(/\s+/g, "")}`, "")
                              .trim(),
                          );
                        }}
                        className="hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Media Preview */}
              {selectedMedia && (
                <div className="relative rounded-lg overflow-hidden bg-gray-100 h-40">
                  {mediaType === "image" ? (
                    <img
                      src={selectedMedia}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={selectedMedia}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <button
                    onClick={() => {
                      setSelectedMedia(null);
                      setMediaType(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Media Upload Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                className="hidden"
              />

              {/* Upload and Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                  Add Media
                </button>
              </div>

              {/* Post and Cancel Buttons */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setShowNewPost(false)}
                  disabled={postLoading}
                  className="flex-1 bg-gray-300 text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewPost}
                  disabled={!newPostContent.trim() || postLoading}
                  className="flex-1 bg-gradient-primary text-gray-900 font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  {postLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-4 py-12 text-center">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        )}

        {/* Posts List */}
        {!loading && (
          <div className="px-4 space-y-4 pb-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to post!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {/* Post Header */}
                  <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0">
                      {getInitials(post.author_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">
                        {post.author_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.author_role === "trainer"
                          ? "🏋️ Trainer"
                          : "👤 Client"}{" "}
                        • {formatDate(post.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFollow(post.user_id)}
                      disabled={isTogglingId === post.user_id}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-xs transition-all flex-shrink-0 disabled:opacity-50 ${
                        isFollowing(post.user_id)
                          ? theme === "light"
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-gray-600 text-white hover:bg-gray-500"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isTogglingId === post.user_id ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : isFollowing(post.user_id) ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 py-2">
                    <p className="text-foreground text-sm leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="w-full h-64 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Video */}
                  {post.video_url && (
                    <div className="w-full h-64 overflow-hidden">
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between text-muted-foreground">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        likedPosts.has(post.id)
                          ? "text-red-500"
                          : "hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-red-500" : ""}`}
                      />
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => handleComment(post.id)}
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>{post.shares_count}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
