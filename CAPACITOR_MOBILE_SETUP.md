# Capacitor Mobile Setup Guide

## Current Plugins Installed
- @capacitor/core (basic functionality)
- @capacitor/app (app lifecycle)
- @capacitor/android (Android native)

## Recommended Plugins to Add

### 1. Camera Plugin (for profile pictures)
```bash
npm install @capacitor/camera
npx cap sync
```
**Usage**: Profile picture uploads, photo logging for meals

### 2. Geolocation Plugin (for trainer discovery)
```bash
npm install @capacitor/geolocation
npx cap sync
```
**Usage**: Find trainers near you, location-based features

### 3. Health Data Integration (for step tracking)
```bash
npm install @capacitor-health/health
npx cap sync
```
**Usage**: Automatic step sync from Google Fit/Apple HealthKit

### 4. Local Notifications (for reminders)
```bash
npm install @capacitor/local-notifications
npx cap sync
```
**Usage**: Workout reminders, meal tracking alerts

### 5. Storage Plugin (better offline support)
```bash
npm install @capacitor/preferences
npx cap sync
```
**Usage**: Offline caching, user preferences

### 6. Device Info Plugin
```bash
npm install @capacitor/device
npx cap sync
```
**Usage**: Device identification, analytics

## Android Permissions Required

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Camera -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Health Data -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## iOS Configuration

Update `ios/App/Info.plist`:

```xml
<!-- Camera -->
<key>NSCameraUsageDescription</key>
<string>We need camera access to upload profile pictures and meal photos</string>

<!-- Location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find nearby trainers</string>

<!-- Health -->
<key>NSHealthSharingUsageDescription</key>
<string>We need health data access to track your fitness progress</string>
```

## Build & Deploy

```bash
# After adding plugins:
npx cap sync
npx cap build android
npx cap build ios
```

## Testing Locally

```bash
# iOS
npx cap run ios

# Android
npx cap run android
```

## Important Notes

1. **Always sync after installing**: `npx cap sync`
2. **Permissions must be requested at runtime** for Android 6+
3. **Test on real devices** - simulators don't have access to sensors
4. **Use try-catch** when calling native features for graceful fallbacks
