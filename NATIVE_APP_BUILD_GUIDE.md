# CoTrainr Native App Build Guide

This guide will help you build and deploy CoTrainr as a native iOS and Android application using Capacitor.

## Prerequisites

### Required Tools

1. **Node.js & npm/pnpm**
   - Node.js 18+ required
   - pnpm 10+ (as per project)

2. **For Android Development**
   - Android Studio (latest version)
   - JDK 17+
   - Android SDK (API level 31+)
   - Gradle 8.0+

3. **For iOS Development (Mac only)**
   - Xcode 14+ (macOS 12.5+)
   - CocoaPods
   - iOS deployment target: 12.0+

## Installation & Setup

### 1. Install Dependencies

```bash
# Install project dependencies
pnpm install

# Install native plugins (already added)
# @capacitor/camera
# @capacitor/geolocation
# @capacitor/local-notifications
# @capacitor/device
# @capacitor/preferences
# @capacitor/network
# @capacitor/keyboard
# @capacitor/status-bar
```

### 2. Install Capacitor CLI

```bash
# Global installation (optional but recommended)
npm install -g @capacitor/cli

# Or use via npx
npx cap init
```

### 3. Create Native Projects

#### For Android:
```bash
# Generate Android project
npx cap add android

# Open Android Studio
npx cap open android

# Build APK for testing
npx cap run android

# Or use npm scripts
pnpm run cap:build
pnpm run cap:open
```

#### For iOS:
```bash
# Generate iOS project (Mac only)
npx cap add ios

# Open Xcode
npx cap open ios

# Build and run on simulator
npx cap run ios

# Or via Xcode GUI
open ios/App/App.xcworkspace
```

## Building for Production

### Android APK & AAB (Google Play)

#### 1. Configure App Signing

Edit `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file(System.getenv('KEYSTORE_PATH') ?: '/path/to/keystore.jks')
        storePassword System.getenv('KEYSTORE_PASSWORD')
        keyAlias System.getenv('KEY_ALIAS')
        keyPassword System.getenv('KEY_PASSWORD')
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
    }
}
```

#### 2. Generate Release Build

```bash
# Build AAB (App Bundle) for Play Store
cd android
./gradlew bundleRelease

# Build APK for testing
./gradlew assembleRelease

# Output locations:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

#### 3. Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Upload AAB (Android App Bundle)
4. Configure store listing, pricing, etc.
5. Submit for review

### iOS App (App Store)

#### 1. Configure App Signing

In Xcode:
- Select App project > Build Settings
- Set Team ID to your Apple Developer account
- Set Bundle Identifier to match provisioning profile

#### 2. Generate Release Build

```bash
# Open Xcode workspace
open ios/App/App.xcworkspace

# In Xcode:
# 1. Select Generic iOS Device or simulator
# 2. Product > Archive
# 3. Organizer will open
# 4. Distribute App > App Store
```

#### 3. Upload to App Store

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Upload build via Transporter or Xcode
4. Configure app information, screenshots, etc.
5. Submit for review

## Native Features Integration

### Camera Usage

```typescript
import { useCamera } from "@/hooks/useNativeFeatures";

function ProfilePicture() {
  const { takePhoto, selectFromGallery } = useCamera();

  const handlePhotoSelect = async () => {
    const photo = await selectFromGallery();
    if (photo) {
      // Use base64 encoded image
    }
  };

  return <button onClick={handlePhotoSelect}>Select Photo</button>;
}
```

### Geolocation (Trainer Discovery)

```typescript
import { useGeolocation } from "@/hooks/useNativeFeatures";

function TrainerNearby() {
  const { location, getLocation, startWatching } = useGeolocation();

  const findNearbyTrainers = async () => {
    const loc = await getLocation();
    // Find trainers using coordinates
  };

  return <button onClick={findNearbyTrainers}>Find Nearby Trainers</button>;
}
```

### Local Notifications (Workout Reminders)

```typescript
import { useLocalNotifications } from "@/hooks/useNativeFeatures";

function WorkoutReminder() {
  const { scheduleNotification } = useLocalNotifications();

  const setReminder = async (title: string, delayMs: number) => {
    await scheduleNotification({
      title: "Workout Reminder",
      body: title,
      delay: delayMs,
      vibrate: true,
    });
  };

  return null;
}
```

### Offline Support

```typescript
import { storePendingOperation, getPendingOperations } from "@/lib/offlineStorage";

