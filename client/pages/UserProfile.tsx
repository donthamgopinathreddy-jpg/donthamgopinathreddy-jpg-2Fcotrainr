import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Loader,
  Edit2,
  Trash2,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useFollows } from "@/hooks/useFollows";
import { useFollowerCounts } from "@/hooks/useFollowerCounts";
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

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author?: {
    username: string;
    full_name: string;
  };
}

interface Like {
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
  const [displayUserId, setDisplayUserId] = useState<string | undefined>();
  const { counts: followerCounts, refetch: refetchCounts } =
    useFollowerCounts(displayUserId);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [postComments, setPostComments] = useState<{
    [key: string]: Comment[];
  }>({});
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>(
    {},
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [likeLoading, setLikeLoading] = useState<Set<string>>(new Set());
  const [commentLoading, setCommentLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        // Try to fetch user data by ID first
        let userData = null;
        let userError = null;

        // Check if userId looks like a UUID (contains hyphens) or is a username
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            userId,
          );

        if (isUUID) {
          // Search by ID
          const result = await supabase
            .from("users")
            .select("id, username, full_name, profile_picture_url, bio, role")
            .eq("id", userId)
            .single();
          userData = result.data;
          userError = result.error;
        } else {
          // Search by username
          const result = await supabase
            .from("users")
            .select("id, username, full_name, profile_picture_url, bio, role")
            .eq("username", userId.toLowerCase())
            .single();
          userData = result.data;
          userError = result.error;
        }

        if (userError || !userData) {
          console.error("Error fetching user:", userError);
          toast.error("User not found");
          navigate("/feed");
          return;
        }

        setUser(userData as UserData);
        setBioText(userData.bio || "");
        setDisplayUserId(userData.id);

        // Fetch user's posts using the actual user ID from userData
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error fetching posts:", postsError);
          setPosts([]);
        } else {
          setPosts(postsData || []);

          // Fetch likes for current user if logged in
          if (currentUser?.id) {
            const postIds = (postsData || []).map((p) => p.id);
            if (postIds.length > 0) {
              const { data: likesData } = await supabase
                .from("post_likes")
                .select("post_id")
                .eq("user_id", currentUser.id)
                .in("post_id", postIds);

              if (likesData) {
                setLikedPosts(new Set(likesData.map((l) => l.post_id)));
              }
            }
          }
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
  }, [userId, navigate, currentUser?.id]);

  const handleFollow = async () => {
    if (!user?.id) return;

    setIsTogglingFollow(true);
    try {
      const success = await toggleFollow(user.id);
      if (success) {
        toast.success(isFollowing(user.id) ? "Unfollowed" : "Following!");
        // Refetch follower counts after follow action
        await refetchCounts(user.id);
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

  const handleLike = async (postId: string) => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to like posts");
      return;
    }

    setLikeLoading((prev) => new Set(prev).add(postId));

    try {
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        // Unlike: delete from post_likes table
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);

        // Update likes_count
        const post = posts.find((p) => p.id === postId);
        if (post && post.likes_count > 0) {
          await supabase
            .from("posts")
            .update({ likes_count: post.likes_count - 1 })
            .eq("id", postId);
        }

        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes_count: Math.max(0, p.likes_count - 1) }
              : p,
          ),
        );
      } else {
        // Like: insert into post_likes table
        await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: currentUser.id,
        });

        // Update likes_count
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await supabase
            .from("posts")
            .update({ likes_count: post.likes_count + 1 })
            .eq("id", postId);

          // Create notification for the post owner (if not liking own post)
          if (post.user_id !== currentUser.id) {
            await supabase.from("notifications").insert({
              user_id: post.user_id,
              actor_id: currentUser.id,
              type: "like",
              post_id: postId,
            });
          }
        }

        setLikedPosts((prev) => new Set(prev).add(postId));

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setLikeLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleSaveBio = async () => {
    if (!user?.id) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("users")
        .update({ bio: bioText })
        .eq("id", user.id);

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

  const handleDeletePost = async (postId: string) => {
    if (!currentUser?.id || currentUser.id !== user?.id) {
      toast.error("You can only delete your own posts");
      return;
    }

    try {
      // Delete likes associated with post
      await supabase.from("post_likes").delete().eq("post_id", postId);

      // Delete comments associated with post
      await supabase.from("post_comments").delete().eq("post_id", postId);

      // Delete the post
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", currentUser.id);

      if (error) {
        toast.error("Failed to delete post");
        return;
      }

      setPosts(posts.filter((p) => p.id !== postId));
      setShowDeleteConfirm(null);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const fetchPostComments = async (postId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("id, content, user_id, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // Fetch user info for comments
      const userIds = [...new Set((commentsData || []).map((c) => c.user_id))];
      let userMap: { [key: string]: any } = {};

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, username, full_name")
          .in("id", userIds);

        if (usersData) {
          userMap = Object.fromEntries(usersData.map((u) => [u.id, u]));
        }
      }

      const formattedComments = (commentsData || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        user_id: c.user_id,
        created_at: c.created_at,
        author: userMap[c.user_id]
          ? {
              username: userMap[c.user_id].username,
              full_name: userMap[c.user_id].full_name,
            }
          : undefined,
      }));

      setPostComments((prev) => ({
        ...prev,
        [postId]: formattedComments,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to comment");
      return;
    }

    const commentText = commentInput[postId]?.trim();
    if (!commentText) {
      toast.error("Comment cannot be empty");
      return;
    }

    setCommentLoading((prev) => new Set(prev).add(postId));

    try {
      // Insert comment
      const { data: newComment, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: commentText,
        })
        .select("id, content, user_id, created_at")
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
        return;
      }

      // Update comments_count
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("posts")
          .update({ comments_count: post.comments_count + 1 })
          .eq("id", postId);

        // Create notification for the post owner (if not commenting on own post)
        if (post.user_id !== currentUser.id) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            actor_id: currentUser.id,
            type: "comment",
            post_id: postId,
            comment_id: newComment.id,
          });
        }
      }

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
        ),
      );

      const formattedComment = {
        id: newComment.id,
        content: newComment.content,
        user_id: newComment.user_id,
        created_at: newComment.created_at,
        author: {
          username: currentUser.username || "User",
          full_name: currentUser.full_name || "User",
        },
      };

      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), formattedComment],
      }));

      setCommentInput((prev) => ({
        ...prev,
        [postId]: "",
      }));

      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
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
          <div className="flex items-center gap-4 mb-4">
            {/* Profile Picture */}
            <img
              src={
                user.profile_picture_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
              alt={user.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />

            {/* User Info */}
            <div className="flex-1">
              <h1
                className={`text-2xl font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {user.full_name}
              </h1>
              <p
                className={
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }
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

          {/* Follower/Following Counts */}
          <div
            className={`flex gap-6 mb-4 py-3 px-3 rounded-lg ${
              theme === "light" ? "bg-gray-50" : "bg-gray-800"
            }`}
          >
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {followerCounts.followers_count}
              </p>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Followers
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {followerCounts.following_count}
              </p>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Following
              </p>
            </div>
          </div>

          {/* Follow Button */}
          <div className="mb-4">
            <button
              onClick={handleFollow}
              disabled={isTogglingFollow}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
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

          {/* Bio Section */}
          <div className="mb-4">
            {currentUser?.id === user?.id && editingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value.slice(0, 120))}
                  maxLength={120}
                  placeholder="Add a bio (max 120 characters)..."
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-gray-800 border-gray-700 text-white"
                  }`}
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBioText(user.bio || "");
                    }}
                    className={`flex-1 px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                      theme === "light"
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {bioText ? (
                  <p
                    className={`text-sm mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {bioText}
                  </p>
                ) : currentUser?.id === user?.id ? (
                  <p
                    className={`text-sm italic ${
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    No bio yet
                  </p>
                ) : null}
                {currentUser?.id === user?.id && (
                  <button
                    onClick={() => setEditingBio(true)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                      theme === "light"
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-blue-400 hover:text-blue-300"
                    }`}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Bio
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="px-4 py-6 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p
                className={
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {post.content}
                    </p>
                  </div>
                  {currentUser?.id === user?.id && (
                    <button
                      onClick={() => setShowDeleteConfirm(post.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0 ml-2"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

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

                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className={
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }
                  >
                    {formatDate(post.created_at)}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={likeLoading.has(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
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
                        className={
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }
                      >
                        {post.likes_count}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (!postComments[post.id]) {
                          fetchPostComments(post.id);
                        }
                      }}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle
                        className={
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }
                      />
                      <span
                        className={
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }
                      >
                        {post.comments_count}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {postComments[post.id] && (
                  <div
                    className={`border-t pt-3 ${
                      theme === "light" ? "border-gray-200" : "border-gray-700"
                    }`}
                  >
                    {postComments[post.id].length > 0 && (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {postComments[post.id].map((comment) => (
                          <div
                            key={comment.id}
                            className={`text-xs rounded p-2 ${
                              theme === "light"
                                ? "bg-gray-100"
                                : "bg-gray-700/50"
                            }`}
                          >
                            <p
                              className={`font-semibold ${
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-white"
                              }`}
                            >
                              {comment.author?.full_name || "Anonymous"}
                            </p>
                            <p
                              className={
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              }
                            >
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentUser?.id && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInput[post.id] || ""}
                          onChange={(e) =>
                            setCommentInput((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => {
                            if (
                              e.key === "Enter" &&
                              !commentLoading.has(post.id)
                            ) {
                              handleAddComment(post.id);
                            }
                          }}
                          className={`flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === "light"
                              ? "bg-gray-100 text-gray-900 border border-gray-300"
                              : "bg-gray-700 text-white border border-gray-600"
                          }`}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={
                            commentLoading.has(post.id) ||
                            !commentInput[post.id]?.trim()
                          }
                          className="text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50 p-1"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Post Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Delete Post?
            </h3>
            <p
              className={`text-sm mb-6 ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
