# CoTrainr Native Build Setup Guide

This guide provides step-by-step instructions to build and deploy the CoTrainr app on Android and iOS using Capacitor.

## Prerequisites

### Required Software

- **Node.js** v18+ and npm or pnpm
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds - macOS only)
- **JDK** 11+ (for Android)
- **Gradle** (included with Android Studio)
- **CocoaPods** (for iOS: `sudo gem install cocoapods`)

### Environment Setup

#### For Android:

```bash
# Install Android Studio from https://developer.android.com/studio

# Set ANDROID_HOME environment variable
export ANDROID_HOME=~/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk     # Linux
export ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\sdk  # Windows

# Add to PATH
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$PATH
```

#### For iOS (macOS only):

```bash
# Xcode is available in Mac App Store or https://developer.apple.com/download/

# Install CocoaPods
sudo gem install cocoapods
```

## Step-by-Step Build Instructions

### 1. Install Dependencies

```bash
cd /path/to/cotrainr
pnpm install
```

### 2. Build Web Assets

```bash
pnpm run build:client
```

This generates the production web app in `dist/spa/`.

### 3. Sync with Capacitor

#### Initialize/Create Native Projects

```bash
# Initialize Capacitor (if not already done)
npx cap init CoTrainr com.cotrainr.app --web-dir dist/spa

# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

#### Sync Changes

```bash
# Sync latest web build to native platforms
pnpm run cap:build

# Or manually:
npx cap sync android
npx cap sync ios  # macOS only
```

### 4. Build for Android

#### Debug Build:

```bash
pnpm run android:debug
```

This generates `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release Build:

```bash
# Generate release APK
pnpm run android:release

# Or build AAB (Android App Bundle) for Play Store
cd android
./gradlew bundleRelease
cd ..
```

The release APK is at: `android/app/build/outputs/apk/release/app-release.apk`
The AAB is at: `android/app/build/outputs/bundle/release/app-release.aab`

#### Run on Emulator/Device:

```bash
# List connected devices
adb devices

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or open in Android Studio
pnpm run cap:open

# Then in Android Studio: Run > Run 'app'
```

### 5. Build for iOS (macOS only)

#### Debug Build:

```bash
# Open in Xcode
pnpm run cap:open

# In Xcode:
# 1. Select Simulator or real device
# 2. Product > Run
# Or use Command + R
```

#### Release Build:

```bash
cd ios/App

# Build for testing
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release build

# Or in Xcode:
# 1. Select "Generic iOS Device" or an iPad/iPhone device
# 2. Product > Archive
# 3. Distribute App
```

### 6. Configuration Files

#### Capacitor Config (`capacitor.config.json`)

- **appId**: `com.cotrainr.app` (matches Android package name)
- **webDir**: `dist/spa` (location of web assets)
- **server.cleartext**: `true` (allows http for localhost debugging)
- **Android settings**: Allows mixed content and custom user agent
- **iOS settings**: Limits navigation to app domains

#### Android Config (`android/app/build.gradle`)

```gradle
android {
    compileSdkVersion = 34
    minSdkVersion = 24
    targetSdkVersion = 34

    versionCode = 1
    versionName = "1.0"
}
```

Update version codes/names before each release.

#### iOS Config (`ios/App/App/Info.plist`)

Key settings:

- `NSLocalNetworkUsageDescription`: Needed for local network access
- `NSBonjourServices`: List Bonjour services used
- `NSAppTransportSecurity`: Defines HTTPS/HTTP rules

### 7. Running the App

#### Android:

```bash
# On emulator
adb shell am start -n com.cotrainr.app/.MainActivity

# Debug output
adb logcat | grep "CoTrainr"
```

#### iOS:

```bash
# Through Xcode or:
xcrun simctl launch booted com.cotrainr.app
```

## Important Files Structure

