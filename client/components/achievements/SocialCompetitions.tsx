import { useState } from "react";
import { useSocialCompetitions } from "@/hooks/useSocialCompetitions";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronRight, TrendingUp } from "lucide-react";

interface SocialCompetitionsProps {
  variant?: "compact" | "full";
}

export const SocialCompetitions = ({
  variant = "full",
}: SocialCompetitionsProps) => {
  const { theme } = useTheme();
  const { competitions, loading } = useSocialCompetitions();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<
    string | null
  >(competitions[0]?.id || null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className={`w-8 h-8 rounded-full border-2 border-transparent animate-spin ${
            theme === "dark"
              ? "border-t-purple-500 border-r-purple-500"
              : "border-t-purple-600 border-r-purple-600"
          }`}
        />
      </div>
    );
  }

  const selectedCompetition =
    competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];

  if (variant === "compact") {
    const topParticipant = selectedCompetition?.participants?.[0];

    return (
      <div
        className={`rounded-2xl p-4 ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700/50"
            : "bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100/50"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p
              className={`text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Competition
            </p>
            <p
              className={`text-lg font-bold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {selectedCompetition?.title}
            </p>
          </div>
          <div className="text-2xl">{selectedCompetition?.icon}</div>
        </div>
        {topParticipant && (
          <div
            className={`rounded-lg p-2 text-sm ${
              theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
            }`}
          >
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              🥇 Leading:{" "}
              <span className="font-semibold">{topParticipant.full_name}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2
        className={`text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <span className="text-lg sm:text-xl">⚡</span>
        Social Competitions
      </h2>

      {/* Competition Selector */}
      <div className="grid grid-cols-3 gap-2">
        {competitions.map((competition) => {
          const isSelected = competition.id === selectedCompetitionId;
          return (
            <button
              key={competition.id}
              onClick={() => setSelectedCompetitionId(competition.id)}
              className={`rounded-xl p-2 sm:p-3 transition-all text-center ${
                isSelected
                  ? theme === "dark"
                    ? "bg-purple-500/30 border border-purple-500/50"
                    : "bg-purple-100 border border-purple-300"
                  : theme === "dark"
                    ? "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                    : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{competition.icon}</div>
              <p
                className={`text-xs font-semibold line-clamp-2 ${
                  isSelected
                    ? theme === "dark"
                      ? "text-purple-300"
                      : "text-purple-700"
                    : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {competition.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Competition Details */}
      {selectedCompetition && (
        <div
          className={`rounded-2xl overflow-hidden ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700/50"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Competition Header */}
          <div
            className={`p-4 border-b ${
              theme === "dark"
                ? "bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-gray-700/50"
                : "bg-gradient-to-r from-purple-50 to-pink-50 border-gray-100"
            }`}
          >
            <h3
              className={`font-bold text-sm sm:text-base mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {selectedCompetition.title}
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {selectedCompetition.description}
            </p>
          </div>

          {/* Leaderboard */}
          <div className="divide-y divide-gray-700/30">
            {selectedCompetition.participants.length === 0 ? (
              <div
                className={`p-8 text-center ${
                  theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"
                }`}
              >
                <p
                  className={
                    theme === "dark" ? "text-gray-500" : "text-gray-600"
                  }
                >
                  No participants yet
                </p>
              </div>
            ) : (
              selectedCompetition.participants.map((participant) => {
                const isCurrentUser = participant.is_current_user;
                return (
                  <div
                    key={participant.user_id}
                    className={`p-3 flex items-center gap-3 transition-all ${
                      isCurrentUser
                        ? theme === "dark"
                          ? "bg-purple-500/10"
                          : "bg-purple-50/50"
                        : theme === "dark"
                          ? "hover:bg-gray-800/30"
                          : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Rank Medal */}
                    <div className="flex-shrink-0 text-xl w-6 text-center">
                      {participant.medal}
                    </div>

                    {/* Rank Number */}
                    <div
                      className={`flex-shrink-0 font-bold text-sm w-6 text-right ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      #{participant.rank}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {participant.profile_picture_url && (
                          <img
                            src={participant.profile_picture_url}
                            alt={participant.full_name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isCurrentUser
                                ? theme === "dark"
                                  ? "text-purple-300"
                                  : "text-purple-700"
                                : theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                            }`}
                          >
                            {participant.full_name}
                            {isCurrentUser && (
                              <span
                                className={`ml-1 text-xs font-normal ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                (You)
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-600"
                            }`}
                          >
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <p
                        className={`text-lg font-bold ${
                          isCurrentUser
                            ? theme === "dark"
                              ? "text-purple-400"
                              : "text-purple-600"
                            : theme === "dark"
                              ? "text-white"
                              : "text-gray-900"
                        }`}
                      >
                        {participant.current_score.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {selectedCompetition.metric === "steps"
                          ? "steps"
                          : selectedCompetition.metric === "workouts"
                            ? "workouts"
                            : selectedCompetition.metric === "meals"
                              ? "meals"
                              : "days"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialCompetitions;
