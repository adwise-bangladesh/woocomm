# 🔧 Facebook Pixel Duplicate Events Fix V2

## 🚨 **Issue Still Persisting**
Facebook Pixel events are still showing duplicates even after the initial fix. This suggests the duplicate prevention isn't working properly or there are multiple initialization points.

## 🔧 **Enhanced Fix - Multiple Initialization Prevention**

### **1. Fix FacebookPixelProvider Duplicate Initialization**
```typescript
// Update components/FacebookPixelProvider.tsx
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

  useEffect(() => {
    // Initialize Facebook Pixel only once
    const initializePixel = async () => {
      if (!initializedRef.current && !facebookPixel.isReady()) {
        await facebookPixel.initialize();
        initializedRef.current = true;
      }
    };
    
    initializePixel();
  }, []);

  useEffect(() => {
    // Track page view on route change with enhanced duplicate prevention
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

  // Track Time on Site (custom event) with duplicate prevention
  useEffect(() => {
    const startTime = Date.now();
    const timeOnSiteTrackedRef = useRef(false);

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
```

### **2. Enhanced FacebookPixelManager Duplicate Prevention**
```typescript
// Update lib/facebook-pixel.ts - Enhanced duplicate prevention
class FacebookPixelManager {
  private pixels: FacebookPixelConfig[] = [];
  private isInitialized = false;
  private scriptLoaded = false;
  private trackedProducts = new Set<string>();
  private trackedCheckouts = new Set<string>();
  private trackedInitiateCheckouts = new Set<string>();
  private trackedPurchases = new Set<string>();
  private trackedPageViews = new Set<string>();
  private trackedCategories = new Set<string>();
  private trackedAddToCart = new Set<string>();
  private trackedViewCart = new Set<string>();
  private trackedTimeOnSite = new Set<string>();
  private sessionId = Date.now().toString();

  // Enhanced duplicate prevention with session-based tracking
  private createEventKey(eventType: string, data: any): string {
    const timestamp = Date.now();
    const sessionKey = this.sessionId;
    
    switch (eventType) {
      case 'PageView':
        return `pageview_${data.pathname || window.location.pathname}_${sessionKey}`;
      case 'ViewContent':
        return `viewcontent_${data.content_ids?.[0]}_${sessionKey}`;
      case 'AddToCart':
        return `addtocart_${data.content_ids?.[0]}_${data.value}_${sessionKey}`;
      case 'InitiateCheckout':
        return `initiate_${data.content_ids?.join('_')}_${data.value}_${sessionKey}`;
      case 'Purchase':
        return `purchase_${data.content_ids?.join('_')}_${data.value}_${sessionKey}`;
      case 'TimeOnSite':
        return `timeonsite_${Math.floor(data.timeSpent / 60)}_${sessionKey}`;
      default:
        return `${eventType.toLowerCase()}_${JSON.stringify(data)}_${sessionKey}`;
    }
  }

  // Enhanced trackPageView with better duplicate prevention
  public trackPageView() {
    if (!this.isInitialized || !window.fbq) return;

    const pageKey = this.createEventKey('PageView', { pathname: window.location.pathname });
    
    if (this.trackedPageViews.has(pageKey)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'PageView', {}, { source: 'nextjs' });
        }
      });
      
      this.trackedPageViews.add(pageKey);
    } catch (error) {
      console.error('Failed to track PageView:', error);
    }
  }

  // Enhanced trackProductView with better duplicate prevention
  public trackProductView(product: ProductData) {
    if (!this.isInitialized || !window.fbq) return;

    const productId = product.databaseId?.toString() || product.id?.toString() || '';
    const productKey = this.createEventKey('ViewContent', { content_ids: [productId] });
    
    if (this.trackedProducts.has(productKey)) {
      return;
    }

    try {
      const price = parseFloat(product.salePrice?.replace(/[^0-9.-]+/g, '') || 
                              product.price?.replace(/[^0-9.-]+/g, '') || 
                              product.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
      
      const categoryName = product.productCategories?.nodes?.[0]?.name || '';
      
      const productData = {
        content_ids: [productId],
        content_type: 'product',
        content_name: product.name || '',
        content_category: categoryName,
        value: price,
        currency: 'BDT'
      };

      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'ViewContent', productData, { source: 'nextjs' });
        }
      });
      
      this.trackedProducts.add(productKey);
    } catch (error) {
      console.error('Failed to track ViewContent:', error);
    }
  }

  // Enhanced trackAddToCart with better duplicate prevention
  public trackAddToCart(cartData: AddToCartData) {
    if (!this.isInitialized || !window.fbq) return;

    const addToCartKey = this.createEventKey('AddToCart', cartData);
    
    if (this.trackedAddToCart.has(addToCartKey)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'AddToCart', cartData, { source: 'nextjs' });
        }
      });
      
      this.trackedAddToCart.add(addToCartKey);
    } catch (error) {
      console.error('Failed to track AddToCart:', error);
    }
  }

  // Enhanced trackTimeOnSite with better duplicate prevention
  public trackTimeOnSite(timeSpent: number) {
    if (!this.isInitialized || !window.fbq) return;

    const timeOnSiteKey = this.createEventKey('TimeOnSite', { timeSpent });
    
    if (this.trackedTimeOnSite.has(timeOnSiteKey)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('trackCustom', 'TimeOnSite', {
            time_spent_seconds: timeSpent,
            time_spent_minutes: (timeSpent / 60).toFixed(2)
          }, { source: 'nextjs' });
        }
      });
      
      this.trackedTimeOnSite.add(timeOnSiteKey);
    } catch (error) {
      console.error('Failed to track TimeOnSite:', error);
    }
  }

  // Clear all tracked events (useful for testing)
  public clearAllTracked(): void {
    this.trackedProducts.clear();
    this.trackedCheckouts.clear();
    this.trackedInitiateCheckouts.clear();
    this.trackedPurchases.clear();
    this.trackedPageViews.clear();
    this.trackedCategories.clear();
    this.trackedAddToCart.clear();
    this.trackedViewCart.clear();
    this.trackedTimeOnSite.clear();
    this.sessionId = Date.now().toString();
    console.log('Cleared all tracked events and reset session');
  }
}
```

