# Mobile Messaging Fix

## Problem
Messaging (DMs) works on desktop web but not on mobile screens (both mobile web and native iOS app).

## Root Causes Identified

1. **Hidden chat window on mobile** - The chat window was hidden on mobile screens with `hidden md:flex`
2. **No mobile view for conversations** - Clicking a channel on mobile did nothing
3. **Missing CapacitorHttp plugin** in iOS config - needed for proper HTTP handling on native iOS
4. **Missing NSAppTransportSecurity settings** - iOS blocks connections to Stream Chat API domains
5. **Relative API URLs** - iOS native app needs absolute URLs for API calls

## Changes Made

### 1. iOS Capacitor Config (`ios/App/App/capacitor.config.json`)
- Added `CapacitorHttp` plugin with `enabled: true`
- Added `allowNavigation: ["*"]` to server config

### 2. iOS Info.plist (`ios/App/App/Info.plist`)
- Added `NSAppTransportSecurity` configuration
- Whitelisted Stream Chat domains:
  - `stream-io-api.com`
  - `getstream.io`
- Configured secure connections with proper forward secrecy settings

### 3. MessagingPage Component (`components/MessagingPage.tsx`)
- **Added mobile-responsive chat view** - Full-screen chat window on mobile when channel is selected
- **Added back button** - Navigate back to channel list on mobile
- **Mobile state management** - `showMobileChat` state to toggle between list and chat views
- Added iOS native platform detection using Capacitor API
- Use absolute URLs (`https://www.mirro2.com`) for API calls on iOS native app
- Improved error handling with user-facing alerts for debugging
- Fixed TypeScript type issues with Stream Chat channel names

## How to Test

1. **Rebuild the iOS app:**
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

3. **Clean build in Xcode:**
   - Product → Clean Build Folder (Shift+Cmd+K)
   - Product → Build (Cmd+B)

4. **Run on device or simulator:**
   - Select your target device
   - Click Run (Cmd+R)

5. **Test messaging:**
   - Log in to the app
   - Navigate to Messages
   - On mobile: tap a channel to open full-screen chat view
   - On mobile: use back button to return to channel list
   - Try sending a DM
   - Check console logs for any errors

## Debugging Tips

If messaging still doesn't work:

1. **Check console logs in Xcode:**
   - Look for "Error initializing chat" messages
   - Check for network errors or timeout issues

2. **Verify Stream Chat credentials:**
   - Ensure `NEXT_PUBLIC_STREAM_API_KEY` is set
   - Ensure `STREAM_SECRET_KEY` is set on server

3. **Test API endpoint directly:**
   - Try accessing `https://www.mirro2.com/api/chat/token` from iOS Safari
   - Should return 405 (Method Not Allowed) for GET, which means it's reachable

4. **Check network connectivity:**
   - Ensure the device has internet access
   - Try other API calls to verify general connectivity

## Additional Notes

- The fix uses absolute URLs for iOS native apps while keeping relative URLs for web
- Stream Chat WebSocket connections now have proper iOS network security settings
- Error messages will now show alerts on iOS for easier debugging
