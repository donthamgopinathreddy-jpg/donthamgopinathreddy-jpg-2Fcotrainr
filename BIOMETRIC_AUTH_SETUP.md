# Biometric Authentication Setup Guide

This guide explains how to set up biometric authentication for the CoTrainr mobile app on both iOS and Android platforms.

## Overview

The app now supports native device biometric authentication:
- **iOS**: Face ID (iPhone X+) or Touch ID (older models)
- **Android**: Fingerprint, Face Recognition, Pattern, or PIN

Users can authenticate using their device's native authentication method without requiring additional PIN/Pattern setup in the app.

## Web Implementation

The web-side implementation is already complete:
- `client/hooks/useBiometricAuth.ts` - React hook for biometric authentication
- `client/lib/capacitorBridge.ts` - Capacitor bridge to native code
- `client/pages/Login.tsx` - Updated login page with biometric option

## Native Implementation

### Android Setup

1. **Update dependencies** in `android/app/build.gradle`:
   ```gradle
   dependencies {
       // Add biometric dependencies
       implementation "androidx.biometric:biometric:1.1.0"
       implementation "androidx.fragment:fragment:1.5.5"
   }
   ```

2. **Update AndroidManifest.xml** with biometric permissions:
   ```xml
   <manifest ...>
       <!-- Biometric permissions -->
       <uses-permission android:name="android.permission.USE_BIOMETRIC" />
       <uses-permission android:name="android.permission.USE_FINGERPRINT" />
       
       <application ...>
           <!-- MainActivity remains the same -->
       </application>
   </manifest>
   ```

3. **Implement Capacitor Plugin Bridge** in `android/app/src/main/java/com/cotrainr/app/BiometricAuthPlugin.kt`:
   ```kotlin
   import com.getcapacitor.JSObject
   import com.getcapacitor.PluginCall
   import com.getcapacitor.annotation.CapacitorPlugin
   import com.getcapacitor.annotation.Permission
   
   @CapacitorPlugin(
       name = "BiometricAuth",
       permissions = [Permission(strings = ["android.permission.USE_BIOMETRIC"])]
   )
   class BiometricAuthPlugin : Plugin() {
       private val biometricAuth by lazy { BiometricAuth(context) }
   
       @PluginMethod
       fun authenticate(call: PluginCall) {
           biometricAuth.authenticate(
               activity as androidx.fragment.app.FragmentActivity,
               onSuccess = {
                   val result = JSObject()
                   result.put("success", true)
                   call.resolve(result)
               },
               onError = { error ->
                   val result = JSObject()
                   result.put("success", false)
                   result.put("error", error)
                   call.reject(error)
               },
               onFailed = {
                   val result = JSObject()
                   result.put("success", false)
                   result.put("error", "Authentication cancelled")
                   call.reject("Authentication cancelled")
               }
           )
       }
   
       @PluginMethod
       fun getPrimaryBiometricType(call: PluginCall) {
           val type = biometricAuth.getPrimaryBiometricType()
           val result = JSObject()
           result.put("type", type)
           call.resolve(result)
       }
   
       @PluginMethod
       fun isAvailable(call: PluginCall) {
           val available = biometricAuth.getAvailableBiometricMethods() != "none"
           val result = JSObject()
           result.put("available", available)
           call.resolve(result)
       }
   }
   ```

4. **Register the plugin** in `MainActivity.kt`:
   ```kotlin
   import android.os.Bundle
   import com.cotrainr.app.BiometricAuthPlugin
   
   class MainActivity : AppCompatActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           registerPlugin(BiometricAuthPlugin::class.java)
       }
   }
   ```

### iOS Setup

1. **Update Info.plist** with required keys:
   ```xml
   <key>NSFaceIDUsageDescription</key>
   <string>We need access to Face ID to authenticate you securely</string>
   <key>NSBiometricsUsageDescription</key>
   <string>We need access to biometric authentication to sign you in</string>
   ```

