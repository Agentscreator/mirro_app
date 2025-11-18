# Deep Linking Setup Guide

This guide explains how to set up deep linking so that shared event URLs open directly in your mobile app instead of the browser.

## Overview

When someone shares an event link like `https://www.mirro2.com/?event=123`, users with the app installed will automatically open it in the app instead of their browser.

## What Was Configured

### 1. Android App Links
- Added intent filters to `android/app/src/main/AndroidManifest.xml`
- Configured to handle `https://www.mirro2.com` and `https://mirro2.com`
- Uses `android:autoVerify="true"` for automatic verification

### 2. iOS Universal Links
- Updated `ios/App/App/Info.plist` with:
  - Associated domains for `www.mirro2.com` and `mirro2.com`
  - Custom URL scheme `mirro2://` as fallback

### 3. Web Verification Files
Created two files in `public/.well-known/`:
- `apple-app-site-association` - For iOS verification
- `assetlinks.json` - For Android verification

### 4. Deep Link Handler
- Created `hooks/useDeepLinking.ts` to handle incoming links
- Integrated into `app/page.tsx` to process event IDs from deep links

## Setup Steps

### Step 1: Get Your iOS Team ID

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to Membership section
3. Copy your Team ID (10-character string)
4. Update `public/.well-known/apple-app-site-association`:
   ```json
   "appID": "YOUR_TEAM_ID.com.mirro2.app"
   ```
   Replace `YOUR_TEAM_ID` with your actual Team ID

### Step 2: Get Your Android SHA-256 Fingerprint

For your release keystore:
```bash
keytool -list -v -keystore android/release-key.keystore -alias key0
```

For debug keystore (testing):
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-256 fingerprint and update `public/.well-known/assetlinks.json`:
```json
"sha256_cert_fingerprints": [
  "YOUR_SHA256_FINGERPRINT_HERE"
]
```

### Step 3: Deploy Verification Files

The verification files MUST be accessible at:
- `https://www.mirro2.com/.well-known/apple-app-site-association`
- `https://www.mirro2.com/.well-known/assetlinks.json`

**Important:**
- Files must be served over HTTPS
- No redirects allowed
- Must return `Content-Type: application/json`
- Must be accessible without authentication

Deploy your Next.js app to make these files live.

### Step 4: Verify iOS Setup

1. Test the association file:
   ```bash
   curl https://www.mirro2.com/.well-known/apple-app-site-association
   ```

2. Use Apple's validator:
   - Go to https://search.developer.apple.com/appsearch-validation-tool/
   - Enter your domain: `www.mirro2.com`
   - Verify it shows your app

### Step 5: Verify Android Setup

1. Test the asset links file:
   ```bash
   curl https://www.mirro2.com/.well-known/assetlinks.json
   ```

2. Use Google's validator:
   - Go to https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.mirro2.com&relation=delegate_permission/common.handle_all_urls
   - Verify it returns your app's package name

### Step 6: Rebuild Your Apps

After updating the configuration files:

**iOS:**
```bash
npx cap sync ios
npx cap open ios
```
Then rebuild in Xcode.

**Android:**
```bash
npx cap sync android
npx cap open android
```
Then rebuild in Android Studio.

### Step 7: Enable Associated Domains in Xcode

1. Open your project in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Associated Domains"
6. Verify these domains are listed:
   - `applinks:www.mirro2.com`
   - `applinks:mirro2.com`

## Testing

### Test on iOS

1. **Install the app** on a physical device (simulators don't support universal links well)
2. **Send yourself a link** via Messages, Mail, or Notes:
   ```
   https://www.mirro2.com/?event=YOUR_EVENT_ID
   ```
3. **Tap the link** - it should open in your app, not Safari
4. If it opens in Safari, long-press the link and check if "Open in MirroSocial" appears

### Test on Android

1. **Install the app** on a device or emulator
2. **Clear app data** to reset verification:
   ```bash
   adb shell pm clear com.mirro2.app
   ```
3. **Test the link** via:
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://www.mirro2.com/?event=YOUR_EVENT_ID"
   ```
4. Or send the link via messaging app and tap it

### Troubleshooting

**iOS - Link opens in Safari:**
- Verify your Team ID is correct in the association file
- Check that the file is accessible at the exact URL
- Try deleting and reinstalling the app
- Check Console.app for "swcd" logs while testing

**Android - Link opens in browser:**
- Verify SHA-256 fingerprint matches your keystore
- Check that autoVerify is working:
  ```bash
  adb shell dumpsys package d
  ```
  Look for your domain and verify status
- Clear app data and reinstall
- Check logcat for verification errors:
  ```bash
  adb logcat | grep -i "digital asset"
  ```

**Both platforms:**
- Ensure files are served over HTTPS
- Check that Content-Type headers are correct
- Verify no redirects occur when accessing the files
- Make sure the files don't require authentication

## How It Works

1. **User shares event** → Generates URL: `https://www.mirro2.com/?event=123`
2. **Recipient taps link** → OS checks if app is installed
3. **OS verifies domain** → Checks verification files on your server
4. **App opens** → `useDeepLinking` hook captures the URL
5. **Event displays** → App navigates to `/?event=123` and shows EventPreviewModal

## Fallback Behavior

If the app is not installed:
- iOS: Opens in Safari
- Android: Opens in default browser
- User can still view the event on the web

## Custom URL Scheme (Fallback)

The app also supports the custom scheme `mirro2://` for cases where universal/app links don't work:
```
mirro2://www.mirro2.com/?event=123
```

This is less preferred but works as a backup.

## Security Notes

- Deep links are handled client-side in the app
- Event data is fetched from your API with proper authentication
- Non-authenticated users can view shared events (by design)
- Joining events still requires authentication

## Additional Resources

- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
