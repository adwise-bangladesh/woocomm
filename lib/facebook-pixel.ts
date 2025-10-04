// Facebook Pixel implementation for e-commerce tracking
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface FacebookPixelConfig {
  pixelId: string;
  enabled: boolean;
}

export interface ProductData {
  content_ids: string[];
  content_type: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  currency: string;
  value: number;
  // Enhanced fields for better Facebook tracking
  content_name?: string;
  content_category?: string;
  product_price?: number;
  post_id?: string;
  post_type?: string;
  page_title?: string;
  user_role?: string;
}

export interface PurchaseData {
  content_ids: string[];
  content_type: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  currency: string;
  value: number;
  num_items: number;
}

export interface AddToCartData {
  content_ids: string[];
  content_type: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  currency: string;
  value: number;
  // Enhanced fields for better Facebook tracking
  content_name?: string;
  content_category?: string;
  product_price?: number;
  post_id?: string;
  post_type?: string;
  page_title?: string;
  user_role?: string;
}

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

  constructor() {
    this.loadPixelsFromEnv();
  }

  private loadPixelsFromEnv() {
    // Load multiple pixel IDs from environment variables
    const pixelIds = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS?.split(',') || [];
    
    this.pixels = pixelIds
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .map(id => ({
        pixelId: id,
        enabled: true
      }));

    // Also check for single pixel ID (backward compatibility)
    if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && this.pixels.length === 0) {
      this.pixels.push({
        pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        enabled: true
      });
    }

    // Fallback: hardcode the pixel ID for testing
    if (this.pixels.length === 0) {
      this.pixels.push({
        pixelId: '939261277872914',
        enabled: true
      });
    }
  }

  public async initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // Reload pixels in case env vars weren't available during construction
    this.loadPixelsFromEnv();

    if (this.pixels.length === 0) {
      console.warn('No Facebook Pixel IDs found in environment variables');
      return;
    }

    try {
      // Load Facebook Pixel script
      await this.loadFacebookPixelScript();
      
      // Initialize each pixel
      for (const pixel of this.pixels) {
        if (pixel.enabled) {
          this.initPixel(pixel.pixelId);
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Facebook Pixel:', error);
    }
  }

  private async loadFacebookPixelScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.getElementById('facebook-pixel-script');
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      // Initialize fbq function before loading script (standard Facebook Pixel format)
      if (!window.fbq) {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          t.id = 'facebook-pixel-script';
          s = b.getElementsByTagName(e)[0];
          s.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      }

      this.scriptLoaded = true;
      resolve();
    });
  }

  private initPixel(pixelId: string) {
    if (!window.fbq) {
      console.error('fbq not available for pixel initialization');
      return;
    }

    try {
      // Initialize the pixel
      window.fbq('init', pixelId);
    } catch (error) {
      console.error(`Failed to initialize pixel ${pixelId}:`, error);
    }
  }

  // Track PageView
  public trackPageView() {
    if (!this.isInitialized || !window.fbq) return;
    
    // Create a unique key for this page view session
    const pageViewKey = `pageview_${window.location.pathname}_${Date.now()}`;
    
    // Prevent duplicate tracking for the same page within a short time window
    const now = Date.now();
    const recentPageViews = Array.from(this.trackedPageViews).filter(key => {
      const timestamp = parseInt(key.split('_').pop() || '0');
      return now - timestamp < 5000; // 5 second window
    });
    
    if (recentPageViews.length > 0) {
      return;
    }
    
    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'PageView');
        }
      });
      
      // Mark as tracked with timestamp
      this.trackedPageViews.add(pageViewKey);
      
      // Clean up old entries
      this.trackedPageViews.forEach(key => {
        const timestamp = parseInt(key.split('_').pop() || '0');
        if (now - timestamp > 30000) { // Keep for 30 seconds
          this.trackedPageViews.delete(key);
        }
      });
    } catch (error) {
      console.error('Failed to track PageView:', error);
    }
  }

  // Track ViewContent
  public trackViewContent(productData: ProductData) {
    if (!this.isInitialized || !window.fbq) return;

    // Prevent duplicate tracking for the same product
    const productId = productData.content_ids[0];
    if (this.trackedProducts.has(productId)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'ViewContent', productData, { source: 'nextjs' });
        }
      });
      
      // Mark as tracked
      this.trackedProducts.add(productId);
    } catch (error) {
      console.error('Failed to track ViewContent:', error);
    }
  }

  // Track AddToCart
  public trackAddToCart(cartData: AddToCartData) {
    if (!this.isInitialized || !window.fbq) return;

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'AddToCart', cartData, { source: 'nextjs' });
        }
      });
    } catch (error) {
      console.error('Failed to track AddToCart:', error);
    }
  }

  // Track InitiateCheckout
  public trackInitiateCheckout(checkoutData: PurchaseData) {
    if (!this.isInitialized || !window.fbq) return;

    // Create a unique key for this checkout session
    const checkoutKey = `initiate_${checkoutData.content_ids?.join('_')}_${checkoutData.value}`;
    
    // Prevent duplicate tracking for the same checkout session
    if (this.trackedInitiateCheckouts.has(checkoutKey)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'InitiateCheckout', checkoutData, { source: 'nextjs' });
        }
      });
      
      // Mark as tracked
      this.trackedInitiateCheckouts.add(checkoutKey);
    } catch (error) {
      console.error('Failed to track InitiateCheckout:', error);
    }
  }

  // Track Purchase
  public trackPurchase(purchaseData: PurchaseData) {
    if (!this.isInitialized || !window.fbq) return;

    // Create a unique key for this purchase
    const purchaseKey = `purchase_${purchaseData.content_ids?.join('_')}_${purchaseData.value}`;
    
    // Prevent duplicate tracking for the same purchase
    if (this.trackedPurchases.has(purchaseKey)) {
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'Purchase', purchaseData, { source: 'nextjs' });
        }
      });
      
      // Mark as tracked
      this.trackedPurchases.add(purchaseKey);
    } catch (error) {
      console.error('Failed to track Purchase:', error);
    }
  }

  // Track Category View
  public trackCategoryView(categoryName: string, categoryId?: string) {
    if (!this.isInitialized || !window.fbq) return;

    // Create a unique key for this category view
    const categoryKey = `category_${categoryName}_${categoryId || 'no-id'}`;
    
    // Prevent duplicate tracking for the same category
    if (this.trackedCategories.has(categoryKey)) {
      return;
    }

    try {
      const categoryData = {
        content_category: categoryName,
        content_ids: categoryId ? [categoryId] : [],
        content_type: 'category'
      };

      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'ViewContent', categoryData, { source: 'nextjs' });
        }
      });
      
      // Mark as tracked
      this.trackedCategories.add(categoryKey);
    } catch (error) {
      console.error('Failed to track CategoryView:', error);
    }
  }

  // Track Search
  public trackSearch(searchTerm: string) {
    if (!this.isInitialized || !window.fbq) return;

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'Search', {
            search_string: searchTerm
          }, { source: 'nextjs' });
        }
      });
    } catch (error) {
      console.error('Failed to track Search:', error);
    }
  }

  // Track Time on Site
  public trackTimeOnSite(timeSpent: number) {
    if (!this.isInitialized || !window.fbq) return;

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('trackCustom', 'TimeOnSite', {
            time_spent_seconds: timeSpent,
            time_spent_minutes: (timeSpent / 60).toFixed(2)
          }, { source: 'nextjs' });
        }
      });
    } catch (error) {
      console.error('Failed to track TimeOnSite:', error);
    }
  }

  // Track Custom Event
  public trackCustomEvent(eventName: string, eventData: any = {}) {
    if (!this.isInitialized || !window.fbq) return;

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', eventName, eventData, { source: 'nextjs' });
        }
      });
    } catch (error) {
      console.error(`Failed to track ${eventName}:`, error);
    }
  }

  // Track ViewCheckout with duplicate prevention
  public trackViewCheckout(checkoutData: any) {
    if (!this.isInitialized || !window.fbq) return;

    // Create a unique key for this checkout session
    const checkoutKey = `checkout_${checkoutData.content_ids?.join('_')}_${checkoutData.value}`;
    
    // Prevent duplicate tracking for the same checkout session
    if (this.trackedCheckouts.has(checkoutKey)) {
      console.log(`ViewCheckout already tracked for checkout session: ${checkoutKey}`);
      return;
    }

    try {
      this.pixels.forEach(pixel => {
        if (pixel.enabled) {
          window.fbq('track', 'ViewCheckout', checkoutData, { source: 'nextjs' });
        }
      });
      
      // Mark as tracked
      this.trackedCheckouts.add(checkoutKey);
      console.log(`ViewCheckout tracked for checkout session: ${checkoutKey}`);
    } catch (error) {
      console.error('Failed to track ViewCheckout:', error);
    }
  }

  // Get pixel IDs for debugging
  public getPixelIds(): string[] {
    return this.pixels.map(p => p.pixelId);
  }

  // Check if pixel is ready
  public isReady(): boolean {
    return this.isInitialized && this.scriptLoaded && !!window.fbq;
  }

  // Clear tracked products (useful for testing)
  public clearTrackedProducts(): void {
    this.trackedProducts.clear();
    console.log('Cleared tracked products');
  }

  // Clear tracked checkouts (useful for testing)
  public clearTrackedCheckouts(): void {
    this.trackedCheckouts.clear();
    console.log('Cleared tracked checkouts');
  }

  // Clear tracked initiate checkouts (useful for testing)
  public clearTrackedInitiateCheckouts(): void {
    this.trackedInitiateCheckouts.clear();
    console.log('Cleared tracked initiate checkouts');
  }

  // Clear tracked purchases (useful for testing)
  public clearTrackedPurchases(): void {
    this.trackedPurchases.clear();
    console.log('Cleared tracked purchases');
  }

  // Clear tracked page views (useful for testing)
  public clearTrackedPageViews(): void {
    this.trackedPageViews.clear();
    console.log('Cleared tracked page views');
  }

  // Clear tracked categories (useful for testing)
  public clearTrackedCategories(): void {
    this.trackedCategories.clear();
    console.log('Cleared tracked categories');
  }

  // Clear all tracked events (useful for testing)
  public clearAllTracked(): void {
    this.trackedProducts.clear();
    this.trackedCheckouts.clear();
    this.trackedInitiateCheckouts.clear();
    this.trackedPurchases.clear();
    this.trackedPageViews.clear();
    this.trackedCategories.clear();
    console.log('Cleared all tracked events');
  }
}

