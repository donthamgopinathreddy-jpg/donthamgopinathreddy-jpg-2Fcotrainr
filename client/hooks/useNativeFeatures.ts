import { useState, useCallback, useEffect } from "react";
import {
  takeCameraPhoto,
  selectPhotoFromGallery,
  getCurrentLocation,
  watchLocation,
  scheduleLocalNotification,
  requestNotificationPermission,
  getDeviceInfo,
  savePreference,
  getPreference,
  removePreference,
  getNetworkStatus,
  watchNetworkStatus,
  hideKeyboard,
  setStatusBarStyle,
  UserLocation,
  NetworkStatus,
  DeviceInfo,
  NotificationOptions,
} from "../lib/nativeFeatures";

/**
 * Hook for camera functionality
 */
export function useCamera() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await takeCameraPhoto();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Camera error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectFromGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await selectPhotoFromGallery();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gallery error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { takePhoto, selectFromGallery, loading, error };
}

/**
 * Hook for geolocation
 */
export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentLocation();
      setLocation(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Location error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startWatching = useCallback(() => {
    try {
      setError(null);
      setWatching(true);
      watchLocation((newLocation) => {
        setLocation(newLocation);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Watch error";
      setError(message);
      setWatching(false);
    }
  }, []);

  const stopWatching = useCallback(() => {
    setWatching(false);
  }, []);

  return {
    location,
    getLocation,
    startWatching,
    stopWatching,
    loading,
    error,
    watching,
  };
}

/**
 * Hook for local notifications
 */
export function useLocalNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Permission error";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleNotification = useCallback(
    async (options: NotificationOptions) => {
      try {
        setError(null);
        if (!permissionGranted) {
          const granted = await requestPermission();
          if (!granted) {
            setError("Notification permission not granted");
            return false;
          }
        }
        await scheduleLocalNotification(options);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Schedule notification error";
        setError(message);
        return false;
      }
    },
    [permissionGranted, requestPermission],
  );

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { scheduleNotification, loading, error, permissionGranted };
}

/**
 * Hook for device information
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const info = await getDeviceInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error("Failed to get device info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, []);

  return { deviceInfo, loading };
}

/**
 * Hook for local preferences
 */
export function useLocalPreferences() {
  const getItem = useCallback(async (key: string) => {
    try {
      return await getPreference(key);
    } catch (error) {
      console.error("Preference get error:", error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string) => {
    try {
      await savePreference(key, value);
    } catch (error) {
      console.error("Preference save error:", error);
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    try {
      await removePreference(key);
    } catch (error) {
      console.error("Preference remove error:", error);
    }
  }, []);

  return { getItem, setItem, removeItem };
}

/**
 * Hook for network status
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    connected: true,
    type: "unknown",
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const currentStatus = await getNetworkStatus();
      setStatus(currentStatus);
    };

    fetchStatus();

    const unsubscribe = watchNetworkStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return status;
}

/**
 * Hook for keyboard management
 */
export function useKeyboard() {
  const hide = useCallback(async () => {
    await hideKeyboard();
  }, []);

  return { hide };
}
