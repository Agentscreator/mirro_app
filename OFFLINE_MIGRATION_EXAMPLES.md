# Offline Migration Examples

Examples of how to update existing components to support offline mode.

## Example 1: Event List Component

### Before (Online Only)
```typescript
'use client';

import { useEffect, useState } from 'react';

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### After (Offline Support)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { offlineFetch } from '@/lib/offline-fetch';
import { useOnlineStatus } from '@/lib/offline';

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await offlineFetch('/api/events', {
          method: 'GET',
          cacheKey: 'events_list',
          cacheDuration: 5 * 60 * 1000 // 5 minutes
        });
        
        const isCache = response.headers.get('X-Offline-Cache') === 'true';
        const data = await response.json();
        
        setEvents(data);
        setIsFromCache(isCache);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isFromCache && (
        <div className="text-sm text-yellow-600 mb-2">
          Showing cached data (offline mode)
        </div>
      )}
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

## Example 2: Create Event Form

### Before (Online Only)
```typescript
'use client';

import { useState } from 'react';

export function CreateEventForm() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (response.ok) {
        alert('Event created!');
        setTitle('');
      }
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
      />
      <button type="submit" disabled={loading}>
        Create Event
      </button>
    </form>
  );
}
```

### After (Offline Support with Queueing)
```typescript
'use client';

import { useState } from 'react';
import { offlineFetch } from '@/lib/offline-fetch';
import { useOnlineStatus } from '@/lib/offline';

export function CreateEventForm() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const isOnline = useOnlineStatus();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await offlineFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
        queueIfOffline: true // Queue if offline
      });

      const data = await response.json();

      if (data.queued) {
        alert('Event will be created when you\'re back online');
      } else {
        alert('Event created!');
      }
      
      setTitle('');
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && (
        <div className="text-sm text-yellow-600 mb-2">
          You're offline. Event will be created when connection is restored.
        </div>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
      />
      <button type="submit" disabled={loading}>
        {isOnline ? 'Create Event' : 'Queue Event'}
      </button>
    </form>
  );
}
```

## Example 3: User Settings

### Before (Online Only)
```typescript
'use client';

import { useEffect, useState } from 'react';

export function UserSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  async function updateSettings(newSettings: any) {
    await fetch('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify(newSettings)
    });
  }

  if (!settings) return <div>Loading...</div>;

  return <div>Settings UI</div>;
}
```

### After (Offline Support with Local Storage)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { offlineFetch } from '@/lib/offline-fetch';
import { OfflineStorage } from '@/lib/offline';

export function UserSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      // Try to load from cache first for instant display
      const cached = OfflineStorage.get('user_settings');
      if (cached) {
        setSettings(cached);
      }

      // Then fetch fresh data
      try {
        const response = await offlineFetch('/api/user/settings', {
          method: 'GET',
          cacheKey: 'user_settings',
          cacheDuration: 60 * 60 * 1000 // 1 hour
        });
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        // If fetch fails and we have cache, keep using it
        if (!cached) {
          console.error('Failed to load settings:', err);
        }
      }
    }

    loadSettings();
  }, []);

  async function updateSettings(newSettings: any) {
    // Optimistically update UI
    setSettings(newSettings);
    
    // Save to local storage immediately
    OfflineStorage.set('user_settings', newSettings);

    // Sync with server (will queue if offline)
    try {
      await offlineFetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
        queueIfOffline: true
      });
    } catch (err) {
      console.error('Failed to sync settings:', err);
    }
  }

  if (!settings) return <div>Loading...</div>;

  return <div>Settings UI</div>;
}
```

## Example 4: Image Upload with Offline Support

### Before (Online Only)
```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

### After (Offline Support with Local Preview)
```typescript
import { OfflineStorage } from '@/lib/offline';

async function uploadImage(file: File) {
  // Create local preview immediately
  const reader = new FileReader();
  const localUrl = await new Promise<string>((resolve) => {
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  // Store locally with temporary ID
  const tempId = `temp_${Date.now()}`;
  OfflineStorage.set(`image_${tempId}`, {
    url: localUrl,
    file: file.name,
    pending: true
  });

  // Try to upload
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    // Replace temp with real data
    OfflineStorage.remove(`image_${tempId}`);
    OfflineStorage.set(`image_${data.id}`, {
      url: data.url,
      file: file.name,
      pending: false
    });

    return data;
  } catch (err) {
    // If offline, return temp data
    if (!navigator.onLine) {
      return {
        id: tempId,
        url: localUrl,
        pending: true
      };
    }
    throw err;
  }
}
```

## Best Practices

1. **Always provide feedback** when using cached data
2. **Use optimistic updates** for better UX
3. **Queue mutations** when offline
4. **Cache GET requests** with appropriate duration
5. **Store critical data** in OfflineStorage
6. **Show offline indicator** in UI
7. **Handle sync conflicts** gracefully
8. **Test offline scenarios** thoroughly

## Common Patterns

### Pattern 1: Instant Load with Background Refresh
```typescript
// Show cached data immediately, refresh in background
const cached = OfflineStorage.get('data');
if (cached) setData(cached);

offlineFetch('/api/data', { cacheKey: 'data' })
  .then(res => res.json())
  .then(setData);
```

### Pattern 2: Optimistic UI Updates
```typescript
// Update UI immediately, sync in background
setData(newData);
OfflineStorage.set('data', newData);
offlineFetch('/api/data', { 
  method: 'PUT', 
  body: JSON.stringify(newData),
  queueIfOffline: true 
});
```

### Pattern 3: Conditional Features
```typescript
const isOnline = useOnlineStatus();

return (
  <div>
    <button disabled={!isOnline}>
      Upload Photo (requires connection)
    </button>
    <button>
      View Events (works offline)
    </button>
  </div>
);
```
