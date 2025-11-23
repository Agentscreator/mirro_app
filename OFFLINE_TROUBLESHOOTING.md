# Offline Mode Troubleshooting Guide

## Common Issues & Solutions

### 1. Service Worker Not Registering

#### Symptoms
- No service worker in DevTools → Application → Service Workers
- Console error: "Service Worker registration failed"
- Offline mode doesn't work

#### Causes & Solutions

**Not using HTTPS**
```
❌ http://example.com
✅ https://example.com
✅ http://localhost:3000
```
Solution: Use HTTPS or localhost for development

**Service Worker file not found**
```bash
# Check if sw.js exists
ls public/sw.js

# Check if it's in the build output (after building)
ls out/sw.js
```
Solution: Ensure `public/sw.js` exists and is copied to build output

**Browser doesn't support Service Workers**
```javascript
if ('serviceWorker' in navigator) {
  // Supported
} else {
  console.error('Service Workers not supported');
}
```
Solution: Use a modern browser (Chrome, Firefox, Safari, Edge)

**Service Worker scope issue**
```javascript
// Wrong - limited scope
navigator.serviceWorker.register('/js/sw.js');

// Correct - full scope
navigator.serviceWorker.register('/sw.js');
```
Solution: Place `sw.js` in the root of your public directory

### 2. Offline Mode Not Working

#### Symptoms
- App doesn't work when offline
- Blank screen or errors when disconnected
- Cached data not loading

#### Causes & Solutions

**Service Worker not active**
```javascript
// Check in DevTools → Application → Service Workers
// Status should be "activated and running"
```
Solution: 
1. Reload the page
2. Check for service worker errors
3. Unregister and re-register

**Assets not cached**
```javascript
// Check in DevTools → Application → Cache Storage
// Should see "mirro-v1" and "mirro-runtime-v1"
```
Solution:
1. Clear all caches
2. Reload page while online
3. Wait for caching to complete
4. Test offline mode

**Cache strategy incorrect**
```javascript
// In sw.js, check fetch event handler
self.addEventListener('fetch', (event) => {
  // Should have proper cache fallback
});
```
Solution: Review and update `public/sw.js` cache strategy

**First load was offline**
```
User installs app → Offline → Opens app → Nothing cached
```
Solution: App must be loaded at least once while online to cache assets

### 3. Offline Indicator Not Showing

#### Symptoms
- No banner when offline
- `useOnlineStatus` always returns true

#### Causes & Solutions

**Component not imported**
```typescript
// In app/layout.tsx
import { OfflineIndicator } from '@/components/OfflineIndicator';

// In JSX
<OfflineIndicator />
```
Solution: Ensure component is imported and rendered

**Network detection not working**
```typescript
// Test in console
console.log(navigator.onLine); // Should be false when offline
```
Solution:
1. Check browser network settings
2. Try airplane mode on device
3. Use DevTools → Network → Offline

**Capacitor Network plugin not installed**
```bash
yarn list --pattern @capacitor/network
```
Solution: Run `yarn install` to install missing dependencies (already done! ✅)

### 4. Queued Actions Not Syncing

#### Symptoms
- Actions performed offline don't sync when back online
- Queue grows but never processes
- Duplicate actions

#### Causes & Solutions

**Online event not firing**
```typescript
// Test in console
window.addEventListener('online', () => {
  console.log('Online event fired');
});
```
Solution: Ensure `ServiceWorkerRegistration` component is mounted

**Queue processing failing**
```typescript
// Check queue in console
import { OfflineQueue } from '@/lib/offline';
console.log(OfflineQueue.getAll());
```
Solution:
1. Check for errors in console
2. Manually process queue: `OfflineQueue.processQueue()`
3. Clear corrupted queue: `OfflineQueue.clear()`

**API endpoint changed**
```typescript
// Queue stores full endpoint URL
// If API changes, old queued actions may fail
```
Solution:
1. Clear queue after API changes
2. Add version checking to queue items
3. Handle 404 errors gracefully

**Authentication expired**
```typescript
// Queued actions may fail if auth token expired
```
Solution:
1. Refresh auth token before processing queue
2. Re-authenticate user if needed
3. Clear queue on logout

### 5. Cache Not Updating

#### Symptoms
- Old data showing even when online
- Changes not reflected after sync
- Stale content

#### Causes & Solutions

**Cache duration too long**
```typescript
// In offlineFetch call
cacheDuration: 24 * 60 * 60 * 1000 // 24 hours - too long!
```
Solution: Reduce cache duration for frequently changing data

**Service Worker not updating**
```javascript
// In sw.js, increment version
const CACHE_NAME = 'mirro-v2'; // Was v1
```
Solution:
1. Update cache version
2. Rebuild app
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

**Cache not being invalidated**
```typescript
// Manually clear cache
import { OfflineStorage } from '@/lib/offline';
OfflineStorage.remove('cache_key');
```
Solution: Clear specific cache keys after mutations

### 6. Storage Quota Exceeded

#### Symptoms
- Error: "QuotaExceededError"
- Can't cache new data
- App becomes slow

#### Causes & Solutions

**Too much data cached**
```javascript
// Check storage usage in DevTools
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
});
```
Solution:
1. Reduce cache duration
2. Limit cached items
3. Clear old caches regularly

