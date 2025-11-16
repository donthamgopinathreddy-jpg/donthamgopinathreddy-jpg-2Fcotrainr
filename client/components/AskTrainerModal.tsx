import { useState } from "react";
import { X, Send } from "lucide-react";

interface AskTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trainerId: string | null) => Promise<void>;
  isLoading: boolean;
}

export default function AskTrainerModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AskTrainerModalProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(selectedTrainer);
      // Reset form
      setSelectedTrainer(null);
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full border border-white/20 dark:border-gray-800/20 backdrop-blur-xl animate-in slide-up-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ask Trainer to Review
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send your current diet plan to your assigned trainer for
              personalized feedback and recommendations.
            </p>

            {/* Trainer Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Your Trainer
              </label>
              <div className="space-y-2">
                {/* Mock trainer list - in real app, this would come from data */}
                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="trainer"
                    value="any"
                    checked={selectedTrainer === null}
                    onChange={() => setSelectedTrainer(null)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Any Available Trainer
                  </span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share specific concerns or goals with your trainer..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                📝 Your trainer will review your diet plan within 24-48 hours
                and provide feedback.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting || isLoading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
