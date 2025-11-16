import { useState, useCallback, useEffect } from "react";

export type PermissionType =
  | "notifications"
  | "location"
  | "camera"
  | "microphone"
  | "calls";

export interface PermissionStatus {
  type: PermissionType;
  status: "granted" | "denied" | "prompt" | "unknown";
  displayName: string;
  icon: string;
  description: string;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<
    Record<PermissionType, boolean>
  >({
    notifications: false,
    location: false,
    camera: false,
    microphone: false,
    calls: false,
  });

  const [loading, setLoading] = useState(false);

  const getPermissionStatus = useCallback(
    async (type: PermissionType): Promise<boolean> => {
      try {
        // Check if browser supports Permissions API
        if (!navigator.permissions) {
          console.debug("Permissions API not supported");
          return false;
        }

        switch (type) {
          case "notifications":
            return Notification.permission === "granted";

          case "camera":
            if ("permissions" in navigator) {
              const result = await navigator.permissions.query({
                name: "camera" as any,
              });
              return result.state === "granted";
            }
            return false;

          case "microphone":
            if ("permissions" in navigator) {
              const result = await navigator.permissions.query({
                name: "microphone" as any,
              });
              return result.state === "granted";
            }
            return false;

          case "location":
            if ("permissions" in navigator) {
              const result = await navigator.permissions.query({
                name: "geolocation" as any,
              });
              return result.state === "granted";
            }
            return false;

          case "calls":
            // For calls, we check if getUserMedia is available
            return !!navigator.mediaDevices?.getUserMedia;

          default:
            return false;
        }
      } catch (err) {
        console.debug(`Error checking ${type} permission:`, err);
        return false;
      }
    },
    [],
  );

  const requestPermission = useCallback(
    async (type: PermissionType): Promise<boolean> => {
      try {
        setLoading(true);

        switch (type) {
          case "notifications":
            if ("Notification" in window) {
              const permission = await Notification.requestPermission();
              const granted = permission === "granted";
              setPermissions((prev) => ({ ...prev, notifications: granted }));
              return granted;
            }
            return false;

          case "camera":
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
              });
              stream.getTracks().forEach((track) => track.stop());
              setPermissions((prev) => ({ ...prev, camera: true }));
              return true;
            } catch (err) {
              console.debug("Camera permission denied:", err);
              setPermissions((prev) => ({ ...prev, camera: false }));
              return false;
            }

          case "microphone":
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
              });
              stream.getTracks().forEach((track) => track.stop());
              setPermissions((prev) => ({ ...prev, microphone: true }));
              return true;
            } catch (err) {
              console.debug("Microphone permission denied:", err);
              setPermissions((prev) => ({ ...prev, microphone: false }));
              return false;
            }

          case "location":
            return new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                () => {
                  setPermissions((prev) => ({ ...prev, location: true }));
                  resolve(true);
                },
                () => {
                  setPermissions((prev) => ({ ...prev, location: false }));
                  resolve(false);
                },
              );
            });

          case "calls":
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
              stream.getTracks().forEach((track) => track.stop());
              setPermissions((prev) => ({ ...prev, calls: true }));
              return true;
            } catch (err) {
              console.debug("Calls permission denied:", err);
              setPermissions((prev) => ({ ...prev, calls: false }));
              return false;
            }

          default:
            return false;
        }
      } catch (err) {
        console.debug(`Error requesting ${type} permission:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const checkAllPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const types: PermissionType[] = [
        "notifications",
        "location",
        "camera",
        "microphone",
        "calls",
      ];
      const results: Record<PermissionType, boolean> = {
        notifications: false,
        location: false,
        camera: false,
        microphone: false,
        calls: false,
      };

      for (const type of types) {
        results[type] = await getPermissionStatus(type);
      }

      setPermissions(results);
    } finally {
      setLoading(false);
    }
  }, [getPermissionStatus]);

  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions]);

  return {
    permissions,
    loading,
    requestPermission,
    checkAllPermissions,
    getPermissionStatus,
  };
}