```
cotrainr/
├── capacitor.config.json          # Main Capacitor config
├── android/                         # Android native code
│   ├── app/src/main/AndroidManifest.xml
│   ├── app/build.gradle
│   └── local.properties           # ANDROID_HOME path (auto-generated)
├── ios/                            # iOS native code (generated)
│   ├── App/App.xcworkspace
│   ├── App/App/Info.plist
│   └── Podfile
├── dist/spa/                       # Built web assets (referenced by natives)
├── client/                         # Web source code
└── server/                         # Node.js backend (for web)
```

## Troubleshooting

### Android Issues

#### Gradle Build Fails

```bash
# Clear gradle cache
cd android
./gradlew clean
./gradlew build
cd ..
```

#### Emulator Not Starting

```bash
# List available AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Pixel_5_API_30 &
```

#### App Crashes on Startup

- Check `adb logcat` for errors
- Ensure `dist/spa/index.html` exists
- Verify `ANDROID_HOME` is set correctly

### iOS Issues

#### Pod Installation Fails

```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
cd ../../
```

#### Build Fails in Xcode

- Product > Clean Build Folder (Shift + Cmd + K)
- Verify Xcode version: `xcode-select -p`
- Check deployment target matches Podfile

### Both Platforms

#### App Loads Blank Screen

- Build web assets: `pnpm run build:client`
- Sync: `npx cap sync`
- Clear app data and reinstall
- Check browser console via Chrome DevTools (Android)

#### API Calls Fail

- Ensure Netlify backend is deployed: https://cotrainr.netlify.app/api/health
- On physical devices, use actual domain (not localhost)
- Check CORS headers in Netlify function

## Development Workflow

### Hot Reload (Web Development)

```bash
# Terminal 1: Start dev server
pnpm run dev

# Terminal 2: Open in browser
# Dev server runs at http://localhost:8080
```

### Live Reload on Device

```bash
# After setting up native project, use:
npx cap serve

# This broadcasts your dev server to physical devices
# Requires same network
```

### Code Signing (Required for Release)

#### Android:

```bash
# Create keystore
keytool -genkey -v -keystore release.keystore -keyalg RSA \
  -keysize 2048 -validity 10000 -alias cotrainr

# Update gradle.properties with keystore path
# Then build release as above
```

#### iOS:

- Use Xcode's automatic signing or manage certificates manually
- Requires Apple Developer account ($99/year)
- Guide: https://developer.apple.com/help/xcode/signing-your-app-for-distribution/

## Release Checklist

- [ ] Update version in `package.json` and `capacitor.config.json`
- [ ] Update version code in `android/app/build.gradle`
- [ ] Update version in `ios/App/App/Info.plist`
- [ ] Test on multiple devices/emulators
- [ ] Update `CHANGELOG.md`
- [ ] Build for release: `pnpm run android:release`
- [ ] Sign APK/AAB or use Play Store signing
- [ ] Test signed release build on device
- [ ] Submit to Play Store or TestFlight

## Environment Variables

The app uses these environment variables (set in `netlify/functions/api.ts`):

```
VITE_SUPABASE_URL=https://hnxdlgdkyboctsvfktwe.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

For native builds, these are baked into the web assets during build.

## Useful Commands

```bash
# Build web + sync to native
pnpm run cap:build

# Open native IDE
pnpm run cap:open

# Build debug APK
pnpm run android:debug

# Build release APK
pnpm run android:release

# Clean everything
pnpm run build && npx cap sync android && pnpm run android:debug
```

## Next Steps

1. **Configure API**: Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as needed
2. **Test Login**: Verify authentication works on native device
3. **Add Icons**: Replace default Capacitor icons with CoTrainr branding
4. **Implement Permissions**: Camera, location, notifications as needed
5. **Push to Stores**: Follow Play Store and App Store submission guides

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Android Studio Emulator Guide](https://developer.android.com/studio/run/emulator)
- [Xcode Development Guide](https://developer.apple.com/xcode/)

---

**Last Updated**: 2024
**Capacitor Version**: 5.0.8+
