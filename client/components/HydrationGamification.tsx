import { Droplets, Award } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface WaterBadge {
  level: number;
  icon: string;
  label: string;
}

export default function HydrationGamification() {
  const { theme } = useTheme();

  const waterConsumed = 6.5;
  const waterGoal = 8;
  const hydrationPercent = Math.round((waterConsumed / waterGoal) * 100);

  const badges: WaterBadge[] = [
    { level: 1, icon: "💧", label: "Hydration Start" },
    { level: 2, icon: "💦", label: "Water Warrior" },
    { level: 3, icon: "🌊", label: "Hydration Hero" },
  ];

  const unlockedBadges = Math.ceil((waterConsumed / waterGoal) * badges.length);

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-gray-900/50 border border-cyan-700/30"
          : "bg-gradient-to-br from-cyan-50 via-blue-50 to-white border border-cyan-300/40"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className={`text-lg font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <Droplets className="w-5 h-5 text-cyan-500" />
            Hydration Challenge
          </h3>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Level {Math.ceil(hydrationPercent / 25)} - Keep going! 💪
          </p>
        </div>
        <div className="text-3xl">💧</div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <span
            className={`text-sm font-semibold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Level {Math.ceil(hydrationPercent / 25)}
          </span>
          <span
            className={`text-xs font-bold ${
              theme === "dark" ? "text-cyan-400" : "text-cyan-600"
            }`}
          >
            {waterConsumed}L / {waterGoal}L
          </span>
        </div>

        <div
          className={`relative h-4 rounded-full overflow-hidden border ${
            theme === "dark"
              ? "bg-gray-700/50 border-cyan-700/30"
              : "bg-gray-200/50 border-cyan-300/30"
          }`}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(hydrationPercent, 100)}%` }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Water Badges */}
      <div>
        <p
          className={`text-xs font-semibold mb-3 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          Hydration Badges
        </p>
        <div className="flex gap-3 flex-wrap">
          {badges.map((badge, idx) => (
            <button
              key={idx}
              className={`relative p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${
                idx < unlockedBadges
                  ? theme === "dark"
                    ? "bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-700/50 hover:border-amber-500/80 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-110"
                    : "bg-gradient-to-br from-amber-100 to-amber-50/50 border border-amber-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-300/30 hover:scale-110"
                  : theme === "dark"
                    ? "bg-gray-800/30 border border-gray-700/30 opacity-40"
                    : "bg-gray-100/30 border border-gray-300/30 opacity-40"
              }`}
            >
              <div className="text-2xl group-hover:scale-125 transition-transform">
                {badge.icon}
              </div>
              <p
                className={`text-xs font-semibold mt-2 text-center ${
                  idx < unlockedBadges
                    ? theme === "dark"
                      ? "text-amber-200"
                      : "text-amber-700"
                    : theme === "dark"
                      ? "text-gray-500"
                      : "text-gray-500"
                }`}
              >
                {badge.label}
              </p>
              {idx < unlockedBadges && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hydration Tips */}
      <div
        className={`mt-6 p-3 rounded-xl text-xs ${
          theme === "dark"
            ? "bg-blue-900/20 border border-blue-800/30 text-blue-200"
            : "bg-blue-50/50 border border-blue-200/50 text-blue-700"
        }`}
      >
        💡 <span className="font-semibold">Tip:</span> Drink a glass of water every 2 hours for
        optimal hydration!
      </div>
    </div>
  );
}
