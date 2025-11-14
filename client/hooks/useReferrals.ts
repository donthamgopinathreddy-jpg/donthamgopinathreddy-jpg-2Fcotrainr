import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string | null;
  referral_code: string;
  discount_percentage: number;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export const useReferrals = () => {
  const { user, userProfile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate a unique referral code for user
  const generateReferralCode = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Check if user already has a referral code
      const { data: existing } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .single();

      if (existing) {
        return existing.referral_code;
      }

      // Generate unique code
      const code = `REF${user.id.slice(0, 8).toUpperCase()}${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

      // Create referral code
      const { data: newReferral, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referral_code: code,
          discount_percentage: 10,
        })
        .select()
        .single();

      if (error) {
        console.error("Error generating referral code:", error);
        return null;
      }

      setReferralCode(code);
      return code;
    } catch (error) {
      console.error("Error in generateReferralCode:", error);
      return null;
    }
  };

  // Fetch user's referral code
  const fetchReferralCode = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .single();

      if (!error && data) {
        setReferralCode(data.referral_code);
      } else if (error?.code === "PGRST116") {
        // No referral code yet, generate one
        await generateReferralCode();
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
    }
  };

  // Get referral code by code string (for signup flow)
  const getReferralByCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referral_code", code)
        .eq("is_used", false)
        .maybeSingle();

      if (error) {
        console.debug("Error fetching referral:", error?.message || String(error));
        return null;
      }

      return data;
    } catch (error) {
      console.debug("Error in getReferralByCode:", error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  // Use a referral code (when new user signs up)
  const useReferralCode = async (
    referralCode: string,
    newUserId: string,
  ): Promise<boolean> => {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referral_code", referralCode)
        .eq("is_used", false)
        .maybeSingle();

      if (fetchError || !referral) {
        console.debug("Invalid referral code:", fetchError?.message || "Not found");
        return false;
      }

      // Update referral as used
      const { error: updateError } = await supabase
        .from("referrals")
        .update({
          is_used: true,
          referee_id: newUserId,
          used_at: new Date().toISOString(),
        })
        .eq("id", referral.id);

      if (updateError) {
        console.debug("Error using referral:", updateError?.message || String(updateError));
        return false;
      }

      return true;
    } catch (error) {
      console.debug("Error in useReferralCode:", error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // Fetch referrals for current user
  const fetchReferrals = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching referrals:", error);
        return;
      }

      setReferrals(data || []);

      // Count successful referrals
      const successCount = (data || []).filter((r) => r.is_used).length;
      setReferralCount(successCount);
    } catch (error) {
      console.error("Error in fetchReferrals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReferralCode();
      fetchReferrals();
    }
  }, [user?.id]);

  return {
    referralCode,
    referrals,
    referralCount,
    loading,
    generateReferralCode,
    fetchReferralCode,
    getReferralByCode,
    useReferralCode,
    fetchReferrals,
  };
};
