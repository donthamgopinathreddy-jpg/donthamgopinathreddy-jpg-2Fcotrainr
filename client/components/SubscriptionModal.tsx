import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import SubscriptionComparison from "@/components/SubscriptionComparison";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: "free" | "basic" | "premium";
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "basic" | "premium" | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "razorpay">(
    "razorpay",
  );
  const [processingPayment, setProcessingPayment] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setProcessingPayment(true);

      if (selectedPlan === "free") {
        alert(`Switched to ${selectedPlan.toUpperCase()} plan`);
      } else {
        // Mock payment processing - in production, integrate Razorpay
        const planPrices = {
          basic: 299,
          premium: 599,
        };

        const amount = planPrices[selectedPlan];

        // Simulating Razorpay payment
        alert(
          `Processing payment for ${selectedPlan.toUpperCase()} plan: ₹${amount}/month\n\nIn production, this would redirect to Razorpay payment gateway.`,
        );
      }

      // TODO: Integrate actual Razorpay payment here
      // After successful payment, update user's subscription_plan in database

      setSelectedPlan(null);
      onClose();
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscription Plans
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {selectedPlan ? (
              // Payment Section
              <div className="space-y-6">
                <div
                  className={`rounded-2xl p-6 border ${
                    selectedPlan === "free"
                      ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {selectedPlan === "free"
                      ? "Free Plan"
                      : selectedPlan === "basic"
                        ? "Basic Plan"
                        : "Premium Plan"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedPlan === "free"
                      ? "Get started with basic workouts"
                      : selectedPlan === "basic"
                        ? "Unlock all workouts and limited diet planning"
                        : "Full access to all features including AI insights"}
                  </p>
                  <div className="text-3xl font-bold">
                    <span
                      className={
                        selectedPlan === "free"
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-orange-600 dark:text-orange-400"
                      }
                    >
                      ₹
                      {selectedPlan === "free"
                        ? "0"
                        : selectedPlan === "basic"
                          ? "299"
                          : "599"}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                </div>

                {selectedPlan !== "free" && (
                  <>
                    {/* Payment Method Selection */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Payment Method
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-all">
                          <input
                            type="radio"
                            name="payment"
                            value="razorpay"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="w-4 h-4 accent-orange-500"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Razorpay (Recommended)
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              UPI, Cards, Net Banking, Wallets
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 transition-all">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                            className="w-4 h-4 accent-orange-500"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Credit/Debit Card
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Visa, Mastercard, American Express
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 Your subscription will auto-renew monthly. You can
                        cancel anytime from your account settings.
                      </p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={processingPayment}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    {processingPayment
                      ? "Processing..."
                      : `Pay Now for ${selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : ""}`}
                  </button>
                </div>
              </div>
            ) : (
              // Comparison Section
              <SubscriptionComparison
                currentPlan={currentPlan}
                onSelectPlan={setSelectedPlan}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
