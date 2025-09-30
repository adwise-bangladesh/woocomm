# Testing ACF Slider in WordPress - Step by Step

## Method 1: Using GraphiQL IDE (Recommended) ✅

### Step 1: Access GraphiQL IDE
1. Log into your WordPress admin
2. Go to **GraphQL → GraphiQL IDE** (in the left sidebar)

### Step 2: Test the Slider Query

Paste this query in the GraphiQL IDE:

```graphql
query TestSlider {
  sliders(first: 10) {
    nodes {
      id
      title
      acfSlider {
        sliderImage {
          sourceUrl
          altText
        }
        sliderTitle
        sliderDescription
        sliderLink
        sliderButtonText
      }
    }
  }
}
```

### Step 3: Click "Execute Query" (Play button)

#### ✅ If Working Correctly, You'll See:
```json
{
  "data": {
    "sliders": {
      "nodes": [
        {
          "id": "cG9zdDoxMjM=",
          "title": "Slide 1",
          "acfSlider": {
            "sliderImage": {
              "sourceUrl": "https://backend.zonash.com/wp-content/uploads/2025/01/slider1.jpg",
              "altText": "Welcome Banner"
            },
            "sliderTitle": "Welcome to Zonash",
            "sliderDescription": "Shop the best products",
            "sliderLink": "/shop",
            "sliderButtonText": "Shop Now"
          }
        }
      ]
    }
  }
}
```

#### ❌ If NOT Working, You'll See:

**Error 1: Field 'sliders' not found**
```json
{
  "errors": [
    {
      "message": "Cannot query field \"sliders\" on type \"RootQuery\""
    }
  ]
}
```
**Solution:** Custom post type not registered or not exposed to GraphQL

**Error 2: Field 'acfSlider' returns null**
```json
{
  "data": {
    "sliders": {
      "nodes": [
        {
          "id": "cG9zdDoxMjM=",
          "title": "Slide 1",
          "acfSlider": null
        }
      ]
    }
  }
}
```
**Solution:** ACF fields not configured for GraphQL or field group not assigned

---

## Method 2: Check in WordPress Admin

### Step 1: Verify Custom Post Type Exists
1. Go to WordPress admin dashboard
2. Look for **"Sliders"** in the left sidebar
3. If you DON'T see it, add this to `functions.php`:

```php
function register_slider_post_type() {
    register_post_type('slider', array(
        'label' => 'Sliders',
        'public' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-images-alt2',
        'supports' => array('title', 'page-attributes'),
        'show_in_graphql' => true,
        'graphql_single_name' => 'slider',
        'graphql_plural_name' => 'sliders',
    ));
}
add_action('init', 'register_slider_post_type');
```

### Step 2: Check ACF Field Group
1. Go to **ACF → Field Groups**
2. Look for "Slider Fields" or similar
3. Click to edit it

**Check these settings:**

#### Field Group Settings:
- ✅ **Show in GraphQL**: Must be checked
- ✅ **GraphQL Field Name**: Must be exactly `acfSlider`

#### Location Rules:
- ✅ **Post Type** is equal to **slider**

#### Individual Fields Must Have:

**Field 1: slider_image**
- Type: Image
- Return Format: Image Array
- **Show in GraphQL**: ✅ Checked
- **GraphQL Field Name**: `sliderImage`

**Field 2: slider_title**
- Type: Text
- **Show in GraphQL**: ✅ Checked
- **GraphQL Field Name**: `sliderTitle`

**Field 3: slider_description**
- Type: Textarea
- **Show in GraphQL**: ✅ Checked
- **GraphQL Field Name**: `sliderDescription`

**Field 4: slider_link**
- Type: URL
- **Show in GraphQL**: ✅ Checked
- **GraphQL Field Name**: `sliderLink`

**Field 5: slider_button_text**
- Type: Text
- **Show in GraphQL**: ✅ Checked
- **GraphQL Field Name**: `sliderButtonText`

### Step 3: Check Slider Posts Have Data
1. Go to **Sliders → All Sliders**
2. Click on a slider post
3. Verify all ACF fields have values:
   - ✅ Slider Image uploaded
   - ✅ Slider Title filled
   - ✅ Slider Description filled
   - ✅ Slider Link (optional)
   - ✅ Slider Button Text (optional)
4. Make sure post is **Published** (not draft)

---

## Method 3: Check WPGraphQL Plugin Status

