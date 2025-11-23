import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Device } from "@capacitor/device";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { Keyboard } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

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
      // Web fallback
      return getWebLocation();
    }

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
      // Web Notification API fallback
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(options.title, { body: options.body });
      }
      return;
    }

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
    await Preferences.set({ key, value });
  } catch (error) {
    console.error("Preference save error:", error);
  }
}

export async function getPreference(key: string): Promise<string | null> {
  try {
    const result = await Preferences.get({ key });
    return result.value;
  } catch (error) {
    console.error("Preference get error:", error);
    return null;
  }
}

export async function removePreference(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error("Preference remove error:", error);
  }
}

export async function clearAllPreferences(): Promise<void> {
  try {
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
    Network.addListener("networkStatusChange", (status) => {
      callback({
        connected: status.connected,
        type: status.connectionType || "none",
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
    if (Capacitor.isNativePlatform()) {
      await Keyboard.hide();
    }
  } catch (error) {
    console.error("Keyboard hide error:", error);
  }
}

export async function showKeyboard(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Keyboard.show();
    }
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
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
    }
  } catch (error) {
    console.error("Status bar error:", error);
  }
}

export async function setStatusBarColor(color: string): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setBackgroundColor({ color });
    }
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
