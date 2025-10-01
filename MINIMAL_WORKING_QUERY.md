# Minimal Working Query (No Errors)

## Clean Query (Copy this to GraphQL Playground)

```graphql
query GetProductMinimal($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    __typename
    id
    databaseId
    name
    slug
    type
    status
    featured
    description
    shortDescription
    sku
    date
    modified
    onSale
    purchasable
    totalSales
    soldIndividually
    weight
    length
    width
    height
    reviewsAllowed
    averageRating
    reviewCount
    relatedIds
    upsellIds
    crossSellIds
    parentId
    purchaseNote
    categories {
      nodes {
        id
        name
        slug
      }
    }
    tags {
      nodes {
        id
        name
        slug
      }
    }
    image {
      id
      sourceUrl
      altText
      title
    }
    galleryImages {
      nodes {
        id
        sourceUrl
        altText
        title
      }
    }
    attributes {
      nodes {
        id
        name
        options
        position
        visible
        variation
        __typename
      }
    }
    defaultAttributes {
      nodes {
        id
        name
        value
        __typename
      }
    }
    ... on ProductWithPricing {
      price
      regularPrice
      salePrice
      taxStatus
      taxClass
    }
    ... on InventoriedProduct {
      manageStock
      stockQuantity
      stockStatus
      backorders
      backordersAllowed
    }
    ... on SimpleProduct {
      __typename
    }
    ... on VariableProduct {
      __typename
      variations(first: 50) {
        nodes {
          __typename
          id
          databaseId
          name
          slug
          status
          description
          sku
          onSale
          purchasable
          weight
          length
          width
          height
          image {
            id
            sourceUrl
            altText
            title
          }
          attributes {
            nodes {
              id
              name
              value
              __typename
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
            manageStock
            backorders
            backordersAllowed
          }
        }
      }
    }
    ... on ExternalProduct {
      __typename
      externalUrl
      buttonText
    }
  }
}
```

## Variables

```json
{
  "slug": "hawkeye-yoga-short"
}
```

---

## What I Removed/Fixed:

1. **Moved all pricing fields** to `ProductWithPricing` fragment
2. **Moved all inventory fields** to `InventoriedProduct` fragment  
3. **Moved external fields** to `ExternalProduct` fragment
4. **Removed problematic fields** that might not be supported

---

## Key Focus Areas:

**For Variable Products, look for:**
```json
"variations": {
  "nodes": [
    {
      "price": "...",
      "regularPrice": "...",
      "salePrice": "...",
      "attributes": {
        "nodes": [
          {
            "name": "Size",
            "value": "32"
          }
        ]
      }
    }
  ]
}
```

**Run this query and paste the response - it should work without errors!** 🚀
