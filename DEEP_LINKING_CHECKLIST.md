# Deep Linking Setup Checklist

## Configuration ✅

- [x] Android App Links configured in AndroidManifest.xml
- [x] iOS Universal Links configured in Info.plist
- [x] iOS Team ID added (B46X894ZHC)
- [x] Deep linking hook created (hooks/useDeepLinking.ts)
- [x] Deep linking integrated in app/page.tsx
- [x] @capacitor/app plugin installed
- [x] Next.js headers configured for verification files

## Remaining Steps

### Step 1: Get Android SHA-256 Fingerprint
- [ ] Build Android app in Android Studio
- [ ] Run: `./scripts/get-android-fingerprint.sh`
- [ ] Copy SHA-256 fingerprint
- [ ] Update `public/.well-known/assetlinks.json`

### Step 2: Deploy Verification Files
- [ ] Deploy Next.js app to production
- [ ] Verify accessible: `curl https://www.mirro2.com/.well-known/apple-app-site-association`
- [ ] Verify accessible: `curl https://www.mirro2.com/.well-known/assetlinks.json`
- [ ] Check Content-Type is `application/json`

### Step 3: Validate iOS Setup
- [ ] Test file: https://www.mirro2.com/.well-known/apple-app-site-association
- [ ] Validate at: https://search.developer.apple.com/appsearch-validation-tool/
- [ ] Enter domain: `www.mirro2.com`
- [ ] Confirm it shows your app (com.mirro2.app)

### Step 4: Validate Android Setup
- [ ] Test file: https://www.mirro2.com/.well-known/assetlinks.json
- [ ] Validate at: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.mirro2.com&relation=delegate_permission/common.handle_all_urls
- [ ] Confirm it returns your package name

### Step 5: Rebuild Mobile Apps
- [ ] Run: `npx cap sync`
- [ ] iOS: `npx cap open ios` → Build in Xcode
- [ ] Android: `npx cap open android` → Build in Android Studio

### Step 6: Enable Associated Domains (iOS Only)
- [ ] Open project in Xcode
- [ ] Select app target
- [ ] Go to Signing & Capabilities
- [ ] Add "Associated Domains" capability
- [ ] Verify domains listed:
  - `applinks:www.mirro2.com`
  - `applinks:mirro2.com`

### Step 7: Test on iOS
- [ ] Install app on physical device
- [ ] Send test link via Messages: `https://www.mirro2.com/?event=TEST_EVENT_ID`
- [ ] Tap link → Should open in app
- [ ] If opens in Safari, long-press link → Check for "Open in MirroSocial"

### Step 8: Test on Android
- [ ] Install app on device/emulator
- [ ] Test via ADB: `adb shell am start -a android.intent.action.VIEW -d "https://www.mirro2.com/?event=TEST_EVENT_ID"`
- [ ] Or send link via messaging app and tap
- [ ] Verify app opens with event modal

## Troubleshooting

### iOS Issues
- [ ] Check Team ID is correct (B46X894ZHC)
- [ ] Verify file is accessible without redirects
- [ ] Check Console.app for "swcd" logs
- [ ] Try deleting and reinstalling app
- [ ] Ensure Associated Domains capability is enabled

### Android Issues
- [ ] Verify SHA-256 fingerprint matches keystore
- [ ] Check verification status: `adb shell dumpsys package d`
- [ ] Clear app data: `adb shell pm clear com.mirro2.app`
- [ ] Check logcat: `adb logcat | grep -i "digital asset"`
- [ ] Ensure autoVerify is working

### Both Platforms
- [ ] Files served over HTTPS (not HTTP)
- [ ] No redirects when accessing files
- [ ] Content-Type is application/json
- [ ] Files don't require authentication
- [ ] Domain matches exactly (www.mirro2.com)

## Success Criteria

✅ Tapping `https://www.mirro2.com/?event=123` opens the app
✅ EventPreviewModal displays the shared event
✅ Non-authenticated users can view events
✅ Authenticated users can join/leave events
✅ If app not installed, opens in browser (fallback)

## Quick Commands

```bash
# Get Android fingerprint
./scripts/get-android-fingerprint.sh

# Sync Capacitor
npx cap sync

# Open in IDEs
npx cap open ios
npx cap open android

# Test Android deep link
adb shell am start -a android.intent.action.VIEW -d "https://www.mirro2.com/?event=YOUR_EVENT_ID"

# Check Android verification
adb shell dumpsys package d | grep -A 5 "mirro2"

# View Android logs
adb logcat | grep -i "digital asset"
```

## Resources

- [iOS Universal Links Guide](https://developer.apple.com/ios/universal-links/)
- [Android App Links Guide](https://developer.android.com/training/app-links)
- [Apple Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- [Google Validator](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.mirro2.com&relation=delegate_permission/common.handle_all_urls)
