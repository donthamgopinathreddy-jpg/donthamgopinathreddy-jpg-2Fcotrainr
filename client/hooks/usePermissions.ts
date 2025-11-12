import { useState, useCallback } from "react";

interface PermissionStatus {
  geolocation: PermissionState | null;
  camera: PermissionState | null;
  microphone: PermissionState | null;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    geolocation: null,
    camera: null,
    microphone: null,
  });
  const [loading, setLoading] = useState(false);

  const checkPermissions = useCallback(async () => {
    try {
      const statuses: PermissionStatus = {
        geolocation: null,
        camera: null,
        microphone: null,
      };

      if ("permissions" in navigator) {
        try {
          const geoStatus = await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });
          statuses.geolocation = geoStatus.state;
        } catch (e) {
          console.log("Geolocation permission check not supported");
        }

        try {
          const cameraStatus = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          statuses.camera = cameraStatus.state;
        } catch (e) {
          console.log("Camera permission check not supported");
        }

        try {
          const micStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          statuses.microphone = micStatus.state;
        } catch (e) {
          console.log("Microphone permission check not supported");
        }
      }

      setPermissions(statuses);
      return statuses;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return permissions;
    }
  }, [permissions]);

  const requestGeolocation = useCallback(async () => {
    setLoading(true);
    try {
      if ("geolocation" in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissions((prev) => ({ ...prev, geolocation: "granted" }));
              resolve(true);
            },
            () => {
              setPermissions((prev) => ({ ...prev, geolocation: "denied" }));
              resolve(false);
            },
          );
        });
      }
      return false;
    } catch (error) {
      console.error("Error requesting geolocation:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setLoading(true);
    try {
      if ("mediaDevices" in navigator) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setPermissions((prev) => ({ ...prev, camera: "granted" }));
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.message || String(error);
      console.warn("Camera permission denied:", message);
      setPermissions((prev) => ({ ...prev, camera: "denied" }));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestMicrophone = useCallback(async () => {
    setLoading(true);
    try {
      if ("mediaDevices" in navigator) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setPermissions((prev) => ({ ...prev, microphone: "granted" }));
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error?.message || String(error);
      console.warn("Microphone permission denied:", message);
      setPermissions((prev) => ({ ...prev, microphone: "denied" }));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestAllPermissions = useCallback(async () => {
    setLoading(true);
    try {
      await checkPermissions();
      const results = await Promise.all([
        requestGeolocation(),
        requestCamera(),
        requestMicrophone(),
      ]);
      return results;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, requestGeolocation, requestCamera, requestMicrophone]);

  return {
    permissions,
    loading,
    checkPermissions,
    requestGeolocation,
    requestCamera,
    requestMicrophone,
    requestAllPermissions,
  };
};
