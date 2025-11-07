# CoTrainr Android App - Capacitor Setup Guide

This guide will help you build and run your React app as a native Android application using Capacitor.

## Prerequisites

You need to have the following installed on your machine:

1. **Node.js & pnpm** (you already have this)
2. **Java Development Kit (JDK)** - Version 11 or higher
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Or use: `brew install openjdk` (Mac) or `apt-get install openjdk-11-jdk` (Linux)

3. **Android SDK** 
   - Download Android Studio from: https://developer.android.com/studio
   - Or install command-line tools: https://developer.android.com/studio#command-tools

4. **Gradle** (usually included with Android Studio)

5. **Environment Variables** (set these on your machine):
   ```bash
   export JAVA_HOME=/path/to/jdk
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Your React App

```bash
pnpm run build:client
```

This creates a production build in the `dist/spa` folder.

### 3. Initialize Capacitor (if not done yet)

```bash
npx cap init
```

When prompted, use:
- App name: **CoTrainr**
- App Package: **com.cotrainr.app**
- Web dir: **dist/spa**

(The capacitor.config.json file is already configured, so this step may be optional)

### 4. Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder with the native Android project.

### 5. Build APK for Testing

```bash
cd android
./gradlew assembleDebug
```

The APK will be created at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Install on Android Device/Emulator

#### Option A: Using Android Studio
1. Open Android Studio
2. Open the `android` folder
3. Connect your Android device (with USB Debugging enabled)
4. Click "Run" → "Run 'app'"

#### Option B: Using Command Line
```bash
# List connected devices
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.cotrainr.app/.MainActivity
```

### 7. Build Release APK (for app store)

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

To sign it, you'll need a keystore file.

## Troubleshooting

### Issue: Gradle build fails
**Solution:** 
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue: Java/JAVA_HOME not found
**Solution:** Set JAVA_HOME environment variable:
```bash
export JAVA_HOME=$(/usr/libexec/java_home)  # Mac
# or
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk  # Linux
```

### Issue: Android SDK not found
**Solution:** Install Android SDK via Android Studio or:
```bash
sdkmanager "platforms;android-33"
sdkmanager "build-tools;33.0.0"
```

### Issue: App displays blank/white screen
**Solution:**
1. Check browser console: `adb logcat | grep chromium`
2. Ensure `dist/spa` folder exists and has `index.html`
3. Check that Capacitor is properly initialized in index.html

## Updating the App

After making changes to your React code:

1. Rebuild the React app:
   ```bash
   pnpm run build:client
   ```

2. Sync changes to Android:
   ```bash
   npx cap sync android
   ```

3. Rebuild and deploy:
   ```bash
   cd android
   ./gradlew assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

## Next Steps

- **Test on real device:** Connect Android phone via USB and run the app
- **Test on emulator:** Use Android Studio's built-in emulator
- **Submit to Play Store:** Build release APK and follow Google Play submission process
- **Add native features:** Use Capacitor plugins for camera, location, notifications, etc.

## Useful Capacitor Plugins

```bash
# Camera
pnpm add @capacitor/camera

# Geolocation
pnpm add @capacitor/geolocation

# Local notifications
pnpm add @capacitor/local-notifications

# Device info
pnpm add @capacitor/device

# App version
pnpm add @capacitor/app

# Share
pnpm add @capacitor/share
```

## Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Docs: https://developer.android.com/docs
- Capacitor Android Guide: https://capacitorjs.com/docs/android

---

Your React app is now ready to be deployed as a native Android app! 🚀
