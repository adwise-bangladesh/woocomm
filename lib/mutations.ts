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
                ... on SimpleProduct {
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
                ... on SimpleProduct {
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
                ... on SimpleProduct {
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

// Mutation for checkout
export const CHECKOUT = gql`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        id
        databaseId
        orderNumber
        status
        total
        date
      }
      result
      redirect
    }
  }
`;