### Step 1: Verify Plugins Are Active
1. Go to **Plugins → Installed Plugins**
2. Check these are **Active**:
   - ✅ WPGraphQL
   - ✅ WPGraphQL for WooCommerce
   - ✅ Advanced Custom Fields (ACF)
   - ✅ WPGraphQL for Advanced Custom Fields

### Step 2: Check Plugin Versions
- WPGraphQL: v1.14+ recommended
- WPGraphQL for ACF: v0.6+ recommended

---

## Method 4: Frontend Testing

### Quick Test Query in Browser

Open your browser console on http://localhost:3001 and run:

```javascript
fetch('https://backend.zonash.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query {
        sliders(first: 3) {
          nodes {
            title
            acfSlider {
              sliderTitle
              sliderImage { sourceUrl }
            }
          }
        }
      }
    `
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## Common Issues & Solutions

### Issue 1: "sliders" field not found
**Problem:** Custom post type not registered with GraphQL
**Solution:**
```php
// In functions.php, make sure:
'show_in_graphql' => true,
'graphql_single_name' => 'slider',
'graphql_plural_name' => 'sliders',
```

### Issue 2: acfSlider returns null
**Problem:** ACF field group not exposed to GraphQL
**Solution:**
1. Edit field group in ACF
2. Check "Show in GraphQL"
3. Set GraphQL Field Name to `acfSlider`
4. Save

### Issue 3: Individual fields missing
**Problem:** Fields not exposed to GraphQL
**Solution:**
Each field must have:
- "Show in GraphQL" checked
- Correct GraphQL Field Name (camelCase)

### Issue 4: Empty data even though fields filled
**Problem:** Field names don't match query
**Solution:**
Check field names exactly match:
- `sliderImage` (not slider_image)
- `sliderTitle` (not slider_title)
- etc.

### Issue 5: Permission denied
**Problem:** GraphQL permissions
**Solution:**
In WPGraphQL settings, ensure public access or authentication is set up

---

## Verification Checklist

Use this checklist to verify everything is set up:

```
□ WPGraphQL plugin active
□ WPGraphQL for ACF plugin active
□ ACF plugin active
□ Custom post type "slider" registered
□ Custom post type has 'show_in_graphql' => true
□ Custom post type has 'graphql_single_name' => 'slider'
□ Custom post type has 'graphql_plural_name' => 'sliders'
□ ACF Field Group created
□ Field Group "Show in GraphQL" checked
□ Field Group GraphQL name is "acfSlider"
□ Field Group location rule: Post Type = slider
□ All fields have "Show in GraphQL" checked
□ All fields have correct GraphQL names (camelCase)
□ At least one slider post published
□ Slider post has image uploaded
□ Slider post has title and description
□ GraphiQL query returns data successfully
```

---

## Quick Debug Commands

### Test in GraphiQL:

**1. Check if sliders exist:**
```graphql
{ sliders { nodes { id title } } }
```

**2. Check if ACF fields are exposed:**
```graphql
{ sliders { nodes { id acfSlider { sliderTitle } } } }
```

**3. Full slider data:**
```graphql
{
  sliders(first: 1) {
    nodes {
      title
      acfSlider {
        sliderImage { sourceUrl altText }
        sliderTitle
        sliderDescription
        sliderLink
        sliderButtonText
      }
    }
  }
}
```

---

## Screenshot Guide

### What to Check in WordPress:

1. **ACF Field Group Settings:**
   - Screenshot the "Show in GraphQL" checkbox
   - Screenshot "GraphQL Field Name" field
   - Screenshot Location Rules

2. **Individual Field Settings:**
   - Click "Edit" on each field
   - Check "Show in GraphQL" tab
   - Verify GraphQL Field Name

3. **Slider Post:**
   - Screenshot filled ACF fields
   - Verify post status is "Published"

4. **GraphiQL Results:**
   - Screenshot successful query result
   - Or screenshot error message for debugging

---

## Need Help?

If still not working, check:

1. **PHP Error Log**: Check for PHP errors
2. **Browser Console**: Check for GraphQL errors
3. **Network Tab**: Check API response
4. **WPGraphQL Debug Mode**: Enable in WPGraphQL settings

**Most Common Fix:**
Clear all caches:
- WordPress cache
- Object cache
- Browser cache
- CDN cache (if any)

Then try the GraphiQL query again!
