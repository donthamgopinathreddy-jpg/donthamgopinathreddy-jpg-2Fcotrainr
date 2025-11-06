import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap } from "lucide-react";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 199,
    duration: "per month",
    savings: null,
    features: [
      "Unlimited video sessions",
      "Unlimited chat messaging",
      "Priority support",
      "Access to all trainers",
      "Meal tracking",
      "Ad-free experience",
    ],
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 499,
    duration: "for 3 months",
    savings: "Save ₹100",
    features: [
      "Unlimited video sessions",
      "Unlimited chat messaging",
      "Priority support",
      "Access to all trainers",
      "Meal tracking",
      "Ad-free experience",
      "Exclusive workout plans",
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
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Unlock Premium</h2>
            <p className="text-gray-600">
              Get unlimited access to trainers, chat, and exclusive features
            </p>
          </div>

          {/* Plans */}
          <div className="space-y-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Savings Badge */}
                {plan.savings && (
                  <div className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.savings}
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">₹{plan.price}</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selected Indicator */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Button */}
          <button
            onClick={() => handlePayment(selectedPlan)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {loading ? "Processing..." : `Get Premium - ₹${PLANS.find((p) => p.id === selectedPlan)?.price}`}
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
              <p className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</p>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription anytime from your account settings.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Is there a free trial?</p>
              <p className="text-sm text-gray-600">
                Yes, you get 3 free 10-minute trial sessions with any trainer.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Secure payment?</p>
              <p className="text-sm text-gray-600">
                All payments are processed securely through Stripe. Your information is protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
