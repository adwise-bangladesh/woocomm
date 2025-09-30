# ACF Slider Architecture Diagram

## Data Flow

```
WordPress Backend
│
├── Custom Post Type: "slider"
│   └── Posts:
│       ├── Slider 1 (Order: 0)
│       ├── Slider 2 (Order: 1)
│       └── Slider 3 (Order: 2)
│
├── ACF Field Group: "Slider Fields"
│   └── Fields:
│       ├── slider_image (Image)
│       ├── slider_title (Text)
│       ├── slider_description (Textarea)
│       ├── slider_link (URL)
│       └── slider_button_text (Text)
│
└── WPGraphQL + WPGraphQL for ACF
    └── Exposes GraphQL API
        │
        ▼
    GraphQL Endpoint: /graphql
        │
        ▼
┌───────────────────────────────────────┐
│   Next.js Frontend                     │
│                                       │
│   lib/queries.ts                      │
│   └── GET_SLIDER_IMAGES               │
│       └── Query sliders with ACF      │
│           │                           │
│           ▼                           │
│   app/page.tsx                        │
│   └── Fetch slider data (SSR)        │
│       │                               │
│       ▼                               │
│   components/HeroSlider.tsx           │
│   └── Display slider with:            │
│       ├── Auto-play (5s)              │
│       ├── Navigation arrows           │
│       ├── Dot indicators              │
│       └── CTA buttons                 │
└───────────────────────────────────────┘
```

## GraphQL Query Structure

```
Query: GET_SLIDER_IMAGES
  └── sliders (Custom Post Type)
      └── nodes
          ├── id
          ├── title
          └── acfSlider (ACF Field Group)
              ├── sliderImage (ACF Field)
              │   ├── sourceUrl
              │   └── altText
              ├── sliderTitle (ACF Field)
              ├── sliderDescription (ACF Field)
              ├── sliderLink (ACF Field)
              └── sliderButtonText (ACF Field)
```

## Component Hierarchy

```
Homepage (app/page.tsx)
│
└── HeroSlider (components/HeroSlider.tsx)
    ├── Slide 1
    │   ├── Image
    │   ├── Title
    │   ├── Description
    │   └── CTA Button (optional)
    │
    ├── Slide 2
    │   └── ...
    │
    ├── Navigation Arrows
    └── Dot Indicators
```

## WordPress Setup Checklist

```
□ Install WPGraphQL
□ Install WPGraphQL for WooCommerce
□ Install Advanced Custom Fields PRO
□ Install WPGraphQL for ACF
□ Register "slider" post type with GraphQL support
□ Create ACF Field Group with correct GraphQL names
□ Set Location Rule: Post Type = slider
□ Enable "Show in GraphQL" for field group
□ Create 3+ slider posts with images
□ Publish slider posts
□ Test query in GraphiQL IDE
```

## ACF Field Configuration

```
Field Group: "Slider Fields"
├── GraphQL Field Name: acfSlider ✓
├── Show in GraphQL: Yes ✓
└── Fields:
    │
    ├── slider_image
    │   ├── Type: Image
    │   ├── Return: Image Array
    │   └── GraphQL: sliderImage ✓
    │
    ├── slider_title
    │   ├── Type: Text
    │   └── GraphQL: sliderTitle ✓
    │
    ├── slider_description
    │   ├── Type: Textarea
    │   └── GraphQL: sliderDescription ✓
    │
    ├── slider_link
    │   ├── Type: URL
    │   └── GraphQL: sliderLink ✓
    │
    └── slider_button_text
        ├── Type: Text
        └── GraphQL: sliderButtonText ✓
```

## Rendering Flow

```
1. User visits homepage
   ↓
2. Next.js SSR fetches data
   GET_SLIDER_IMAGES → WordPress GraphQL
   ↓
3. WordPress returns JSON:
   {
     sliders: {
       nodes: [
         {
           acfSlider: {
             sliderImage: { ... },
             sliderTitle: "Welcome",
             ...
           }
         }
       ]
     }
   }
   ↓
4. HeroSlider component receives data
   ↓
5. Component renders:
   - Maps through slides
   - Shows first slide (opacity-100)
   - Hides others (opacity-0)
   - Starts 5s auto-play timer
   ↓
6. Every 5 seconds:
   - Current slide fades out
   - Next slide fades in
   - Updates dot indicators
```

## Three Setup Options

### Option 1: Custom Post Type (Recommended) ⭐
```
slider CPT → ACF Fields → Multiple slider posts
✓ Easy to manage
✓ Can reorder slides
✓ Can enable/disable individual slides
```

### Option 2: ACF Options Page
```
Options Page → Repeater Field → Multiple rows
✓ Single location for all slides
✓ Simpler structure
✗ No post-level control
```

### Option 3: Homepage with ACF
```
Homepage → Repeater Field → Multiple rows
✓ Homepage-specific
✗ Less flexible
✗ Tied to specific page
```

## Query Alternatives

Based on your setup method:

```javascript
// Option 1: Custom Post Type
import { GET_SLIDER_IMAGES } from '@/lib/queries';

// Option 2: Options Page
import { GET_SLIDER_FROM_OPTIONS } from '@/lib/queries';

// Option 3: Homepage
import { GET_HOMEPAGE_SLIDER } from '@/lib/queries';
```

All three queries are available in `lib/queries.ts`!

---

## Need Help?

1. Check `ACF_QUICK_START.md` for 5-minute setup
2. Read `ACF_SLIDER_SETUP.md` for detailed guide
3. Test queries in GraphiQL IDE (WordPress Admin)
4. Check browser console for errors
5. Verify all plugins are active
