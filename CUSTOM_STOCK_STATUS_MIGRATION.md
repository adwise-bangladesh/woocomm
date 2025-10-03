# Custom Stock Status Migration Guide

## 🎯 Overview

This document explains the migration from WooCommerce's default stock statuses to custom stock statuses with delivery time information.

---

## 📊 Stock Status Mapping

### Backend (WordPress/WooCommerce)

Custom stock statuses registered via GraphQL:

| Custom Status      | GraphQL Enum        | Display Text                                    | Color  |
|--------------------|---------------------|------------------------------------------------|--------|
| `fast_delivery`    | `FAST_DELIVERY`     | Stock Available – Fast Delivery (1-3 days)     | 🟢 Green |
| `regular_delivery` | `REGULAR_DELIVERY`  | Stock Available – Regular Delivery (3-5 days)  | 🟠 Orange |
| `global_delivery`  | `GLOBAL_DELIVERY`   | Pre-Order Available – Global Delivery (10-15 days) | 🔴 Red |

### Old Status Compatibility

For backward compatibility, the frontend supports both old and new statuses:

| Old Status     | New Status         | Behavior                          |
|----------------|--------------------|-----------------------------------|
| `IN_STOCK`     | `FAST_DELIVERY`    | Fast Delivery (1-3 days)          |
| `ON_BACKORDER` | `REGULAR_DELIVERY` | Regular Delivery (3-5 days)       |
| `OUT_OF_STOCK` | `GLOBAL_DELIVERY`  | Global Delivery (10-15 days)      |

---

## 🔧 Backend Configuration

### 1. WordPress Functions (functions.php)

```php
// Allow checkout for OUT_OF_STOCK products
add_filter('woocommerce_is_purchasable', function($purchasable, $product) {
    if (!$purchasable && !$product->is_in_stock()) {
        return true;
    }
    return $purchasable;
}, 10, 2);

// Register Custom Stock Statuses
add_filter('woocommerce_product_stock_status_options', function($status) {
    $status['fast_delivery']   = __('Stock Available – Fast Delivery (1-3 days)', 'woocommerce');
    $status['regular_delivery'] = __('Stock Available – Regular Delivery (3-5 days)', 'woocommerce');
    $status['global_delivery']  = __('Pre-Order Available – Global Delivery (10-15 days)', 'woocommerce');
    return $status;
});

// Extend GraphQL Schema
add_action('graphql_register_types', function() {
    register_graphql_enum_values( 'StockStatusEnum', [
        'FAST_DELIVERY' => [
            'value' => 'fast_delivery',
            'description' => __( 'Stock Available – Fast Delivery (1-3 days)', 'woocommerce' ),
        ],
        'REGULAR_DELIVERY' => [
            'value' => 'regular_delivery',
            'description' => __( 'Stock Available – Regular Delivery (3-5 days)', 'woocommerce' ),
        ],
        'GLOBAL_DELIVERY' => [
            'value' => 'global_delivery',
            'description' => __( 'Pre-Order Available – Global Delivery (10-15 days)', 'woocommerce' ),
        ],
    ]);
});
```

---

## 💻 Frontend Changes

### Files Modified

1. **`components/ProductPageClient.tsx`**
   - Updated stock status detection logic
   - Changed from `isInStock`, `isBackordersAllowed` to `isFastDelivery`, `isRegularDelivery`, `isGlobalDelivery`
   - Updated UI to show correct delivery times and colors
   - Updated pre-order policy display logic

2. **`app/cart/page.tsx`**
   - Updated `getDeliveryTime()` function to support both old and new statuses
   - Maintains backward compatibility

3. **`app/checkout/page.tsx`**
   - Updated `getDeliveryTime()` function to support both old and new statuses
   - Maintains backward compatibility

4. **`app/product/[slug]/page.tsx`**
   - Updated SEO metadata to handle custom statuses
   - Updated JSON-LD structured data for search engines

5. **`components/OrderNowButton.tsx`**
   - Enhanced error handling
   - Added support for variation IDs
   - Added session token management

