'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { fetchWithSession } from '@/lib/graphql-client';
import { useCartStore } from '@/lib/store';

interface OrderNowButtonProps {
  productId: number;
  variationId?: number;
  disabled?: boolean;
}

export default function OrderNowButton({ productId, variationId, disabled = false }: OrderNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { sessionToken, setSessionToken, setCart } = useCartStore();

  const handleOrderNow = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const ADD_TO_CART_QUERY = `
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
      
      const variables = {
        input: {
          productId,
          quantity: 1,
          ...(variationId && { variationId }),
        },
      };
      
      const { data, sessionToken: newSessionToken } = await fetchWithSession(
        ADD_TO_CART_QUERY,
        variables,
        sessionToken || undefined
      );

      // Store the new session token
      if (newSessionToken) {
        setSessionToken(newSessionToken);
      }

      // Update cart state
      const response = data as { addToCart: { cart: Record<string, unknown> } };
      if (response.addToCart?.cart) {
        setCart(response.addToCart.cart as never);
        
        // Redirect to checkout
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Check if it's a stock status error
      const errorMessage = (error as Error)?.message || 'Unknown error';
      
      if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('inventory')) {
        alert('This product is currently out of stock but available for pre-order. We are processing your request...');
        // For pre-orders, we might want to redirect to a special pre-order form
        // For now, let's redirect to contact
        router.push('/');
      } else {
        alert(`Failed to process order: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleOrderNow}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[5px] font-semibold transition-colors ${
        disabled || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'text-white'
      }`}
      style={!disabled && !isLoading ? { backgroundColor: '#fe6c06' } : {}}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          (e.target as HTMLElement).style.backgroundColor = '#e55a00';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          (e.target as HTMLElement).style.backgroundColor = '#fe6c06';
        }
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          Order Now
        </>
      )}
    </button>
  );
}

