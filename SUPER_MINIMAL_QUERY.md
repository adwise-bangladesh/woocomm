# Super Minimal Query (Should Work)

## Absolute Minimal Query

```graphql
query GetProductBasic {
  product(id: "hawkeye-yoga-short", idType: SLUG) {
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
    reviewsAllowed
    averageRating
    reviewCount
    purchaseNote
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
    ... on ProductWithPricing {
      price
      regularPrice
      salePrice
    }
    ... on InventoriedProduct {
      manageStock
      stockQuantity
      stockStatus
      backorders
      backordersAllowed
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
          sku
          onSale
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
  }
}
```

---

## Even More Minimal (Just Variations)

If the above still has errors, try this super basic one:

```graphql
query GetVariationsOnly {
  product(id: "hawkeye-yoga-short", idType: SLUG) {
    __typename
    id
    name
    type
    ... on VariableProduct {
      variations(first: 10) {
        nodes {
          __typename
          id
          name
          attributes {
            nodes {
              name
              value
            }
          }
          ... on ProductWithPricing {
            price
            regularPrice
            salePrice
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

**Try the first query, and if it still has errors, try the second one. One of these should work!** 🚀

The key is to see if we can get the **variation pricing data** with the `ProductWithPricing` fragment.
