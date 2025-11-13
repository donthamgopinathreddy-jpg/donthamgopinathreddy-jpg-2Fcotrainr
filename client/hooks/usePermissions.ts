import { useState, useCallback } from "react";

export interface PermissionStatus {
  camera: "granted" | "denied" | "prompt" | "unknown";
  microphone: "granted" | "denied" | "prompt" | "unknown";
  notifications: "granted" | "denied" | "prompt" | "unknown";
  location: "granted" | "denied" | "prompt" | "unknown";
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: "prompt",
    microphone: "prompt",
    notifications: "prompt",
    location: "prompt",
  });
  const [loading, setLoading] = useState(false);

  // Request camera permission
  const requestCamera = useCallback(async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, camera: "granted" }));
      return true;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setPermissions((prev) => ({ ...prev, camera: "denied" }));
      } else if (error.name === "NotFoundError") {
        setPermissions((prev) => ({ ...prev, camera: "unknown" }));
      }
      console.error("Camera permission error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request microphone permission
  const requestMicrophone = useCallback(async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, microphone: "granted" }));
      return true;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setPermissions((prev) => ({ ...prev, microphone: "denied" }));
      } else if (error.name === "NotFoundError") {
        setPermissions((prev) => ({ ...prev, microphone: "unknown" }));
      }
      console.error("Microphone permission error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request notification permission
  const requestNotification = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermissions((prev) => ({ ...prev, notifications: "unknown" }));
      return false;
    }

    if (Notification.permission === "granted") {
      setPermissions((prev) => ({ ...prev, notifications: "granted" }));
      return true;
    }

    if (Notification.permission === "denied") {
      setPermissions((prev) => ({ ...prev, notifications: "denied" }));
      return false;
    }

    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      setPermissions((prev) => ({
        ...prev,
        notifications: permission as "granted" | "denied",
      }));
      return permission === "granted";
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request all permissions at once
  const requestAllPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const cameraResult = await requestCamera();
      const micResult = await requestMicrophone();
      const notifResult = await requestNotification();

      return {
        camera: cameraResult,
        microphone: micResult,
        notifications: notifResult,
      };
    } finally {
      setLoading(false);
    }
  }, [requestCamera, requestMicrophone, requestNotification]);

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    try {
      if ("permissions" in navigator) {
        const queries = [
          { name: "camera" as const },
          { name: "microphone" as const },
          { name: "notifications" as const },
        ];

        for (const query of queries) {
          try {
            const status = await (navigator.permissions as any).query(query);
            setPermissions((prev) => ({
              ...prev,
              [query.name]: status.state,
            }));
          } catch (e) {
            console.warn(`Could not query ${query.name} permission:`, e);
          }
        }
      }
    } catch (error) {
      console.warn("Error checking permissions:", error);
    }
  }, []);

  return {
    permissions,
    loading,
    requestCamera,
    requestMicrophone,
    requestNotification,
    requestAllPermissions,
    checkPermissions,
  };
};
