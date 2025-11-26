# iOS Capabilities Summary

## Configured Capabilities in Xcode

### ✅ Push Notifications
- Allows the app to receive push notifications for new messages
- Configured with Stream Chat for messaging notifications
- Info.plist includes `NSUserNotificationsUsageDescription`

### ✅ Background Modes → Remote notifications
- Enables push notifications to be delivered when app is in background
- Info.plist includes `UIBackgroundModes` with `remote-notification`

### ✅ Associated Domains
- Enables deep linking from web to app
- When users share event links, recipients open the app instead of web browser
- **Domain configured**: `applinks:www.mirro2.com`
- Works with your existing `.well-known/apple-app-site-association` file

### ✅ Sign in with Apple
- Allows users to sign in using their Apple ID
- Provides privacy-focused authentication
- Requires web implementation to complete

### ✅ Face ID / Touch ID (Biometric Authentication)
- Enables biometric authentication for secure login
- Info.plist needs `NSFaceIDUsageDescription`
- Requires web implementation to complete

---

## What's Already Working

1. **Deep Linking** ✅
   - Your `useDeepLinking` hook handles incoming links
   - `.well-known/apple-app-site-association` is configured
   - Associated Domains capability is now enabled in Xcode

2. **Push Notifications** ✅
   - `usePushNotifications` hook is implemented
   - Info.plist has required permissions
   - Just needs APNs key uploaded to Stream Dashboard

---

## What Needs Implementation

### 1. Sign in with Apple (Web Side)

You'll need to:
- Add Apple as an OAuth provider in your auth system
- Configure Apple Developer Portal with Services ID
- Implement Apple Sign In button in `AuthPage.tsx`

### 2. Face ID / Touch ID (Web Side)

You'll need to:
- Add `NSFaceIDUsageDescription` to Info.plist
- Use Capacitor's Biometric Auth plugin
- Implement biometric login flow

---

## Next Steps

### For Push Notifications (Almost Done!)
1. Get APNs key from Apple Developer Portal
2. Upload to Stream Chat Dashboard
3. Test on physical device

### For Sign in with Apple
1. Configure Services ID in Apple Developer Portal
2. Add Apple OAuth to your auth system
3. Add Apple Sign In button to login page

### For Face ID
1. Add Face ID permission to Info.plist
2. Install `@capacitor-community/biometric-auth`
3. Implement biometric login option

---

## Testing Checklist

- [ ] Push notifications work when app is backgrounded
- [ ] Deep links open app instead of browser
- [ ] Apple Sign In works (once implemented)
- [ ] Face ID works for login (once implemented)

---

## Important Notes

- **Associated Domains**: Make sure your domain is verified in Apple Developer Portal
- **Sign in with Apple**: Required if you offer other social login options (per App Store guidelines)
- **Face ID**: Optional but great for UX - users can unlock app with face/fingerprint
