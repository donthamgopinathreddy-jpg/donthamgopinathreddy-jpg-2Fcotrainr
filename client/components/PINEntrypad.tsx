import { useState } from "react";
import { Backspace, X } from "lucide-react";

interface PINEntrypadProps {
  onPINSubmit: (pin: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
  maxLength?: number;
}

export default function PINEntrypad({
  onPINSubmit,
  isLoading = false,
  error,
  onCancel,
  maxLength = 6,
}: PINEntrypadProps) {
  const [pin, setPin] = useState("");

  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onPINSubmit(pin);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) {
      handleNumberClick(e.key);
    } else if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyPress} tabIndex={-1}>
      {/* PIN Display */}
      <div className="flex justify-center gap-3">
        {[...Array(maxLength)].map((_, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
              i < pin.length
                ? "bg-primary/10 border-primary text-primary"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            }`}
          >
            {i < pin.length ? "●" : ""}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            disabled={isLoading || pin.length >= maxLength}
            className="py-4 text-2xl font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 transition-colors"
          >
            {num}
          </button>
        ))}

        {/* 0 Button spanning 2 columns */}
        <button
          onClick={() => handleNumberClick("0")}
          disabled={isLoading || pin.length >= maxLength}
          className="col-span-2 py-4 text-2xl font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 transition-colors"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          onClick={handleBackspace}
          disabled={isLoading || pin.length === 0}
          className="py-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Backspace className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || pin.length < 4}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Sign In"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        )}
      </div>

      {/* Info Text */}
      <p className="text-center text-xs text-gray-600 dark:text-gray-400">
        Enter your {maxLength}-digit PIN
      </p>
    </div>
  );
}
