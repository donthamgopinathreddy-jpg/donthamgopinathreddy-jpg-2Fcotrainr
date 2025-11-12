import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    duration: "Forever",
    tier: "free",
    savings: null,
    popular: false,
    features: [
      "10 messages per week",
      "3 x 10-min trial sessions",
      "Basic meal tracking",
      "View trainer profiles",
      "Community access",
    ],
  },
  {
    id: "monthly",
    name: "Premium",
    price: 199,
    duration: "per month",
    tier: "premium",
    savings: null,
    popular: true,
    features: [
      "Unlimited video sessions",
      "Unlimited chat messaging",
      "Priority support",
      "Access to all trainers",
      "Full meal tracking",
      "Ad-free experience",
      "Exclusive workout plans",
      "Macro tracking & analytics",
    ],
  },
  {
    id: "quarterly",
    name: "Gold",
    price: 499,
    duration: "for 3 months",
    tier: "gold",
    savings: "Save ₹100",
    popular: false,
    features: [
      "Everything in Premium",
      "Priority trainer access",
      "1:1 nutrition consultation",
      "Custom meal plans",
      "AI-powered recommendations",
      "Exclusive content library",
      "24/7 priority support",
      "VIP community access",
    ],
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [loading, setLoading] = useState(false);

  const handlePayment = async (planId: string) => {
    setLoading(true);

    // Simulate Stripe payment
    // In production, this would call your backend to create a Stripe Checkout session
    setTimeout(() => {
      alert(`Processing payment for ${planId}...`);
      // TODO: Integrate with Stripe using @stripe/react-stripe-js
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "light" ? "bg-white" : "bg-gray-950"
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b px-4 py-4 flex items-center gap-3 ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Premium Plans</h1>
        </div>

        {/* Content */}
        <div className="px-4 py-8 space-y-6">
          {/* Header Text */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Unlock Premium
            </h2>
            <p className="text-gray-600">
              Get unlimited access to trainers, chat, and exclusive features
            </p>
          </div>

          {/* Plans */}
          <div className="space-y-4">
            {PLANS.map((plan) => {
              const tierStyles = {
                free: {
                  border: "border-gray-300",
                  bg: "bg-gray-50",
                  selected: "border-gray-600 bg-gray-100",
                  badge: "bg-gray-600",
                  text: "text-gray-900",
                  accent: "text-gray-600",
                },
                premium: {
                  border: "border-amber-300",
                  bg: "bg-amber-50",
                  selected: "border-amber-600 bg-amber-100",
                  badge: "bg-amber-600",
                  text: "text-amber-900",
                  accent: "text-amber-700",
                },
                gold: {
                  border: "border-yellow-400",
                  bg: "bg-yellow-50",
                  selected: "border-yellow-600 bg-yellow-100",
                  badge: "bg-yellow-600",
                  text: "text-yellow-900",
                  accent: "text-yellow-700",
                },
              };

              const style = tierStyles[plan.tier as keyof typeof tierStyles];
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `${style.selected} shadow-lg`
                      : `${style.border} ${style.bg} hover:shadow-md`
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  {/* Savings Badge */}
                  {plan.savings && (
                    <div className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.savings}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4 pt-2">
                    <div>
                      <h3 className={`text-xl font-bold ${style.text}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${style.accent}`}>
                        {plan.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${style.text}`}>
                        ₹{plan.price}
                      </p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check
                          className={`w-4 h-4 ${style.accent} flex-shrink-0`}
                        />
                        <span className={`text-sm ${style.text}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${style.badge} flex items-center justify-center bg-white`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${style.badge}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Button */}
          <button
            onClick={() => handlePayment(selectedPlan)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {loading
              ? "Processing..."
              : `Get Premium - ₹${PLANS.find((p) => p.id === selectedPlan)?.price}`}
          </button>

          {/* Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-blue-900">✨ Premium includes:</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Unlimited video sessions with any trainer</li>
              <li>✓ Unlimited 1:1 messaging</li>
              <li>✓ Full meal tracking and macro analysis</li>
              <li>✓ Priority customer support</li>
              <li>✓ Exclusive workout plans</li>
              <li>✓ Ad-free experience</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Can I cancel anytime?
              </p>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription anytime from your account
                settings.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Is there a free trial?
              </p>
              <p className="text-sm text-gray-600">
                Yes, you get 3 free 10-minute trial sessions with any trainer.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Secure payment?
              </p>
              <p className="text-sm text-gray-600">
                All payments are processed securely through Stripe. Your
                information is protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
