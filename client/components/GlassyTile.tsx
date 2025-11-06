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
    "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-gray-200 cursor-pointer transition-all duration-200 active:scale-95 hover:scale-102";

  const gradientStyles = {
    trainers: "bg-gradient-to-br from-cyan-100 via-blue-100 to-teal-100",
    nutritionists: "bg-gradient-to-br from-purple-100 via-violet-100 to-pink-100",
    meals: "bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100",
    chat: "bg-gradient-to-br from-pink-100 via-rose-100 to-red-100",
    video: "bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100",
    feed: "bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${customGradient || gradientStyles[variant]} ${className} group`}
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
        {icon && <div className="mb-3 text-primary opacity-90 group-hover:opacity-100 transition-opacity">{icon}</div>}
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default GlassyTile;
