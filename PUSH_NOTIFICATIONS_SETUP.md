# Push Notifications Setup for iOS (Capacitor + Stream Chat)

## Overview
This guide sets up push notifications for your Capacitor iOS app using Stream Chat's built-in push notification system.

## Prerequisites
- Apple Developer Account
- APNs (Apple Push Notification service) certificate or key
- Stream Chat account with push notifications enabled

---

## Step 1: Install Required Packages

```bash
yarn add @capacitor/push-notifications
npx cap sync ios
```

---

## Step 2: Configure iOS App for Push Notifications

### 2.1 Enable Push Notifications in Xcode
1. Open your iOS project: `npx cap open ios`
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and check:
   - Remote notifications
   - Background fetch

### 2.2 Generate APNs Certificate/Key

**Option A: APNs Auth Key (Recommended)**
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Create a new key
3. Enable "Apple Push Notifications service (APNs)"
4. Download the `.p8` file (save it securely!)
5. Note your Key ID and Team ID

**Option B: APNs Certificate**
1. Create a Certificate Signing Request (CSR) in Keychain Access
2. Go to Apple Developer Portal → Certificates
3. Create "Apple Push Notification service SSL (Sandbox & Production)"
4. Upload CSR and download certificate
5. Install in Keychain and export as `.p12`

---

## Step 3: Configure Stream Chat Dashboard

1. Go to [Stream Dashboard](https://dashboard.getstream.io/)
2. Select your app
3. Go to "Chat" → "Push Notifications"
4. Click "Add Configuration" for iOS
5. Upload your APNs certificate/key:
   - **For .p8 key**: Enter Key ID, Team ID, and upload .p8 file
   - **For .p12 cert**: Upload .p12 file and enter password
6. Set notification mode to "Production" (for App Store) or "Development" (for testing)

---

## Step 4: Update Capacitor Config

Add push notification configuration to `capacitor.config.ts`:

```typescript
plugins: {
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"]
  }
}
```

---

## Step 5: Request Permission & Register Device

Create a new hook for push notifications:

**File: `hooks/usePushNotifications.ts`**

```typescript
import { useEffect } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export function usePushNotifications(userId: string | null, streamClient: any) {
  useEffect(() => {
    if (!userId || !streamClient || !Capacitor.isNativePlatform()) {
      return
    }

    const setupPushNotifications = async () => {
      try {
        // Request permission
        const permission = await PushNotifications.requestPermissions()
        
        if (permission.receive === 'granted') {
          // Register with APNs
          await PushNotifications.register()
        }

        // Listen for registration success
        await PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token:', token.value)
          
          // Register device with Stream Chat
          await streamClient.addDevice(token.value, 'apn', userId)
          console.log('Device registered with Stream Chat')
        })

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error)
        })

        // Handle notification received while app is in foreground
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification)
          // Optionally show in-app notification
        })

        // Handle notification tap (opens app)
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed:', notification)
          // Navigate to chat or specific message
          const data = notification.notification.data
          if (data.channel_id) {
            // Navigate to the channel
            window.location.href = `/messages?channel=${data.channel_id}`
          }
        })
      } catch (error) {
        console.error('Error setting up push notifications:', error)
      }
    }

    setupPushNotifications()

    // Cleanup
    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [userId, streamClient])
}
```

---

## Step 6: Integrate into MessagingPage

Update `components/MessagingPage.tsx`:

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function MessagingPage({ user, onChatOpen }: MessagingPageProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  
  // Add push notifications hook
  usePushNotifications(user.id, client)
  
  // ... rest of your component
}
```

---

## Step 7: Update Info.plist (iOS)

The iOS app needs permission descriptions. Open `ios/App/App/Info.plist` and add:

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>We need permission to send you notifications about new messages</string>
```

---

## Step 8: Build and Test

### Development Testing
```bash
# Sync changes
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build and run on a physical device (push notifications don't work in simulator)
```

### Production Build
1. Archive your app in Xcode
2. Upload to App Store Connect
3. Submit for review
4. Ensure "Push Notifications" capability is enabled in App Store Connect

---

## Step 9: Test Push Notifications

### Test from Stream Dashboard
1. Go to Stream Dashboard → Chat → Explorer
2. Find a channel
3. Send a message
4. Your device should receive a notification (when app is in background)

### Test Programmatically
```typescript
// Send a test notification via Stream API
await channel.sendMessage({
  text: 'Test notification',
  user_id: 'sender-id'
})
```

---

## Troubleshooting

### No notifications received
- ✅ Check device is registered: Look for "Push registration success" in logs
- ✅ Verify APNs certificate is valid and uploaded to Stream
- ✅ Ensure app is in background (foreground notifications need custom handling)
- ✅ Check notification permissions: Settings → Your App → Notifications
- ✅ Verify Stream Chat device registration: `streamClient.getDevices()`

### Registration fails
- ✅ Must test on physical device (not simulator)
- ✅ Check Bundle ID matches Apple Developer Portal
- ✅ Verify Push Notifications capability is enabled in Xcode
- ✅ Check provisioning profile includes push notifications

### Notifications not opening app
- ✅ Verify `pushNotificationActionPerformed` listener is set up
- ✅ Check notification payload includes proper data (channel_id, etc.)

---

## Advanced: Custom Notification Handling

### Show badge count
```typescript
import { Badge } from '@capacitor/badge'

// Update badge when new messages arrive
await Badge.set({ count: unreadCount })

// Clear badge when app opens
await Badge.clear()
```

### Rich notifications with images
Stream Chat supports rich notifications. Configure in Stream Dashboard:
- Add image URLs to message attachments
- Stream will automatically include them in push payload

---

## Security Notes

- ✅ Never commit `.p8` or `.p12` files to git
- ✅ Store APNs credentials securely
- ✅ Use production APNs for App Store builds
- ✅ Rotate APNs keys periodically

---

## Next Steps

1. Install push notification package
2. Configure iOS capabilities in Xcode
3. Set up APNs certificate/key
4. Configure Stream Chat dashboard
5. Implement push notification hook
6. Test on physical device
7. Submit to App Store

---

## Resources

- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Stream Chat Push Notifications](https://getstream.io/chat/docs/ios-swift/push_introduction/)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
