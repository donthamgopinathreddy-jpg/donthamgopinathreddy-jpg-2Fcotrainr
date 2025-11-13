import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { useReferrals } from "@/hooks/useReferrals";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Check, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrainerData {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  hourly_rate?: number;
}

const TrainerBookingPayment = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { trainerId } = useParams();
  const [trainer, setTrainer] = useState<TrainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [bookingDetails, setBookingDetails] = useState({
    duration_minutes: 60,
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
  });

  const [referralCode, setReferralCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountDetails, setDiscountDetails] = useState<{
    code: string;
    percentage: number;
  } | null>(null);

  const { processPayment, applyDiscount, error: paymentError } = usePayments();
  const { getReferralByCode } = useReferrals();

  // Fetch trainer details
  useEffect(() => {
    const fetchTrainer = async () => {
      if (!trainerId) return;

      try {
        const { data, error } = await supabase
          .from("trainers")
          .select("*, users!id(id, full_name, profile_picture_url, email)")
          .eq("id", trainerId)
          .single();

        if (error || !data) {
          toast.error("Trainer not found");
          navigate(-1);
          return;
        }

        const userData = data.users;
        setTrainer({
          id: data.id,
          full_name: userData?.full_name || "Trainer",
          profile_picture_url: userData?.profile_picture_url,
          hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : 1000,
        });
      } catch (err) {
        console.error("Error fetching trainer:", err);
        toast.error("Failed to load trainer details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [trainerId, navigate, toast]);

  // Calculate amount
  const baseAmount = Math.ceil(
    ((trainer?.hourly_rate || 1000) / 60) * bookingDetails.duration_minutes,
  );
  const { finalAmount: discountedAmount, discountAmount } = applyDiscount(
    baseAmount,
    appliedDiscount,
  );

  // Apply referral code
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    try {
      const referral = await getReferralByCode(referralCode);
      if (!referral) {
        toast.error("Invalid or expired referral code");
        return;
      }

      setAppliedDiscount(referral.discount_percentage);
      setDiscountDetails({
        code: referral.referral_code,
        percentage: referral.discount_percentage,
      });
      toast.success(`Applied ${referral.discount_percentage}% discount!`);
    } catch (err) {
      console.error("Error applying referral:", err);
      toast.error("Failed to apply referral code");
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!user?.id || !trainer) {
      toast.error("Missing required information");
      return;
    }

    setProcessing(true);
    try {
      const success = await processPayment(
        discountedAmount * 100, // Convert to paise
        `Trainer Session with ${trainer.full_name} - ${bookingDetails.duration_minutes}min`,
        discountDetails?.code,
        discountAmount * 100,
      );

      if (success) {
        toast.success("Payment successful! Booking confirmed.");
        // Navigate to booking confirmation or profile
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } else {
        toast.error(paymentError || "Payment failed");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center pb-24 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center pb-24 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Trainer not found
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b p-4`}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Trainer Info Card */}
        <div
          className={`p-4 rounded-lg ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            {trainer.profile_picture_url ? (
              <img
                src={trainer.profile_picture_url}
                alt={trainer.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                {trainer.full_name.charAt(0)}
              </div>
            )}
            <div>
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {trainer.full_name}
              </h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Professional Trainer
              </p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  theme === "dark" ? "text-cyan-400" : "text-blue-600"
                }`}
              >
                ₹{trainer.hourly_rate}/hour
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div
          className={`p-4 rounded-lg space-y-4 ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3
            className={`font-bold text-lg ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Booking Details
          </h3>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Date
            </label>
            <input
              type="date"
              value={bookingDetails.date}
              onChange={(e) =>
                setBookingDetails({ ...bookingDetails, date: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Time
            </label>
            <input
              type="time"
              value={bookingDetails.time}
              onChange={(e) =>
                setBookingDetails({ ...bookingDetails, time: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Session Duration
            </label>
            <div className="flex gap-2">
              {[30, 60, 90].map((duration) => (
                <button
                  key={duration}
                  onClick={() =>
                    setBookingDetails({
                      ...bookingDetails,
                      duration_minutes: duration,
                    })
                  }
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    bookingDetails.duration_minutes === duration
                      ? "bg-blue-600 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div
          className={`p-4 rounded-lg space-y-3 ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3
            className={`font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Have a referral code?
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              disabled={!!discountDetails}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } disabled:opacity-50`}
            />
            <button
              onClick={handleApplyReferral}
              disabled={!!discountDetails || processing}
              className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-green-700 text-white hover:bg-green-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Apply
            </button>
          </div>

          {discountDetails && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <Check className="w-5 h-5 text-green-600" />
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-green-400" : "text-green-700"
                }`}
              >
                {discountDetails.percentage}% discount applied!
              </p>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div
          className={`p-4 rounded-lg space-y-3 ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3
            className={`font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Price Breakdown
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                Base Amount ({bookingDetails.duration_minutes}min):
              </span>
              <span
                className={theme === "dark" ? "text-gray-300" : "text-gray-900"}
              >
                ₹{baseAmount}
              </span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedDiscount}%):</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div
              className={`border-t pt-2 flex justify-between font-bold text-lg ${
                theme === "dark"
                  ? "border-gray-700 text-white"
                  : "border-gray-200 text-gray-900"
              }`}
            >
              <span>Total Amount:</span>
              <span className="text-cyan-400">₹{discountedAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            processing
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ₹${discountedAmount}`
          )}
        </button>

        {paymentError && (
          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-red-900/30 border border-red-700"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm ${
                theme === "dark" ? "text-red-400" : "text-red-700"
              }`}
            >
              {paymentError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerBookingPayment;
