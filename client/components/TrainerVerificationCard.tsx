import React, { useState } from "react";
import { format } from "date-fns";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TrainerVerificationCardProps {
  trainerId: string;
  name: string;
  email: string;
  country?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  certificateUrl?: string;
  onApprove: (trainerId: string) => void;
  onReject: (trainerId: string) => void;
  onRevokeVerification?: (trainerId: string) => void;
  onReReview?: (trainerId: string) => void;
  isProcessing?: boolean;
}

export const TrainerVerificationCard: React.FC<
  TrainerVerificationCardProps
> = ({
  trainerId,
  name,
  email,
  country,
  status,
  submittedAt,
  reviewedAt,
  rejectionReason,
  idDocumentUrl,
  selfieUrl,
  certificateUrl,
  onApprove,
  onReject,
  onRevokeVerification,
  onReReview,
  isProcessing = false,
}) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    onApprove(trainerId);
    setShowApproveDialog(false);
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleViewDocument = (url: string, type: string) => {
    setSelectedImage({ url, type });
    setShowImageModal(true);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">✓ Verified</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{email}</p>
            {country && <p className="text-sm text-gray-500">📍 {country}</p>}
            <p className="text-xs text-gray-400 mt-2">
              Role: <span className="font-medium">Trainer</span>
            </p>
          </div>
          <div className="flex-shrink-0">{getStatusBadge()}</div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500">
            {status === "approved"
              ? `Approved on ${reviewedAt ? format(new Date(reviewedAt), "MMM dd, yyyy") : "Unknown"}`
              : status === "rejected"
                ? `Rejected on ${reviewedAt ? format(new Date(reviewedAt), "MMM dd, yyyy") : "Unknown"}`
                : `Submitted on ${format(new Date(submittedAt), "MMM dd, yyyy 'at' HH:mm")}`}
          </p>
        </div>

        {status === "rejected" && rejectionReason && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {rejectionReason}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          {idDocumentUrl && (
            <button
              onClick={() => handleViewDocument(idDocumentUrl, "ID Document")}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View ID Document</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {selfieUrl && (
            <button
              onClick={() => handleViewDocument(selfieUrl, "Selfie")}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Selfie</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {certificateUrl && (
            <button
              onClick={() =>
                handleViewDocument(certificateUrl, "Certification")
              }
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Certification</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          {status === "pending" && (
            <>
              <Button
                onClick={handleRejectClick}
                disabled={isProcessing}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button
                onClick={handleApproveClick}
                disabled={isProcessing}
                className="bg-[#FF7A00] hover:bg-[#E67000] text-white"
              >
                Approve
              </Button>
            </>
          )}
          {status === "approved" && onRevokeVerification && (
            <Button
              onClick={() => onRevokeVerification(trainerId)}
              disabled={isProcessing}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Revoke Verification
            </Button>
          )}
          {status === "rejected" && onReReview && (
            <Button
              onClick={() => onReReview(trainerId)}
              disabled={isProcessing}
              variant="outline"
            >
              Re-review
            </Button>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogTitle>Approve Trainer Verification</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this trainer as verified? This will
            give them access to trainer features across the app.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-[#FF7A00] hover:bg-[#E67000] text-white"
            >
              Approve
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog - Confirmation only */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogTitle>Reject Trainer Verification</AlertDialogTitle>
          <AlertDialogDescription>
            This trainer will be moved to the Rejected tab. You can provide a
            reason in the next step.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReject(trainerId);
                setShowRejectDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Proceed to Rejection
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                {selectedImage.type}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.type}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF7A00] hover:text-[#E67000] font-medium flex items-center gap-2"
              >
                Open in new tab
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
