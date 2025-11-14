import { useState, useEffect } from "react";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscriptions, SUBSCRIPTION_PLANS } from "@/hooks/useSubscriptions";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Subscription() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { subscription, isActive, createSubscription, getCurrentPlan } =
    useSubscriptions();
  const [selectedPlanId, setSelectedPlanId] = useState("co_basic_monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user || !razorpayLoaded) {
      toast.error("Please wait for payment system to load");
      return;
    }

    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        toast.error("Plan not found");
        return;
      }

      // In production, this would call your backend to create an order
      // For now, we'll simulate the Razorpay flow
      const options = {
        key: "rzp_test_placeholder", // Replace with actual Razorpay key
        amount: plan.price_inr * 100, // Amount in paise
        currency: "INR",
        name: "CoTrainr",
        description: `Subscribe to ${plan.name}`,
        order_id: `order_${Date.now()}`, // In production, get from backend
        handler: async (response: any) => {
          // In production, verify payment on backend
          const success = await createSubscription(
            planId,
            "razorpay",
            response.razorpay_payment_id,
          );

          if (success) {
            toast.success("Subscription activated!");
            setTimeout(() => navigate(-1), 1000);
          } else {
            toast.error("Failed to activate subscription");
          }
        },
        prefill: {
          email: user.email || "",
          contact: "",
        },
        theme: {
          color: "#ff9a1f",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setIsProcessing(false);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      console.debug(
        "Subscription error:",
        error instanceof Error ? error.code : "unknown",
      );
      toast.error("Failed to process subscription");
      setIsProcessing(false);
    }
  };

  const currentPlan = getCurrentPlan();
  const monthlyPlans = SUBSCRIPTION_PLANS.filter(
    (p) => p.billing_interval === "monthly",
  );
  const yearlyPlans = SUBSCRIPTION_PLANS.filter(
    (p) => p.billing_interval === "yearly",
  );

  return (
    <div
      className={`min-h-screen pb-20 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Premium Subscription
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Current Status */}
        {isActive() && currentPlan && (
          <div
            className={`rounded-lg border-2 border-green-500 ${
              theme === "dark" ? "bg-green-900/20" : "bg-green-50"
            } p-6 mb-8`}
          >
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-green-700 mb-1">
                  You're on {currentPlan.name}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-green-300" : "text-green-600"
                  }`}
                >
                  Your premium access is active and benefits are available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mb-10">
          <h2
            className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            <Zap className="w-5 h-5 text-orange-500" />
            Premium Benefits
          </h2>
          <div className="grid gap-3">
            {[
              "📊 Advanced analytics & insights",
              "👥 Unlimited trainer access",
              "🏆 Achievement tracking",
              "🔥 Streak history & milestones",
              "📈 Personalized training plans",
              "🎯 One-on-one coaching",
              "⭐ Priority support",
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-800/50"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span
                  className={
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }
                >
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-10">
          <h2
            className={`text-lg font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Choose Your Plan
          </h2>

          {/* Monthly Plans */}
          <div className="mb-8">
            <h3
              className={`text-sm font-semibold mb-3 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              MONTHLY
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {monthlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 p-6 transition-all cursor-pointer ${
                    selectedPlanId === plan.id
                      ? theme === "dark"
                        ? "border-orange-500 bg-orange-900/20"
                        : "border-orange-400 bg-orange-50"
                      : theme === "dark"
                        ? "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                        : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <h3
                    className={`font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-orange-500">
                      ₹{plan.price_inr}
                    </span>
                    <span
                      className={`ml-2 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      /month
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className={`text-sm flex items-start gap-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span className="text-orange-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Plans */}
          <div className="mb-8">
            <h3
              className={`text-sm font-semibold mb-3 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              YEARLY (SAVE 17%)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {yearlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 p-6 transition-all cursor-pointer ${
                    selectedPlanId === plan.id
                      ? theme === "dark"
                        ? "border-orange-500 bg-orange-900/20"
                        : "border-orange-400 bg-orange-50"
                      : theme === "dark"
                        ? "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                        : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <h3
                    className={`font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-orange-500">
                      ₹{plan.price_inr}
                    </span>
                    <span
                      className={`ml-2 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      /year
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className={`text-sm flex items-start gap-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span className="text-orange-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscribe Button */}
        {!isActive() && (
          <button
            onClick={() => handleSubscribe(selectedPlanId)}
            disabled={isProcessing || !razorpayLoaded}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 text-white font-bold py-4 rounded-lg transition-all mb-4 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : !razorpayLoaded ? (
              "Loading payment system..."
            ) : (
              <>Subscribe with Razorpay</>
            )}
          </button>
        )}

        {/* Info Box */}
        <div
          className={`rounded-lg border ${
            theme === "dark"
              ? "bg-blue-900/20 border-blue-700/50"
              : "bg-blue-50 border-blue-200"
          } p-4`}
        >
          <p
            className={`text-sm ${
              theme === "dark" ? "text-blue-300" : "text-blue-700"
            }`}
          >
            💳 Secure payment processing powered by Razorpay. Your payment
            information is encrypted and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
