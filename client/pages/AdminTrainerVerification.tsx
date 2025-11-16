import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminTrainerVerification } from "@/hooks/useAdminTrainerVerification";
import { TrainerVerificationCard } from "@/components/TrainerVerificationCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  Loader,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Upload,
} from "lucide-react";

const AdminTrainerVerification: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
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

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTrainerId, setRejectingTrainerId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [trainerCount, setTrainerCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  // Check if user is admin (for now, we'll allow access - this should be enforced via backend)
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
    const success = await rejectTrainer(rejectingTrainerId, reason, userProfile.id);
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

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      setUploadingPic(true);

      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userProfile.id}-profile.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("profiles")
        .getPublicUrl(fileName);

      const profileUrl = data.publicUrl;

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_picture_url: profileUrl })
        .eq("id", userProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Profile picture upload error:", err);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingPic(false);
    }
  };

  // Fetch trainer and client counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: trainers, error: trainersError } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "trainer");

        const { data: clients, error: clientsError } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "client");

        if (!trainersError && trainers) {
          setTrainerCount(trainers.length);
        }
        if (!clientsError && clients) {
          setClientCount(clients.length);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
  }, []);

  const pendingCount = trainers.filter((t) => t.verification_status === "pending").length;
  const approvedCount = trainers.filter((t) => t.verification_status === "approved").length;
  const rejectedCount = trainers.filter((t) => t.verification_status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7A00] to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {userProfile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex flex-col items-center gap-3">
                  {userProfile?.profile_picture_url ? (
                    <img
                      src={userProfile.profile_picture_url}
                      alt={userProfile.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#FF7A00]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7A00] to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                      {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#FF7A00] text-white text-sm font-medium rounded-lg hover:bg-[#E67000] cursor-pointer transition-colors disabled:opacity-50">
                    {uploadingPic ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Change Picture</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPic}
                      onChange={handleProfilePictureUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Admin Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Admin Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Role</p>
                    <p className="text-gray-900">System Administrator</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Status</p>
                    <p className="text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Active
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-gray-900 break-all">{userProfile?.email}</p>
                  </div>
                </div>
              </div>

              {/* System Settings & Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">System Settings</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Settings & Configuration</p>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                    Notification Preferences
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                    View Activity Log
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trainer Verification</h1>
              <p className="text-gray-600 mt-1">Review and approve trainer documents</p>
            </div>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              Admin Only
            </Badge>
          </div>

          {/* Admin Stats Cards - Compact Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-amber-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-amber-600 font-medium uppercase">Pending</p>
                  <p className="text-xl font-bold text-amber-900 mt-1">{pendingCount}</p>
                </div>
                <Clock className="w-5 h-5 text-amber-400 opacity-60 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white border border-green-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-green-600 font-medium uppercase">Approved</p>
                  <p className="text-xl font-bold text-green-900 mt-1">{approvedCount}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400 opacity-60 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white border border-red-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-red-600 font-medium uppercase">Rejected</p>
                  <p className="text-xl font-bold text-red-900 mt-1">{rejectedCount}</p>
                </div>
                <XCircle className="w-5 h-5 text-red-400 opacity-60 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-blue-600 font-medium uppercase">Total Users</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">{trainerCount + clientCount}</p>
                </div>
                <Users className="w-5 h-5 text-blue-400 opacity-60 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white border border-purple-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-purple-600 font-medium uppercase">Trainers</p>
                  <p className="text-xl font-bold text-purple-900 mt-1">{trainerCount}</p>
                </div>
                <Users className="w-5 h-5 text-purple-400 opacity-60 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white border border-indigo-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-indigo-600 font-medium uppercase">Clients</p>
                  <p className="text-xl font-bold text-indigo-900 mt-1">{clientCount}</p>
                </div>
                <Users className="w-5 h-5 text-indigo-400 opacity-60 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
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
              <Loader className="w-8 h-8 text-[#FF7A00] animate-spin" />
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">No trainers to display</h3>
            <p className="text-gray-600">
              {currentTab === "pending" && "No trainers are waiting for verification"}
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
                status={trainer.verification_status as "pending" | "approved" | "rejected"}
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
      </div>

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
    </div>
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
          <h2 className="text-xl font-semibold text-gray-900">Rejection Reason</h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this trainer's verification:
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none"
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
