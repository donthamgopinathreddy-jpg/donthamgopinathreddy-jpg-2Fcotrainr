import { Trophy, Flame, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Challenge {
  id: string;
  title: string;
  duration: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  reward: string;
  participants?: number;
}

export default function MiniChallengesCarousel() {
  const { theme } = useTheme();

  const challenges: Challenge[] = [
    {
      id: "7day",
      title: "7-Day Warrior",
      duration: "7 days",
      icon: <Flame className="w-6 h-6" />,
      color: "from-orange-400 to-red-500",
      progress: 71,
      reward: "500 XP",
    },
    {
      id: "30day",
      title: "30-Day Beast",
      duration: "30 days",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-purple-400 to-pink-500",
      progress: 45,
      reward: "2000 XP",
      participants: 1240,
    },
    {
      id: "friend",
      title: "Friend vs Friend",
      duration: "14 days",
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-400 to-cyan-500",
      progress: 62,
      reward: "1000 XP",
      participants: 3,
    },
  ];

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50"
          : "bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <h3
        className={`text-lg font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        } flex items-center gap-2`}
      >
        <Trophy className="w-5 h-5 text-amber-500" />
        Active Challenges
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-x-auto pb-2">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`group rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:scale-105 flex-shrink-0 min-w-full sm:min-w-0 ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/30 hover:border-gray-500/50"
                : "bg-gradient-to-br from-gray-50/60 to-white/60 border border-gray-200/40 hover:border-gray-300/60"
            }`}
            style={{
              boxShadow:
                theme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${challenge.color} group-hover:scale-110 transition-transform`}
              >
                {challenge.icon}
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  theme === "dark"
                    ? "bg-gray-600/50 text-gray-200"
                    : "bg-gray-200/50 text-gray-700"
                }`}
              >
                {challenge.duration}
              </span>
            </div>

            <h4
              className={`font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {challenge.title}
            </h4>

            {challenge.participants && (
              <p
                className={`text-xs mb-3 flex items-center gap-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Users className="w-3 h-3" />
                {challenge.participants} joining
              </p>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Progress
                </span>
                <span
                  className={`text-xs font-bold ${
                    theme === "dark" ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {challenge.progress}%
                </span>
              </div>

              <div
                className={`relative h-2 rounded-full overflow-hidden border ${
                  theme === "dark"
                    ? "bg-gray-600/50 border-gray-500/30"
                    : "bg-gray-200/50 border-gray-300/30"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${challenge.color} transition-all duration-700 ease-out`}
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
            </div>

            <button
              className={`w-full py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                theme === "dark"
                  ? "bg-gray-600/50 hover:bg-gray-600/70 text-white"
                  : "bg-gray-200/50 hover:bg-gray-300/50 text-gray-900"
              }`}
            >
              View Details
            </button>

            <p
              className={`text-xs text-center mt-3 font-semibold ${
                theme === "dark" ? "text-amber-400" : "text-amber-600"
              }`}
            >
              🎁 {challenge.reward}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
