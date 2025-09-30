# ACF Slider Debugging Flowchart

## Quick Diagnostic Flow

```
START: Is slider showing on frontend?
│
├─ NO → Go to Step 1
└─ YES → ✅ All good!

Step 1: Open GraphiQL IDE
(WordPress Admin → GraphQL → GraphiQL IDE)
│
├─ Run query: { sliders { nodes { id title } } }
│
├─ ERROR: "Cannot query field 'sliders'" ?
│   └─ YES → Problem: Custom Post Type not registered
│       Solution: Check functions.php
│       └─ Go to FIX 1
│
├─ Returns empty nodes: [] ?
│   └─ YES → Problem: No slider posts exist
│       Solution: Create slider posts
│       └─ Go to FIX 2
│
└─ Returns sliders with IDs?
    └─ YES → Go to Step 2

Step 2: Test ACF Fields
Run: { sliders { nodes { acfSlider { sliderTitle } } } }
│
├─ acfSlider is NULL ?
│   └─ YES → Problem: ACF not configured for GraphQL
│       └─ Go to FIX 3
│
└─ Returns slider data?
    └─ YES → ✅ Backend working!
        └─ Problem is in Frontend
        └─ Go to FIX 4
```

---

## FIX 1: Custom Post Type Not Registered

```
Problem: Query error "Cannot query field 'sliders'"
│
Solution Steps:
│
1. Check if "Sliders" menu exists in WP Admin sidebar
   ├─ NO → Add to functions.php:
   │
   └─ code:
       function register_slider_post_type() {
           register_post_type('slider', array(
               'label' => 'Sliders',
               'public' => true,
               'show_in_graphql' => true,        ← CRITICAL
               'graphql_single_name' => 'slider', ← CRITICAL
               'graphql_plural_name' => 'sliders', ← CRITICAL
           ));
       }
       add_action('init', 'register_slider_post_type');
│
2. Save functions.php
│
3. Go to Settings → Permalinks → Click "Save Changes"
   (This flushes rewrite rules)
│
4. Test again in GraphiQL
│
✅ Should now work!
```

---

## FIX 2: No Slider Posts

```
Problem: Query returns empty array
│
Solution Steps:
│
1. Go to Sliders → Add New
│
2. Enter Post Title (e.g., "Slider 1")
│
3. Fill ACF Fields:
   ├─ Upload Slider Image
   ├─ Enter Slider Title
   ├─ Enter Slider Description
   ├─ (Optional) Enter Link
   └─ (Optional) Enter Button Text
│
4. Set Order (Attributes box, right sidebar)
   ├─ Slider 1: Order = 0
   ├─ Slider 2: Order = 1
   └─ Slider 3: Order = 2
│
5. Click "Publish"
│
6. Create 2-3 more sliders
│
7. Test in GraphiQL
│
✅ Should return data!
```

---

## FIX 3: ACF Fields Return NULL

```
Problem: acfSlider is null in GraphQL response
│
Root Causes:
├─ ACF Field Group not exposed to GraphQL
├─ Field Group not assigned to slider post type
├─ WPGraphQL for ACF plugin not active
└─ Field names don't match

Solution:
│
Step A: Check Plugin
├─ Go to Plugins → Installed Plugins
├─ Find "WPGraphQL for Advanced Custom Fields"
├─ Is it Active?
│   ├─ NO → Activate it
│   └─ YES → Continue to Step B
│
Step B: Check Field Group Settings
├─ Go to ACF → Field Groups
├─ Find "Slider Fields" (or your group name)
├─ Click to Edit
│
├─ Check Settings (top right):
│   ├─ "Show in GraphQL" ✓ MUST BE CHECKED
│   ├─ "GraphQL Field Name" = acfSlider (EXACT)
│   └─ If missing, check and save
│
├─ Check Location Rules (bottom):
│   ├─ Rule: Post Type = slider
│   └─ If wrong, fix and save
│
Step C: Check Individual Fields
├─ In field group, click each field:
│
├─ For slider_image:
│   ├─ Click "Edit"
│   ├─ Look for "Show in GraphQL" tab/section
│   ├─ Check "Show in GraphQL" ✓
│   ├─ GraphQL Field Name = sliderImage (EXACT)
│   └─ Save
│
├─ Repeat for all 5 fields:
│   ├─ slider_title → sliderTitle
│   ├─ slider_description → sliderDescription
│   ├─ slider_link → sliderLink
│   └─ slider_button_text → sliderButtonText
│
Step D: Clear Cache
├─ Clear WordPress cache (if using cache plugin)
├─ Clear browser cache
└─ Test in GraphiQL again
│
✅ Should now return ACF data!
```

