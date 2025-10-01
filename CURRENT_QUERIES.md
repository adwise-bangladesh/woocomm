# Current GraphQL Queries

## GET_PRODUCT_BY_SLUG Query

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
          image {
            sourceUrl
            altText
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

## Issues to Check:

1. **Variation Price Fields**: Are `price`, `regularPrice`, `salePrice` being returned for variations?
2. **Fragment Support**: Does your WooCommerce GraphQL support `ProductWithPricing` fragment for variations?
3. **Attribute Matching**: Are variation attributes matching the product attributes?

## Alternative Query (if fragments don't work):

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
    price
    regularPrice
    salePrice
    stockStatus
    stockQuantity
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
