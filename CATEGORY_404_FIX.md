# Category Page 404 Error - How to Fix

## 🐛 Issue
Visiting `/category/[slug]` shows a 404 error page.

## 🔍 Common Causes

### 1. **Category Doesn't Exist in WordPress**
The most common reason for a 404 is that the category slug you're trying to access doesn't exist in your WordPress/WooCommerce installation.

### 2. **Wrong Slug**
You might be using the wrong slug. WordPress automatically generates slugs based on the category name.

### 3. **No Products in Category**
The category exists but has no products assigned to it (this won't cause a 404, but will show an empty page).

## ✅ How to Fix

### Step 1: Check Available Categories

Visit the debug page to see all available categories:
```
http://localhost:3000/test-categories
```

This page will show you:
- All categories in your WordPress
- Their exact slugs
- Product counts
- Links to test each category

### Step 2: Create Categories in WordPress

If you don't have any categories:

1. **Go to WordPress Admin:**
   ```
   https://backend.zonash.com/wp-admin
   ```

2. **Navigate to Products → Categories**

3. **Create a New Category:**
   - Name: e.g., "Electronics"
   - Slug: Will auto-generate (e.g., "electronics")
   - Description: Optional
   - Click "Add New Product Category"

4. **Assign Products to Category:**
   - Go to Products → All Products
   - Edit a product
   - Check the category checkbox
   - Update product

### Step 3: Use Correct Slug

Make sure you're using the exact slug shown in the debug page:

❌ **Wrong:**
- `/category/Electronics` (capital E)
- `/category/electronics-category`
- `/category/electronic`

✅ **Correct:**
- `/category/electronics` (exact slug from WordPress)

## 🧪 Testing

### Test Individual Category:
```
http://localhost:3000/category/[your-slug-here]
```

Replace `[your-slug-here]` with the actual slug from your categories.

### Common Category Slugs to Try:
- `/category/uncategorized` (default WooCommerce category)
- `/category/electronics`
- `/category/clothing`
- `/category/accessories`

## 🛠️ Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors:
```
Category not found: your-slug
```

### 2. Check Network Tab
- Open DevTools → Network tab
- Filter by "Fetch/XHR"
- Look for GraphQL requests
- Check the response to see if category data is returned

### 3. Test GraphQL Query Directly

Go to your GraphQL endpoint:
```
https://backend.zonash.com/graphql
```

Run this query:
```graphql
query GetCategories {
  productCategories(first: 100) {
    nodes {
      id
      name
      slug
      count
    }
  }
}
```

## 📝 Code Changes Made

### Improved Error Handling
The category page now:
- ✅ Returns null if category doesn't exist
- ✅ Shows helpful error messages in development
- ✅ Properly triggers 404 page
- ✅ Handles empty products array

### Debug Page Created
- ✅ `/test-categories` - Lists all available categories
- ✅ Shows exact slugs to use
- ✅ Provides clickable links to test
- ✅ Shows helpful troubleshooting tips

## 🎯 Expected Behavior

### If Category Exists:
1. Page loads with category name
2. Products display in grid
3. Shows product count

### If Category Doesn't Exist:
1. 404 page displays
2. Console shows "Category not found: slug-name" (in dev mode)
3. User can navigate back

## 🔄 Quick Fix Checklist

- [ ] Visit `/test-categories` to see available categories
- [ ] Check if any categories exist in WordPress
- [ ] Create categories if none exist
- [ ] Assign products to categories
- [ ] Use exact slug from debug page
- [ ] Test the category URL
- [ ] Clear browser cache if needed

## 💡 Pro Tips

### 1. Default Category
WooCommerce creates a default "Uncategorized" category. Try:
```
http://localhost:3000/category/uncategorized
```

### 2. Check WordPress Settings
Go to: WooCommerce → Settings → Products
- Make sure "Shop page" is set
- Check if categories are enabled

### 3. Permalink Structure
In WordPress: Settings → Permalinks
- Make sure it's set to "Post name" or custom structure
- Click "Save Changes" to flush rewrite rules

## 📊 Common Scenarios

### Scenario 1: Fresh WordPress Install
**Problem:** No categories created yet  
**Solution:** Create categories in WordPress first

### Scenario 2: Categories Exist but Getting 404
**Problem:** Using wrong slug  
**Solution:** Check exact slug in `/test-categories`

### Scenario 3: Category Shows but No Products
**Problem:** No products assigned to category  
**Solution:** Assign products to category in WordPress

## 🚀 Next Steps

1. Visit `/test-categories` to diagnose the issue
2. Create/verify categories in WordPress
3. Test the category URLs
4. If still having issues, check the browser console for specific errors

---

**Need Help?**

If you're still getting 404 errors after following these steps:
1. Check the browser console for the exact error
2. Verify GraphQL endpoint is accessible
3. Ensure WPGraphQL and WooGraphQL plugins are active
4. Check WordPress error logs

---

**Files Modified:**
- `app/category/[slug]/page.tsx` - Improved error handling
- `app/test-categories/page.tsx` - New debug page

**Testing URL:**
```
http://localhost:3000/test-categories
```

