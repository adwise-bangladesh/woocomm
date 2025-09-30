# Find Your Actual ACF Field Names

## Step 1: Run This Query in GraphiQL

Copy and paste this into GraphiQL IDE:

```graphql
{
  __type(name: "AcfSlider") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

## Step 2: You'll Get Results Like This

```json
{
  "data": {
    "__type": {
      "name": "AcfSlider",
      "fields": [
        {
          "name": "subtitle",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        },
        {
          "name": "description", 
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        },
        {
          "name": "image",
          "type": {
            "name": "MediaItem",
            "kind": "OBJECT"
          }
        },
        {
          "name": "link",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        },
        {
          "name": "buttonText",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        }
      ]
    }
  }
}
```

## Step 3: Write Down Your Field Names

Based on the results, your actual field names are:

```
✅ subtitle (not sliderTitle)
✅ description (not sliderDescription)  
✅ image (not sliderImage)
✅ link (probably correct)
✅ buttonText (probably correct)
```

## Step 4: Test with Correct Names

Now test this query:

```graphql
{
  sliders(first: 3) {
    nodes {
      title
      acfSlider {
        image {
          sourceUrl
          altText
        }
        subtitle
        description
        link
        buttonText
      }
    }
  }
}
```

## If This Works ✅

Tell me the field names you found, and I'll update all the code to use them!

## If Still Errors ❌

Share the exact output from the `__type` query above.
