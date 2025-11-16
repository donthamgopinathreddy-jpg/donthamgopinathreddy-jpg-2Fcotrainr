import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Lock,
  X,
  CreditCard,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const FEATURES = [
  { name: "Basic Workouts", free: true, basic: true, premium: true },
  { name: "Intermediate & Advanced Workouts", free: false, basic: true, premium: true },
  { name: "Limited Diet Planner", free: false, basic: true, premium: true },
  { name: "Full Diet Planner (Allergens, Macros)", free: false, basic: false, premium: true },
  { name: "Weekly Meal Plans", free: false, basic: false, premium: true },
  { name: "AI Weekly Insights", free: false, basic: false, premium: true },
  { name: "Trainer Review Option", free: false, basic: false, premium: true },
  { name: "Trend Graphs", free: false, basic: true, premium: true },
  { name: "Priority Support", free: false, basic: false, premium: true },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "premium" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processingPayment, setProcessingPayment] = useState(false);

  const currentPlan = (userProfile?.subscription_plan || "free") as "free" | "basic" | "premium";

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setProcessingPayment(true);

      if (selectedPlan === "free") {
        toast.success("Switched to Free plan");
      } else {
        const planPrices: Record<"basic" | "premium", number> = {
          basic: 299,
          premium: 599,
        };

        const amount = planPrices[selectedPlan];

        alert(
          `Processing payment for ${selectedPlan.toUpperCase()} plan: ₹${amount}/month\n\nIn production, this would redirect to Razorpay payment gateway.`,
        );
        toast.success(`Upgraded to ${selectedPlan} plan!`);
      }

      setSelectedPlan(null);
      navigate("/profile");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-32 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-orange-50 via-white to-purple-50"
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-4 p-3 rounded-lg transition-all ${
            theme === "dark"
              ? "text-gray-300 hover:bg-gray-800"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Upgrade to unlock premium features and accelerate your fitness journey
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan !== "free" && (
          <div className={`text-center p-4 rounded-2xl ${
            theme === "dark"
              ? "bg-green-900/30 border border-green-700"
              : "bg-green-50 border border-green-300"
          }`}>
            <p className={theme === "dark" ? "text-green-300" : "text-green-700"}>
              ✓ You are currently on the <span className="font-bold capitalize">{currentPlan}</span> plan
            </p>
          </div>
        )}

        {/* Plans Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* FREE PLAN */}
          <div className={`rounded-3xl p-8 relative transition-all hover:shadow-xl ${
            currentPlan === "free"
              ? theme === "dark"
                ? "bg-gray-700 border-2 border-gray-600"
                : "bg-gray-100 border-2 border-gray-300"
              : theme === "dark"
                ? "bg-gray-800/50 border-2 border-gray-700"
                : "bg-white border-2 border-gray-200"
          }`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🆓 Free
              </h3>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Get started
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
                ₹0<span className="text-lg">/month</span>
              </p>
            </div>

            <div className="space-y-3 mb-8">
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
              <button className="w-full py-3 bg-gray-400 dark:bg-gray-600 text-white font-semibold rounded-xl cursor-default">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => setSelectedPlan("free")}
                className={`w-full py-3 font-semibold rounded-xl transition-all ${
                  selectedPlan === "free"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {selectedPlan === "free" ? "Selected" : "Select Plan"}
              </button>
            )}
          </div>

          {/* BASIC PLAN */}
          <div className={`rounded-3xl p-8 relative transition-all hover:shadow-xl ${
            currentPlan === "basic"
              ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600 md:scale-105 md:z-10"
              : "bg-white dark:bg-gray-800/50 border-2 border-orange-400 dark:border-orange-600 md:scale-105 md:z-10"
          }`}>
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
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-3">
                ₹299<span className="text-lg">/month</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                or ₹2,999/year
              </p>
            </div>

            <div className="space-y-3 mb-8">
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
              <button className="w-full py-3 bg-gray-400 dark:bg-gray-600 text-white font-semibold rounded-xl cursor-default">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => setSelectedPlan("basic")}
                className={`w-full py-3 font-semibold rounded-xl transition-all ${
                  selectedPlan === "basic"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200 hover:bg-orange-300 dark:hover:bg-orange-900"
                }`}
              >
                {selectedPlan === "basic" ? "Selected" : "Select Plan"}
              </button>
            )}
          </div>

          {/* PREMIUM PLAN */}
          <div className={`rounded-3xl p-8 relative transition-all hover:shadow-xl ${
            currentPlan === "premium"
              ? "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-500 dark:border-purple-600"
              : "bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900/50 dark:to-pink-900/50 border-2 border-purple-600 dark:border-purple-700"
          }`}>
            <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${
              currentPlan === "premium"
                ? "bg-purple-600 text-white"
                : "bg-purple-700 text-white"
            }`}>
              Best Deal
            </div>

            <div className="text-center mb-6">
              <h3 className={`text-2xl font-bold mb-2 ${
                currentPlan === "premium"
                  ? "text-purple-900 dark:text-white"
                  : "text-white"
              }`}>
                👑 Premium
              </h3>
              <p className={`text-sm ${
                currentPlan === "premium"
                  ? "text-purple-700 dark:text-gray-400"
                  : "text-white/90"
              }`}>
                Full access
              </p>
              <p className={`text-4xl font-bold mt-3 ${
                currentPlan === "premium"
                  ? "text-purple-600 dark:text-white"
                  : "text-white"
              }`}>
                ₹599<span className="text-lg">/month</span>
              </p>
              <p className={`text-sm mt-1 ${
                currentPlan === "premium"
                  ? "text-purple-700 dark:text-gray-400"
                  : "text-white/80"
              }`}>
                or ₹5,999/year (Save 17%)
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className={`flex items-center gap-2 ${
                currentPlan === "premium"
                  ? "text-purple-900 dark:text-gray-200"
                  : "text-white/90"
              }`}>
                <Check className="w-5 h-5" />
                <span className="text-sm">Everything in Basic</span>
              </div>
              <div className={`flex items-center gap-2 ${
                currentPlan === "premium"
                  ? "text-purple-900 dark:text-gray-200"
                  : "text-white/90"
              }`}>
                <Check className="w-5 h-5" />
                <span className="text-sm">Full Diet Planner</span>
              </div>
              <div className={`flex items-center gap-2 ${
                currentPlan === "premium"
                  ? "text-purple-900 dark:text-gray-200"
                  : "text-white/90"
              }`}>
                <Check className="w-5 h-5" />
                <span className="text-sm">AI Weekly Insights</span>
              </div>
              <div className={`flex items-center gap-2 ${
                currentPlan === "premium"
                  ? "text-purple-900 dark:text-gray-200"
                  : "text-white/90"
              }`}>
                <Check className="w-5 h-5" />
                <span className="text-sm">Trainer Review</span>
              </div>
            </div>

            {currentPlan === "premium" ? (
              <button className={`w-full py-3 font-semibold rounded-xl cursor-default ${
                theme === "dark"
                  ? "bg-purple-700/50 text-white"
                  : "bg-purple-600 text-white"
              }`}>
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => setSelectedPlan("premium")}
                className={`w-full py-3 font-semibold rounded-xl transition-all ${
                  selectedPlan === "premium"
                    ? "bg-purple-600 dark:bg-purple-600 text-white"
                    : "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {selectedPlan === "premium" ? "Selected" : "Select Plan"}
              </button>
            )}
          </div>
        </div>

        {/* Payment Section - Show when plan is selected */}
        {selectedPlan && currentPlan !== selectedPlan && (
          <div className={`rounded-3xl p-8 max-w-md mx-auto w-full ${
            theme === "dark"
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              <CreditCard className="w-5 h-5" />
              Complete Your Order
            </h3>

            <div className={`rounded-2xl p-4 mb-6 ${
              theme === "dark"
                ? "bg-blue-900/30 border border-blue-700"
                : "bg-blue-50 border border-blue-200"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                💡 Your subscription will auto-renew monthly. You can cancel anytime from your account settings.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === "razorpay"
                  ? theme === "dark"
                    ? "border-orange-600 bg-orange-900/20"
                    : "border-orange-500 bg-orange-50"
                  : theme === "dark"
                    ? "border-gray-700 hover:border-orange-600"
                    : "border-gray-200 hover:border-orange-400"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="w-4 h-4 accent-orange-500"
                />
                <div className="ml-3 flex-1">
                  <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Razorpay (Recommended)
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    UPI, Cards, Net Banking, Wallets
                  </p>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === "card"
                  ? theme === "dark"
                    ? "border-orange-600 bg-orange-900/20"
                    : "border-orange-500 bg-orange-50"
                  : theme === "dark"
                    ? "border-gray-700 hover:border-orange-600"
                    : "border-gray-200 hover:border-orange-400"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="w-4 h-4 accent-orange-500"
                />
                <div className="ml-3 flex-1">
                  <p className={`font-semibold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <CreditCard className="w-4 h-4" />
                    Credit/Debit Card
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Visa, Mastercard, American Express
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processingPayment}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {processingPayment ? "Processing..." : `Pay Now for ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </button>
          </div>
        )}

        {/* Full Feature Comparison Table */}
        <div className={`rounded-3xl overflow-hidden border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        } mt-12`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={theme === "dark" ? "bg-gray-900" : "bg-gray-50"}>
                  <th className={`text-left px-6 py-4 font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    Features
                  </th>
                  <th className={`text-center px-6 py-4 font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    Free
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-orange-600 dark:text-orange-400">
                    Basic
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-purple-600 dark:text-purple-400">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`border-t ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700/30"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className={`px-6 py-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {feature.name}
                    </td>
                    <td className="text-center px-6 py-4">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-6 py-4">
                      {feature.basic ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-6 py-4">
                      {feature.premium ? (
                        <Check className="w-5 h-5 text-purple-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
