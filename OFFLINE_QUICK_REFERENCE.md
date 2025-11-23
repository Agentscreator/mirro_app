# Offline Mode - Quick Reference

## 🚀 Build & Deploy

```bash
# Build for native apps with offline support
yarn mobile:build

# Sync with native platforms
npx cap sync

# Open in native IDE
yarn mobile:android  # or mobile:ios
```

## 📱 What Works Offline

✅ **Fully Offline**
- App navigation
- Viewing cached events
- Viewing cached user data
- UI interactions
- Local image previews

⚠️ **Queued When Offline**
- Creating events
- Updating events
- Deleting events
- Uploading media
- Sending messages

❌ **Requires Connection**
- Initial login
- Real-time messaging
- Live video calls
- Fresh data sync

## 🔧 Quick Code Snippets

### Check if Online
```typescript
import { useOnlineStatus } from '@/lib/offline';

const isOnline = useOnlineStatus();
```

### Fetch with Cache
```typescript
import { offlineFetch } from '@/lib/offline-fetch';

const response = await offlineFetch('/api/events', {
  cacheKey: 'events',
  cacheDuration: 5 * 60 * 1000 // 5 min
});
```

### Queue Action
```typescript
await offlineFetch('/api/events', {
  method: 'POST',
  body: JSON.stringify(data),
  queueIfOffline: true
});
```

### Save Locally
```typescript
import { OfflineStorage } from '@/lib/offline';

OfflineStorage.set('key', data);
const data = OfflineStorage.get('key');
```

## 🧪 Testing

### Browser
1. Open DevTools → Network
2. Select "Offline"
3. Test app functionality

### Device
1. Install app
2. Use while online (caches data)
3. Enable airplane mode
4. Test offline features

## 📊 Storage Limits

- **Service Worker Cache**: ~50MB
- **LocalStorage**: ~5-10MB
- **Total**: Varies by device

## 🔄 Cache Strategy

| Resource Type | Strategy | Cache Duration |
|--------------|----------|----------------|
| API Calls | Network First | 5-10 minutes |
| Static Assets | Cache First | Until updated |
| Images | Cache First | Permanent |
| HTML Pages | Network First | Until updated |

## 🎯 Key Files

```
public/
  ├── sw.js                    # Service worker
  └── manifest.json            # PWA manifest

lib/
  ├── offline.ts               # Core offline utilities
  └── offline-fetch.ts         # Fetch wrapper

components/
  ├── OfflineIndicator.tsx     # UI indicator
  └── ServiceWorkerRegistration.tsx

capacitor.config.ts            # Native config
```

## 💡 Tips

1. **First load must be online** to cache assets
2. **Test offline scenarios** during development
3. **Show feedback** when using cached data
4. **Handle queue failures** gracefully
5. **Monitor storage usage** to avoid limits
6. **Clear old caches** periodically

## 🐛 Troubleshooting

**Service worker not working?**
- Check HTTPS (or localhost)
- Clear cache and reload
- Check DevTools → Application → Service Workers

**Offline mode not activating?**
- Verify service worker is registered
- Check cache storage in DevTools
- Ensure assets are being cached

**Queued actions not syncing?**
- Check browser console for errors
- Verify online event listener
- Check localStorage for queue

## 📚 Documentation

- Full Setup: `OFFLINE_MODE_SETUP.md`
- Migration Examples: `OFFLINE_MIGRATION_EXAMPLES.md`
- Capacitor Docs: https://capacitorjs.com
- Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
