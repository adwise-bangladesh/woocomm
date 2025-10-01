/**
 * Performance Optimization Utilities
 * Provides memoization and optimization helpers
 */

import { useMemo, useCallback } from 'react';

// Memoized price formatting
export const usePriceFormatter = () => {
  return useCallback((price: string | null | undefined): string => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num) || num < 0) return 'Tk 0';
    return `Tk ${num.toFixed(0)}`;
  }, []);
};

// Memoized discount calculation
export const useDiscountCalculator = () => {
  return useCallback((salePrice: string | null | undefined, regularPrice: string | null | undefined): number | null => {
    if (!salePrice || !regularPrice) return null;
    
    const regular = parseFloat(regularPrice.replace(/[^0-9.-]+/g, ''));
    const sale = parseFloat(salePrice.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(regular) || isNaN(sale) || regular <= 0 || sale <= 0 || sale >= regular) {
      return null;
    }
    
    const discount = Math.round(((regular - sale) / regular) * 100);
    return discount > 0 && discount < 100 ? discount : null;
  }, []);
};

// Memoized review stats generator
export const useReviewStatsGenerator = () => {
  return useCallback((productId: string): { rating: number; count: number } => {
    const productIdHash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
    const count = 700 + (productIdHash % 1800);
    return { rating, count };
  }, []);
};

// Debounce utility for search and other inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Image preloader utility
export const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(
    imageUrls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      })
    )
  );
};

// Environment-aware logging
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
