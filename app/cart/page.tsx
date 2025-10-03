'use client';

import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '@/lib/types';

export default function CartPage() {
  const { items, isEmpty, clearCart, setCart } = useCartStore();
  const [localItems, setLocalItems] = useState(items);

  // Sync localItems with items from store
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const getDeliveryTime = (stockStatus?: string) => {
    if (!stockStatus) return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    
    switch (stockStatus) {
      case 'IN_STOCK':
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
      case 'ON_BACKORDER':
        return { text: 'Regular Delivery (3-5 days)', color: 'text-orange-600' };
      case 'OUT_OF_STOCK':
        return { text: 'Global Delivery (10-15 days)', color: 'text-red-600' };
      default:
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    }
  };

  const updateQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = localItems.map(item => {
      if (item.key === itemKey) {
        const pricePerUnit = parseFloat(item.total.replace(/[^0-9.-]+/g, '')) / item.quantity;
        const newTotal = (pricePerUnit * newQuantity).toFixed(2);
        return {
          ...item,
          quantity: newQuantity,
          total: `${newTotal}৳ `,
        };
      }
      return item;
    });
    
    setLocalItems(updatedItems);
    
    // Update cart in store
    const newSubtotal = updatedItems.reduce((sum, item) => {
      return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
    }, 0);
    
    setCart({
      contents: { nodes: updatedItems },
      subtotal: `${newSubtotal.toFixed(2)}৳ `,
      total: `${newSubtotal.toFixed(2)}৳ `,
      isEmpty: false,
    });
  };

  const removeItem = (itemKey: string) => {
    const updatedItems = localItems.filter(item => item.key !== itemKey);
    setLocalItems(updatedItems);
    
    if (updatedItems.length === 0) {
      clearCart();
    } else {
      const newSubtotal = updatedItems.reduce((sum, item) => {
        return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
      }, 0);
      
      setCart({
        contents: { nodes: updatedItems },
        subtotal: `${newSubtotal.toFixed(2)}৳ `,
        total: `${newSubtotal.toFixed(2)}৳ `,
        isEmpty: false,
      });
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (isEmpty || items.length === 0 || localItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-[5px] font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[5px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Items</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {localItems.length} {localItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-3">
                  {localItems.map((item: CartItem) => {
                    const variationStock = item.variation?.node?.stockStatus;
                    const productStock = item.product?.node?.stockStatus;
                    const stockStatus = variationStock || productStock || 'IN_STOCK';
                    const deliveryInfo = getDeliveryTime(stockStatus);
                    
                    return (
                      <div key={item.key} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex gap-3">
                          {/* Product Image with Border */}
                          <Link href={`/product/${item.product.node.slug}`}>
                            <div className="w-20 h-20 border-[3px] border-gray-200 rounded-[5px] overflow-hidden flex-shrink-0 cursor-pointer hover:border-teal-500 transition-colors">
                              <Image
                                src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                                alt={item.product.node.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            {/* Product Title & Delete Button */}
                            <div className="flex items-start justify-between mb-2">
                              <Link href={`/product/${item.product.node.slug}`}>
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 pr-2 hover:text-teal-600 cursor-pointer">
                                  {item.product.node.name}
                                </h4>
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-[5px] transition-colors flex-shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Delivery Time Badge */}
                            <div className="flex items-center gap-1 mb-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                stockStatus === 'IN_STOCK' ? 'bg-green-500' : 
                                stockStatus === 'ON_BACKORDER' ? 'bg-orange-500' : 
                                'bg-red-500'
                              }`}></div>
                              <Clock className={`w-3 h-3 ${deliveryInfo.color}`} />
                              <span className={`text-xs ${deliveryInfo.color} font-medium`}>{deliveryInfo.text}</span>
                            </div>
                            
                            {/* Quantity Controls & Price */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-gray-100 rounded-full p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                  <Minus className="w-4 h-4 text-gray-700" />
                                </button>
                                <span className="text-sm font-bold text-gray-900 w-10 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                  <Plus className="w-4 h-4 text-gray-700" />
                                </button>
                              </div>
                              
                              <span className="text-base font-bold text-red-600">{formatPrice(item.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary - Sticky on Desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[5px] p-4 shadow-sm lg:sticky lg:top-4">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal ({localItems.length} items)</span>
                    <span className="font-medium text-gray-900">Tk {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-xs text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold mb-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-red-600">Tk {subtotal.toFixed(0)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-[5px] text-base font-bold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="block text-center text-sm text-gray-600 hover:text-teal-600 mt-3 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
