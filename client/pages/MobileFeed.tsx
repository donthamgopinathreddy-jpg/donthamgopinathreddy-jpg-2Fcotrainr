import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { postsApi } from "@/lib/api";

export default function MobileFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [postText, setPostText] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await postsApi.getFeed();
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) {
      toast.error("Please write something");
      return;
    }

    try {
      await postsApi.createPost({ text: postText });
      toast.success("Post created!");
      setPostText("");
      setShowForm(false);
      loadFeed();
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postsApi.likePost(postId);
      loadFeed();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-600 font-semibold mb-2"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
      </div>

      {/* Create Post Button */}
      {!showForm && (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-700 font-semibold"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white text-sm">
              👤
            </div>
            <span>What's on your mind?</span>
          </button>
        </div>
      )}

      {/* Post Form */}
      {showForm && (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
          <form onSubmit={handlePostSubmit} className="space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share your fitness journey..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setPostText("");
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Posts */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-gray-600 text-lg">No posts yet</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-3 px-4 py-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {post.users?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-900 text-sm mb-4 leading-relaxed">
                {post.text}
              </p>

              {/* Post Image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full rounded-xl mb-4 object-cover max-h-64"
                />
              )}

              {/* Post Stats */}
              <div className="flex gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <span>{post.likes_count || 0} likes</span>
                <span>{post.comments_count || 0} comments</span>
              </div>

              {/* Post Actions */}
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-red-500 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart size={18} />
                  <span className="text-sm font-semibold">Like</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-500 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-sm font-semibold">Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-orange-500 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={18} />
                  <span className="text-sm font-semibold">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
