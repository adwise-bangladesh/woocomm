import { useCallback } from 'react';
import { facebookPixel, trackProductView, trackAddToCart, trackCheckoutInitiated, trackPurchase } from '@/lib/facebook-pixel';

export const useFacebookPixel = () => {
  // NO initialization here - handled by FacebookPixelProvider
  // NO TimeOnSite tracking here - handled by FacebookPixelProvider
  // NO PageView tracking here - handled by FacebookPixelProvider

  // Helper functions for tracking - these are the ONLY tracking functions
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
