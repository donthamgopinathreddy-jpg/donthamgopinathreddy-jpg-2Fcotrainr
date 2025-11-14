import { useState, useEffect } from "react";
import { Zap, Info } from "lucide-react";
import { toast } from "sonner";
import { useDailyStepsReward } from "@/hooks/useDailyStepsReward";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

interface DailyStepsRewardProps {
  dailySteps?: number;
  onRewardClaimed?: () => void;
}

export default function DailyStepsReward({
  dailySteps = 0,
  onRewardClaimed,
}: DailyStepsRewardProps) {
  const { theme = "light" } = useTheme() || { theme: "light" };
  const { userProfile } = useAuth();
  const { rewardClaimed, isClaimable, isClaiming, claimReward } =
    useDailyStepsReward(dailySteps);

  const targetSteps = 10000;
  const progressPercentage = Math.min((dailySteps / targetSteps) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45

  const handleClaimReward = async () => {
    const success = await claimReward();
    if (success) {
      toast.success("✓ 10 coins claimed!");
      onRewardClaimed?.();
    } else {
      toast.error("Unable to claim reward. Try again.");
    }
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div
      className={`rounded-2xl p-6 space-y-4 shadow-sm ${
        theme === "dark"
          ? "bg-gray-800/50 border border-gray-700/50"
          : "bg-white border border-gray-200"
      }`}
    >
      {/* Header */}
      <h3 className={`text-lg font-bold flex items-center gap-2 ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}>
        <Zap className="w-5 h-5 text-orange-500" />
        Daily Steps Reward
      </h3>

      {/* Steps Counter Area */}
      <div className="text-center space-y-2">
        <p className={`text-sm font-semibold ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Daily Steps
        </p>
        <h2 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          {formatNumber(dailySteps)}
        </h2>
        <p className={`text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          / {formatNumber(targetSteps)} steps
        </p>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPercentage / 100)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {Math.round(progressPercentage)}%
            </span>
            <span className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              of goal
            </span>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className={`rounded-xl p-4 text-center space-y-3 ${
        isClaimable
          ? theme === "dark"
            ? "bg-green-900/30 border border-green-800"
            : "bg-green-50 border border-green-200"
          : rewardClaimed
            ? theme === "dark"
              ? "bg-blue-900/30 border border-blue-800"
              : "bg-blue-50 border border-blue-200"
            : theme === "dark"
              ? "bg-gray-700/50 border border-gray-600"
              : "bg-gray-50 border border-gray-300"
      }`}>
        {dailySteps < targetSteps ? (
          <>
            <p className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-900"
            }`}>
              Keep going! Earn <span className="text-orange-500 font-bold">+10 Coins</span> when you reach{" "}
              {formatNumber(targetSteps)} steps today.
            </p>
            <p className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              {formatNumber(targetSteps - dailySteps)} steps to go
            </p>
          </>
        ) : rewardClaimed ? (
          <p className={`text-sm font-semibold flex items-center justify-center gap-2 ${
            theme === "dark" ? "text-blue-300" : "text-blue-700"
          }`}>
            <span className="text-lg">✓</span>
            Reward claimed for today
          </p>
        ) : isClaimable ? (
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-green-300" : "text-green-700"
          }`}>
            🎉 {formatNumber(targetSteps)} steps completed! Tap to claim your 10 coins.
          </p>
        ) : null}
      </div>

      {/* Claim Button */}
      {isClaimable && (
        <button
          onClick={handleClaimReward}
          disabled={isClaiming}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isClaiming ? "Claiming..." : "Claim 10 Coins"}
        </button>
      )}

      {/* Info Line */}
      <div className={`flex items-start gap-2 rounded-lg p-3 ${
        theme === "dark"
          ? "bg-gray-700/30"
          : "bg-gray-100"
      }`}>
        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`} />
        <p className={`text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          Daily rewards reset every 24 hours at midnight.
        </p>
      </div>
    </div>
  );
}
