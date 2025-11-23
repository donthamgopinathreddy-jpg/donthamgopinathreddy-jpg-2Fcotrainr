import React from "react";
import VibrancyCard from "./VibrancyCard";

interface AnimatedStatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  gradient?: "orange" | "purple" | "blue" | "green" | "pink";
  progress?: number;
  onClick?: () => void;
  delay?: number;
}

export default function AnimatedStatTile({
  icon,
  label,
  value,
  unit,
  gradient = "blue",
  progress,
  onClick,
  delay = 0,
}: AnimatedStatTileProps) {
  return (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <VibrancyCard
        gradient={gradient}
        shadow="medium"
        animate={true}
        clickable={!!onClick}
        onClick={onClick}
        className="h-full"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-4xl">{icon}</div>
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="text-3xl font-bold">
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>

          {progress !== undefined && (
            <div className="w-full mt-2 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </VibrancyCard>
    </div>
  );
}
