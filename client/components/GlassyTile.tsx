import { ReactNode } from "react";

interface GlassyTileProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary";
}

const GlassyTile = ({
  icon,
  title,
  subtitle,
  onClick,
  className = "",
  children,
  variant = "primary",
}: GlassyTileProps) => {
  const baseStyles =
    "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-white border-opacity-10 cursor-pointer transition-all duration-200 active:scale-95 hover:scale-102";

  const gradientStyles = {
    primary: "bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-yellow-500/20",
    secondary: "bg-gradient-to-br from-yellow-500/20 via-orange-400/10 to-orange-500/20",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${gradientStyles[variant]} ${className} group`}
    >
      {/* Animated gradient shimmer effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-30% to-transparent opacity-0 group-hover:opacity-20 animate-shimmer"
        style={{
          backgroundSize: "200% 100%",
        }}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

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
