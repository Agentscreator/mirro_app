import { useEffect } from 'react';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { useRouter } from 'next/navigation';

export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    // Handle app launch from deep link
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);
      
      // Extract event ID from query parameter
      const eventId = url.searchParams.get('event');
      
      if (eventId) {
        // Navigate to home with event parameter
        router.push(`/?event=${eventId}`);
      } else {
        // Navigate to the path from the URL
        const path = url.pathname + url.search;
        router.push(path || '/');
      }
    });

    // Check if app was launched with a URL
    CapacitorApp.getLaunchUrl().then((result) => {
      if (result?.url) {
        const url = new URL(result.url);
        const eventId = url.searchParams.get('event');
        
        if (eventId) {
          router.push(`/?event=${eventId}`);
        }
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [router]);
}
