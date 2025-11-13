import { useState } from "react";
import { Gift, Copy, Check } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";

interface ReferralCodeSectionProps {
  theme: "light" | "dark";
  onOpenModal?: () => void;
}

const ReferralCodeSection = ({
  theme,
  onOpenModal,
}: ReferralCodeSectionProps) => {
  const { referralCode, referralCount } = useReferrals();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl p-4 space-y-3 ${
        theme === "dark"
          ? "bg-purple-900/30 border border-purple-700/50 backdrop-blur-xl"
          : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Gift
          className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}
        />
        <h3
          className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Referral Rewards
        </h3>
      </div>

      {referralCode ? (
        <>
          {/* Referral Code Display */}
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              theme === "dark"
                ? "bg-gray-900 border border-purple-700"
                : "bg-white border border-purple-300"
            }`}
          >
            <input
              type="text"
              readOnly
              value={referralCode}
              className={`flex-1 bg-transparent outline-none font-mono font-bold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            />
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded transition-colors ${
                copied
                  ? theme === "dark"
                    ? "text-green-400"
                    : "text-green-600"
                  : theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-700"
              }`}
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Info Box */}
          <div
            className={`p-3 rounded-lg text-sm space-y-2 ${
              theme === "dark"
                ? "bg-purple-900/50 border border-purple-700"
                : "bg-white border border-purple-200"
            }`}
          >
            <p
              className={`font-semibold ${
                theme === "dark" ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Share & Earn!
            </p>
            <ul
              className={`text-xs space-y-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Your friends get 10% discount on first booking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>You earn rewards for each successful referral</span>
              </li>
            </ul>
          </div>

          {/* Referral Count */}
          {referralCount > 0 && (
            <div
              className={`p-3 rounded-lg text-center border ${
                theme === "dark"
                  ? "bg-green-900/30 border-green-700"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Successful Referrals
              </p>
              <p
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                {referralCount}
              </p>
            </div>
          )}
        </>
      ) : (
        <p
          className={`text-sm text-center py-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading referral code...
        </p>
      )}
    </div>
  );
};

export default ReferralCodeSection;
