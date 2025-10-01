# Complete Product Query - Get All Fields

## Query (Copy this to GraphQL Playground)

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
    price
    regularPrice
    salePrice
    onSale
    purchasable
    totalSales
    virtual
    downloadable
    downloadLimit
    downloadExpiry
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
          price
          regularPrice
          salePrice
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
          virtual
          downloadable
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
    ... on GroupProduct {
      __typename
      addToCartText
      addToCartDescription
    }
  }
}
```

## Variables (Copy this to Variables section)

```json
{
  "slug": "your-product-slug-here"
}
```

---

## Alternative Query with Different ID Types

### Using Database ID
```graphql
query GetProductById($id: ID!) {
  product(id: $id, idType: DATABASE_ID) {
    # ... same fields as above
  }
}
```

### Variables for Database ID
```json
{
  "id": "1139"
}
```

---

## What This Query Will Show:

1. **All basic product fields**
2. **All pricing fields** (price, regularPrice, salePrice)
3. **All stock fields** (stockStatus, stockQuantity, etc.)
4. **Product type information** (__typename)
5. **Attributes and variations** (complete structure)
6. **Images and gallery**
7. **Categories and tags**
8. **All variation details** (if variable product)

---

## Instructions:

1. **Go to your GraphQL Playground**
2. **Copy the complete query above**
3. **Replace `"your-product-slug-here"`** with any product slug (simple or variable)
4. **Run the query**
5. **Copy the ENTIRE response** and paste it here

This will show us:
- ✅ What fields are actually available
- ✅ How variation pricing is structured
- ✅ What the attribute/variation relationship looks like
- ✅ Any missing or different field names

**Run this and give me the complete JSON response!** 🔍
