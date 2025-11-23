import { useEffect, useState } from 'react';
import { OfflineStorage, OfflineQueue } from './offline';

interface OfflineFetchOptions extends RequestInit {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  queueIfOffline?: boolean;
}

/**
 * Fetch wrapper with offline support
 */
export async function offlineFetch(
  url: string,
  options: OfflineFetchOptions = {}
): Promise<Response> {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    queueIfOffline = false,
    ...fetchOptions
  } = options;

  // Try network first
  try {
    const response = await fetch(url, fetchOptions);

    // Cache successful GET requests
    if (response.ok && fetchOptions.method === 'GET' && cacheKey) {
      const data = await response.clone().json();
      OfflineStorage.set(cacheKey, data);
    }

    return response;
  } catch (error) {
    // Network failed - check if we're offline
    if (!navigator.onLine) {
      // For GET requests, try to return cached data
      if (fetchOptions.method === 'GET' && cacheKey) {
        const cached = OfflineStorage.get(cacheKey);
        const age = OfflineStorage.getAge(cacheKey);

        if (cached && age && age < cacheDuration) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Offline-Cache': 'true'
            }
          });
        }
      }

      // For POST/PUT/DELETE requests, queue them if requested
      if (queueIfOffline && fetchOptions.method !== 'GET') {
        OfflineQueue.add({
          type: fetchOptions.method || 'POST',
          endpoint: url,
          data: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
          timestamp: Date.now()
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            queued: true,
            message: 'Action queued for when you\'re back online' 
          }),
          {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Re-throw if we can't handle it
    throw error;
  }
}

/**
 * Hook for offline-aware data fetching
 */
export function useOfflineFetch<T>(
  url: string,
  options: OfflineFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await offlineFetch(url, options);
        const isCache = response.headers.get('X-Offline-Cache') === 'true';
        const json = await response.json();

        if (mounted) {
          setData(json);
          setIsFromCache(isCache);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading, error, isFromCache };
}
