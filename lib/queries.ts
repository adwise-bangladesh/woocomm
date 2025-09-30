import { gql } from 'graphql-request';

// Query to get site settings (logo, title, etc.)
export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    generalSettings {
      title
      description
      url
    }
    siteLogo {
      id
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
`;

// Query to get primary menu
export const GET_MENU = gql`
  query GetMenu($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 50) {
      nodes {
        id
        label
        url
        path
        target
        parentId
        order
      }
    }
  }
`;

// Query to get product categories (only parent categories)
export const GET_CATEGORIES = gql`
  query GetCategories {
    productCategories(first: 20, where: { hideEmpty: true, parent: null }) {
      nodes {
        id
        name
        slug
        count
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

// Query to get slider/banner images from ACF
// This assumes you have a "Slider" post type with ACF fields
export const GET_SLIDER_IMAGES = gql`
  query GetSliderImages {
    sliders(first: 10, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
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
`;

// Alternative: Query for ACF options page slider (if using ACF Options)
export const GET_SLIDER_FROM_OPTIONS = gql`
  query GetSliderFromOptions {
    acfOptionsHomepage {
      homepage {
        heroSlider {
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
`;

// Alternative: Query for Page with ACF slider fields
export const GET_HOMEPAGE_SLIDER = gql`
  query GetHomepageSlider {
    page(id: "homepage", idType: URI) {
      id
      title
      acfHomepage {
        heroSlider {
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
`;

// Query to get all products with pagination
// Using ProductWithPricing interface to access price fields
// Sorted by: Date (newest first), Featured status included for frontend sorting
export const GET_PRODUCTS = gql`
  query GetProducts($first: Int!, $after: String) {
    products(
      first: $first
      after: $after
      where: { orderby: { field: DATE, order: DESC } }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        featured
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
        }
      }
    }
  }
`;

// Query to get popular products (by sales/popularity)
export const GET_POPULAR_PRODUCTS = gql`
  query GetPopularProducts($first: Int!) {
    products(
      first: $first
      where: { orderby: { field: POPULARITY, order: DESC } }
    ) {
      nodes {
        id
        name
        slug
        featured
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
        }
      }
    }
  }
`;

// Simpler products query without inline fragments (use if above fails)
export const GET_PRODUCTS_SIMPLE = gql`
  query GetProductsSimple($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

// Query to get flash sale products (on sale)
export const GET_FLASH_SALE_PRODUCTS = gql`
  query GetFlashSaleProducts($first: Int = 8) {
    products(first: $first, where: { onSale: true }) {
      nodes {
        id
        name
        slug
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
        }
      }
    }
  }
`;

// Query to get a single product by slug
export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
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
    }
  }
`;

// Query to get cart
export const GET_CART = gql`
  query GetCart {
    cart {
      contents {
        nodes {
          key
          quantity
          total
          subtotal
          product {
            node {
              id
              databaseId
              name
              slug
              image {
                sourceUrl
                altText
              }
              ... on ProductWithPricing {
                price
              }
            }
          }
          variation {
            node {
              id
              databaseId
              name
              price
            }
          }
        }
      }
      subtotal
      total
      isEmpty
    }
  }
`;

// Query to get customer data
export const GET_CUSTOMER = gql`
  query GetCustomer {
    customer {
      billing {
        firstName
        lastName
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      shipping {
        firstName
        lastName
        address1
        address2
        city
        state
        postcode
        country
      }
    }
  }
`;
