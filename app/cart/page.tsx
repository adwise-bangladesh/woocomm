'use client';

import { useCartStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { createSessionClient } from '@/lib/graphql-client';
import { REMOVE_FROM_CART, UPDATE_CART_ITEM } from '@/lib/mutations';
import { useState } from 'react';

export default function CartPage() {
  const { items, total, isEmpty, sessionToken, setCart } = useCartStore();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const handleRemoveItem = async (key: string) => {
    setLoadingKey(key);
    try {
      const client = createSessionClient(sessionToken || undefined);
      const response = await client.request(REMOVE_FROM_CART, {
        input: {
          keys: [key],
        },
      }) as { removeItemsFromCart: { cart: { contents: { nodes: unknown[] }; subtotal: string; total: string; isEmpty: boolean } } };

      if (response.removeItemsFromCart.cart) {
        setCart(response.removeItemsFromCart.cart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

  const handleUpdateQuantity = async (key: string, quantity: number) => {
    if (quantity < 1) return;
    
    setLoadingKey(key);
    try {
      const client = createSessionClient(sessionToken || undefined);
      const response = await client.request(UPDATE_CART_ITEM, {
        input: {
          items: [{ key, quantity }],
        },
      }) as { updateItemQuantities: { cart: { contents: { nodes: unknown[] }; subtotal: string; total: string; isEmpty: boolean } } };

      if (response.updateItemQuantities.cart) {
        setCart(response.updateItemQuantities.cart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

  if (isEmpty || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                    alt={item.product.node.image?.altText || item.product.node.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.node.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-1"
                  >
                    {item.product.node.name}
                  </Link>
                  {item.variation && (
                    <p className="text-sm text-gray-600 mb-2">{item.variation.node.name}</p>
                  )}
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.variation?.node.price || item.product.node.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleRemoveItem(item.key)}
                    disabled={loadingKey === item.key}
                    className="text-red-600 hover:text-red-700 transition-colors p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.key, item.quantity - 1)}
                      disabled={loadingKey === item.key || item.quantity <= 1}
                      className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.key, item.quantity + 1)}
                      disabled={loadingKey === item.key}
                      className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">
                    Total: <span className="font-bold">{formatPrice(item.total)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/"
                className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
