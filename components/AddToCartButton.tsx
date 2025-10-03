'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { createSessionClient } from '@/lib/graphql-client';
import { ADD_TO_CART } from '@/lib/mutations';
import { ShoppingCart } from 'lucide-react';
import { validateProductId } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/utils/performance';

interface CartResponse {
  contents: { nodes: never[] };
  subtotal: string;
  total: string;
  isEmpty: boolean;
}

interface AddToCartButtonProps {
  productId: number;
  variationId?: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  variationId,
  disabled = false,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { sessionToken, setCart } = useCartStore();

  const handleAddToCart = async () => {
    // Validate inputs
    const validProductId = validateProductId(productId);
    const validVariationId = variationId ? validateProductId(variationId) : null;
    
    if (!validProductId) {
      logger.error('Invalid product ID', { productId });
      alert('Invalid product. Please refresh the page and try again.');
      return;
    }
    
    if (variationId && !validVariationId) {
      logger.error('Invalid variation ID', { variationId });
      alert('Invalid product variation. Please refresh the page and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const client = createSessionClient(sessionToken || undefined);
      
      const variables = {
        input: {
          productId: validProductId,
          quantity: 1,
          ...(validVariationId && { variationId: validVariationId }),
        },
      };

      const response = await client.request(ADD_TO_CART, variables) as { addToCart: { cart: CartResponse } };

      // Extract session token if available
      // Note: With graphql-request, we need to handle this differently
      // For now, we'll store it when available
      
      if (response.addToCart.cart) {
        setCart(response.addToCart.cart as never);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (error: any) {
      logger.error('Error adding to cart', error);
      
      // Check if it's a stock status error
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Unknown error';
      
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
