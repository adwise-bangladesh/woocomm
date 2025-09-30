# ACF Field Names - Actual Mapping

## ✅ All Code Updated!

Based on your ACF schema, I've updated all the code to use the correct field names.

## Your Actual ACF Field Names

```json
{
  "buttonText": "String",
  "image": "AcfMediaItemConnectionEdge",
  "link": "String", 
  "subtitle": "String",
  "title": "String"
}
```

## Field Mapping

| What We Query Now | ACF Field Type | Notes |
|-------------------|----------------|-------|
| `image.node.sourceUrl` | AcfMediaItemConnectionEdge | Image field (nested) |
| `image.node.altText` | AcfMediaItemConnectionEdge | Image alt text |
| `title` | String | Main slider title |
| `subtitle` | String | Slider description |
| `link` | String | Button link URL |
| `buttonText` | String | Button text |

## Updated Files

✅ **lib/queries.ts**
- GET_SLIDER_IMAGES
- GET_SLIDER_FROM_OPTIONS  
- GET_HOMEPAGE_SLIDER

✅ **lib/types.ts**
- SliderImage interface

✅ **components/HeroSlider.tsx**
- ACFSliderData interface
- Placeholder slides
- Rendering logic

## Test Query (Copy & Paste into GraphiQL)

```graphql
{
  sliders(first: 3) {
    nodes {
      id
      title
      acfSlider {
        image {
          node {
            sourceUrl
            altText
          }
        }
        title
        subtitle
        link
        buttonText
      }
    }
  }
}
```

## Expected Response

```json
{
  "data": {
    "sliders": {
      "nodes": [
        {
          "id": "cG9zdDoxMjM=",
          "title": "Slide 1",
          "acfSlider": {
            "image": {
              "node": {
                "sourceUrl": "https://backend.zonash.com/wp-content/uploads/2025/01/banner.jpg",
                "altText": "Welcome Banner"
              }
            },
            "title": "Welcome to Zonash",
            "subtitle": "Shop amazing products at great prices",
            "link": "/shop",
            "buttonText": "Shop Now"
          }
        }
      ]
    }
  }
}
```

## What Changed

### Old Field Names (Wrong ❌)
```typescript
sliderImage { sourceUrl }
sliderTitle
sliderDescription
sliderLink
sliderButtonText
```

### New Field Names (Correct ✅)
```typescript
image { node { sourceUrl } }
title
subtitle
link
buttonText
```

## Important Note About Image Field

The `image` field is **NOT** a simple MediaItem. It's wrapped in a connection edge:

```graphql
image {
  node {    # ← Notice the "node" wrapper
    sourceUrl
    altText
  }
}
```

This is why we access it as `acf.image.node.sourceUrl` in the component.

## Your ACF Setup in WordPress

Based on your schema, your ACF fields should be named:

1. **Field Name:** `image`
   - Type: Image
   - GraphQL Field Name: `image`

2. **Field Name:** `title`
   - Type: Text
   - GraphQL Field Name: `title`

3. **Field Name:** `subtitle`
   - Type: Text/Textarea
   - GraphQL Field Name: `subtitle`

4. **Field Name:** `link`
   - Type: URL
   - GraphQL Field Name: `link`

5. **Field Name:** `button_text`
   - Type: Text
   - GraphQL Field Name: `buttonText`

## Next Steps

1. Test the query in GraphiQL ✅
2. Create slider posts with filled fields
3. Refresh http://localhost:3001
4. Slider should now work! 🎉

## Troubleshooting

If slider still doesn't show:

1. **Check if slider posts exist:**
   ```graphql
   { sliders { nodes { id title } } }
   ```

2. **Check if posts have ACF data:**
   ```graphql
   { sliders { nodes { acfSlider { title } } } }
   ```

3. **Check browser console** for errors

4. **Clear cache** (WordPress, browser, CDN)
