import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { facebookPixel, trackProductView, trackAddToCart, trackCheckoutInitiated, trackPurchase } from '@/lib/facebook-pixel';

export const useFacebookPixel = () => {
  const pathname = usePathname();

  // Initialize Facebook Pixel on mount
  useEffect(() => {
    facebookPixel.initialize();
  }, []);

  // PageView tracking is handled by FacebookPixelProvider
  // No need to track here to avoid duplicates

  // Track time on site
  useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds
      facebookPixel.trackTimeOnSite(timeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Helper functions for tracking
  const trackProduct = useCallback((product: any) => {
    trackProductView(product);
  }, []);

  const trackCartAdd = useCallback((product: any, quantity: number = 1) => {
    trackAddToCart(product, quantity);
  }, []);

  const trackCheckout = useCallback((items: any[], totalValue: number) => {
    trackCheckoutInitiated(items, totalValue);
  }, []);

  const trackOrder = useCallback((orderData: any, items: any[]) => {
    trackPurchase(orderData, items);
  }, []);

  const trackCategory = useCallback((categoryName: string, categoryId?: string) => {
    facebookPixel.trackCategoryView(categoryName, categoryId);
  }, []);

  const trackSearch = useCallback((searchTerm: string) => {
    facebookPixel.trackSearch(searchTerm);
  }, []);

  const trackCustom = useCallback((eventName: string, eventData: any = {}) => {
    facebookPixel.trackCustomEvent(eventName, eventData);
  }, []);

  const trackViewCheckout = useCallback((checkoutData: any) => {
    facebookPixel.trackViewCheckout(checkoutData);
  }, []);

  return {
    trackProduct,
    trackCartAdd,
    trackCheckout,
    trackOrder,
    trackCategory,
    trackSearch,
    trackCustom,
    trackViewCheckout,
    getPixelIds: facebookPixel.getPixelIds
  };
};
