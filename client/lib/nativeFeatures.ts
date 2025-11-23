import { Capacitor } from "@capacitor/core";

/**
 * CAMERA FEATURES
 */
export interface CameraOptions {
  source?: "gallery" | "camera";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export async function takeCameraPhoto(
  options: CameraOptions = {}
): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const { Camera, CameraResultType, CameraSource } = await import(
      "@capacitor/camera"
    );

    const result = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: false,
      resultType:
        options.source === "gallery"
          ? CameraResultType.Base64
          : CameraResultType.Base64,
      source:
        options.source === "gallery" ? CameraSource.Photos : CameraSource.Camera,
      width: options.maxWidth || 800,
      height: options.maxHeight || 800,
    });

    return result.base64String || null;
  } catch (error) {
    console.error("Camera error:", error);
    return null;
  }
}

export async function selectPhotoFromGallery(
  options: CameraOptions = {}
): Promise<string | null> {
  return takeCameraPhoto({ ...options, source: "gallery" });
}

/**
 * GEOLOCATION FEATURES
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return getWebLocation();
    }

    const { Geolocation } = await import("@capacitor/geolocation");

    const coordinates = await Geolocation.getCurrentPosition();
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy || undefined,
      timestamp: coordinates.timestamp,
    };
  } catch (error) {
    console.error("Geolocation error:", error);
    return null;
  }
}

export async function watchLocation(
  callback: (location: UserLocation) => void
): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const { Geolocation } = await import("@capacitor/geolocation");

    const watchId = await Geolocation.watchPosition({}, (position) => {
      if (position?.coords) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          timestamp: position.timestamp,
        });
      }
    });

    return watchId;
  } catch (error) {
    console.error("Watch location error:", error);
    return null;
  }
}

function getWebLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          timestamp: Date.now(),
        });
      },
      () => resolve(null)
    );
  });
}

/**
 * LOCAL NOTIFICATIONS
 */
export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  delay?: number;
  smallIcon?: string;
  iconColor?: string;
  sound?: string;
  vibrate?: boolean;
}

export async function scheduleLocalNotification(
  options: NotificationOptions
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(options.title, { body: options.body });
      }
      return;
    }

    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    await LocalNotifications.schedule({
      notifications: [
        {
          title: options.title,
          body: options.body,
          id: options.id || Math.floor(Math.random() * 10000),
          schedule: options.delay
            ? { at: new Date(Date.now() + options.delay) }
            : undefined,
          smallIcon: options.smallIcon,
          iconColor: options.iconColor,
          sound: options.sound,
          vibrate: options.vibrate ?? true,
        },
      ],
    });
  } catch (error) {
    console.error("Notification error:", error);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return "Notification" in window && Notification.permission === "granted";
    }

    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === "granted";
  } catch (error) {
    console.error("Notification permission error:", error);
    return false;
  }
}

/**
 * DEVICE INFORMATION
 */
export interface DeviceInfo {
  platform: string;
  osVersion: string;
  model: string;
  deviceId: string;
  isNative: boolean;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    return {
      platform: info.platform || "web",
      osVersion: info.osVersion || "",
      model: info.model || "",
      deviceId: info.id || "",
      isNative: Capacitor.isNativePlatform(),
    };
  } catch (error) {
    console.error("Device info error:", error);
    return {
      platform: "web",
      osVersion: "",
      model: "",
      deviceId: "",
      isNative: false,
    };
  }
}

/**
 * LOCAL STORAGE (Preferences)
 */
export async function savePreference(
  key: string,
  value: string
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(key, value);
      return;
    }

    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value });
  } catch (error) {
    console.error("Preference save error:", error);
  }
}

export async function getPreference(key: string): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(key);
    }

    const { Preferences } = await import("@capacitor/preferences");
    const result = await Preferences.get({ key });
    return result.value;
  } catch (error) {
    console.error("Preference get error:", error);
    return null;
  }
}

export async function removePreference(key: string): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      localStorage.removeItem(key);
      return;
    }

    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key });
  } catch (error) {
    console.error("Preference remove error:", error);
  }
}

export async function clearAllPreferences(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      localStorage.clear();
      return;
    }

    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.clear();
  } catch (error) {
    console.error("Clear preferences error:", error);
  }
}

/**
 * NETWORK STATUS
 */
export interface NetworkStatus {
  connected: boolean;
  type: string;
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return {
        connected: navigator.onLine,
        type: navigator.onLine ? "wifi" : "none",
      };
    }

    const { Network } = await import("@capacitor/network");
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      type: status.connectionType || "none",
    };
  } catch (error) {
    console.error("Network status error:", error);
    return { connected: true, type: "unknown" };
  }
}

export function watchNetworkStatus(
  callback: (status: NetworkStatus) => void
): void {
  try {
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener("online", () =>
        callback({ connected: true, type: "wifi" })
      );
      window.addEventListener("offline", () =>
        callback({ connected: false, type: "none" })
      );
      return;
    }

    import("@capacitor/network").then(({ Network }) => {
      Network.addListener("networkStatusChange", (status) => {
        callback({
          connected: status.connected,
          type: status.connectionType || "none",
        });
      });
    });
  } catch (error) {
    console.error("Watch network error:", error);
  }
}

/**
 * KEYBOARD
 */
export async function hideKeyboard(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const { Keyboard } = await import("@capacitor/keyboard");
    await Keyboard.hide();
  } catch (error) {
    console.error("Keyboard hide error:", error);
  }
}

export async function showKeyboard(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const { Keyboard } = await import("@capacitor/keyboard");
    await Keyboard.show();
  } catch (error) {
    console.error("Keyboard show error:", error);
  }
}

/**
 * STATUS BAR
 */
export async function setStatusBarStyle(
  isDark: boolean = false
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch (error) {
    console.error("Status bar error:", error);
  }
}

export async function setStatusBarColor(color: string): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error("Status bar color error:", error);
  }
}

/**
 * APP LIFECYCLE
 */
export function onAppPause(callback: () => void): void {
  const handler = () => callback();
  if (Capacitor.isNativePlatform()) {
    window.addEventListener("pause", handler);
  }
}

export function onAppResume(callback: () => void): void {
  const handler = () => callback();
  if (Capacitor.isNativePlatform()) {
    window.addEventListener("resume", handler);
  }
}

export function onAppDestroy(callback: () => void): void {
  const handler = () => callback();
  if (Capacitor.isNativePlatform()) {
    window.addEventListener("destroy", handler);
  }
}
