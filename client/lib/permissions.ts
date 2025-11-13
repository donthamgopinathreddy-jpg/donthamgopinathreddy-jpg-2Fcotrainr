/**
 * Utility functions for requesting device permissions
 * This helps ensure users are prompted consistently across the app
 */

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("Camera API not supported");
      return false;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error: any) {
    console.error("Camera permission denied:", error);
    return false;
  }
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("Microphone API not supported");
      return false;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error: any) {
    console.error("Microphone permission denied:", error);
    return false;
  }
};

export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  coords?: { latitude: number; longitude: number };
}> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation API not supported");
      resolve({ granted: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location permission granted");
        resolve({
          granted: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.error("Location permission denied:", error);
        resolve({ granted: false });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!("Notification" in window)) {
      console.warn("Notification API not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error: any) {
    console.error("Notification permission error:", error);
    return false;
  }
};

export const requestAllPermissions = async () => {
  const results = {
    camera: await requestCameraPermission(),
    microphone: await requestMicrophonePermission(),
    location: await requestLocationPermission(),
    notifications: await requestNotificationPermission(),
  };
  return results;
};
