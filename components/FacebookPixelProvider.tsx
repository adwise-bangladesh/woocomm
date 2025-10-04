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
    if (!facebookPixel.isReady()) {
      facebookPixel.initialize();
    }
  }, []);

  useEffect(() => {
    // Track page view on route change
    facebookPixel.trackPageView();
  }, [pathname]);

  // Track Time on Site (custom event)
  useEffect(() => {
    const startTime = Date.now();
    let timer: NodeJS.Timeout;

    const trackTimeOnSite = () => {
      const duration = Date.now() - startTime; // in milliseconds
      const timeSpent = Math.round(duration / 1000); // in seconds
      facebookPixel.trackTimeOnSite(timeSpent);
    };

    // Track every 30 seconds
    timer = setInterval(trackTimeOnSite, 30000);

    // Track on unmount/page close
    window.addEventListener('beforeunload', trackTimeOnSite);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', trackTimeOnSite);
    };
  }, []);

  return <>{children}</>;
}
