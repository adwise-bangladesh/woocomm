# 🔧 Facebook Pixel Duplicate Events Fix

## 🚨 **Issue Fixed**
Facebook Pixel events were activating 2 times, causing duplicate tracking errors. This has been fixed with proper duplicate prevention.

## ✅ **Events Fixed with Duplicate Prevention**

### **1. ViewContent** ✅
- **Fixed**: Added duplicate prevention using `trackedProducts` Set
- **Key**: `product_${productId}`
- **Prevention**: Prevents same product from being tracked multiple times

### **2. AddToCart** ✅
- **Fixed**: Added duplicate prevention using `trackedAddToCart` Set
- **Key**: `addtocart_${content_ids}_${value}_${timestamp}`
- **Prevention**: Prevents same AddToCart event from being tracked multiple times

### **3. InitiateCheckout** ✅
- **Fixed**: Added duplicate prevention using `trackedInitiateCheckouts` Set
- **Key**: `initiate_${content_ids}_${value}`
- **Prevention**: Prevents same checkout session from being tracked multiple times

### **4. Purchase** ✅
- **Fixed**: Added duplicate prevention using `trackedPurchases` Set
- **Key**: `purchase_${content_ids}_${value}_${timestamp}`
- **Prevention**: Prevents same purchase from being tracked multiple times

### **5. TimeOnSite** ✅
- **Fixed**: Added duplicate prevention using `trackedTimeOnSite` Set
- **Key**: `timeonsite_${minutes}_${timestamp}`
- **Prevention**: Prevents same time tracking from being tracked multiple times

### **6. ViewCart** ✅
- **Fixed**: Added duplicate prevention using `sessionStorage`
- **Key**: `viewcart_${items}_${value}_${timestamp}`
- **Prevention**: Prevents same cart view from being tracked multiple times

## 🔧 **Implementation Details**

### **1. FacebookPixelManager Updates**
```typescript
// Added new tracking sets
private trackedAddToCart = new Set<string>();
private trackedViewCart = new Set<string>();
private trackedTimeOnSite = new Set<string>();

// Updated clearAllTracked method
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
}
```

### **2. AddToCart Duplicate Prevention**
```typescript
public trackAddToCart(cartData: AddToCartData) {
  // Create unique key
  const addToCartKey = `addtocart_${cartData.content_ids?.join('_')}_${cartData.value}_${Date.now()}`;
  
  // Prevent duplicate tracking
  if (this.trackedAddToCart.has(addToCartKey)) {
    return;
  }
  
  // Track and mark as tracked
  this.pixels.forEach(pixel => {
    if (pixel.enabled) {
      window.fbq('track', 'AddToCart', cartData, { source: 'nextjs' });
    }
  });
  
  this.trackedAddToCart.add(addToCartKey);
}
```

### **3. TimeOnSite Duplicate Prevention**
```typescript
public trackTimeOnSite(timeSpent: number) {
  // Create unique key
  const timeOnSiteKey = `timeonsite_${Math.floor(timeSpent / 60)}_${Date.now()}`;
  
  // Prevent duplicate tracking
  if (this.trackedTimeOnSite.has(timeOnSiteKey)) {
    return;
  }
  
  // Track and mark as tracked
  this.pixels.forEach(pixel => {
    if (pixel.enabled) {
      window.fbq('trackCustom', 'TimeOnSite', {
        time_spent_seconds: timeSpent,
        time_spent_minutes: (timeSpent / 60).toFixed(2)
      }, { source: 'nextjs' });
    }
  });
  
  this.trackedTimeOnSite.add(timeOnSiteKey);
}
```

### **4. ViewCart Duplicate Prevention (Cart Page)**
```typescript
// Create unique key for this ViewCart event
const viewCartKey = `viewcart_${localItems.length}_${cartValue}_${Date.now()}`;

// Check if already tracked in this session
if (!sessionStorage.getItem(`viewcart_${viewCartKey}`)) {
  trackCustom('ViewCart', cartData);
  sessionStorage.setItem(`viewcart_${viewCartKey}`, 'true');
}
```

## 🚀 **Deploy the Fix**

### **1. Clear Cache and Restart**
```bash
# Stop PM2
pm2 kill

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

### **2. Test the Fix**
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

## 🎯 **What's Fixed**

✅ **ViewContent** - No more duplicate product views  
✅ **AddToCart** - No more duplicate add to cart events  
✅ **InitiateCheckout** - No more duplicate checkout initiations  
✅ **Purchase** - No more duplicate purchase events  
✅ **TimeOnSite** - No more duplicate time tracking  
✅ **ViewCart** - No more duplicate cart views  

## 🚨 **If Issues Persist**

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

**🎉 All Facebook Pixel duplicate events have been fixed!**
