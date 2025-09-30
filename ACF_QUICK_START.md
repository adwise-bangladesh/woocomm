# ACF Slider - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Plugins (WordPress Admin)

1. Install **Advanced Custom Fields PRO** (or free version)
2. Install **WPGraphQL for Advanced Custom Fields**
   - Search "WPGraphQL ACF" in Plugins → Add New

### Step 2: Register Slider Post Type

Add to your theme's `functions.php`:

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

### Step 3: Create ACF Field Group

**ACF → Field Groups → Add New**

**Title:** Slider Fields

**Fields:**
1. Image Field: `slider_image` → GraphQL: `sliderImage`
2. Text Field: `slider_title` → GraphQL: `sliderTitle`
3. Textarea: `slider_description` → GraphQL: `sliderDescription`
4. URL Field: `slider_link` → GraphQL: `sliderLink`
5. Text Field: `slider_button_text` → GraphQL: `sliderButtonText`

**Location:** Post Type = slider

**Settings:**
- ✅ Show in GraphQL
- GraphQL Field Name: `acfSlider`

### Step 4: Create Slider Posts

1. Go to **Sliders → Add New**
2. Add title, upload image, fill fields
3. Set **Order** (0, 1, 2, etc. for sorting)
4. Publish
5. Create 3+ slides

### Step 5: Test in GraphiQL

WordPress Admin → GraphQL IDE:

```graphql
{
  sliders {
    nodes {
      title
      acfSlider {
        sliderImage {
          sourceUrl
        }
        sliderTitle
      }
    }
  }
}
```

### ✅ Done!

Refresh your frontend at **http://localhost:3001** - slider should appear!

---

## Field Names Must Match Exactly

| ACF Field | GraphQL Name | Type |
|-----------|--------------|------|
| slider_image | sliderImage | Image |
| slider_title | sliderTitle | Text |
| slider_description | sliderDescription | Textarea |
| slider_link | sliderLink | URL |
| slider_button_text | sliderButtonText | Text |

Field Group: `acfSlider`

---

## Full Documentation

See `ACF_SLIDER_SETUP.md` for:
- Alternative setups (Options Page, Homepage)
- Troubleshooting
- Advanced configuration
- Different query options
