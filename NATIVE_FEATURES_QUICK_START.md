# Native Features Quick Start Guide

This guide shows you how to use the native Capacitor features integrated into CoTrainr.

## Available Features

### 1. Camera - Profile Pictures & Meal Logging

**Hook**: `useCamera()`

```typescript
import { useCamera } from "@/hooks/useNativeFeatures";
import { useState } from "react";

function ProfilePictureUpload() {
  const { takePhoto, selectFromGallery, loading, error } = useCamera();
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSelectPhoto = async () => {
    const result = await selectFromGallery();
    if (result) {
      setPhoto(result);
      // Upload to Supabase
      await uploadPhotoToSupabase(result);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      setPhoto(result);
      // Upload to Supabase
      await uploadPhotoToSupabase(result);
    }
  };

  return (
    <div>
      <button onClick={handleSelectPhoto} disabled={loading}>
        {loading ? "Loading..." : "Select from Gallery"}
      </button>
      <button onClick={handleTakePhoto} disabled={loading}>
        {loading ? "Loading..." : "Take Photo"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {photo && <img src={`data:image/jpeg;base64,${photo}`} alt="Selected" />}
    </div>
  );
}
```

### 2. Geolocation - Trainer Discovery

**Hook**: `useGeolocation()`

```typescript
import { useGeolocation } from "@/hooks/useNativeFeatures";
import { useEffect } from "react";

function TrainerNearby() {
  const { location, getLocation, startWatching, stopWatching, loading } =
    useGeolocation();

  const handleFindTrainers = async () => {
    const loc = await getLocation();
    if (loc) {
      // Find trainers within 5km
      const trainers = await findTrainersNear(
        loc.latitude,
        loc.longitude,
        5 // km radius
      );
      console.log("Nearby trainers:", trainers);
    }
  };

  const handleLiveTracking = () => {
    startWatching(); // Updates location as user moves
  };

  return (
    <div>
      <button onClick={handleFindTrainers} disabled={loading}>
        {loading ? "Getting location..." : "Find Nearby Trainers"}
      </button>
      <button onClick={handleLiveTracking}>Enable Live Tracking</button>
      <button onClick={stopWatching}>Stop Tracking</button>

      {location && (
        <p>
          Current: {location.latitude}, {location.longitude}
        </p>
      )}
    </div>
  );
}
```

### 3. Local Notifications - Workout Reminders

**Hook**: `useLocalNotifications()`

```typescript
import { useLocalNotifications } from "@/hooks/useNativeFeatures";

function WorkoutReminder() {
  const { scheduleNotification, loading, error, permissionGranted } =
    useLocalNotifications();

  const handleScheduleReminder = async () => {
    const success = await scheduleNotification({
      title: "Workout Reminder",
      body: "Time for your morning workout!",
      delay: 60000, // 1 minute from now
      vibrate: true,
      sound: "beep",
    });

    if (success) {
      console.log("Reminder scheduled!");
    }
  };

  return (
    <div>
      {!permissionGranted && (
        <p className="text-yellow-600">Notifications disabled</p>
      )}
      <button onClick={handleScheduleReminder} disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Reminder"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### 4. Device Info - Analytics & Features

**Hook**: `useDeviceInfo()`

```typescript
import { useDeviceInfo } from "@/hooks/useNativeFeatures";

function DeviceInfoDisplay() {
  const { deviceInfo, loading } = useDeviceInfo();

  if (loading) return <p>Loading device info...</p>;

  return (
    <div className="p-4 border rounded">
      <h3>Device Information</h3>
      <p>Platform: {deviceInfo?.platform}</p>
      <p>OS Version: {deviceInfo?.osVersion}</p>
      <p>Model: {deviceInfo?.model}</p>
      <p>Native App: {deviceInfo?.isNative ? "Yes" : "No"}</p>
    </div>
  );
}
```

### 5. Network Status - Offline Support

**Hook**: `useNetworkStatus()`

```typescript
import { useNetworkStatus } from "@/hooks/useNativeFeatures";

function NetworkStatusIndicator() {
  const { connected, type } = useNetworkStatus();

  return (
    <div
      className={`p-2 rounded ${connected ? "bg-green-100" : "bg-red-100"}`}
    >
      <p className={connected ? "text-green-800" : "text-red-800"}>
        {connected ? "Online" : "Offline"} ({type})
      </p>
    </div>
  );
}
```

### 6. Local Preferences - Offline Caching

**Hook**: `useLocalPreferences()`

```typescript
import { useLocalPreferences } from "@/hooks/useNativeFeatures";
import { useEffect, useState } from "react";

