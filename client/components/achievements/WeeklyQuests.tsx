import { useWeeklyQuests } from "@/hooks/useWeeklyQuests";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle2, Lock } from "lucide-react";

interface WeeklyQuestsProps {
  variant?: "compact" | "full";
}

export const WeeklyQuests = ({ variant = "full" }: WeeklyQuestsProps) => {
  const { theme } = useTheme();
  const { quests, completedQuests, loading, totalQuestRewards } =
    useWeeklyQuests();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className={`w-8 h-8 rounded-full border-2 border-transparent animate-spin ${
            theme === "dark"
              ? "border-t-blue-500 border-r-blue-500"
              : "border-t-blue-600 border-r-blue-600"
          }`}
        />
      </div>
    );
  }

  const completedCount = completedQuests.length;
  const completionPercentage = (completedCount / quests.length) * 100;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-2xl p-4 ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700/50"
            : "bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100/50"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p
              className={`text-xs sm:text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Weekly Quests
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {completedCount}/{quests.length}
            </p>
          </div>
          <div
            className={`text-sm sm:text-lg md:text-xl font-bold rounded-lg p-1.5 sm:p-2 ${
              theme === "dark"
                ? "bg-gray-700/50 text-yellow-400"
                : "bg-yellow-100/50 text-yellow-600"
            }`}
          >
            +{totalQuestRewards} XP
          </div>
        </div>
        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            theme === "dark" ? "bg-gray-700" : "bg-blue-100"
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <span className="text-lg sm:text-xl">📋</span>
          Weekly Quests
        </h2>
        <div
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            theme === "dark"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          +{totalQuestRewards} XP
        </div>
      </div>

      {/* Progress Overview */}
      <div
        className={`rounded-xl p-3 ${
          theme === "dark"
            ? "bg-gray-800/30 border border-gray-700/30"
            : "bg-blue-50/30 border border-blue-100/30"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Progress
          </span>
          <span
            className={`text-sm font-bold ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {completedCount}/{quests.length}
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full overflow-hidden ${
            theme === "dark" ? "bg-gray-700" : "bg-blue-100"
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quest List */}
      <div className="grid gap-2">
        {quests.map((quest) => {
          const isCompleted = completedQuests.includes(quest.id);
          const progressPercent = (quest.progress / quest.target) * 100;
          const difficultyColor =
            quest.difficulty === "easy"
              ? theme === "dark"
                ? "text-green-400"
                : "text-green-600"
              : quest.difficulty === "medium"
                ? theme === "dark"
                  ? "text-yellow-400"
                  : "text-yellow-600"
                : theme === "dark"
                  ? "text-red-400"
                  : "text-red-600";

          return (
            <div
              key={quest.id}
              className={`rounded-xl p-3 transition-all ${
                isCompleted
                  ? theme === "dark"
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-green-50/50 border border-green-100"
                  : theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                    : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon and Completion */}
                <div className="relative flex-shrink-0">
                  <div className="text-xl sm:text-2xl">{quest.icon}</div>
                  {isCompleted && (
                    <div
                      className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ${
                        theme === "dark"
                          ? "bg-green-500"
                          : "bg-green-600"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Quest Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`font-semibold text-sm ${
                        isCompleted
                          ? theme === "dark"
                            ? "text-green-400"
                            : "text-green-700"
                          : theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {quest.title}
                    </h3>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${difficultyColor}`}
                    >
                      {quest.difficulty}
                    </span>
                  </div>

                  <p
                    className={`text-xs mb-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {quest.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-1.5 flex-1 rounded-full overflow-hidden ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500"
                          }`}
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ml-2 whitespace-nowrap ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {quest.progress}/{quest.target}
                      </span>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? theme === "dark"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-700"
                          : theme === "dark"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      +{quest.reward_xp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyQuests;
