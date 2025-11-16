import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminTrainerVerification } from "@/hooks/useAdminTrainerVerification";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { TrainerVerificationCard } from "@/components/TrainerVerificationCard";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Loader,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from "lucide-react";

const AdminTrainerVerification: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const {
    trainers,
    loading,
    error,
    currentTab,
    setCurrentTab,
    approveTrainer,
    rejectTrainer,
    revokeVerification,
    reReviewTrainer,
  } = useAdminTrainerVerification();

  const { stats } = useAdminDashboard();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTrainerId, setRejectingTrainerId] = useState<string | null>(
    null,
  );

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to access this page</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (trainerId: string) => {
    setProcessingId(trainerId);
    const success = await approveTrainer(trainerId, userProfile.id);
    setProcessingId(null);

    if (success) {
      toast({
        title: "Success",
        description: "Trainer approved successfully",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to approve trainer",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (trainerId: string) => {
    setRejectingTrainerId(trainerId);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingTrainerId) return;

    setProcessingId(rejectingTrainerId);
    const success = await rejectTrainer(
      rejectingTrainerId,
      reason,
      userProfile.id,
    );
    setProcessingId(null);
    setRejectModalOpen(false);
    setRejectingTrainerId(null);

    if (success) {
      toast({
        title: "Success",
        description: "Trainer rejected successfully",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to reject trainer",
        variant: "destructive",
      });
    }
  };

  const handleRevokeVerification = async (trainerId: string) => {
    setProcessingId(trainerId);
    const success = await revokeVerification(trainerId);
    setProcessingId(null);

    if (success) {
      toast({
        title: "Success",
        description: "Verification revoked successfully",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to revoke verification",
        variant: "destructive",
      });
    }
  };

  const handleReReview = async (trainerId: string) => {
    setProcessingId(trainerId);
    const success = await reReviewTrainer(trainerId);
    setProcessingId(null);

    if (success) {
      toast({
        title: "Success",
        description: "Trainer moved back to pending review",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to move trainer back to pending",
        variant: "destructive",
      });
    }
  };

  const pendingCount = stats.pendingVerifications;
  const approvedCount = stats.approvedVerifications;
  const rejectedCount = stats.rejectedVerifications;

  return (
    <AdminLayout
      title="Trainer Verification"
      description="Review and approve trainer documents"
    >
      {/* Admin Stats Cards - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Side: Platform Stats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-blue-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-blue-700 font-semibold uppercase">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-purple-700 font-semibold uppercase">
                    Trainers
                  </p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {stats.totalTrainers}
                  </p>
                </div>
                <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-indigo-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-indigo-700 font-semibold uppercase">
                    Clients
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {stats.totalClients}
                  </p>
                </div>
                <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Verification Stats */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
            Trainer Verification Status
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-amber-700 font-semibold uppercase">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {pendingCount}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-green-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-green-700 font-semibold uppercase">
                    Approved
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {approvedCount}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4 backdrop-blur-md border border-white/40 hover:shadow-lg hover:shadow-red-400/50 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-red-700 font-semibold uppercase">
                    Rejected
                  </p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {rejectedCount}
                  </p>
                </div>
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs/Filters - Underline Style */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        <button
          onClick={() => setCurrentTab("pending")}
          className={`px-1 py-3 font-medium border-b-2 transition-colors ${
            currentTab === "pending"
              ? "border-amber-400 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab("approved")}
          className={`px-1 py-3 font-medium border-b-2 transition-colors ${
            currentTab === "approved"
              ? "border-green-400 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved
          {approvedCount > 0 && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {approvedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab("rejected")}
          className={`px-1 py-3 font-medium border-b-2 transition-colors ${
            currentTab === "rejected"
              ? "border-red-400 text-red-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Rejected
          {rejectedCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {rejectedCount}
            </span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading trainers...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && trainers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-3">
            {currentTab === "pending" && "📋"}
            {currentTab === "approved" && "✓"}
            {currentTab === "rejected" && "✕"}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No trainers to display
          </h3>
          <p className="text-gray-600">
            {currentTab === "pending" &&
              "No trainers are waiting for verification"}
            {currentTab === "approved" && "No approved trainers yet"}
            {currentTab === "rejected" && "No rejected trainers"}
          </p>
        </div>
      )}

      {/* Trainer List */}
      {!loading && trainers.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {trainers.map((trainer) => (
            <TrainerVerificationCard
              key={trainer.id}
              trainerId={trainer.id}
              name={trainer.name}
              email={trainer.email}
              country={trainer.country}
              status={
                trainer.verification_status as
                  | "pending"
                  | "approved"
                  | "rejected"
              }
              submittedAt={trainer.submitted_at}
              reviewedAt={trainer.reviewed_at}
              rejectionReason={trainer.rejection_reason}
              idDocumentUrl={trainer.id_document_url}
              selfieUrl={trainer.selfie_url}
              certificateUrl={trainer.certificate_url}
              onApprove={handleApprove}
              onReject={handleReject}
              onRevokeVerification={handleRevokeVerification}
              onReReview={handleReReview}
              isProcessing={processingId === trainer.id}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <RejectReasonModal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setRejectingTrainerId(null);
          }}
          onConfirm={handleRejectConfirm}
          isProcessing={processingId !== null}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
};

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [reason, setReason] = React.useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Rejection Reason
          </h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this trainer's verification:
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            rows={4}
            disabled={isProcessing}
          />
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && <Loader className="w-4 h-4 animate-spin" />}
            Submit Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTrainerVerification;
