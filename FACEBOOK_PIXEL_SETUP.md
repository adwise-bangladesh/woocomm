# Facebook Pixel Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
# Single pixel ID (backward compatibility)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914

# Multiple pixel IDs (comma-separated)
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914
```

## Tracked Events

### 1. **PageView** - Automatic
- Tracks every page visit
- Includes time on site tracking

### 2. **ViewContent** - Product Pages
- Tracks when users view product pages
- Includes product details and pricing

### 3. **AddToCart** - Cart Actions
- Tracks when items are added to cart
- Includes product and quantity information

### 4. **InitiateCheckout** - Checkout Start
- Tracks when checkout process begins
- Includes cart contents and total value

### 5. **Purchase** - Order Completion
- Tracks successful orders
- Includes order details and customer information

### 6. **Category View** - Category Pages
- Tracks category page visits
- Can be implemented in category pages

### 7. **Search** - Search Functionality
- Tracks search queries
- Can be implemented in search pages

## Implementation Details

### Files Created/Modified:

1. **`lib/facebook-pixel.ts`** - Core Facebook Pixel implementation
2. **`hooks/useFacebookPixel.ts`** - React hook for easy integration
3. **`components/FacebookPixelProvider.tsx`** - Provider component
4. **`app/layout.tsx`** - Added provider to layout
5. **`components/ProductPageClient.tsx`** - Added product view tracking
6. **`components/AddToCartButton.tsx`** - Added add to cart tracking
7. **`app/checkout/page.tsx`** - Added checkout and purchase tracking

### Multiple Pixel Support:

The implementation supports multiple Facebook Pixel IDs:

```typescript
// In your .env.local
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=123456789,987654321,111222333
```

All events will be sent to all configured pixels.

### Custom Events:

You can track custom events using the hook:

```typescript
const { trackCustom } = useFacebookPixel();

// Track custom event
trackCustom('CustomEventName', { custom_data: 'value' });
```

### Time on Site:

Time on site is automatically tracked and sent as a custom event when users leave the page.

## Testing

1. Install Facebook Pixel Helper browser extension
2. Check that all events are firing correctly
3. Verify multiple pixel IDs are receiving events
4. Test in Facebook Events Manager

## Debugging

The implementation includes console logging for debugging. Check browser console for:
- Pixel initialization messages
- Event tracking confirmations
- Error messages

## GDPR Compliance

Make sure to:
1. Add cookie consent banner
2. Only initialize pixels after consent
3. Provide opt-out mechanisms
4. Update privacy policy

## Performance

- Pixels load asynchronously
- No blocking of page rendering
- Efficient event batching
- Minimal impact on page speed
