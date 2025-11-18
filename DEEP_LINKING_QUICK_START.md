# Deep Linking Quick Start

## What's Done ✅

Your app is now configured for deep linking! When users tap shared event links, they'll open in your app instead of the browser.

## What You Need to Do

### 1. iOS Team ID ✅ DONE
Your Team ID (B46X894ZHC) has been added to:
- `public/.well-known/apple-app-site-association`

### 2. Get Android SHA-256 Fingerprint (2 minutes)
```bash
# Run the helper script:
./scripts/get-android-fingerprint.sh

# Or manually:
# For release build:
keytool -list -v -keystore android/release-key.keystore -alias key0

# Copy the SHA-256 fingerprint
# Edit: public/.well-known/assetlinks.json
# Replace: YOUR_SHA256_FINGERPRINT_HERE with your fingerprint
```

**Note:** You'll need to build your Android app first to generate the keystore.

### 3. Deploy to Production (5 minutes)
```bash
# Deploy your Next.js app so these files are accessible:
# - https://www.mirro2.com/.well-known/apple-app-site-association
# - https://www.mirro2.com/.well-known/assetlinks.json

# Verify they're accessible:
curl https://www.mirro2.com/.well-known/apple-app-site-association
curl https://www.mirro2.com/.well-known/assetlinks.json
```

### 4. Rebuild Mobile Apps (5 minutes)
```bash
# Sync changes to native projects
npx cap sync

# iOS - Open in Xcode and rebuild
npx cap open ios

# Android - Open in Android Studio and rebuild
npx cap open android
```

### 5. Enable Associated Domains in Xcode (1 minute)
1. Open project in Xcode
2. Select app target → Signing & Capabilities
3. Add "Associated Domains" capability
4. Verify domains are listed:
   - `applinks:www.mirro2.com`
   - `applinks:mirro2.com`

## Testing

### iOS
Send yourself this link via Messages:
```
https://www.mirro2.com/?event=YOUR_EVENT_ID
```
Tap it - should open in app!

### Android
```bash
adb shell am start -a android.intent.action.VIEW -d "https://www.mirro2.com/?event=YOUR_EVENT_ID"
```

## How It Works

1. User shares event → `https://www.mirro2.com/?event=123`
2. Recipient taps link → OS checks if app installed
3. App opens → Shows event in EventPreviewModal
4. If app not installed → Opens in browser (fallback)

## Files Changed

- ✅ `android/app/src/main/AndroidManifest.xml` - Added intent filters
- ✅ `ios/App/App/Info.plist` - Added associated domains
- ✅ `public/.well-known/apple-app-site-association` - iOS verification
- ✅ `public/.well-known/assetlinks.json` - Android verification
- ✅ `hooks/useDeepLinking.ts` - Deep link handler
- ✅ `app/page.tsx` - Integrated deep linking
- ✅ `next.config.mjs` - Added headers for verification files
- ✅ `package.json` - Added @capacitor/app dependency

## Need Help?

See `DEEP_LINKING_SETUP.md` for detailed troubleshooting and testing instructions.
