import { useState } from "react";
import { Heart, MessageCircle, Share2, Plus } from "lucide-react";

interface Post {
  id: string;
  authorName: string;
  authorRole: "trainer" | "client";
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  createdAt: string;
}

const DEMO_POSTS: Post[] = [
  {
    id: "1",
    authorName: "Priya Singh",
    authorRole: "trainer",
    authorAvatar: "PS",
    content: "🔥 New transformation! Check out my client Rahul's amazing 12-week journey. Consistency is key! #FitnessJourney",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop",
    likes: 324,
    comments: 47,
    shares: 23,
    liked: false,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    authorName: "Amit Kumar",
    authorRole: "client",
    authorAvatar: "AK",
    content: "Day 30 of my fitness journey! Started with my trainer Raj at CrossFit. Already seeing results 💪",
    image: "https://images.unsplash.com/photo-1552672260-7bdde322fa4f?w=500&h=500&fit=crop",
    likes: 156,
    comments: 28,
    shares: 12,
    liked: true,
    createdAt: "4 hours ago",
  },
  {
    id: "3",
    authorName: "Neha Verma",
    authorRole: "trainer",
    authorAvatar: "NV",
    content: "💡 Tip: Start your workout with a 5-min warm-up. It increases blood flow and prevents injuries. Tag someone who needs this!",
    likes: 542,
    comments: 89,
    shares: 156,
    liked: false,
    createdAt: "6 hours ago",
  },
  {
    id: "4",
    authorName: "Sneha Patel",
    authorRole: "client",
    authorAvatar: "SP",
    content: "Finally hit my target weight! 🎉 Thanks to my nutritionist and trainer for keeping me on track!",
    image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=500&fit=crop",
    likes: 287,
    comments: 52,
    shares: 34,
    liked: false,
    createdAt: "8 hours ago",
  },
];

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleNewPost = () => {
    if (!newPostContent.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      authorName: "You",
      authorRole: "client",
      authorAvatar: "ME",
      content: newPostContent,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      createdAt: "just now",
    };

    setPosts([post, ...posts]);
    setNewPostContent("");
    setShowNewPost(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-6">
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground text-sm">Share your progress and inspiration</p>
        </div>

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
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 bg-muted text-muted-foreground font-medium py-2 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewPost}
                  disabled={!newPostContent.trim()}
                  className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="px-4 space-y-4 pb-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Post Header */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-gray-900 text-sm">
                  {post.authorAvatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.authorRole === "trainer" ? "🏋️ Trainer" : "👤 Client"} • {post.createdAt}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 py-2">
                <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="w-full h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-border flex items-center justify-between text-muted-foreground">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    post.liked ? "text-red-500" : "hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-red-500" : ""}`} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
