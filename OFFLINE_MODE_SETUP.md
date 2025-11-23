# Offline Mode Setup for Native Apps

Your MirroSocial app now supports full offline functionality for iOS and Android native apps.

## What's Been Implemented

### 1. Service Worker (`public/sw.js`)
- Caches critical assets on install
- Network-first strategy for API calls with cache fallback
- Cache-first strategy for static assets
- Automatic cache management and cleanup

### 2. Offline Storage (`lib/offline.ts`)
- `OfflineStorage`: Local storage manager with timestamps
- `OfflineQueue`: Queue system for actions performed while offline
- `useOnlineStatus`: React hook to detect connectivity status
- Automatic service worker registration

### 3. Offline-Aware Fetch (`lib/offline-fetch.ts`)
- `offlineFetch`: Fetch wrapper with caching and queueing
- `useOfflineFetch`: React hook for data fetching with offline support
- Automatic request queueing when offline
- Cache expiration management

### 4. UI Components
- `OfflineIndicator`: Shows banner when user is offline
- `ServiceWorkerRegistration`: Handles SW registration and queue processing
- Integrated into root layout

### 5. PWA Manifest (`public/manifest.json`)
- App metadata for installation
- Icon configuration
- Display and orientation settings

### 6. Updated Capacitor Config
- Removed server URL to use local files
- Enabled offline navigation
- Added CapacitorHttp plugin

## How to Build for Native Apps

### Build the app:
```bash
yarn mobile:build
```

This will:
1. Build Next.js in static export mode
2. Generate the `out` directory with all assets
3. Include service worker and manifest

### Sync with native platforms:
```bash
npx cap sync
```

### Open in native IDEs:
```bash
# For Android
yarn mobile:android

# For iOS
yarn mobile:ios
```

## How Offline Mode Works

### On First Launch
1. App loads from local files (no internet required)
2. Service worker installs and caches critical assets
3. User can navigate and view cached content

### When Online
1. All API calls go through network
2. Successful responses are cached
3. Static assets are cached for offline use
4. Queued actions are processed

### When Offline
1. API calls return cached data if available
2. POST/PUT/DELETE actions are queued
3. User sees offline indicator
4. Navigation works with cached pages

### When Back Online
1. Offline indicator disappears
2. Queued actions are automatically processed
3. Fresh data is fetched and cached
4. App syncs with server

## Using Offline Features in Your Code

### Check Online Status
```typescript
import { useOnlineStatus } from '@/lib/offline';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? 'Connected' : 'Offline'}
    </div>
  );
}
```

### Offline-Aware Fetch
```typescript
import { offlineFetch } from '@/lib/offline-fetch';

async function loadEvents() {
  const response = await offlineFetch('/api/events', {
    method: 'GET',
    cacheKey: 'events',
    cacheDuration: 10 * 60 * 1000 // 10 minutes
  });
  
  return response.json();
}
```

### Queue Actions When Offline
```typescript
import { offlineFetch } from '@/lib/offline-fetch';

async function createEvent(data: any) {
  const response = await offlineFetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
    queueIfOffline: true // Will queue if offline
  });
  
  return response.json();
}
```

### Use Offline Storage
```typescript
import { OfflineStorage } from '@/lib/offline';

// Save data
OfflineStorage.set('user_preferences', { theme: 'dark' });

// Get data
const prefs = OfflineStorage.get('user_preferences');

// Check age
const age = OfflineStorage.getAge('user_preferences');
if (age && age > 24 * 60 * 60 * 1000) {
  // Data is older than 24 hours
}
```

## Testing Offline Mode

### In Browser
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Reload page - should work from cache
4. Try navigating - should work
5. Try API calls - should return cached data

### In Native App
1. Build and install app on device
2. Use app while online (caches data)
3. Enable airplane mode
4. App should continue working
5. Perform actions (they'll be queued)
6. Disable airplane mode
7. Actions should sync automatically

## Customization

### Adjust Cache Duration
Edit `lib/offline-fetch.ts`:
```typescript
cacheDuration: 30 * 60 * 1000 // 30 minutes
```

### Add More Precached Assets
Edit `public/sw.js`:
```javascript
const PRECACHE_ASSETS = [
  '/',
  '/login',
  '/events',
  // Add more routes
];
```

### Customize Offline Indicator
Edit `components/OfflineIndicator.tsx` to change styling or message.

## Important Notes

1. **First Load**: App must be loaded once while online to cache assets
2. **Storage Limits**: Browser storage has limits (~5-10MB typically)
3. **Cache Invalidation**: Caches are versioned and auto-cleaned
4. **Queue Processing**: Queued actions process in order when online
5. **API Routes**: Only same-origin API calls are cached

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (or localhost)
- Clear browser cache and reload

### Offline Mode Not Working
- Check if service worker is active (DevTools → Application → Service Workers)
- Verify assets are cached (DevTools → Application → Cache Storage)
- Check network tab for failed requests

### Queued Actions Not Processing
- Check browser console for errors
- Verify `OfflineQueue.processQueue()` is called on online event
- Check localStorage for queued items

## Next Steps

Consider adding:
- Background sync API for better queue processing
- IndexedDB for larger data storage
- Conflict resolution for offline edits
- Optimistic UI updates
- Offline-first data architecture with sync
