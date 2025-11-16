import { useState, useEffect } from "react";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { Fingerprint, Toggle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BiometricSettingsProps {
  userId: string;
}

export default function BiometricSettings({ userId }: BiometricSettingsProps) {
  const {
    isAvailable: biometricAvailable,
    biometricType,
    isEnabled: biometricEnabled,
    loading,
    error,
    enableBiometricAuth,
    disableBiometricAuth,
    isBiometricEnabled,
  } = useBiometricAuth();

  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if biometric is enabled for this user on mount
  useEffect(() => {
    const checkBiometricStatus = async () => {
      try {
        setChecking(true);
        const isEnabled = await isBiometricEnabled(userId);
        setEnabled(isEnabled);
      } catch (err) {
        console.error("Error checking biometric status:", err);
      } finally {
        setChecking(false);
      }
    };

    checkBiometricStatus();
  }, [userId, isBiometricEnabled]);

  const handleToggle = async () => {
    try {
      if (enabled) {
        // Disable biometric
        const success = await disableBiometricAuth(userId);
        if (success) {
          setEnabled(false);
          toast.success("Biometric authentication disabled");
        } else {
          toast.error("Failed to disable biometric authentication");
        }
      } else {
        // Enable biometric
        const success = await enableBiometricAuth(userId);
        if (success) {
          setEnabled(true);
          toast.success("Biometric authentication enabled");
        } else {
          toast.error("Failed to enable biometric authentication");
        }
      }
    } catch (err) {
      console.error("Error toggling biometric:", err);
      toast.error("An error occurred");
    }
  };

  if (checking || !biometricAvailable) {
    return null;
  }

  const biometricLabel = {
    faceId: "Face ID",
    fingerprint: "Fingerprint",
    pattern: "Pattern",
    pin: "PIN",
    none: "Biometric Authentication",
  }[biometricType] || "Biometric Authentication";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Fingerprint className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {biometricLabel}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Use your device's biometric authentication to sign in securely
              </p>
              {biometricType === "faceId" && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Your device supports Face ID authentication
                </p>
              )}
              {biometricType === "fingerprint" && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Your device supports fingerprint authentication
                </p>
              )}
              {biometricType === "pattern" && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Your device supports pattern authentication
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading || checking}
            className={`p-2 rounded-lg transition-all ${
              enabled
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={enabled ? "Disable biometric" : "Enable biometric"}
          >
            <Toggle2 className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {enabled && (
          <div className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ {biometricLabel} authentication is enabled for your account
          </div>
        )}

        {!enabled && biometricAvailable && (
          <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            You can enable {biometricLabel} to sign in faster
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>How it works:</strong>
        </p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>
            When enabled, you can use {biometricLabel.toLowerCase()} to sign in
          </li>
          <li>Your biometric data is never sent to our servers</li>
          <li>
            It stays securely stored on your device and managed by the OS
          </li>
          <li>You can disable this anytime in settings</li>
        </ul>
      </div>
    </div>
  );
}
