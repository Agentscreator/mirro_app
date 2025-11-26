# Push Notifications Quick Start

## What's Already Done ✅

1. ✅ Push notification hook created (`hooks/usePushNotifications.ts`)
2. ✅ Integrated into MessagingPage component
3. ✅ Capacitor config updated with push notification settings

## What You Need to Do

### 1. Install the Package (5 minutes)

```bash
npm install @capacitor/push-notifications
npx cap sync ios
```

### 2. Configure Xcode (10 minutes)

```bash
npx cap open ios
```

In Xcode:
1. Select your app target (MirroSocial)
2. Go to "Signing & Capabilities" tab
3. Click "+ Capability" button
4. Add **"Push Notifications"**
5. Add **"Background Modes"** and check:
   - ☑️ Remote notifications
   - ☑️ Background fetch

### 3. Get APNs Key from Apple (15 minutes)

**Easiest Method - APNs Auth Key:**

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click the "+" button to create a new key
3. Name it "MirroSocial Push Notifications"
4. Check "Apple Push Notifications service (APNs)"
5. Click "Continue" → "Register"
6. **Download the .p8 file** (you can only download once!)
7. Note your **Key ID** (shows on the page)
8. Note your **Team ID** (top right of page)

**Save these securely:**
- The `.p8` file
- Key ID (e.g., `ABC123DEFG`)
- Team ID (e.g., `XYZ987WXYZ`)

### 4. Configure Stream Chat Dashboard (10 minutes)

1. Go to https://dashboard.getstream.io/
2. Select your app
3. Navigate to **Chat** → **Push Notifications**
4. Click **"Add Configuration"** for iOS
5. Select **"Token-based (.p8)"**
6. Fill in:
   - **Key ID**: Your Key ID from step 3
   - **Team ID**: Your Team ID from step 3
   - **Bundle ID**: `com.mirro2.app`
   - Upload your `.p8` file
7. Set environment to **"Production"** (for App Store)
8. Click **"Save"**

### 5. Update iOS Info.plist (2 minutes)

Open `ios/App/App/Info.plist` in Xcode or text editor and add:

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Get notified when you receive new messages from friends</string>
```

### 6. Build and Test (10 minutes)

**Important: Must test on a physical device (not simulator)**

```bash
# Sync all changes
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Connect your iPhone
# 2. Select your device from the device dropdown
# 3. Click the "Play" button to build and run
```

### 7. Test Notifications

1. **Grant permission**: When app launches, tap "Allow" for notifications
2. **Check logs**: Look for "Push registration success" in Xcode console
3. **Send a test message**:
   - Open app on another device or web
   - Send a message to your test device
   - Put the app in background (press home button)
   - You should receive a notification!

---

## Troubleshooting

### "No notifications received"
- Make sure app is in **background** (foreground notifications need custom UI)
- Check Settings → MirroSocial → Notifications are enabled
- Look for "Device registered with Stream Chat" in logs

### "Registration failed"
- Must use a **physical device** (not simulator)
- Check Bundle ID matches: `com.mirro2.app`
- Verify Push Notifications capability is enabled in Xcode

### "Permission denied"
- Delete app and reinstall to reset permissions
- Or go to Settings → MirroSocial → Notifications → Allow

---

## Production Checklist

Before submitting to App Store:

- ✅ Push Notifications capability enabled in Xcode
- ✅ Background Modes enabled (Remote notifications)
- ✅ APNs key uploaded to Stream Dashboard
- ✅ Stream environment set to "Production"
- ✅ Info.plist has notification permission description
- ✅ Tested on physical device

---

## Next Steps After Setup

### Optional: Add Badge Count

Install badge plugin:
```bash
npm install @capacitor/badge
```

Update unread count:
```typescript
import { Badge } from '@capacitor/badge'

// Set badge
await Badge.set({ count: unreadMessageCount })

// Clear badge
await Badge.clear()
```

### Optional: Custom Notification Sounds

1. Add sound file to `ios/App/App/sounds/`
2. Configure in Stream Dashboard notification template
3. Reference in push payload: `"sound": "notification.wav"`

---

## Time Estimate

- **Total setup time**: ~45 minutes
- **Testing time**: ~15 minutes
- **Total**: ~1 hour

Most of the time is waiting for Apple Developer Portal and Stream Dashboard to process your configuration.

---

## Support

If you run into issues:
1. Check Xcode console logs for errors
2. Verify Stream Dashboard shows device registered
3. Test with Stream Dashboard's "Send Test Notification" feature
4. Review full guide: `PUSH_NOTIFICATIONS_SETUP.md`
