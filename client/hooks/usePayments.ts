import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentData {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  description: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: string;
  discount_code: string | null;
  discount_amount_cents: number;
  created_at: string;
  updated_at: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (cents)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const usePayments = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Razorpay script
  const initializeRazorpay = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create payment order
  const createPaymentOrder = async (
    amountCents: number,
    description: string,
    discountCode?: string,
    discountAmountCents?: number,
  ): Promise<{ orderId: string; amountCents: number } | null> => {
    if (!user?.id) {
      setError("User not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount_cents: amountCents,
          currency: "INR",
          description,
          status: "pending",
          discount_code: discountCode || null,
          discount_amount_cents: discountAmountCents || 0,
        })
        .select()
        .single();

      if (paymentError) {
        setError("Failed to create payment");
        console.error("Payment creation error:", paymentError);
        return null;
      }

      return {
        orderId: payment.id,
        amountCents,
      };
    } catch (err: any) {
      setError(err.message || "Failed to create payment");
      console.error("Error in createPaymentOrder:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process payment with Razorpay
  const processPayment = async (
    amountCents: number,
    description: string,
    discountCode?: string,
    discountAmountCents?: number,
  ): Promise<boolean> => {
    setError(null);

    // Initialize Razorpay
    const isInitialized = await initializeRazorpay();
    if (!isInitialized) {
      setError("Failed to load Razorpay");
      return false;
    }

    // Create payment order
    const orderData = await createPaymentOrder(
      amountCents,
      description,
      discountCode,
      discountAmountCents,
    );
    if (!orderData) return false;

    return new Promise((resolve) => {
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "",
        amount: amountCents,
        currency: "INR",
        name: "Fitness App",
        description,
        order_id: orderData.orderId,
        prefill: {
          name: userProfile?.full_name || userProfile?.username || "",
          email: userProfile?.email || "",
        },
        handler: async (response: any) => {
          // Verify and update payment
          const success = await verifyAndUpdatePayment(
            orderData.orderId,
            response.razorpay_payment_id,
          );
          resolve(success);
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled");
            resolve(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Verify and update payment
  const verifyAndUpdatePayment = async (
    paymentId: string,
    razorpayPaymentId: string,
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          razorpay_payment_id: razorpayPaymentId,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (updateError) {
        setError("Failed to verify payment");
        console.error("Payment verification error:", updateError);
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Payment verification failed");
      console.error("Error in verifyAndUpdatePayment:", err);
      return false;
    }
  };

  // Apply discount code to payment
  const applyDiscount = (
    baseAmount: number,
    discountPercentage: number,
  ): { finalAmount: number; discountAmount: number } => {
    const discountAmount = Math.floor((baseAmount * discountPercentage) / 100);
    const finalAmount = baseAmount - discountAmount;
    return { finalAmount, discountAmount };
  };

  // Get payment history
  const getPaymentHistory = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }

      return data || [];
    } catch (err: any) {
      console.error("Error in getPaymentHistory:", err);
      return [];
    }
  };

  return {
    loading,
    error,
    processPayment,
    createPaymentOrder,
    applyDiscount,
    getPaymentHistory,
  };
};
