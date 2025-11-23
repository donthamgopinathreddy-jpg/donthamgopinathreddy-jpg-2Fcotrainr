import React from "react";

interface VibrancyCardProps {
  children: React.ReactNode;
  gradient?: "orange" | "purple" | "blue" | "green" | "pink" | "multi";
  shadow?: "none" | "light" | "medium" | "bold";
  animate?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

const GRADIENTS = {
  orange: "from-orange-400 via-orange-500 to-orange-600",
  purple: "from-purple-400 via-purple-500 to-purple-600",
  blue: "from-blue-400 via-blue-500 to-blue-600",
  green: "from-green-400 via-green-500 to-green-600",
  pink: "from-pink-400 via-pink-500 to-pink-600",
  multi: "from-orange-400 via-pink-500 to-purple-600",
};

const SHADOWS = {
  none: "",
  light: "shadow-md",
  medium: "shadow-lg",
  bold: "shadow-2xl",
};

export default function VibrancyCard({
  children,
  gradient = "multi",
  shadow = "medium",
  animate = true,
  clickable = false,
  onClick,
  className = "",
}: VibrancyCardProps) {
  const gradientClass = `bg-gradient-to-br ${GRADIENTS[gradient]}`;
  const shadowClass = SHADOWS[shadow];
  const hoverClass = clickable ? "hover:scale-105 hover:shadow-2xl cursor-pointer" : "";
  const animationClass = animate
    ? "animate-fade-in transition-all duration-300"
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl p-6 text-white
        ${gradientClass}
        ${shadowClass}
        ${hoverClass}
        ${animationClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