**Large files being cached**
```javascript
// Don't cache large videos or files
if (request.url.includes('/large-file')) {
  return fetch(request); // Don't cache
}
```
Solution: Exclude large files from caching

**LocalStorage full**
```typescript
// LocalStorage has ~5-10MB limit
try {
  OfflineStorage.set('key', largeData);
} catch (e) {
  console.error('Storage full:', e);
}
```
Solution:
1. Clear old data
2. Use IndexedDB for large data
3. Implement LRU cache

### 7. Native App Issues

#### iOS Specific

**Service Worker not working**
```
iOS requires WKWebView with proper configuration
```
Solution: Ensure Capacitor is properly configured

**Network detection unreliable**
```typescript
// Use Capacitor Network plugin instead of navigator.onLine
import { Network } from '@capacitor/network';
const status = await Network.getStatus();
```
Solution: Already implemented in `lib/capacitor-offline.ts`

**Cache not persisting**
```
iOS may clear cache when storage is low
```
Solution:
1. Keep cache size small
2. Implement cache restoration
3. Store critical data in native storage

#### Android Specific

**WebView cache disabled**
```
Check AndroidManifest.xml for cache settings
```
Solution: Ensure WebView caching is enabled in Capacitor config

**Network permission missing**
```xml
<!-- In AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
Solution: Add network permission (should be automatic with Capacitor)

**Background sync not working**
```
Android may kill background processes
```
Solution: Process queue when app comes to foreground

### 8. Build Issues

#### Static export failing

**API routes in build**
```
Error: API routes are not supported with static export
```
Solution: API routes are automatically backed up by `mobile-build.js`

**Dynamic routes not working**
```
Error: Dynamic routes require server
```
Solution: Use static paths or implement client-side routing

**Environment variables missing**
```
Error: Environment variable not defined
```
Solution: Ensure `.env.local` is properly configured

### 9. Performance Issues

#### Slow cache lookups

**Too many cache entries**
```javascript
// Limit cache size
const MAX_CACHE_ENTRIES = 100;
```
Solution: Implement cache size limits and LRU eviction

**Large cache keys**
```typescript
// Use short, descriptive keys
cacheKey: 'events' // Good
cacheKey: 'all_events_for_user_123_with_filters' // Bad
```
Solution: Use shorter cache keys

#### Slow queue processing

**Too many queued actions**
```typescript
// Process in batches
const BATCH_SIZE = 10;
```
Solution: Process queue in batches with delays

### 10. Development Issues

#### Hot reload not working with Service Worker

**Service Worker caching dev files**
```javascript
// Disable service worker in development
if (process.env.NODE_ENV === 'development') {
  // Don't register
}
```
Solution: Service worker only registers in production build

**Changes not reflecting**
```bash
# Clear everything and rebuild
rm -rf .next out
yarn build
```
Solution: Clear build directories and rebuild

## Debugging Tools

### Browser Console Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registrations:', registrations);
});

// Check caches
caches.keys().then(keys => {
  console.log('Cache keys:', keys);
});

// Check specific cache
caches.open('mirro-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Cached URLs:', keys.map(k => k.url));
  });
});

// Check storage
navigator.storage.estimate().then(estimate => {
  console.log('Storage:', estimate);
});

// Check online status
console.log('Online:', navigator.onLine);

// Check localStorage
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('mirro_offline_')) {
    console.log(key, localStorage.getItem(key));
  }
});
```

### Manual Testing

```typescript
// Force offline mode
import { OfflineStorage, OfflineQueue } from '@/lib/offline';

// View queue
console.log('Queue:', OfflineQueue.getAll());

// Process queue manually
await OfflineQueue.processQueue();

// Clear queue
OfflineQueue.clear();

// View cached data
console.log('Events:', OfflineStorage.get('events'));

// Clear all offline data
OfflineStorage.clear();

// Check data age
const age = OfflineStorage.getAge('events');
console.log('Cache age (ms):', age);
```

### DevTools Checklist

1. **Application Tab**
   - [ ] Service Workers: Check registration and status
   - [ ] Cache Storage: Verify cached resources
   - [ ] Local Storage: Check stored data
   - [ ] Clear Storage: Use to reset everything

2. **Network Tab**
   - [ ] Offline: Test offline mode
   - [ ] Slow 3G: Test slow connections
   - [ ] Filter: Check which requests are cached

3. **Console Tab**
   - [ ] Check for errors
   - [ ] Run debug commands
   - [ ] Monitor events

## Getting Help

### Information to Provide

When asking for help, include:

1. **Environment**
   - Platform (iOS/Android/Web)
   - Browser/OS version
   - Capacitor version

2. **Error Messages**
   - Full error text
   - Stack trace
   - Console logs

3. **Steps to Reproduce**
   - What you did
   - What you expected
   - What actually happened

4. **Debug Info**
   ```javascript
   // Run this and include output
   console.log({
     online: navigator.onLine,
     serviceWorker: 'serviceWorker' in navigator,
     caches: await caches.keys(),
     storage: await navigator.storage.estimate(),
     queue: OfflineQueue.getAll()
   });
   ```

### Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Service Worker API**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Cache API**: https://developer.mozilla.org/en-US/docs/Web/API/Cache
- **Network Information API**: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API

---

Still having issues? Check the other documentation files or open an issue with the debug information above.
