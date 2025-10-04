import { gql } from 'graphql-request';

// Mutation to add item to cart
export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
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
                ... on InventoriedProduct {
                  stockStatus
                  stockQuantity
                }
              }
            }
            variation {
              node {
                id
                databaseId
                name
                price
                ... on InventoriedProduct {
                  stockStatus
                  stockQuantity
                }
              }
            }
          }
        }
        subtotal
        total
        isEmpty
      }
    }
  }
`;

// Mutation to remove item from cart
export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($input: RemoveItemsFromCartInput!) {
    removeItemsFromCart(input: $input) {
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
  }
`;

// Mutation to update cart item quantity
export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
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
  }
`;

// Mutation to create customer session
export const CREATE_CUSTOMER_SESSION = gql`
  mutation CreateCustomerSession {
    createCustomerSession {
      customerSessionToken
    }
  }
`;

// Mutation to place order with live API
export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        id
        orderNumber
        total
        shippingTotal
        status
        shippingLines {
          nodes {
            methodTitle
            total
          }
        }
        lineItems {
          nodes {
            product {
              node {
                name
              }
            }
            quantity
            total
          }
        }
      }
    }
  }
`;

// Simplified add to cart mutation for checkout
export const ADD_TO_CART_SIMPLE = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
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
                ... on InventoriedProduct {
                  stockStatus
                  stockQuantity
                }
              }
            }
            variation {
              node {
                id
                databaseId
                name
                price
                ... on InventoriedProduct {
                  stockStatus
                  stockQuantity
                }
              }
            }
          }
        }
        subtotal
        total
        isEmpty
      }
    }
  }
`;


