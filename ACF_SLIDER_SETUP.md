# ACF Slider Setup Guide

This guide explains how to set up the homepage slider using Advanced Custom Fields (ACF) and WPGraphQL for ACF.

## Prerequisites

1. **WPGraphQL** - Already installed ✅
2. **WPGraphQL for WooCommerce** - Already installed ✅
3. **Advanced Custom Fields (ACF) PRO** - Required
4. **WPGraphQL for Advanced Custom Fields** - Required

## Installation

### 1. Install Required Plugins

Install these plugins in your WordPress admin:

1. **Advanced Custom Fields PRO**
   - Purchase from: https://www.advancedcustomfields.com/pro/
   - Or install free version from WordPress.org (limited features)

2. **WPGraphQL for Advanced Custom Fields**
   - Install from WordPress.org: Search "WPGraphQL ACF"
   - Or via Composer: `composer require wpackagist-plugin/wpgraphql-acf`
   - Documentation: https://acf.wpgraphql.com/

## Setup Instructions

### Option 1: Using Custom Post Type "Slider" (Recommended)

#### Step 1: Register Custom Post Type

Add this code to your theme's `functions.php`:

```php
function register_slider_post_type() {
    $args = array(
        'label' => 'Sliders',
        'public' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-images-alt2',
        'supports' => array('title', 'page-attributes'),
        'show_in_graphql' => true,
        'graphql_single_name' => 'slider',
        'graphql_plural_name' => 'sliders',
    );
    register_post_type('slider', $args);
}
add_action('init', 'register_slider_post_type');
```

#### Step 2: Create ACF Field Group

1. Go to **ACF → Field Groups → Add New**
2. Title: "Slider Fields"
3. Add these fields:

**Field 1: Slider Image**
- Field Label: `Slider Image`
- Field Name: `slider_image`
- Field Type: `Image`
- Return Format: `Image Array`
- Show in GraphQL: ✅ Yes
- GraphQL Field Name: `sliderImage`

**Field 2: Slider Title**
- Field Label: `Slider Title`
- Field Name: `slider_title`
- Field Type: `Text`
- Show in GraphQL: ✅ Yes
- GraphQL Field Name: `sliderTitle`

**Field 3: Slider Description**
- Field Label: `Slider Description`
- Field Name: `slider_description`
- Field Type: `Textarea`
- Show in GraphQL: ✅ Yes
- GraphQL Field Name: `sliderDescription`

**Field 4: Slider Link**
- Field Label: `Slider Link`
- Field Name: `slider_link`
- Field Type: `URL`
- Show in GraphQL: ✅ Yes
- GraphQL Field Name: `sliderLink`

**Field 5: Slider Button Text**
- Field Label: `Slider Button Text`
- Field Name: `slider_button_text`
- Field Type: `Text`
- Show in GraphQL: ✅ Yes
- GraphQL Field Name: `sliderButtonText`

#### Step 3: Configure Location Rules

Under "Location" section:
- Show this field group if: **Post Type** is equal to **slider**

#### Step 4: Configure GraphQL Settings

In the field group settings:
- **GraphQL Field Name**: `acfSlider`
- **Show in GraphQL**: ✅ Yes

#### Step 5: Create Slider Posts

1. Go to **Sliders → Add New**
2. Enter title (for admin reference)
3. Fill in ACF fields:
   - Upload slider image
   - Add title, description
   - Add link URL (optional)
   - Add button text (optional)
4. Set **Order** attribute (for sorting)
5. Publish

Create 3-5 slider posts for your homepage.

---

### Option 2: Using ACF Options Page (Alternative)

#### Step 1: Enable ACF Options Page

Add to `functions.php`:

```php
if( function_exists('acf_add_options_page') ) {
    acf_add_options_page(array(
        'page_title'    => 'Homepage Settings',
        'menu_title'    => 'Homepage',
        'menu_slug'     => 'homepage-settings',
        'capability'    => 'edit_posts',
        'show_in_graphql' => true,
        'graphql_field_name' => 'acfOptionsHomepage',
    ));
}
```

#### Step 2: Create ACF Field Group

1. **Field Group Title**: "Homepage Slider"
2. Add a **Repeater Field**:
   - Field Name: `hero_slider`
   - GraphQL Field Name: `heroSlider`
   - Sub Fields: (same as above - sliderImage, sliderTitle, etc.)

3. **Location Rules**: Options Page is equal to "Homepage Settings"

---

### Option 3: Using Homepage with ACF Fields

#### Step 1: Create Homepage

1. Create a page with slug "homepage" or your home page
2. Set as front page in **Settings → Reading**

#### Step 2: Create ACF Field Group

Follow same field structure as Option 1, but:
- **Location Rule**: Page is equal to "Homepage"
- Add a Repeater field called `hero_slider`

---

## Verifying Setup

### Test in GraphiQL

Go to **GraphQL IDE** in WordPress admin and run:

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

You should see your slider data returned!

## Frontend Query Used

The frontend uses this query (already configured in `lib/queries.ts`):

```graphql
query GetSliderImages {
  sliders(first: 10, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
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

## Troubleshooting

### Slider not showing?
- Check that WPGraphQL for ACF is installed and activated
- Verify field group has "Show in GraphQL" enabled
- Check GraphQL field names match query
- Ensure slider posts are published

### GraphQL errors?
- Test query in GraphiQL IDE
- Check ACF field configuration
- Verify custom post type is registered with GraphQL support

### Images not loading?
- Check image URLs in GraphQL response
- Verify `next.config.ts` has correct remote patterns
- Ensure images are uploaded properly in WordPress

## Field Name Reference

Make sure these exact field names in ACF:

| ACF Field Name | GraphQL Field Name | Type |
|---|---|---|
| slider_image | sliderImage | Image |
| slider_title | sliderTitle | Text |
| slider_description | sliderDescription | Textarea |
| slider_link | sliderLink | URL |
| slider_button_text | sliderButtonText | Text |

Field Group GraphQL Name: `acfSlider`

## Alternative Queries

If you used Options Page, update the import in `app/page.tsx`:

```typescript
import { GET_SLIDER_FROM_OPTIONS } from '@/lib/queries';
```

If you used Homepage, use:

```typescript
import { GET_HOMEPAGE_SLIDER } from '@/lib/queries';
```

---

## Support

- [WPGraphQL for ACF Docs](https://acf.wpgraphql.com/)
- [ACF Documentation](https://www.advancedcustomfields.com/resources/)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs)

---

**Once set up, your slider will automatically pull from WordPress and display on the homepage!** 🎉
