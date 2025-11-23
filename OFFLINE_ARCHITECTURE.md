# Offline Mode Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MirroSocial App                         │
│                    (React/Next.js)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Offline Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │OfflineStorage│  │OfflineQueue  │  │offlineFetch  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│    Service Worker         │   │   LocalStorage            │
│    (Cache Management)     │   │   (Data Persistence)      │
└───────────────────────────┘   └───────────────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────────────────────────────────────┐
│                    Cache Storage                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Static Cache │  │ Runtime Cache│  │  API Cache   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                      Network                              │
│              (When Available)                             │
└───────────────────────────────────────────────────────────┘
```

## Data Flow

### Online Mode

```
User Action
    │
    ▼
Component
    │
    ▼
offlineFetch()
    │
    ├─→ Check Network Status (Online)
    │
    ▼
Network Request
    │
    ├─→ Success
    │   │
    │   ├─→ Return Response
    │   │
    │   └─→ Cache Response (if GET)
    │
    └─→ Failure
        │
        └─→ Return Cached Data (if available)
```

### Offline Mode

```
User Action
    │
    ▼
Component
    │
    ▼
offlineFetch()
    │
    ├─→ Check Network Status (Offline)
    │
    ├─→ GET Request?
    │   │
    │   ├─→ Yes: Return Cached Data
    │   │
    │   └─→ No: Queue Action
    │
    └─→ Show Offline Feedback
```

### Sync Process

```
Network Status Change (Offline → Online)
    │
    ▼
Online Event Listener
    │
    ▼
OfflineQueue.processQueue()
    │
    ├─→ Get All Queued Actions
    │
    ├─→ For Each Action:
    │   │
    │   ├─→ Send Network Request
    │   │
    │   ├─→ Success?
    │   │   │
    │   │   ├─→ Yes: Remove from Queue
    │   │   │
    │   │   └─→ No: Keep in Queue
    │   │
    │   └─→ Next Action
    │
    └─→ Update UI
```

## Component Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    App Layout                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │         ServiceWorkerRegistration                 │ │
│  │  - Registers service worker                       │ │
│  │  - Sets up online/offline listeners               │ │
│  │  - Processes queue on reconnect                   │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │         OfflineIndicator                          │ │
│  │  - Shows when offline                             │ │
│  │  - Uses useOnlineStatus hook                      │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Page Content                              │ │
│  │  - Uses offlineFetch for API calls               │ │
│  │  - Shows cached data when offline                 │ │
│  │  - Queues actions when offline                    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Service Worker Lifecycle

```
Install
    │
    ├─→ Cache Critical Assets
    │   - HTML pages
    │   - CSS files
    │   - JavaScript bundles
    │   - Images
    │
    └─→ Skip Waiting

Activate
    │
    ├─→ Clean Old Caches
    │
    └─→ Claim Clients

Fetch
    │
    ├─→ API Request?
    │   │
    │   ├─→ Network First
    │   │   - Try network
    │   │   - Cache response
    │   │   - Fallback to cache
    │   │
    │   └─→ Return Response
    │
    └─→ Static Asset?
        │
        ├─→ Cache First
        │   - Check cache
        │   - Fallback to network
        │   - Cache response
        │
        └─→ Return Response
```

## Storage Strategy

### Cache Storage (Service Worker)

```
┌─────────────────────────────────────────────────────┐
│                  mirro-v1                           │
│  (Static Assets - Precached)                        │
│  - /                                                │
│  - /login                                           │
│  - /app-icon.png                                    │
│  - /placeholder.svg                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              mirro-runtime-v1                       │
│  (Dynamic Content - Runtime Cached)                 │
│  - API responses                                    │
│  - Images                                           │
│  - Other assets                                     │
└─────────────────────────────────────────────────────┘
```

### LocalStorage

```
┌─────────────────────────────────────────────────────┐
│              mirro_offline_*                        │
│  (Structured Data)                                  │
│                                                     │
│  mirro_offline_events                              │
│  {                                                  │
│    data: [...],                                     │
│    timestamp: 1234567890                            │
│  }                                                  │
│                                                     │
│  mirro_offline_user_settings                       │
│  {                                                  │
│    data: {...},                                     │
│    timestamp: 1234567890                            │
│  }                                                  │
│                                                     │
│  mirro_offline_action_queue                        │
│  [                                                  │
│    {                                                │
│      type: 'POST',                                  │
│      endpoint: '/api/events',                       │
│      data: {...},                                   │
│      timestamp: 1234567890                          │
│    }                                                │
│  ]                                                  │
└─────────────────────────────────────────────────────┘
```

## Network Detection

### Web Platform

```
Browser
    │
    ├─→ navigator.onLine
    │
    ├─→ 'online' event
    │
    └─→ 'offline' event
