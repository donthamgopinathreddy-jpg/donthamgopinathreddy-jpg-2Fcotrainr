import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(
    () => !!navigator.credentials?.create && !!window.PublicKeyCredential,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register biometric credential
  const registerBiometric = useCallback(
    async (userId: string, deviceName: string) => {
      if (!isAvailable) {
        setError("Biometric authentication is not available on this device");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Get challenge from server
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: {
              name: "CoTrainr",
              id: window.location.hostname,
            },
            user: {
              id: new TextEncoder().encode(userId),
              name: userId,
              displayName: deviceName,
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              residentKey: "preferred",
              userVerification: "preferred",
            },
            timeout: 60000,
            attestation: "none",
          },
        });

        if (!credential) {
          setError("Biometric registration cancelled");
          return false;
        }

        // Store credential metadata in Supabase
        const credentialData = {
          id: (credential as any).id,
          userId: userId,
          deviceName: deviceName,
          credentialPublicKey: btoa(
            String.fromCharCode(
              ...new Uint8Array((credential as any).response.getPublicKey()),
            ),
          ),
          counter: 0,
          credentialDeviceType: "single-device",
          credentialBackedUp: false,
          transports: (credential as any).response.getTransports?.() || [],
          createdAt: new Date().toISOString(),
        };

        const { error: dbError } = await supabase
          .from("biometric_credentials")
          .insert([credentialData]);

        if (dbError) {
          setError(`Failed to save credential: ${dbError.message}`);
          return false;
        }

        return true;
      } catch (err: any) {
        const errorMsg =
          err?.name === "NotAllowedError"
            ? "Biometric registration was cancelled"
            : err?.name === "NotSupportedError"
              ? "Biometric authentication is not supported on this device"
              : `Registration failed: ${err?.message || "Unknown error"}`;
        setError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAvailable],
  );

  // Authenticate using biometric
  const authenticateWithBiometric = useCallback(
    async (userId: string) => {
      if (!isAvailable) {
        setError("Biometric authentication is not available on this device");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Get challenge from server
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            userVerification: "preferred",
            timeout: 60000,
          },
        });

        if (!assertion || assertion.type !== "public-key") {
          setError("Biometric authentication failed");
          return null;
        }

        // Verify with backend and sign in
        return {
          credentialId: (assertion as any).id,
          clientDataJSON: btoa(
            String.fromCharCode(
              ...new Uint8Array((assertion as any).response.clientDataJSON),
            ),
          ),
          authenticatorData: btoa(
            String.fromCharCode(
              ...new Uint8Array((assertion as any).response.authenticatorData),
            ),
          ),
          signature: btoa(
            String.fromCharCode(
              ...new Uint8Array((assertion as any).response.signature),
            ),
          ),
        };
      } catch (err: any) {
        const errorMsg =
          err?.name === "NotAllowedError"
            ? "Authentication was cancelled"
            : err?.name === "NotSupportedError"
              ? "Biometric authentication is not supported on this device"
              : `Authentication failed: ${err?.message || "Unknown error"}`;
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAvailable],
  );

  return {
    isAvailable,
    loading,
    error,
    registerBiometric,
    authenticateWithBiometric,
  };
};
