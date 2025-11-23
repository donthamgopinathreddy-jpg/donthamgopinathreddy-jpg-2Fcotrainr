import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import {
  getDeviceInfo,
  onAppPause,
  onAppResume,
  onAppDestroy,
  setStatusBarStyle,
  requestNotificationPermission,
} from "../lib/nativeFeatures";
import { initializeBiometricAuth } from "../lib/capacitorBridge";
import { initializeOfflineStorage } from "../lib/offlineStorage";

/**
 * Initialize native app features on app startup
 * This hook handles:
 * - Device info logging
 * - App lifecycle events
 * - Status bar styling
 * - Notification permissions
 * - Biometric authentication setup
 * - Offline storage initialization
 */
export function useNativeAppInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initializeApp = async () => {
      try {
        // Log device info
        const deviceInfo = await getDeviceInfo();
        console.log("Device Info:", {
          platform: deviceInfo.platform,
          osVersion: deviceInfo.osVersion,
          model: deviceInfo.model,
        });

        // Set status bar style
        await setStatusBarStyle(false);

        // Request notification permissions
        await requestNotificationPermission();

        // Initialize biometric authentication
        await initializeBiometricAuth();

        // Initialize offline storage
        await initializeOfflineStorage((operations) => {
          console.log(`Found ${operations.length} pending operations`);
          // Sync pending operations when connection is restored
        });

        console.log("Native app initialized successfully");
      } catch (error) {
        console.error("Failed to initialize native app:", error);
      }
    };

    initializeApp();

    // Setup app lifecycle listeners
    onAppPause(() => {
      console.log("App paused");
      // Save app state
    });

    onAppResume(() => {
      console.log("App resumed");
      // Restore app state and sync data
    });

    onAppDestroy(() => {
      console.log("App destroyed");
      // Clean up resources
    });
  }, []);
}

/**
 * Alternative implementation name for clarity
 * Re-exports useNativeAppInit for different naming preference
 */
export const useInitializeNativeApp = useNativeAppInit;