async function syncWhenOnline() {
  const operations = await getPendingOperations();

  for (const op of operations) {
    try {
      const response = await fetch(op.endpoint, {
        method: op.type === "delete" ? "DELETE" : op.type === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.data),
      });

      if (response.ok) {
        await removePendingOperation(op.id);
      }
    } catch (error) {
      // Retry later
    }
  }
}
```

## Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Camera -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Location -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Storage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Health Data (for fitness tracking) -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    
    <!-- Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Network -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Application configuration -->
    <application>
        <!-- Activities and services -->
    </application>
</manifest>
```

## iOS Configuration

Update `ios/App/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Camera -->
    <key>NSCameraUsageDescription</key>
    <string>We need camera access to upload your profile picture and meal photos</string>
    
    <!-- Location -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>We need your location to find nearby trainers and track your workouts</string>
    
    <!-- Photo Library -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need access to your photo library to select profile pictures</string>
    
    <!-- Health Data -->
    <key>NSHealthSharingUsageDescription</key>
    <string>We need access to your health data to track your fitness progress</string>
    
    <!-- Notification -->
    <key>NSUserNotificationUsageDescription</key>
    <string>We send notifications for workout reminders and messages</string>
</dict>
</plist>
```

## Testing on Real Devices

### Android Device Testing

```bash
# Connect Android device via USB with debugging enabled
# Check if device is detected
adb devices

# Run on connected device
npx cap run android --live

# View logs
adb logcat

# Debug WebView
chrome://inspect
```

### iOS Device Testing

```bash
# Connect iOS device
# Select device in Xcode
# Click Run button in Xcode

# Or via command line
npx cap run ios --live

# View simulator logs
xcrun simctl spawn booted log stream --level=debug
```

## Debugging

### Android Debugging

```bash
# Chrome DevTools for WebView
# 1. Open Chrome
# 2. Go to chrome://inspect
# 3. Select your app
# 4. DevTools will open

# Logcat for native code
adb logcat | grep cotrainr
```

### iOS Debugging

```bash
# Safari DevTools for WebView
# 1. Open Safari
# 2. Develop > [Device Name] > App WebView
# 3. Inspect web content

# Xcode Console for native code
# Open Xcode > View > Debug Area > Console
```

## Troubleshooting

### Build Issues

**Issue**: `android/gradlew: command not found`
```bash
# Solution: Make executable
chmod +x android/gradlew
```

**Issue**: Capacitor bridge not loading
```bash
# Solution: Sync with native projects
npx cap sync
```

**Issue**: Plugin initialization error
```bash
# Solution: Clear and rebuild
rm -rf android/app/build
npx cap build android
```

### Runtime Issues

**Issue**: Camera permission denied
- Ensure permissions are in AndroidManifest.xml
- Request permission at runtime using Android 6.0+ API
- Test on device with Android 6.0+

**Issue**: Geolocation returning null
- Ensure location permission is granted
- Test on real device (not simulator)
- Check if location services are enabled

**Issue**: Offline sync not working
- Check network status with `useNetworkStatus()`
- Verify pending operations in storage
- Implement retry logic with exponential backoff

## Building APK/AAB with Scripts

```bash
# Add to package.json if not present
"android:debug": "cd android && ./gradlew assembleDebug",
"android:release": "cd android && ./gradlew assembleRelease",

# Run
pnpm run android:debug    # APK for testing
pnpm run android:release  # APK for distribution
```

## Next Steps

1. ✅ Build development APK and test on Android device
2. ✅ Test native features (camera, geolocation, notifications)
3. ✅ Set up App Signing Certificate for Play Store
4. ✅ Publish to Google Play Store
5. ✅ Publish to Apple App Store
6. ✅ Monitor crashes and errors using Sentry or similar

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development](https://developer.android.com/)
- [iOS Development](https://developer.apple.com/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

## Support

For Capacitor-specific issues:
- Check [Capacitor Issues](https://github.com/ionic-team/capacitor/issues)
- Review [Community Forums](https://forum.ionicframework.com/)
- Check individual plugin documentation

For CoTrainr specific issues:
- Review error logs in Chrome DevTools
- Check network tab for API errors
- Verify Supabase authentication and permissions
