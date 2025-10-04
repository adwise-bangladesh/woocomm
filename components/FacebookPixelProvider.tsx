'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { facebookPixel } from '@/lib/facebook-pixel';

interface FacebookPixelProviderProps {
  children: React.ReactNode;
}

export default function FacebookPixelProvider({ children }: FacebookPixelProviderProps) {
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const pageViewTrackedRef = useRef(new Set<string>());
  const timeOnSiteTrackedRef = useRef(false);

  // Initialize Facebook Pixel only once - this is the ONLY place pixel should be initialized
  useEffect(() => {
    const initializePixel = async () => {
      if (!initializedRef.current && !facebookPixel.isReady()) {
        await facebookPixel.initialize();
        initializedRef.current = true;
      }
    };
    
    initializePixel();
  }, []);

  // Track page view on route change with enhanced duplicate prevention
  useEffect(() => {
    const trackPageView = () => {
      if (facebookPixel.isReady()) {
        const pageKey = `pageview_${pathname}`;
        
        // Check if this page view was already tracked
        if (!pageViewTrackedRef.current.has(pageKey)) {
          facebookPixel.trackPageView();
          pageViewTrackedRef.current.add(pageKey);
        }
      }
    };

    // Small delay to ensure pixel is initialized
    setTimeout(trackPageView, 100);
  }, [pathname]);

  // Track Time on Site (custom event) - SINGLE tracking point
  useEffect(() => {
    const startTime = Date.now();

    const trackTimeOnSite = () => {
      if (!timeOnSiteTrackedRef.current) {
        const duration = Date.now() - startTime;
        const timeSpent = Math.round(duration / 1000);
        
        if (timeSpent > 10) { // Only track if user spent more than 10 seconds
          facebookPixel.trackTimeOnSite(timeSpent);
          timeOnSiteTrackedRef.current = true;
        }
      }
    };

    // Track time on site after 30 seconds
    const timer = setTimeout(trackTimeOnSite, 30000);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