function UserPreferences() {
  const { getItem, setItem, removeItem } = useLocalPreferences();
  const [theme, setTheme] = useState<string>("");

  useEffect(() => {
    // Load saved theme preference
    getItem("theme").then((value) => {
      if (value) setTheme(value);
    });
  }, [getItem]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setItem("theme", newTheme);
  };

  return (
    <div>
      <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

### 7. Keyboard Control

**Hook**: `useKeyboard()`

```typescript
import { useKeyboard } from "@/hooks/useNativeFeatures";
import { useRef } from "react";

function SearchInput() {
  const { hide } = useKeyboard();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (query: string) => {
    // Hide keyboard after search
    await hide();

    // Perform search
    const results = await searchTrainers(query);
    console.log("Search results:", results);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search trainers..."
      onBlur={() => hide()}
    />
  );
}
```

## Offline Data Sync

For operations performed while offline, use the offline storage:

```typescript
import {
  storePendingOperation,
  getPendingOperations,
  removePendingOperation,
} from "@/lib/offlineStorage";
import { useNetworkStatus } from "@/hooks/useNativeFeatures";

async function bookTrainerOffline(trainerId: string, sessionId: string) {
  // Store operation for sync when online
  await storePendingOperation("create", `/api/bookings`, {
    trainerId,
    sessionId,
  });

  console.log("Booking saved. Will sync when online.");
}

async function syncPendingOperations() {
  const { connected } = useNetworkStatus();

  if (!connected) return;

  const operations = await getPendingOperations();

  for (const op of operations) {
    try {
      const response = await fetch(op.endpoint, {
        method: op.type === "delete" ? "DELETE" : op.type === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body:
          op.type === "delete" ? undefined : JSON.stringify(op.data),
      });

      if (response.ok) {
        await removePendingOperation(op.id);
        console.log("Synced:", op.id);
      }
    } catch (error) {
      console.error("Sync failed for", op.id);
    }
  }
}
```

## Safe Area Handling (Notches)

For proper layout with device notches:

```typescript
import { SafeAreaView } from "@/components/SafeAreaView";

function MobileHeader() {
  return (
    <SafeAreaView className="bg-orange-500 text-white">
      <h1 className="text-2xl font-bold">CoTrainr</h1>
    </SafeAreaView>
  );
}

// Or with fine-grained control:
import { getSafeAreaInsets } from "@/lib/safeAreaHelper";

function CustomLayout() {
  const insets = getSafeAreaInsets();

  return (
    <div
      style={{
        paddingTop: `${insets.top}px`,
        paddingBottom: `${insets.bottom}px`,
        paddingLeft: `${insets.left}px`,
        paddingRight: `${insets.right}px`,
      }}
    >
      {/* Content */}
    </div>
  );
}
```

## Testing Native Features

### On Android Device

```bash
# Connect Android device via USB
adb devices

# Run with live reload
npx cap run android --live

# View logs
adb logcat | grep cotrainr
```

### On iOS Simulator

```bash
# Run on iOS simulator
npx cap run ios --live

# Or use Xcode directly
open ios/App/App.xcworkspace
```

### Testing Permissions

1. **Camera**:
   - Android: Settings > Apps > CoTrainr > Permissions > Camera
   - iOS: Settings > Privacy > Camera > CoTrainr

2. **Location**:
   - Android: Settings > Apps > CoTrainr > Permissions > Location
   - iOS: Settings > Privacy > Location Services > CoTrainr

3. **Notifications**:
   - Android: Settings > Apps > CoTrainr > Notifications
   - iOS: Settings > Notifications > CoTrainr

## Best Practices

1. **Always check if native platform**:
   ```typescript
   import { Capacitor } from "@capacitor/core";

   if (Capacitor.isNativePlatform()) {
     // Native-specific code
   }
   ```

2. **Handle errors gracefully**:
   ```typescript
   try {
     const photo = await selectPhotoFromGallery();
   } catch (error) {
     console.error("Camera access denied or not available");
     // Show fallback UI
   }
   ```

3. **Request permissions early**:
   ```typescript
   useEffect(() => {
     // Request permissions on app startup
     requestNotificationPermission();
   }, []);
   ```

4. **Cache sensitive operations**:
   ```typescript
   import { cacheData, getCachedData } from "@/lib/offlineStorage";

   // Cache trainer list for offline access
   await cacheData("trainers_list", trainers, 60000); // 1 minute TTL

   // Retrieve from cache if available
   const cached = await getCachedData("trainers_list");
   ```

## Debugging Native Issues

### Camera not working
- Ensure camera permission is granted
- Check logcat/console for permission errors
- Test on real device (not simulator)

### Location returning null
- Ensure location permission is granted
- Check if location services are enabled on device
- Test on real device with GPS signal

### Notifications not appearing
- Verify notification permission is granted
- Check notification settings on device
- Ensure app is not in background (system dependent)

### Offline sync not working
- Check network status with `useNetworkStatus()`
- Verify pending operations with `getPendingOperations()`
- Check Supabase auth and permissions

## Additional Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)

## Need Help?

1. Check the NATIVE_APP_BUILD_GUIDE.md for build instructions
2. Review error logs in Chrome DevTools
3. Check Capacitor documentation for plugin-specific issues
4. Test with both web and native platforms to identify platform-specific bugs
