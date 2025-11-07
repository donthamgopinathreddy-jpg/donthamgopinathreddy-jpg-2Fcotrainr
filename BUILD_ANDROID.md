# Build Android APK - Quick Guide

## Prerequisites
- Java JDK 11+ installed
- Android SDK installed
- Android Studio (recommended) or Command-line tools

## Quick Start (from root directory)

### Step 1: Build React App
```bash
pnpm run build:client
```

### Step 2: Sync to Capacitor
```bash
npx cap sync android
```

### Step 3: Build APK (Debug)
```bash
pnpm run android:debug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Build for Release (App Store)
```bash
pnpm run android:release
```

APK at: `android/app/build/outputs/apk/release/app-release.apk`

You'll need to sign this APK before uploading to Google Play Store.

## Alternative: Use Android Studio
```bash
pnpm run cap:open
```

This opens Android Studio where you can:
- Run on emulator or connected device
- Debug the app
- Build APK directly

## Check Device Status
```bash
adb devices
adb logcat  # View app logs
```

---

See `CAPACITOR_SETUP.md` for detailed instructions and troubleshooting.
