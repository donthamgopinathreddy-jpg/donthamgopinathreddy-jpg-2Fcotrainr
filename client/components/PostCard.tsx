import React from "react";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import VibrancyCard from "./VibrancyCard";

interface PostCardProps {
  id: string;
  authorName: string;
  authorRole?: "trainer" | "nutritionist" | "client";
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  isLiked?: boolean;
  timestamp?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const ROLE_COLORS: Record<string, "orange" | "purple" | "blue" | "green"> = {
  trainer: "orange",
  nutritionist: "green",
  client: "blue",
};

export default function PostCard({
  id,
  authorName,
  authorRole,
  authorAvatar,
  content,
  imageUrl,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  isLiked = false,
  timestamp,
  onLike,
  onComment,
  onShare,
}: PostCardProps) {
  const roleColor = authorRole ? ROLE_COLORS[authorRole] || "blue" : "blue";

  return (
    <VibrancyCard
      gradient={roleColor}
      shadow="light"
      animate={true}
      className="rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center overflow-hidden text-lg font-bold">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              authorName.charAt(0)
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{authorName}</p>
            {timestamp && <p className="text-xs opacity-75">{timestamp}</p>}
          </div>
        </div>
        <button className="text-white/60 hover:text-white p-2">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm mb-3 opacity-95">{content}</p>

      {/* Image */}
      {imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-white/10">
          <img
            src={imageUrl}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Stats and Actions */}
      <div className="space-y-3">
        {/* Stats */}
        <div className="flex gap-4 text-xs opacity-90 border-t border-white/20 pt-2">
          <button className="hover:opacity-100 transition-opacity">
            ❤️ {likeCount}
          </button>
          <button className="hover:opacity-100 transition-opacity">
            💬 {commentCount}
          </button>
          <button className="hover:opacity-100 transition-opacity">
            🔄 {shareCount}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-white/20 pt-2">
          <button
            onClick={onLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              isLiked ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <Heart size={16} className={isLiked ? "fill-white" : ""} />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button
            onClick={onComment}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <Share2 size={16} />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </VibrancyCard>
  );
}
