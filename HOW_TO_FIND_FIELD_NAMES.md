# How to Find Correct ACF Field Names

## Your Error Explained

```
"Cannot query field \"sliderImage\" on type \"AcfSlider\""
"Cannot query field \"sliderTitle\" on type \"AcfSlider\". Did you mean \"subtitle\"?"
```

This means:
- ✅ ACF is working and exposed to GraphQL
- ✅ The `acfSlider` field group exists
- ❌ But the individual field names don't match

## Quick Fix: Find Your Actual Field Names

### Method 1: Use GraphiQL Schema Explorer (Easiest)

1. Go to **WordPress Admin → GraphQL → GraphiQL IDE**

2. Click the **"Docs"** button (top right)

3. Search for **"AcfSlider"**

4. Click on it to see all available fields

5. You'll see something like:
   ```
   type AcfSlider {
     subtitle: String
     description: String
     image: MediaItem
     link: String
     buttonText: String
   }
   ```

### Method 2: Test Query to Discover Fields

Run this query in GraphiQL:

```graphql
{
  __type(name: "AcfSlider") {
    fields {
      name
      type {
        name
      }
    }
  }
}
```

This will show you ALL available field names!

### Method 3: Check ACF Field Settings

1. Go to **ACF → Field Groups**
2. Edit your slider field group
3. For each field, look at the **"GraphQL Field Name"** 
4. Write them down

## Common Field Name Patterns

Your error said `Did you mean "subtitle"?` - this tells us:

| What We're Querying | What ACF Has | Fix Needed |
|---------------------|--------------|------------|
| sliderTitle | subtitle | Change query |
| sliderDescription | description | Change query |
| sliderImage | image | Change query |
| sliderLink | link | Probably OK |
| sliderButtonText | buttonText | Probably OK |

## Fix Options

### Option A: Update the Query (Recommended)

Update your query to match ACF's field names.

### Option B: Update ACF Field Names

Change the GraphQL field names in ACF to match our query.