// Create singleton instance
export const facebookPixel = new FacebookPixelManager();

// Helper functions for common e-commerce events
export const trackProductView = (product: any) => {
  // Use databaseId (WooCommerce product ID) instead of GraphQL encoded ID
  const productId = product.databaseId?.toString() || product.id?.toString() || '';
  const price = parseFloat(product.salePrice?.replace(/[^0-9.-]+/g, '') || 
                          product.price?.replace(/[^0-9.-]+/g, '') || 
                          product.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
  
  // Get category information
  const categoryName = product.productCategories?.nodes?.[0]?.name || 
                      product.categories?.nodes?.[0]?.name || '';
  
  const productData: ProductData = {
    content_ids: [productId],
    content_type: 'product',
    contents: [{
      id: productId,
      quantity: 1,
      item_price: price
    }],
    currency: 'BDT',
    value: price,
    // Enhanced product information for better Facebook tracking
    content_name: product.name || '',
    content_category: categoryName,
    product_price: price,
    post_id: productId,
    post_type: 'product',
    page_title: product.name || document.title || '',
    user_role: 'guest' // You can enhance this to detect logged-in users
  };

  facebookPixel.trackViewContent(productData);
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  const productId = product.databaseId?.toString() || product.id?.toString() || '';
  const price = parseFloat(product.salePrice?.replace(/[^0-9.-]+/g, '') || 
                          product.price?.replace(/[^0-9.-]+/g, '') || 
                          product.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
  
  // Get category information
  const categoryName = product.productCategories?.nodes?.[0]?.name || 
                      product.categories?.nodes?.[0]?.name || '';
  
  const cartData: AddToCartData = {
    content_ids: [productId],
    content_type: 'product',
    contents: [{
      id: productId,
      quantity: quantity,
      item_price: price
    }],
    currency: 'BDT',
    value: price * quantity,
    // Enhanced product information for better Facebook tracking
    content_name: product.name || '',
    content_category: categoryName,
    product_price: price,
    post_id: productId,
    post_type: 'product',
    page_title: product.name || document.title || '',
    user_role: 'guest'
  };

  facebookPixel.trackAddToCart(cartData);
};

export const trackCheckoutInitiated = (items: any[], totalValue: number) => {
  const checkoutData: PurchaseData = {
    content_ids: items.map(item => {
      // Handle both cart item structure and direct product structure
      if (item.product?.node?.databaseId) {
        return item.product.node.databaseId.toString();
      } else if (item.databaseId) {
        return item.databaseId.toString();
      } else if (item.id) {
        return item.id.toString();
      }
      return '';
    }),
    content_type: 'product',
    contents: items.map(item => {
      // Handle both cart item structure and direct product structure
      let productId = '';
      let itemPrice = 0;
      
      if (item.product?.node?.databaseId) {
        productId = item.product.node.databaseId.toString();
        // Calculate price from cart item total
        itemPrice = parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0') / (item.quantity || 1);
      } else if (item.databaseId) {
        productId = item.databaseId.toString();
        itemPrice = parseFloat(item.salePrice?.replace(/[^0-9.-]+/g, '') || 
                              item.price?.replace(/[^0-9.-]+/g, '') || 
                              item.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
      } else if (item.id) {
        productId = item.id.toString();
        itemPrice = parseFloat(item.salePrice?.replace(/[^0-9.-]+/g, '') || 
                              item.price?.replace(/[^0-9.-]+/g, '') || 
                              item.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
      }
      
      return {
        id: productId,
        quantity: item.quantity || 1,
        item_price: itemPrice
      };
    }),
    currency: 'BDT',
    value: totalValue,
    num_items: items.length
  };

  console.log(`Tracking InitiateCheckout for ${items.length} items, total: ${totalValue}`);
  facebookPixel.trackInitiateCheckout(checkoutData);
};

export const trackPurchase = (orderData: any, items: any[]) => {
  const purchaseData: PurchaseData = {
    content_ids: items.map(item => {
      // Handle both cart item structure and direct product structure
      if (item.product?.node?.databaseId) {
        return item.product.node.databaseId.toString();
      } else if (item.databaseId) {
        return item.databaseId.toString();
      } else if (item.id) {
        return item.id.toString();
      }
      return '';
    }),
    content_type: 'product',
    contents: items.map(item => {
      // Handle both cart item structure and direct product structure
      let productId = '';
      let itemPrice = 0;
      
      if (item.product?.node?.databaseId) {
        productId = item.product.node.databaseId.toString();
        // Calculate price from cart item total
        itemPrice = parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0') / (item.quantity || 1);
      } else if (item.databaseId) {
        productId = item.databaseId.toString();
        itemPrice = parseFloat(item.salePrice?.replace(/[^0-9.-]+/g, '') || 
                              item.price?.replace(/[^0-9.-]+/g, '') || 
                              item.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
      } else if (item.id) {
        productId = item.id.toString();
        itemPrice = parseFloat(item.salePrice?.replace(/[^0-9.-]+/g, '') || 
                              item.price?.replace(/[^0-9.-]+/g, '') || 
                              item.regularPrice?.replace(/[^0-9.-]+/g, '') || '0');
      }
      
      return {
        id: productId,
        quantity: item.quantity || 1,
        item_price: itemPrice
      };
    }),
    currency: 'BDT',
    value: parseFloat(orderData.total?.replace(/[^0-9.-]+/g, '') || '0'),
    num_items: items.length
  };

  facebookPixel.trackPurchase(purchaseData);
};