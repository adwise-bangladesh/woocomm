'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { facebookPixel } from '@/lib/facebook-pixel';

interface FacebookPixelProviderProps {
  children: React.ReactNode;
}

export default function FacebookPixelProvider({ children }: FacebookPixelProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Facebook Pixel only once
    const initializePixel = async () => {
      if (!facebookPixel.isReady()) {
        await facebookPixel.initialize();
      }
    };
    
    initializePixel();
  }, []);

  useEffect(() => {
    // Track page view on route change with proper timing
    const trackPageView = () => {
      if (facebookPixel.isReady()) {
        facebookPixel.trackPageView();
      } else {
        // If pixel is not ready, wait a bit and try again
        setTimeout(() => {
          if (facebookPixel.isReady()) {
            facebookPixel.trackPageView();
          }
        }, 1000);
      }
    };

    // Small delay to ensure pixel is initialized
    setTimeout(trackPageView, 100);
  }, [pathname]);

  // Track Time on Site (custom event)
  useEffect(() => {
    const startTime = Date.now();

    const trackTimeOnSite = () => {
      const duration = Date.now() - startTime; // in milliseconds
      const timeSpent = Math.round(duration / 1000); // in seconds
      facebookPixel.trackTimeOnSite(timeSpent);
    };

    // Track every 30 seconds
    const timer = setInterval(trackTimeOnSite, 30000);

    // Track on unmount/page close
    window.addEventListener('beforeunload', trackTimeOnSite);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', trackTimeOnSite);
    };
  }, []);

  return <>{children}</>;
}
