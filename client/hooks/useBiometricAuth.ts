import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Conditionally import Capacitor - only available on mobile platforms
let Device: any = null;
let Capacitor: any = null;

try {
  Device = require("@capacitor/device").Device;
  Capacitor = require("@capacitor/core").Capacitor;
} catch (e) {
  // Capacitor not available in this environment (e.g., web)
}

export type BiometricType =
  | "faceId"
  | "fingerprint"
  | "pattern"
  | "pin"
  | "none";

interface BiometricAuthState {
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnabled: boolean;
}

export const useBiometricAuth = () => {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    biometricType: "none",
    isEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect platform and available biometric methods
  const detectBiometricCapabilities = useCallback(async () => {
    try {
      setLoading(true);

      // Check if Device is available (mobile only)
      if (!Device) {
        setState((prev) => ({
          ...prev,
          isAvailable: false,
          biometricType: "none",
        }));
        setLoading(false);
        return;
      }

      const info = await Device.getInfo();
      const platform = info.platform;

      let biometricType: BiometricType = "none";
      let isAvailable = false;

      if (platform === "ios") {
        // iOS: Use Face ID (preferred) or Touch ID, with PIN fallback
        biometricType = "faceId";
        isAvailable = true;
      } else if (platform === "android") {
        // Android: Check for available biometric methods
        // Prefer fingerprint, then face recognition, then pattern/pin
        const biometricInfo = await getAndroidBiometricInfo();

        if (biometricInfo.hasFingerprint) {
          biometricType = "fingerprint";
          isAvailable = true;
        } else if (biometricInfo.hasFace) {
          biometricType = "faceId";
          isAvailable = true;
        } else {
          // Fallback to pattern or PIN
          biometricType = "pattern";
          isAvailable = true;
        }
      }

      setState((prev) => ({
        ...prev,
        isAvailable,
        biometricType,
      }));

      setError(null);
    } catch (err: any) {
      console.error("Error detecting biometric capabilities:", err);
      setError(err?.message || "Failed to detect biometric capabilities");
      setState((prev) => ({
        ...prev,
        isAvailable: false,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Android biometric info
  const getAndroidBiometricInfo = async () => {
    return {
      hasFingerprint: true, // Assume available on Android
      hasFace: false, // Would need native code to detect
      hasPattern: true,
      hasPin: true,
    };
  };

  // Enable biometric auth for user
  const enableBiometricAuth = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error: dbError } = await supabase
          .from("user_security_settings")
          .upsert(
            {
              user_id: userId,
              biometric_enabled: true,
              biometric_type: state.biometricType,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

        if (dbError) {
          throw new Error(
            `Failed to enable biometric auth: ${dbError.message}`,
          );
        }

        setState((prev) => ({
          ...prev,
          isEnabled: true,
        }));

        return true;
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to enable biometric auth";
        setError(errorMsg);
        console.error("Enable biometric auth error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [state.biometricType],
  );

  // Disable biometric auth for user
  const disableBiometricAuth = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: dbError } = await supabase
        .from("user_security_settings")
        .upsert(
          {
            user_id: userId,
            biometric_enabled: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (dbError) {
        throw new Error(`Failed to disable biometric auth: ${dbError.message}`);
      }

      setState((prev) => ({
        ...prev,
        isEnabled: false,
      }));

      return true;
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to disable biometric auth";
      setError(errorMsg);
      console.error("Disable biometric auth error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if biometric auth is enabled for user
  const isBiometricEnabled = useCallback(
    async (userId: string) => {
      try {
        const { data } = await supabase
          .from("user_security_settings")
          .select("biometric_enabled, biometric_type")
          .eq("user_id", userId)
          .single();

        if (data?.biometric_enabled) {
          setState((prev) => ({
            ...prev,
            isEnabled: true,
            biometricType:
              (data.biometric_type as BiometricType) || state.biometricType,
          }));
          return true;
        }

        return false;
      } catch (err) {
        console.error("Error checking biometric status:", err);
        return false;
      }
    },
    [state.biometricType],
  );

  // Trigger biometric authentication (native implementation)
  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Check if Device is available (mobile only)
      if (!Device) {
        setError("Biometric authentication not available on this platform");
        return false;
      }

      const info = await Device.getInfo();
      const platform = info.platform;

      if (platform === "ios") {
        // On iOS, use LocalAuthentication framework (Face ID/Touch ID)
        // This would be implemented in native Swift code
        return await authenticateIOS();
      } else if (platform === "android") {
        // On Android, use BiometricPrompt API
        // This would be implemented in native Kotlin code
        return await authenticateAndroid();
      }

      return false;
    } catch (err: any) {
      const errorMsg = err?.message || "Biometric authentication failed";
      setError(errorMsg);
      console.error("Biometric authentication error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // iOS authentication (native bridge)
  const authenticateIOS = async (): Promise<boolean> => {
    try {
      // Call native iOS biometric authentication
      if (Capacitor.isNativePlatform()) {
        // Try to call the BiometricAuth plugin if it exists
        const result = await (window as any).BiometricAuth?.authenticate?.();
        return result === true;
      }

      // Fallback simulation for web development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (err) {
      console.error("iOS biometric error:", err);
      return false;
    }
  };

  // Android authentication (native bridge)
  const authenticateAndroid = async (): Promise<boolean> => {
    try {
      // Call native Android biometric authentication
      if (Capacitor.isNativePlatform()) {
        // Try to call the BiometricAuth plugin if it exists
        const result = await (window as any).BiometricAuth?.authenticate?.();
        return result === true;
      }

      // Fallback simulation for web development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (err) {
      console.error("Android biometric error:", err);
      return false;
    }
  };

  // Initialize biometric capabilities on mount
  useEffect(() => {
    detectBiometricCapabilities();
  }, [detectBiometricCapabilities]);

  return {
    ...state,
    loading,
    error,
    detectBiometricCapabilities,
    enableBiometricAuth,
    disableBiometricAuth,
    isBiometricEnabled,
    authenticateWithBiometric,
  };
};
