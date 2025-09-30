'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { createSessionClient } from '@/lib/graphql-client';
import { ADD_TO_CART } from '@/lib/mutations';
import { ShoppingCart } from 'lucide-react';

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
    setIsLoading(true);
    try {
      const client = createSessionClient(sessionToken || undefined);
      
      const variables = {
        input: {
          productId,
          quantity: 1,
          ...(variationId && { variationId }),
        },
      };

      const response = await client.request(ADD_TO_CART, variables) as { addToCart: { cart: unknown } };

      // Extract session token if available
      // Note: With graphql-request, we need to handle this differently
      // For now, we'll store it when available
      
      if (response.addToCart.cart) {
        setCart(response.addToCart.cart);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
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