---

## FIX 4: Backend Works, Frontend Doesn't

```
Problem: GraphiQL returns data, but homepage shows no slider
│
Diagnostic:
│
1. Open browser console on http://localhost:3001
│
2. Look for errors in console
│
3. Common Issues:
│
Issue A: CORS Error
├─ Error: "Access-Control-Allow-Origin"
└─ Solution: Add to wp-config.php:
    header('Access-Control-Allow-Origin: *');

Issue B: Image URLs broken
├─ Check if image URLs are full URLs
├─ Example: https://backend.zonash.com/wp-content/uploads/...
└─ Solution: Check next.config.ts has correct domain

Issue C: Data format mismatch
├─ Check console for data structure
├─ Compare with expected format in HeroSlider.tsx
└─ Solution: Update query or component

Issue D: Query returns null
├─ Slider posts exist but query wrong
└─ Solution: Check query name in app/page.tsx

✅ Fix the specific error shown
```

---

## Field Name Reference Table

| WordPress ACF Field | GraphQL Field Name | MUST Match |
|---------------------|-------------------|------------|
| slider_image | sliderImage | ✅ |
| slider_title | sliderTitle | ✅ |
| slider_description | sliderDescription | ✅ |
| slider_link | sliderLink | ✅ |
| slider_button_text | sliderButtonText | ✅ |

**Field Group Name:** `acfSlider` ✅

---

## Testing Checklist (In Order)

```
Test 1: Check Custom Post Type
Query: { sliders { nodes { id } } }
Expected: Returns array with IDs
Status: □ Pass □ Fail

Test 2: Check ACF Field Group
Query: { sliders { nodes { acfSlider { sliderTitle } } } }
Expected: Returns slider titles
Status: □ Pass □ Fail

Test 3: Check All Fields
Query: {
  sliders {
    nodes {
      acfSlider {
        sliderImage { sourceUrl }
        sliderTitle
        sliderDescription
        sliderLink
        sliderButtonText
      }
    }
  }
}
Expected: Returns all field data
Status: □ Pass □ Fail

Test 4: Check Frontend
URL: http://localhost:3001
Expected: Slider visible on homepage
Status: □ Pass □ Fail
```

---

## Quick Copy-Paste Tests

### Test 1: Basic Query
```graphql
{
  sliders {
    nodes {
      id
      title
    }
  }
}
```

### Test 2: With ACF
```graphql
{
  sliders {
    nodes {
      title
      acfSlider {
        sliderTitle
      }
    }
  }
}
```

### Test 3: Full Data
```graphql
{
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

---

## Success Indicators

✅ **You'll know it's working when:**

1. GraphiQL query returns data like:
```json
{
  "data": {
    "sliders": {
      "nodes": [
        {
          "title": "Slide 1",
          "acfSlider": {
            "sliderImage": {
              "sourceUrl": "https://..."
            },
            "sliderTitle": "Welcome"
          }
        }
      ]
    }
  }
}
```

2. Frontend homepage shows rotating slider

3. No errors in browser console

4. Images load properly

---

## Still Not Working?

### Last Resort Checks:

1. **Restart PHP:** Sometimes needed after plugin install
2. **Check PHP Version:** ACF requires PHP 7.4+
3. **Check WP Version:** Should be 5.9+
4. **Disable Other Plugins:** Test if plugin conflict
5. **Check Error Logs:** wp-content/debug.log

### Get More Info:

Enable WP Debug:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check: `wp-content/debug.log`

---

## Summary: Most Common Issue

**90% of the time it's this:**

Field Group "Show in GraphQL" is NOT checked ❌

**Solution:**
1. ACF → Field Groups → Edit your group
2. Look for "Show in GraphQL" checkbox
3. ✅ Check it
4. Enter "acfSlider" as GraphQL Field Name
5. Save
6. Test again

✅ Should work now!
