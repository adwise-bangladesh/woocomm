'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { fetchWithSession } from '@/lib/graphql-client';
import { ShoppingCart } from 'lucide-react';
import { validateProductId } from '@/lib/utils/sanitizer';
// import { logger } from '@/lib/utils/performance';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

interface AddToCartButtonProps {
  productId: number;
  variationId?: number;
  disabled?: boolean;
  productData?: {
    name?: string;
    productCategories?: {
      nodes?: Array<{
        name?: string;
      }>;
    };
  };
}

export default function AddToCartButton({
  productId,
  variationId,
  disabled = false,
  productData,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { sessionToken, setSessionToken, setCart } = useCartStore();
  const { trackCartAdd } = useFacebookPixel();

  const handleAddToCart = async () => {
    // Validate inputs
    const validProductId = validateProductId(productId);
    const validVariationId = variationId ? validateProductId(variationId) : null;
    
    if (!validProductId) {
      alert('Invalid product. Please refresh the page and try again.');
      return;
    }
    
    if (variationId && !validVariationId) {
      alert('Invalid product variation. Please refresh the page and try again.');
      return;
    }

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
          productId: validProductId,
          quantity: 1,
          ...(validVariationId && { variationId: validVariationId }),
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
      
      const response = data as { addToCart: { cart: Record<string, unknown> } };
      if (response.addToCart?.cart) {
        setCart(response.addToCart.cart as never);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        
        // Track Facebook Pixel AddToCart event with complete product data
        const cartContents = ((response.addToCart.cart as Record<string, unknown>)?.contents as Record<string, unknown>)?.nodes as Record<string, unknown>[] || [];
        const addedItem = cartContents.find((item: Record<string, unknown>) => 
          ((item.product as Record<string, unknown>)?.node as Record<string, unknown>)?.databaseId === productId || 
          ((item.variation as Record<string, unknown>)?.node as Record<string, unknown>)?.databaseId === productId
        );
        
        if (addedItem) {
          const product = (addedItem.product as Record<string, unknown>)?.node || (addedItem.variation as Record<string, unknown>)?.node;
          // Get price from cart item total or product price
          const itemPrice = parseFloat((addedItem.total as string)?.replace(/[^0-9.-]+/g, '') || '0') || 
                           parseFloat(((product as Record<string, unknown>)?.price as string)?.replace(/[^0-9.-]+/g, '') || '0');
          
          // Use passed product data or fallback to cart data
          const enhancedProductData = {
            databaseId: (product as Record<string, unknown>)?.databaseId || productId,
            id: (product as Record<string, unknown>)?.id || productId.toString(),
            name: productData?.name || (product as Record<string, unknown>)?.name || 'Unknown Product',
            price: itemPrice.toString(),
            salePrice: itemPrice.toString(),
            regularPrice: itemPrice.toString(),
            productCategories: productData?.productCategories || { nodes: [] }
          };
          trackCartAdd(enhancedProductData, 1);
        }
      }
    } catch (error) {
      // Check if it's a stock status error
      const errorMessage = (error as Error)?.message || 'Unknown error';
      
      if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('inventory')) {
        alert('This product is currently out of stock but available for pre-order. Please use the "Order Now" button to place a pre-order.');
      } else {
        alert(`Failed to add to cart: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold
        transition-all duration-200
        ${
          isAdded
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        ${isLoading ? 'opacity-75 cursor-wait' : ''}
      `}
    >
      <ShoppingCart className="w-5 h-5" />
      {isLoading ? 'Adding...' : isAdded ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
