# GraphQL Playground Query for Variable Products

## Current Query (Copy this to GraphQL Playground)

```graphql
query GetProductBySlug($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    id
    databaseId
    name
    slug
    type
    description
    shortDescription
    image {
      sourceUrl
      altText
    }
    galleryImages {
      nodes {
        sourceUrl
        altText
      }
    }
    ... on ProductWithPricing {
      price
      regularPrice
      salePrice
    }
    ... on InventoriedProduct {
      stockStatus
      stockQuantity
    }
    ... on VariableProduct {
      variations(first: 50) {
        nodes {
          id
          databaseId
          name
          price
          regularPrice
          salePrice
          stockStatus
          stockQuantity
          image {
            sourceUrl
            altText
          }
          attributes {
            nodes {
              name
              value
            }
          }
        }
      }
      attributes {
        nodes {
          name
          options
        }
      }
    }
  }
}
```

## Variables (Copy this to Variables section)

```json
{
  "slug": "your-variable-product-slug"
}
```

---

## Alternative Queries to Test

### 1. Simple Variable Product Query
```graphql
query TestVariableProduct($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    id
    name
    type
    ... on VariableProduct {
      variations {
        nodes {
          id
          name
          price
          regularPrice
          salePrice
          attributes {
            nodes {
              name
              value
            }
          }
        }
      }
      attributes {
        nodes {
          name
          options
        }
      }
    }
  }
}
```

### 2. Check Available Fields
```graphql
query CheckProductFields($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    __typename
    id
    name
    type
    ... on VariableProduct {
      __typename
      variations {
        nodes {
          __typename
          id
          name
          price
          regularPrice
          salePrice
        }
      }
    }
  }
}
```

### 3. Test with Database ID (if slug doesn't work)
```graphql
query GetProductById($id: ID!) {
  product(id: $id, idType: DATABASE_ID) {
    id
    name
    type
    ... on VariableProduct {
      variations {
        nodes {
          id
          name
          price
          regularPrice
          salePrice
          attributes {
            nodes {
              name
              value
            }
          }
        }
      }
      attributes {
        nodes {
          name
          options
        }
      }
    }
  }
}
```

---

## How to Test:

1. **Go to your GraphQL Playground** (usually at `/graphql`)
2. **Copy the first query** into the left panel
3. **Copy the variables** into the Variables section (bottom left)
4. **Replace `"your-variable-product-slug"`** with your actual product slug
5. **Click the Play button**

## What to Look For:

✅ **Good Response:**
```json
{
  "data": {
    "product": {
      "type": "VARIABLE",
      "variations": {
        "nodes": [
          {
            "id": "...",
            "name": "Size: 32, Color: Black",
            "price": "1500",
            "regularPrice": "2000",
            "salePrice": "1500"
          }
        ]
      }
    }
  }
}
```

❌ **Bad Response:**
```json
{
  "data": {
    "product": {
      "variations": {
        "nodes": [
          {
            "price": null,
            "regularPrice": null,
            "salePrice": null
          }
        ]
      }
    }
  }
}
```

## If Prices are NULL:

Try these alternative field names:
- `rawPrice` instead of `price`
- `formattedPrice` instead of `price`
- Check if your WooCommerce GraphQL plugin supports pricing fields for variations

---

**Test this in the playground and tell me what response you get!**
