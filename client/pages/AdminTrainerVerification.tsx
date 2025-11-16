import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminTrainerVerification } from "@/hooks/useAdminTrainerVerification";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
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
  Camera,
  X,
  Bell,
} from "lucide-react";

const AdminTrainerVerification: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, updateProfile } = useAuth();
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
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);

  // Hooks for activity log and notification preferences
  const { logs: activityLogs } = useActivityLog(userProfile?.id);
  const {
    preferences: notifPrefs,
    updatePreferences: updateNotifPrefs,
  } = useNotificationPreferences(userProfile?.id);

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

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `admin-${userProfile.id}-${Date.now()}.${fileExt}`;

      // Convert file to base64 to avoid stream issues
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });

      // Convert ArrayBuffer to File for upload
      const uploadFile = new File([fileData], fileName, { type: file.type });

      // Upload with simple error handling
      const response = await supabase.storage
        .from("profiles")
        .upload(fileName, uploadFile, { upsert: true });

      if (response.error) {
        // If bucket doesn't exist, skip storage and just use a placeholder
        if (response.error.message?.includes("Bucket not found")) {
          console.log("Storage not available, using placeholder");
          const placeholderUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23FF7A00' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='50' fill='white' font-weight='bold'%3E${userProfile.full_name?.[0]?.toUpperCase() || "A"}%3C/text%3E%3C/svg%3E`;

          await supabase
            .from("users")
            .update({ profile_picture_url: placeholderUrl })
            .eq("id", userProfile.id);

          await updateProfile({ profile_picture_url: placeholderUrl });

          toast({
            title: "Saved",
            description: "Profile picture saved (placeholder)",
            variant: "default",
          });
        } else {
          throw new Error(response.error.message || "Upload failed");
        }
      } else {
        // Successfully uploaded, construct URL
        const projectId = "jnvfoyjhflheohculqbb";
        const profileUrl = `https://${projectId}.supabase.co/storage/v1/object/public/profiles/${fileName}`;

        // Update database
        await supabase
          .from("users")
          .update({ profile_picture_url: profileUrl })
          .eq("id", userProfile.id);

        // Update local state
        await updateProfile({ profile_picture_url: profileUrl });

        toast({
          title: "Success",
          description: "Profile picture saved successfully!",
          variant: "default",
        });
      }

      // Reset the input
      e.target.value = "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Profile picture upload error:", errorMsg);

      toast({
        title: "Error",
        description: "Failed to save profile picture",
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
                  <label className="relative cursor-pointer group">
                    {userProfile?.profile_picture_url ? (
                      <img
                        src={userProfile.profile_picture_url}
                        alt={userProfile.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#FF7A00]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF7A00] to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
                        {userProfile?.full_name?.[0]?.toUpperCase() || "A"}
                      </div>
                    )}

                    {/* Camera Icon Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
                      <div className="bg-[#FF7A00] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {uploadingPic ? (
                          <Loader className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

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
                  <button
                    onClick={() => setShowNotificationPrefs(true)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Notification Preferences
                  </button>
                  <button
                    onClick={() => setShowActivityLog(true)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
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

          {/* Admin Stats Cards - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: Platform Stats (NOW TOP) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">Platform Statistics</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-blue-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-blue-600 font-medium uppercase">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{trainerCount + clientCount}</p>
                    </div>
                    <Users className="w-5 h-5 text-blue-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white border border-purple-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-purple-600 font-medium uppercase">Trainers</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{trainerCount}</p>
                    </div>
                    <Users className="w-5 h-5 text-purple-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white border border-indigo-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-indigo-600 font-medium uppercase">Clients</p>
                      <p className="text-2xl font-bold text-indigo-900 mt-1">{clientCount}</p>
                    </div>
                    <Users className="w-5 h-5 text-indigo-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Verification Stats (NOW BOTTOM) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">Trainer Verification Status</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-amber-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-amber-600 font-medium uppercase">Pending</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
                    </div>
                    <Clock className="w-5 h-5 text-amber-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white border border-green-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-green-600 font-medium uppercase">Approved</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{approvedCount}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white border border-red-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-red-600 font-medium uppercase">Rejected</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
                    </div>
                    <XCircle className="w-5 h-5 text-red-400 opacity-60 flex-shrink-0" />
                  </div>
                </div>
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

      {/* Activity Log Modal */}
      {showActivityLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowActivityLog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
              <button
                onClick={() => setShowActivityLog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500">No activity recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {log.action}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-sm text-gray-600 mb-1">
                          {log.description}
                        </p>
                      )}
                      {log.resource_type && (
                        <p className="text-xs text-gray-500">
                          Resource: {log.resource_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotificationPrefs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNotificationPrefs(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <button
                onClick={() => setShowNotificationPrefs(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {notifPrefs ? (
                <div className="space-y-4">
                  {[
                    {
                      key: "email_notifications",
                      label: "Email Notifications",
                      desc: "Receive notifications via email",
                    },
                    {
                      key: "in_app_notifications",
                      label: "In-App Notifications",
                      desc: "See notifications in the app",
                    },
                    {
                      key: "trainer_verifications",
                      label: "Trainer Verifications",
                      desc: "Alerts for trainer verification updates",
                    },
                    {
                      key: "user_activity",
                      label: "User Activity",
                      desc: "Notifications about user activity",
                    },
                    {
                      key: "system_alerts",
                      label: "System Alerts",
                      desc: "Critical system notifications",
                    },
                  ].map((pref) => (
                    <label
                      key={pref.key}
                      className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={
                          notifPrefs[pref.key as keyof NotificationPreferences] as unknown as boolean
                        }
                        onChange={(e) => {
                          updateNotifPrefs({
                            [pref.key]: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 text-[#FF7A00] rounded border-gray-300 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pref.label}
                        </p>
                        <p className="text-xs text-gray-500">{pref.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Loading preferences...
                </p>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowNotificationPrefs(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
