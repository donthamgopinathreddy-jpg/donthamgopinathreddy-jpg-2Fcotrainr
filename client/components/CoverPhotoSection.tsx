import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CoverPhotoSectionProps {
  coverImage: string;
  userName?: string;
  bio?: string;
  onUpload?: (file: File) => void;
  editable?: boolean;
}

export default function CoverPhotoSection({
  coverImage,
  userName = "Welcome",
  bio = "Let's crush your fitness goals!",
  onUpload,
  editable = false,
}: CoverPhotoSectionProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      onUpload?.(file);
      toast.success("Cover photo updated!");
    } catch (error) {
      toast.error("Failed to upload cover photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-lg">
      {/* Cover Image */}
      <div
        className="relative w-full h-48 md:h-64 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Upload Overlay */}
        {editable && (isHovering || isUploading) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-white font-medium transition-all">
              <Upload size={20} />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h1 className="text-3xl font-bold mb-1">{userName}</h1>
        <p className="text-sm opacity-90">{bio}</p>
      </div>
    </div>
  );
}
