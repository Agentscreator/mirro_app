import { useEffect, useState } from 'react';
import { CapacitorOffline } from './capacitor-offline';

/**
 * Hook to detect online/offline status
 * Works with both web and native Capacitor apps
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize Capacitor network monitoring
    CapacitorOffline.initialize();

    // Check initial status
    if (CapacitorOffline.isNative()) {
      CapacitorOffline.getStatus().then(setIsOnline);
    } else {
      setIsOnline(navigator.onLine);
    }

    // Add Capacitor listener for native apps
    const unsubscribe = CapacitorOffline.addListener(setIsOnline);

    // Add browser listeners for web
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Local storage manager for offline data
 */
export class OfflineStorage {
  private static prefix = 'mirro_offline_';

  static set(key: string, value: any): void {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now()
      });
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      console.error('Failed to save to offline storage:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const { data } = JSON.parse(item);
      return data as T;
    } catch (error) {
      console.error('Failed to read from offline storage:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  static getAge(key: string): number | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const { timestamp } = JSON.parse(item);
      return Date.now() - timestamp;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Queue for offline actions
 */
export class OfflineQueue {
  private static queueKey = 'action_queue';

  static add(action: {
    type: string;
    endpoint: string;
    data: any;
    timestamp: number;
  }): void {
    const queue = this.getAll();
    queue.push(action);
    OfflineStorage.set(this.queueKey, queue);
  }

  static getAll(): any[] {
    return OfflineStorage.get(this.queueKey) || [];
  }

  static remove(index: number): void {
    const queue = this.getAll();
    queue.splice(index, 1);
    OfflineStorage.set(this.queueKey, queue);
  }

  static clear(): void {
    OfflineStorage.remove(this.queueKey);
  }

  static async processQueue(): Promise<void> {
    const queue = this.getAll();
    
    for (let i = queue.length - 1; i >= 0; i--) {
      const action = queue[i];
      try {
        const response = await fetch(action.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });

        if (response.ok) {
          this.remove(i);
        }
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
  }
}

/**
 * Register service worker
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}