## 🚀 **Deploy the Enhanced Fix**

### **1. Update Files**
```bash
# Update FacebookPixelProvider.tsx
# Update lib/facebook-pixel.ts with enhanced duplicate prevention
```

### **2. Clear Cache and Restart**
```bash
# Stop PM2
pm2 stop zonash-frontend

# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Rebuild application
npm run build

# Start PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### **3. Test the Fix**
```bash
# Test application
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs zonash-frontend --lines 20
```

## 🔍 **Verify Fix**

### **1. Check Browser Console**
- **Before**: "The Facebook pixel activated 2 times on this web page"
- **After**: No duplicate warnings

### **2. Test Events**
```javascript
// Open browser console and test
// Should only fire once per event type
fbq('track', 'PageView');
fbq('track', 'ViewContent', {content_ids: ['test']});
fbq('track', 'AddToCart', {content_ids: ['test'], value: 100});
```

### **3. Use Facebook Pixel Helper**
- Install Facebook Pixel Helper Chrome extension
- Check that events fire only once
- Verify no duplicate warnings

## 🚨 **If Still Having Issues**

### **1. Clear All Tracking**
```javascript
// Run in browser console
facebookPixel.clearAllTracked();
```

### **2. Clear Browser Storage**
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### **3. Check PM2 Logs**
```bash
# Check for any errors
pm2 logs zonash-frontend

# Restart if needed
pm2 restart zonash-frontend
```

---

**🎉 Enhanced Facebook Pixel duplicate prevention implemented!**
