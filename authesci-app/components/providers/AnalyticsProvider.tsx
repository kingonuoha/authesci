"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const BATCH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface PageViewEvent {
  path: string;
  timestamp: string;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageViewQueue = useRef<PageViewEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to send the batched data
  const sendBatch = useCallback(() => {
    if (pageViewQueue.current.length === 0) {
      return;
    }

    const data = JSON.stringify(pageViewQueue.current);
    // Use navigator.sendBeacon for reliable sending, especially on page unload
    if (navigator.sendBeacon('/api/analytics', data)) {
      console.log(`Analytics: Sent ${pageViewQueue.current.length} events.`);
      pageViewQueue.current = []; // Clear the queue after successful send
    } else {
      console.warn('Analytics: Failed to send beacon. Data might not be sent.');
      // If sendBeacon fails, try a fetch request as a fallback (less reliable on unload)
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true, // Hint to browser to keep request alive even if page unloads
      })
      .then(response => {
        if (response.ok) {
          console.log(`Analytics: Fallback fetch sent ${pageViewQueue.current.length} events.`);
          pageViewQueue.current = [];
        } else {
          console.error('Analytics: Fallback fetch failed.', response.statusText);
        }
      })
      .catch(error => {
        console.error('Analytics: Fallback fetch error:', error);
      });
    }
  }, []);

  // Record a page view event
  const recordPageView = useCallback((path: string) => {
    const event: PageViewEvent = {
      path,
      timestamp: new Date().toISOString(),
    };
    pageViewQueue.current.push(event);
    console.log('Analytics: Recorded event:', event);
  }, []);

  // Effect for initial setup and cleanup
  useEffect(() => {
    // Start interval for periodic sending
    intervalRef.current = setInterval(sendBatch, BATCH_INTERVAL_MS);

    // Event listener for tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab is hidden, send data immediately
        sendBatch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Event listener for page unload
    const handleBeforeUnload = () => {
      // Attempt to send any remaining data before page closes
      sendBatch();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Ensure any remaining data is sent on component unmount (e.g., SPA navigation)
      sendBatch();
    };
  }, [sendBatch]); // Dependency on sendBatch for useCallback

  // Effect to record page views on pathname change
  useEffect(() => {
    if (pathname) {
      recordPageView(pathname);
    }
  }, [pathname, recordPageView]);

  return <>{children}</>;
}
