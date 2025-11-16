import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DietReviewRequest {
  id: string;
  user_id: string;
  trainer_id: string | null;
  diet_plan_id: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  trainer_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useDietReviewRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReviewRequest = useCallback(
    async (dietPlanId: string, trainerId?: string) => {
      if (!user?.id) {
        setError("User not authenticated");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: insertError } = await supabase
          .from("diet_review_requests")
          .insert([
            {
              user_id: user.id,
              trainer_id: trainerId || null,
              diet_plan_id: dietPlanId,
              status: "pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.debug("Create review request error:", insertError?.code);
          setError("Failed to create review request");
          return null;
        }

        return data as DietReviewRequest;
      } catch (err) {
        console.debug(
          "Create review request catch error:",
          err instanceof Error ? err.message : "unknown"
        );
        setError("Failed to create review request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const getReviewRequests = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("diet_review_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.debug("Get review requests error:", fetchError?.code);
        setError("Failed to fetch review requests");
        return [];
      }

      return (data as DietReviewRequest[]) || [];
    } catch (err) {
      console.debug(
        "Get review requests catch error:",
        err instanceof Error ? err.message : "unknown"
      );
      setError("Failed to fetch review requests");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReviewRequest = useCallback(
    async (requestId: string, updates: Partial<DietReviewRequest>) => {
      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("diet_review_requests")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (updateError) {
          console.debug("Update review request error:", updateError?.code);
          setError("Failed to update review request");
          return false;
        }

        return true;
      } catch (err) {
        console.debug(
          "Update review request catch error:",
          err instanceof Error ? err.message : "unknown"
        );
        setError("Failed to update review request");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createReviewRequest,
    getReviewRequests,
    updateReviewRequest,
  };
};
