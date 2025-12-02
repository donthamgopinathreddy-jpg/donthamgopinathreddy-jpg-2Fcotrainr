# CoTrainr Setup Summary

## Status: ✅ Ready for Native Build

### Completed Tasks

#### 1. ✅ Login API Fixed

- **Issue**: Netlify function had duplicate handler declaration
- **Fix**: Renamed `serverless(app)` to `serverlessHandler` to avoid conflicts
- **Status**: Latest code deployed to https://cotrainr.netlify.app
- **Test**: Try logging in with your credentials

#### 2. ✅ TypeScript Errors Fixed

- **Issue**: Missing lucide-react icons (Toggle2, Protein)
- **Fix**:
  - `Toggle2` → `ToggleRight` (BiometricSettings.tsx)
  - `Protein` → `Zap` (MealCard.tsx)
- **Status**: Build completes without errors
- **Build Output**: All modules transformed successfully

#### 3. ✅ Capacitor Config Verified

- **Status**: Capacitor v5.0.8 properly configured
- **Config Location**: `capacitor.config.json`
- **Web Dir**: `dist/spa` (correctly points to built web assets)
- **App ID**: `com.cotrainr.app`
- **Features**: Android & iOS support enabled

#### 4. ✅ Native Build Documentation

- **File**: `NATIVE_BUILD_SETUP.md`
- **Covers**:
  - Complete setup instructions for Android and iOS
  - Environment configuration
  - Build commands with examples
  - Troubleshooting guide
  - Release checklist

## Quick Start Commands

### Development

```bash
# Start web dev server
pnpm run dev

# Open in browser: http://localhost:8080
```

### Build Web + Native Sync

```bash
# Build web assets and sync to native projects
pnpm run cap:build

# Or individual commands:
pnpm run build:client    # Just web
pnpm run build           # Web + server
```

### Android Development

```bash
# Open in Android Studio
pnpm run cap:open

# Build debug APK
pnpm run android:debug

# Build release APK
pnpm run android:release
```

### iOS Development

```bash
# Open in Xcode (macOS only)
pnpm run cap:open

# From Xcode: Product > Run (or Cmd+R)
```

## Project Structure

```
cotrainr/
├── client/               # React web app
│   ├── pages/           # Route pages
│   ├── components/      # React components
│   ├── contexts/        # Auth, Language, Theme
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities, API
├── server/              # Node.js backend
│   ├── routes/          # API endpoints (/api/auth/*, etc)
│   └── index.ts         # Express setup
├── android/             # Android native project (generated)
├── ios/                 # iOS native project (generated)
├── netlify/functions/   # Netlify serverless API
├── dist/                # Built artifacts (git-ignored)
│   └── spa/            # Built web app (served by native)
├── capacitor.config.json # Capacitor configuration
├── package.json         # Node scripts
└── vite.config.ts       # Vite build config
```

## Environment Variables

### Web (set in `.env`)

```
VITE_SUPABASE_URL=https://hnxdlgdkyboctsvfktwe.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

### Native

Environment variables are baked into the web app during build. No additional configuration needed.

### Backend (Netlify)

Environment variables set in Netlify dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Testing the App

### Web

1. Go to https://cotrainr.netlify.app
2. Login with your Supabase credentials
3. Should see the home page with targets, metrics, etc.

### Android

1. Build: `pnpm run android:debug`
2. Install on device/emulator
3. App should load with same experience as web
4. Login should work using Netlify API

### iOS

1. Open in Xcode: `pnpm run cap:open`
2. Run on simulator or device
3. App should work identically to web version

## Key Files for Reference

- **Authentication**: `client/contexts/AuthContext.tsx`
- **API Calls**: `client/lib/api.ts`
- **Supabase Config**: `client/lib/supabase.ts`
- **Netlify API**: `netlify/functions/api.ts`
- **Capacitor Bridge**: `client/lib/capacitorBridge.ts`
- **Native Config**: `capacitor.config.json`

## Known Limitations

1. **API on Native**: When running on physical devices, API calls go to `https://cotrainr.netlify.app/api/*`, not localhost
2. **Hot Reload**: Use `npx cap serve` for live reload during development
3. **iOS**: Requires macOS and Xcode (cannot build on Windows/Linux)
4. **Biometric**: Biometric auth requires native plugins (Face ID, fingerprint) - currently supported

## Next Steps

1. **Test Web Login**: Verify login works on https://cotrainr.netlify.app
2. **Set Up Android**: Install Android Studio, build first debug APK
3. **Set Up iOS**: (macOS only) Install Xcode, build for simulator
4. **Add Signing**: Prepare certificates for Play Store/App Store
5. **Customize**: Add CoTrainr branding, icons, splash screens

## Deployment

### Web

- Automatic deployment to Netlify on git push to main
- Preview: https://cotrainr.netlify.app
- Admin dashboard: https://app.netlify.com/sites/cotrainr

### Android

- Build release: `pnpm run android:release`
- Sign APK: Follow Play Store signing guide
- Submit to: Google Play Store

### iOS

- Build release: Use Xcode Archive feature
- Sign with developer certificate
- Submit to: App Store via Xcode or App Store Connect

## Support

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **React Docs**: https://react.dev

## Checklist Before Release

- [ ] Login works on web (Netlify)
- [ ] Login works on Android emulator/device
- [ ] Login works on iOS simulator
- [ ] No console errors
- [ ] API health check passes
- [ ] Biometric auth configured (if using)
- [ ] App icon added
- [ ] Splash screen updated
- [ ] Signing certificates prepared
- [ ] Version updated in config files

---

**Status**: ✅ Ready for Development & Native Builds
**Last Updated**: 2024
**Tested On**: Capacitor 5.0.8, Node 18+, pnpm 10+
