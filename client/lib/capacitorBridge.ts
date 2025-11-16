import { Capacitor, registerPlugin, Plugin } from "@capacitor/core";

export interface BiometricAuthPlugin extends Plugin {
  authenticate(): Promise<{ success: boolean; error?: string }>;
  getPrimaryBiometricType(): Promise<{ type: string }>;
  isAvailable(): Promise<{ available: boolean }>;
}

/**
 * Register the BiometricAuth plugin
 * This bridges JavaScript code with native iOS/Android implementations
 */
const BiometricAuthPlugin = registerPlugin<BiometricAuthPlugin>(
  "BiometricAuth",
  {
    web: undefined,
  },
);

/**
 * Authenticate user with device biometric
 * Supports:
 * - iOS: Face ID, Touch ID
 * - Android: Fingerprint, Face Recognition, Pattern, PIN
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Web platform - simulate biometric authentication
      return simulateBiometricAuth();
    }

    const result = await BiometricAuthPlugin.authenticate();
    return result.success;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return false;
  }
}

/**
 * Get the primary biometric type available on the device
 */
export async function getPrimaryBiometricType(): Promise<string> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return "pattern"; // Default fallback on web
    }

    const result = await BiometricAuthPlugin.getPrimaryBiometricType();
    return result.type;
  } catch (error) {
    console.error("Error getting biometric type:", error);
    return "none";
  }
}

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true; // Assume available on web for development
    }

    const result = await BiometricAuthPlugin.isAvailable();
    return result.available;
  } catch (error) {
    console.error("Error checking biometric availability:", error);
    return false;
  }
}

/**
 * Simulate biometric authentication for web development
 */
function simulateBiometricAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate 1.5 second authentication delay
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

/**
 * Initialize biometric plugin
 * Call this on app startup to ensure native code is loaded
 */
export async function initializeBiometricAuth(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await getPrimaryBiometricType();
      console.log("Biometric authentication initialized");
    } catch (error) {
      console.warn("Failed to initialize biometric auth:", error);
    }
  }
}
