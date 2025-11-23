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

async function importCamera() {
  const moduleName = ["", "capacitor", "camera"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function takeCameraPhoto(
  options: CameraOptions = {},
): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const mod = await importCamera();
    const Camera = mod.Camera;
    const CameraResultType = mod.CameraResultType;
    const CameraSource = mod.CameraSource;

    const result = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: false,
      resultType:
        options.source === "gallery"
          ? CameraResultType.Base64
          : CameraResultType.Base64,
      source:
        options.source === "gallery"
          ? CameraSource.Photos
          : CameraSource.Camera,
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
  options: CameraOptions = {},
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

async function importGeolocation() {
  const moduleName = ["", "capacitor", "geolocation"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return getWebLocation();
    }

    const mod = await importGeolocation();
    const Geolocation = mod.Geolocation;

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
  callback: (location: UserLocation) => void,
): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const mod = await importGeolocation();
    const Geolocation = mod.Geolocation;

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
      () => resolve(null),
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

async function importLocalNotifications() {
  const moduleName = ["", "capacitor", "local-notifications"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function scheduleLocalNotification(
  options: NotificationOptions,
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(options.title, { body: options.body });
      }
      return;
    }

    const mod = await importLocalNotifications();
    const LocalNotifications = mod.LocalNotifications;

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

    const mod = await importLocalNotifications();
    const LocalNotifications = mod.LocalNotifications;
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

async function importDevice() {
  const moduleName = ["", "capacitor", "device"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const mod = await importDevice();
    const Device = mod.Device;
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
async function importPreferences() {
  const moduleName = ["", "capacitor", "preferences"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function savePreference(
  key: string,
  value: string,
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(key, value);
      return;
    }

    const mod = await importPreferences();
    const Preferences = mod.Preferences;
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

    const mod = await importPreferences();
    const Preferences = mod.Preferences;
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

    const mod = await importPreferences();
    const Preferences = mod.Preferences;
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

    const mod = await importPreferences();
    const Preferences = mod.Preferences;
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

async function importNetwork() {
  const moduleName = ["", "capacitor", "network"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return {
        connected: navigator.onLine,
        type: navigator.onLine ? "wifi" : "none",
      };
    }

    const mod = await importNetwork();
    const Network = mod.Network;
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
  callback: (status: NetworkStatus) => void,
): void {
  try {
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener("online", () =>
        callback({ connected: true, type: "wifi" }),
      );
      window.addEventListener("offline", () =>
        callback({ connected: false, type: "none" }),
      );
      return;
    }

    importNetwork().then((mod) => {
      const Network = mod.Network;
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
async function importKeyboard() {
  const moduleName = ["", "capacitor", "keyboard"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function hideKeyboard(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const mod = await importKeyboard();
    const Keyboard = mod.Keyboard;
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

    const mod = await importKeyboard();
    const Keyboard = mod.Keyboard;
    await Keyboard.show();
  } catch (error) {
    console.error("Keyboard show error:", error);
  }
}

/**
 * STATUS BAR
 */
async function importStatusBar() {
  const moduleName = ["", "capacitor", "status-bar"].join("@");
  return await import(/* @vite-ignore */ moduleName);
}

export async function setStatusBarStyle(
  isDark: boolean = false,
): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const mod = await importStatusBar();
    const StatusBar = mod.StatusBar;
    const Style = mod.Style;
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

    const mod = await importStatusBar();
    const StatusBar = mod.StatusBar;
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
