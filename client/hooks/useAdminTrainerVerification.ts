import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface TrainerForVerification {
  id: string;
  user_id: string;
  name: string;
  email: string;
  country?: string;
  id_document_url?: string;
  selfie_url?: string;
  certificate_url?: string;
  verification_status: "pending" | "approved" | "rejected";
  verified_trainer: boolean;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export function useAdminTrainerVerification() {
  const [trainers, setTrainers] = useState<TrainerForVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"pending" | "approved" | "rejected">("pending");

  const fetchTrainers = useCallback(async (status?: "pending" | "approved" | "rejected") => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("trainer_verifications")
        .select(
          `
          *,
          user:users(id, full_name, email, country)
        `
        )
        .order("submitted_at", { ascending: false });

      if (status) {
        query = query.eq("verification_status", status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        const errorMsg = fetchError?.message || String(fetchError);
        const errorCode = fetchError?.code || "";

        console.error("Detailed error fetching trainers:", {
          message: errorMsg,
          code: errorCode,
          status: fetchError?.status,
          details: fetchError?.details,
        });

        // Check if it's a table not found error
        if (errorMsg.includes("does not exist") || errorMsg.includes("relation") || errorCode === "PGRST116") {
          setError("Trainer verification table not yet initialized. Please wait for database setup to complete.");
        } else if (errorMsg.includes("permission denied") || errorCode === "PGRST301") {
          setError("Permission denied: You may not have access to view trainer verifications.");
        } else if (errorMsg.includes("RLS") || errorMsg.includes("policy")) {
          setError("Row-level security policy blocked access. Please contact support.");
        } else {
          setError(`Failed to fetch trainers: ${errorMsg}`);
        }

        setTrainers([]);
        return;
      }

      // Transform the data to flatten user information
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        name: item.user?.full_name || "Unknown",
        email: item.user?.email || "",
        country: item.user?.country,
        id_document_url: item.id_document_url,
        selfie_url: item.selfie_url,
        certificate_url: item.certificate_url,
        verification_status: item.verification_status,
        verified_trainer: item.verified_trainer,
        submitted_at: item.submitted_at,
        reviewed_by: item.reviewed_by,
        reviewed_at: item.reviewed_at,
        rejection_reason: item.rejection_reason,
      }));

      setTrainers(transformedData);
    } catch (fetchErr) {
      const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("Caught error fetching trainers:", {
        message: errorMsg,
        stack: fetchErr instanceof Error ? fetchErr.stack : undefined,
      });

      if (errorMsg.includes("Failed to fetch")) {
        setError("Network error: Unable to reach the server. Please check your connection.");
      } else if (errorMsg.includes("timeout")) {
        setError("Request timeout: The server took too long to respond.");
      } else {
        setError(`An error occurred: ${errorMsg}`);
      }

      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveTrainer = async (trainerId: string, reviewedBy: string) => {
    try {
      try {
        const { error } = await supabase
          .from("trainer_verifications")
          .update({
            verification_status: "approved",
            verified_trainer: true,
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", trainerId);

        if (error) {
          throw error;
        }

        // Also update the users table to set verified_trainer flag
        const verificationRecord = trainers.find((t) => t.id === trainerId);
        if (verificationRecord) {
          const { error: userError } = await supabase
            .from("users")
            .update({ verified_trainer: true })
            .eq("id", verificationRecord.user_id);

          if (userError) {
            console.warn("Warning updating user verified status:", userError);
          }
        }

        // Refresh the list
        await fetchTrainers(currentTab);
        return true;
      } catch (fetchErr) {
        console.error("Error approving trainer:", fetchErr);
        const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);

        if (errorMsg.includes("Failed to fetch")) {
          setError("Network error: Unable to reach the server");
        } else {
          setError("Failed to approve trainer");
        }

        return false;
      }
    } catch (err) {
      console.error("Error in approveTrainer:", err);
      setError("Failed to approve trainer");
      return false;
    }
  };

  const rejectTrainer = async (
    trainerId: string,
    rejectionReason: string,
    reviewedBy: string
  ) => {
    try {
      try {
        const { error } = await supabase
          .from("trainer_verifications")
          .update({
            verification_status: "rejected",
            verified_trainer: false,
            rejection_reason: rejectionReason,
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", trainerId);

        if (error) {
          throw error;
        }

        // Refresh the list
        await fetchTrainers(currentTab);
        return true;
      } catch (fetchErr) {
        console.error("Error rejecting trainer:", fetchErr);
        const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);

        if (errorMsg.includes("Failed to fetch")) {
          setError("Network error: Unable to reach the server");
        } else {
          setError("Failed to reject trainer");
        }

        return false;
      }
    } catch (err) {
      console.error("Error in rejectTrainer:", err);
      setError("Failed to reject trainer");
      return false;
    }
  };

  const revokeVerification = async (trainerId: string) => {
    try {
      try {
        const verificationRecord = trainers.find((t) => t.id === trainerId);
        if (!verificationRecord) {
          throw new Error("Trainer record not found");
        }

        const { error } = await supabase
          .from("trainer_verifications")
          .update({
            verification_status: "pending",
            verified_trainer: false,
            reviewed_by: null,
            reviewed_at: null,
          })
          .eq("id", trainerId);

        if (error) {
          throw error;
        }

        // Also update the users table
        const { error: userError } = await supabase
          .from("users")
          .update({ verified_trainer: false })
          .eq("id", verificationRecord.user_id);

        if (userError) {
          console.warn("Warning updating user verified status:", userError);
        }

        // Refresh the list
        await fetchTrainers(currentTab);
        return true;
      } catch (fetchErr) {
        console.error("Error revoking verification:", fetchErr);
        const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);

        if (errorMsg.includes("Failed to fetch")) {
          setError("Network error: Unable to reach the server");
        } else {
          setError("Failed to revoke verification");
        }

        return false;
      }
    } catch (err) {
      console.error("Error in revokeVerification:", err);
      setError("Failed to revoke verification");
      return false;
    }
  };

  const reReviewTrainer = async (trainerId: string) => {
    try {
      try {
        const { error } = await supabase
          .from("trainer_verifications")
          .update({
            verification_status: "pending",
            verified_trainer: false,
            reviewed_by: null,
            reviewed_at: null,
          })
          .eq("id", trainerId);

        if (error) {
          throw error;
        }

        // Refresh the list
        await fetchTrainers(currentTab);
        return true;
      } catch (fetchErr) {
        console.error("Error re-reviewing trainer:", fetchErr);
        const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);

        if (errorMsg.includes("Failed to fetch")) {
          setError("Network error: Unable to reach the server");
        } else {
          setError("Failed to re-review trainer");
        }

        return false;
      }
    } catch (err) {
      console.error("Error in reReviewTrainer:", err);
      setError("Failed to re-review trainer");
      return false;
    }
  };

  useEffect(() => {
    fetchTrainers(currentTab);
  }, [currentTab, fetchTrainers]);

  return {
    trainers,
    loading,
    error,
    currentTab,
    setCurrentTab,
    approveTrainer,
    rejectTrainer,
    revokeVerification,
    reReviewTrainer,
    refetch: () => fetchTrainers(currentTab),
  };
}
