# Corrected GraphQL Query (Based on Your Errors)

## Fixed Query (Copy this to GraphQL Playground)

```graphql
query GetCompleteProduct($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    __typename
    id
    databaseId
    name
    slug
    type
    status
    featured
    catalogVisibility
    description
    shortDescription
    sku
    date
    modified
    onSale
    purchasable
    totalSales
    externalUrl
    buttonText
    taxStatus
    taxClass
    manageStock
    stockQuantity
    stockStatus
    backorders
    backordersAllowed
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
    }
    ... on SimpleProduct {
      __typename
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
      manageStock
      backorders
      backordersAllowed
      virtual
      downloadable
      downloadLimit
      downloadExpiry
    }
    ... on VariableProduct {
      __typename
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
      manageStock
      backorders
      backordersAllowed
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
          stockStatus
          stockQuantity
          manageStock
          backorders
          backordersAllowed
          weight
          length
          width
          height
          purchasable
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
        }
      }
    }
    ... on ExternalProduct {
      __typename
      price
      regularPrice
      salePrice
      externalUrl
      buttonText
    }
    ... on DownloadableProduct {
      virtual
      downloadable
      downloadLimit
      downloadExpiry
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

## Key Changes Made:

1. **Moved pricing fields** into fragments:
   - `... on ProductWithPricing { price, regularPrice, salePrice }`
   - Added to both main product and variations

2. **Moved virtual/downloadable** into `DownloadableProduct` fragment

3. **Added `ProductWithPricing` fragment** for variations

---

**Run this corrected query and paste the response!** This should work without errors and show us the exact structure of your WooCommerce data. 🚀
