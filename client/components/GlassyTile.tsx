import { ReactNode } from "react";

interface GlassyTileProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  variant?: "trainers" | "nutritionists" | "meals" | "chat" | "video" | "feed";
  customGradient?: string;
}

const GlassyTile = ({
  icon,
  title,
  subtitle,
  onClick,
  className = "",
  children,
  variant = "trainers",
  customGradient,
}: GlassyTileProps) => {
  const baseStyles =
    "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl cursor-pointer transition-all duration-300 active:scale-95 hover:scale-105 shadow-md hover:shadow-xl";

  const gradientStyles = {
    trainers: "bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400",
    nutritionists: "bg-gradient-to-br from-purple-400 via-violet-400 to-pink-400",
    meals: "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400",
    chat: "bg-gradient-to-br from-pink-400 via-rose-400 to-red-400",
    video: "bg-gradient-to-br from-blue-400 via-cyan-400 to-sky-400",
    feed: "bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${customGradient || gradientStyles[variant]} ${className} group tile-hover`}
    >
      {/* Animated gradient shimmer effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-30% to-transparent opacity-0 group-hover:opacity-15 animate-shimmer"
        style={{
          backgroundSize: "200% 100%",
        }}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {icon && <div className="mb-3 text-white opacity-90 group-hover:opacity-100 transition-opacity text-3xl">{icon}</div>}
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default GlassyTile;
