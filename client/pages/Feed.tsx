import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Plus, UserPlus, UserCheck, Paperclip, X, AtSign } from "lucide-react";

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
  followed: boolean;
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
    followed: false,
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
    followed: false,
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
    followed: false,
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
    followed: false,
    createdAt: "8 hours ago",
  },
];

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

export default function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");

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

  const toggleFollow = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              followed: !post.followed,
            }
          : post
      )
    );
  };

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
        const withMention = prev + (prev ? " " : "") + `@${userName.replace(/\s+/g, "")}`;
        return withMention;
      });
    }
    setShowMentionSuggestions(false);
    setMentionSearch("");
  };

  const filteredUsers = AVAILABLE_USERS.filter(
    (user) =>
      user.toLowerCase().includes(mentionSearch.toLowerCase()) &&
      !mentions.includes(user)
  );

  const handleNewPost = () => {
    if (!newPostContent.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      authorName: "You",
      authorRole: "client",
      authorAvatar: "ME",
      content: newPostContent,
      image: mediaType === "image" ? selectedMedia || undefined : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      followed: false,
      createdAt: "just now",
    };

    setPosts([post, ...posts]);
    setNewPostContent("");
    setSelectedMedia(null);
    setMediaType(null);
    setMentions([]);
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
                            prev.replace(`@${mention.replace(/\s+/g, "")}`, "").trim()
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
                  className="flex-1 bg-gray-300 text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewPost}
                  disabled={!newPostContent.trim()}
                  className="flex-1 bg-gradient-primary text-gray-900 font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all"
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
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0">
                  {post.authorAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.authorRole === "trainer" ? "🏋️ Trainer" : "👤 Client"} • {post.createdAt}
                  </p>
                </div>
                <button
                  onClick={() => toggleFollow(post.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-xs transition-all flex-shrink-0 ${
                    post.followed
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {post.followed ? (
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
