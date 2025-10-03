'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { createSessionClient } from '@/lib/graphql-client';
import { ADD_TO_CART } from '@/lib/mutations';
import { useCartStore } from '@/lib/store';

interface OrderNowButtonProps {
  productId: number;
  variationId?: number;
  disabled?: boolean;
}

export default function OrderNowButton({ productId, variationId, disabled = false }: OrderNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { sessionToken, setCart } = useCartStore();

  const handleOrderNow = async () => {
    if (disabled || isLoading) return;
    
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
      
      const data = await client.request(ADD_TO_CART, variables) as { addToCart: { cart: { contents: { nodes: [] }; subtotal: string; total: string; isEmpty: boolean } } };

      // Update cart state
      setCart(data.addToCart.cart);
      
      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
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
          : 'bg-teal-600 text-white hover:bg-teal-700'
      }`}
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

