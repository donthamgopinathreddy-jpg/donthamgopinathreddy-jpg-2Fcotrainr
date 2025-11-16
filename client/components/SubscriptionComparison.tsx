import { Check, Lock } from "lucide-react";

interface SubscriptionComparisonProps {
  currentPlan: "free" | "basic" | "premium";
  onSelectPlan: (plan: "free" | "basic" | "premium") => void;
}

const FEATURES = [
  { name: "Basic Workouts", free: true, basic: true, premium: true },
  {
    name: "Intermediate & Advanced Workouts",
    free: false,
    basic: true,
    premium: true,
  },
  { name: "Limited Diet Planner", free: false, basic: true, premium: true },
  {
    name: "Full Diet Planner (Allergens, Macros)",
    free: false,
    basic: false,
    premium: true,
  },
  { name: "Weekly Meal Plans", free: false, basic: false, premium: true },
  { name: "AI Weekly Insights", free: false, basic: false, premium: true },
  { name: "Trainer Review Option", free: false, basic: false, premium: true },
  { name: "Trend Graphs", free: false, basic: true, premium: true },
];

export default function SubscriptionComparison({
  currentPlan,
  onSelectPlan,
}: SubscriptionComparisonProps) {
  return (
    <div className="w-full space-y-6">
      {/* Mobile Layout - Stacked Cards */}
      <div className="space-y-4">
        {/* FREE PLAN */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🆓 Free
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get started
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              ₹0<span className="text-lg">/month</span>
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Basic Workouts</span>
            </div>
            <div className="text-gray-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">Limited Features</span>
            </div>
          </div>

          {currentPlan === "free" ? (
            <button className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl cursor-default">
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => onSelectPlan("free")}
              className="w-full py-3 bg-gray-400 text-white font-semibold rounded-xl hover:bg-gray-500 transition-all"
            >
              View Details
            </button>
          )}
        </div>

        {/* BASIC PLAN */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-orange-400 dark:border-orange-600 relative">
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Popular
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ⚡ Basic
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Unlock workouts
            </p>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              ₹299<span className="text-lg">/month</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              or ₹2,999/year
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">All Workouts Unlocked</span>
            </div>
            <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Limited Diet Planner</span>
            </div>
            <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Trend Graphs</span>
            </div>
            <div className="text-gray-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">AI Insights (Premium)</span>
            </div>
          </div>

          {currentPlan === "basic" ? (
            <button className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl cursor-default">
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => onSelectPlan("basic")}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
            >
              Subscribe Now - ₹299/month
            </button>
          )}
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 border-2 border-purple-600 relative">
          <div className="absolute top-4 right-4 bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full">
            Best Deal
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">👑 Premium</h3>
            <p className="text-white/90 text-sm">Full access</p>
            <p className="text-4xl font-bold text-white mt-2">
              ₹599<span className="text-lg">/month</span>
            </p>
            <p className="text-sm text-white/80 mt-1">
              or ₹5,999/year (Save 17%)
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="text-white/90 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Everything in Basic</span>
            </div>
            <div className="text-white/90 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Full Diet Planner</span>
            </div>
            <div className="text-white/90 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">AI Weekly Insights</span>
            </div>
            <div className="text-white/90 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Trainer Review</span>
            </div>
          </div>

          {currentPlan === "premium" ? (
            <button className="w-full py-3 bg-white/30 text-white font-semibold rounded-xl cursor-default">
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => onSelectPlan("premium")}
              className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
            >
              Subscribe Now - ₹599/month
            </button>
          )}
        </div>
      </div>

      {/* Full Feature Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-white">
                  Features
                </th>
                <th className="text-center px-4 py-4 font-semibold text-gray-900 dark:text-white">
                  Free
                </th>
                <th className="text-center px-4 py-4 font-semibold text-orange-600 dark:text-orange-400">
                  Basic
                </th>
                <th className="text-center px-4 py-4 font-semibold text-purple-600 dark:text-purple-400">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {feature.name}
                  </td>
                  <td className="text-center px-4 py-3">
                    {feature.free ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-4 py-3">
                    {feature.basic ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-4 py-3">
                    {feature.premium ? (
                      <Check className="w-5 h-5 text-purple-500 mx-auto" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
