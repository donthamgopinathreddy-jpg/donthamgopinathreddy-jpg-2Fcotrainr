import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_inr: number;
  billing_interval: "monthly" | "yearly";
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: "razorpay" | "stripe";
  status: "active" | "cancelled" | "expired";
  current_period_start: string;
  current_period_end: string;
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "co_basic_monthly",
    name: "Basic Monthly",
    price_inr: 299,
    billing_interval: "monthly",
    features: [
      "Advanced analytics",
      "Unlimited trainer access",
      "Achievement tracking",
      "Streak history",
    ],
  },
  {
    id: "co_basic_yearly",
    name: "Basic Yearly",
    price_inr: 2999,
    billing_interval: "yearly",
    features: [
      "Advanced analytics",
      "Unlimited trainer access",
      "Achievement tracking",
      "Streak history",
      "Save 17% vs monthly",
    ],
  },
  {
    id: "co_premium_monthly",
    name: "Premium Monthly",
    price_inr: 599,
    billing_interval: "monthly",
    features: [
      "Everything in Basic",
      "Personalized training plans",
      "One-on-one coaching",
      "Priority support",
    ],
  },
  {
    id: "co_premium_yearly",
    name: "Premium Yearly",
    price_inr: 5999,
    billing_interval: "yearly",
    features: [
      "Everything in Basic",
      "Personalized training plans",
      "One-on-one coaching",
      "Priority support",
      "Save 17% vs monthly",
    ],
  },
];

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch user's active subscription
  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSubscription(data as Subscription);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscription",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create a subscription after successful payment
  const createSubscription = async (
    planId: string,
    provider: "razorpay" | "stripe",
    providerSubscriptionId: string,
  ) => {
    if (!user?.id) return;

    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const now = new Date();
      const endDate = new Date(now);

      // Set end date based on billing interval
      if (plan.billing_interval === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Cancel existing active subscription
      if (subscription) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", subscription.id);
      }

      // Create new subscription
      const { data, error: insertError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            plan_id: planId,
            provider,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: endDate.toISOString(),
            provider_subscription_id: providerSubscriptionId,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setSubscription(data as Subscription);
      return true;
    } catch (err) {
      console.error("Error creating subscription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create subscription",
      );
      return false;
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription) return;

    try {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", subscription.id);

      if (updateError) throw updateError;

      setSubscription(null);
      return true;
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription",
      );
      return false;
    }
  };

  // Get plan details
  const getPlan = (planId: string): SubscriptionPlan | undefined => {
    return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  };

  // Get current plan details
  const getCurrentPlan = (): SubscriptionPlan | undefined => {
    if (!subscription) return undefined;
    return getPlan(subscription.plan_id);
  };

  // Check if subscription is active
  const isActive = (): boolean => {
    if (!subscription) return false;
    const endDate = new Date(subscription.current_period_end);
    return endDate > new Date();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  return {
    subscription,
    loading,
    error,
    isCheckingOut,
    setIsCheckingOut,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
    getPlan,
    getCurrentPlan,
    isActive,
  };
};
