'use client';

import { useEffect } from 'react';
import { registerServiceWorker, OfflineQueue } from '@/lib/offline';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Process offline queue when coming back online
    const handleOnline = () => {
      OfflineQueue.processQueue();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