6. **`components/AnimatedOrderButton.tsx`**
   - Added `variationId` prop support

7. **`lib/mutations.ts`**
   - Added `stockStatus` and `stockQuantity` to `ADD_TO_CART` mutation
   - Supports both product and variation stock status

---

## 🎨 UI Changes

### Product Page

**Before:**
- ✅ In Stock → Green
- ⚠️ On Backorder → Yellow
- ❌ Out of Stock → Red (couldn't order)

**After:**
- 🟢 Stock Available – Fast Delivery (1-3 days) → Green
- 🟠 Stock Available – Regular Delivery (3-5 days) → Orange
- 🔴 Pre-Order Available – Global Delivery (10-15 days) → Red (can order!)

### Cart & Checkout

Delivery time badges now show:
- 🟢 **Fast Delivery (1-3 days)** for `FAST_DELIVERY` / `IN_STOCK`
- 🟠 **Regular Delivery (3-5 days)** for `REGULAR_DELIVERY` / `ON_BACKORDER`
- 🔴 **Global Delivery (10-15 days)** for `GLOBAL_DELIVERY` / `OUT_OF_STOCK`

---

## 🔍 Testing Checklist

### Product Page
- [ ] Fast Delivery products show green indicator
- [ ] Regular Delivery products show orange indicator
- [ ] Global Delivery products show red indicator + "(Pre-Order)" in title
- [ ] All products can be added to cart
- [ ] Variable products select correct variation stock status

### Cart Page
- [ ] Delivery time badges show correct color
- [ ] Multiple items with different stock statuses display correctly
- [ ] Stock status updates when items are added

### Checkout Page
- [ ] Delivery time badges match cart
- [ ] Order can be placed for all stock statuses
- [ ] Price calculation includes delivery charges

### Backward Compatibility
- [ ] Old `IN_STOCK` products still work
- [ ] Old `ON_BACKORDER` products still work
- [ ] Old `OUT_OF_STOCK` products can now be ordered

---

## 🚀 Migration Steps

### For Existing Products

1. **In WordPress Admin:**
   - Go to Products → Edit Product
   - Scroll to "Product Data" → "Inventory"
   - Select new stock status from dropdown:
     - `Stock Available – Fast Delivery (1-3 days)`
     - `Stock Available – Regular Delivery (3-5 days)`
     - `Pre-Order Available – Global Delivery (10-15 days)`

2. **Bulk Update (optional):**
   ```php
   // Run once to migrate all products
   add_action('init', function() {
       $products = wc_get_products(['limit' => -1]);
       foreach ($products as $product) {
           switch ($product->get_stock_status()) {
               case 'instock':
                   $product->set_stock_status('fast_delivery');
                   break;
               case 'onbackorder':
                   $product->set_stock_status('regular_delivery');
                   break;
               case 'outofstock':
                   $product->set_stock_status('global_delivery');
                   break;
           }
           $product->save();
       }
   });
   ```

---

## 📝 GraphQL Query Examples

### Query Product with New Stock Status

```graphql
{
  product(id: "product-slug", idType: SLUG) {
    name
    stockStatus  # Returns: FAST_DELIVERY, REGULAR_DELIVERY, or GLOBAL_DELIVERY
    ... on InventoriedProduct {
      stockQuantity
      manageStock
    }
  }
}
```

### Response Example

```json
{
  "data": {
    "product": {
      "name": "Product Name",
      "stockStatus": "FAST_DELIVERY",
      "stockQuantity": 100,
      "manageStock": "TRUE"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Products still show old status
**Solution:** Clear WPGraphQL schema cache:
```bash
wp graphql clear-schema-cache
```

### Issue: Can't add OUT_OF_STOCK to cart
**Solution:** Ensure the `woocommerce_is_purchasable` filter is active in functions.php

### Issue: Stock status colors not showing
**Solution:** Check browser console for errors, ensure CSS is loaded

---

## 📚 References

- [WooCommerce Stock Management](https://woocommerce.com/document/managing-products/#product-data)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Last Updated:** October 3, 2025  
**Version:** 1.0.0