```

### Native Platform (Capacitor)

```
Capacitor Network Plugin
    │
    ├─→ Network.getStatus()
    │   - connected: boolean
    │   - connectionType: 'wifi' | 'cellular' | 'none'
    │
    └─→ Network.addListener('networkStatusChange')
        - Fires on network changes
        - More reliable than browser events
```

## Cache Strategy Matrix

| Resource Type | Strategy | Cache Duration | Fallback |
|--------------|----------|----------------|----------|
| HTML Pages | Network First | Until SW update | Cached version |
| API Calls | Network First | 5-10 minutes | Cached version |
| Static Assets | Cache First | Permanent | Network |
| Images | Cache First | Permanent | Network |
| User Data | Network First | 1 hour | Cached version |

## Error Handling

```
Request Failed
    │
    ├─→ Network Error?
    │   │
    │   ├─→ Yes: Check if Offline
    │   │   │
    │   │   ├─→ Yes: Return Cached Data or Queue
    │   │   │
    │   │   └─→ No: Throw Error
    │   │
    │   └─→ No: Throw Error
    │
    └─→ Show Error to User
```

## Performance Considerations

### Cache Size Management

```
Service Worker Activate Event
    │
    ├─→ Get All Cache Names
    │
    ├─→ Filter Old Caches
    │   - Not matching current version
    │
    ├─→ Delete Old Caches
    │
    └─→ Claim Clients
```

### Storage Quota

```
Available Storage
    │
    ├─→ Cache Storage: ~50MB
    │   - Service Worker caches
    │   - Managed automatically
    │
    └─→ LocalStorage: ~5-10MB
        - Structured data
        - Manual management required
```

## Security Considerations

1. **HTTPS Required**
   - Service Workers only work on HTTPS
   - Or localhost for development

2. **Same-Origin Policy**
   - Only cache same-origin requests
   - Cross-origin requires CORS

3. **Data Validation**
   - Validate cached data before use
   - Check timestamps for freshness

4. **Sensitive Data**
   - Don't cache sensitive information
   - Clear caches on logout

## Monitoring & Debugging

### Browser DevTools

```
Application Tab
    │
    ├─→ Service Workers
    │   - Registration status
    │   - Update/Unregister
    │
    ├─→ Cache Storage
    │   - View cached resources
    │   - Clear caches
    │
    └─→ Local Storage
        - View stored data
        - Clear storage
```

### Console Logging

```
Service Worker Events
    │
    ├─→ Install: "Service Worker registered"
    ├─→ Activate: "Service Worker activated"
    ├─→ Fetch: "Serving from cache" / "Fetching from network"
    └─→ Error: "Service Worker error: ..."

Offline Events
    │
    ├─→ Online: "Back online, processing queue"
    ├─→ Offline: "Offline mode activated"
    └─→ Queue: "Action queued: ..."
```

## Deployment Flow

```
Development
    │
    ├─→ yarn dev
    │   - Service Worker disabled
    │   - Hot reload enabled
    │
    └─→ Test offline features manually

Build
    │
    ├─→ yarn mobile:build
    │   - Static export
    │   - Service Worker included
    │   - Manifest included
    │
    └─→ out/ directory created

Sync
    │
    ├─→ npx cap sync
    │   - Copy to iOS
    │   - Copy to Android
    │
    └─→ Native projects updated

Deploy
    │
    ├─→ iOS: Xcode → Build → Archive
    │
    └─→ Android: Android Studio → Build → Generate APK/Bundle
```

---

This architecture provides a robust offline-first experience while maintaining compatibility with both web and native platforms.