2. **Update Podfile** to include LocalAuthentication framework:
   ```ruby
   target 'App' do
     pod 'Capacitor'
     pod 'CapacitorCordova'
     # LocalAuthentication is built-in, no need to add
   end
   ```

3. **Implement Capacitor Plugin Bridge** in `ios/App/App/BiometricAuthPlugin.swift`:
   ```swift
   import Capacitor
   
   @objc(BiometricAuthPlugin)
   public class BiometricAuthPlugin: CAPPlugin {
       
       @objc func authenticate(_ call: CAPPluginCall) {
           BiometricAuth.authenticate(
               reason: "Sign in to CoTrainr",
               onSuccess: {
                   var result = JSObject()
                   result["success"] = true
                   call.resolve(result)
               },
               onError: { error in
                   var result = JSObject()
                   result["success"] = false
                   result["error"] = error
                   call.reject(error)
               }
           )
       }
       
       @objc func getPrimaryBiometricType(_ call: CAPPluginCall) {
           let type = BiometricAuth.getPrimaryBiometricType()
           var result = JSObject()
           result["type"] = type
           call.resolve(result)
       }
       
       @objc func isAvailable(_ call: CAPPluginCall) {
           let available = BiometricAuth.getAvailableBiometricMethods() != "none"
           var result = JSObject()
           result["available"] = available
           call.resolve(result)
       }
   }
   ```

4. **Register the plugin** in `capacitor.config.ts`:
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.cotrainr.app',
     appName: 'CoTrainr',
     webDir: 'dist/spa',
     plugins: {
       BiometricAuth: {
         // Plugin configuration
       }
     }
   };
   ```

## Database Schema

The `user_security_settings` table should have the following columns:

```sql
CREATE TABLE user_security_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_type VARCHAR(50) DEFAULT 'none', -- 'faceId', 'fingerprint', 'pattern', 'pin', 'none'
  pin_enabled BOOLEAN DEFAULT FALSE,
  pin_hash VARCHAR(64),
  pattern_enabled BOOLEAN DEFAULT FALSE,
  pattern_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create RLS policy
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security settings"
  ON user_security_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON user_security_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON user_security_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Testing

### On Android:
1. Build the app with biometric support enabled
2. Test on an Android device or emulator with biometric capabilities
3. Verify that the biometric prompt appears when selecting "Biometric" login
4. Test fallback to PIN/Pattern if biometric fails

### On iOS:
1. Build the app and run on an iPhone/iPad with Face ID or Touch ID
2. Test that Face ID/Touch ID prompt appears
3. Verify authentication flow works
4. Test fallback mechanisms

### On Web:
1. The app simulates biometric authentication (1.5 second delay)
2. Test the login flow works as expected
3. Verify PIN and Pattern authentication still work as fallbacks

## Security Considerations

1. **Never store biometric data** - Only store whether biometric is enabled
2. **PIN/Pattern hashes** - Use SHA-256 for hashing (already implemented)
3. **Device credential reuse** - Users authenticate with their device's native credentials
4. **Session management** - Implement proper session timeout
5. **Encryption** - Enable app-level encryption for sensitive data

## User Setup Flow

1. User logs in with email/password
2. In account settings, user can enable biometric authentication
3. If biometric is available, show option to enable it
4. Store biometric preference in database
5. On next login, show biometric option
6. If biometric fails, offer PIN/Pattern/Password fallback

## Troubleshooting

### Plugin not found error:
- Ensure the plugin is properly registered in MainActivity/AppDelegate
- Run `npx cap sync` after making changes
- Rebuild the native app

### Biometric not available:
- Check if device has biometric hardware
- Verify permissions are granted in AndroidManifest.xml/Info.plist
- Test with device credentials as fallback

### Native bridge not working:
- Check Capacitor console logs
- Ensure plugin return values match expected JSObject structure
- Verify plugin is registered before app loads

## References

- [Android BiometricPrompt Documentation](https://developer.android.com/training/biometric)
- [iOS LocalAuthentication Documentation](https://developer.apple.com/documentation/localauthentication)
- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)
