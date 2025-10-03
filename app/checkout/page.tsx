'use client';

import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Clock, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/types';

export default function CheckoutPage() {
  const { items, isEmpty, clearCart, setCart } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    deliveryZone: 'outside', // Default to outside Dhaka
    paymentMethod: 'cod',
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
  });

  // Sync localItems with items from store
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const validateName = (name: string) => {
    if (name.length < 3) {
      return 'Name must be at least 3 characters';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Remove leading +88 or 88 if present
    let cleanedDigits = digits;
    if (digits.startsWith('88')) {
      cleanedDigits = digits.substring(2);
    }
    
    // Add leading 0 if starts with 1
    if (cleanedDigits.startsWith('1') && cleanedDigits.length === 10) {
      cleanedDigits = '0' + cleanedDigits;
    }
    
    // Check if it's a valid BD number (starts with 01 and 11 digits total)
    if (cleanedDigits.length !== 11 || !cleanedDigits.startsWith('01')) {
      return 'Invalid Bangladesh phone number';
    }
    
    return '';
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Remove leading +88 or 88 if present
    let cleanedDigits = digits;
    if (digits.startsWith('88')) {
      cleanedDigits = digits.substring(2);
    }
    
    // Ensure it starts with 0
    if (cleanedDigits.startsWith('1') && cleanedDigits.length === 10) {
      cleanedDigits = '0' + cleanedDigits;
    }
    
    return cleanedDigits;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (name === 'fullName' || name === 'phone') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const getDeliveryCharge = () => {
    return formData.deliveryZone === 'dhaka' ? 80 : 130;
  };

  const getDeliveryTime = (stockStatus?: string) => {
    if (!stockStatus) return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    
    // Support both old and new stock status formats
    switch (stockStatus) {
      case 'FAST_DELIVERY':
      case 'IN_STOCK':
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
      case 'REGULAR_DELIVERY':
      case 'ON_BACKORDER':
        return { text: 'Regular Delivery (3-5 days)', color: 'text-orange-600' };
      case 'GLOBAL_DELIVERY':
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
      isEmpty: updatedItems.length === 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const nameError = validateName(formData.fullName);
    if (nameError) {
      setErrors((prev) => ({ ...prev, fullName: nameError }));
      return;
    }

    // Validate and format phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phone);

    setIsLoading(true);

    try {
      // For now, simulate order placement
      // In a real app, you'd integrate with your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
      const deliveryCharge = getDeliveryCharge();
      
      // Calculate subtotal from localItems
      const subtotalAmount = localItems.reduce((sum, item) => {
        return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
      }, 0);
      
      const totalAmount = subtotalAmount + deliveryCharge;
      
      clearCart();
      alert(
        `Order placed successfully! Order #${orderNumber}\n\n` +
        `Phone: ${formattedPhone}\n` +
        `Delivery Zone: ${formData.deliveryZone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}\n` +
        `Delivery Charge: Tk ${deliveryCharge}\n` +
        `Total Amount: Tk ${totalAmount.toFixed(0)}\n\n` +
        `We'll contact you within 24 hours to confirm your order.`
      );
      router.push('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to complete checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmpty || items.length === 0 || localItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-[5px] font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Customer Information Card */}
          <div className="bg-white rounded-[5px] p-4 mb-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Customer Information</h2>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  minLength={3}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm text-gray-900 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-500`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm text-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-500`}
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-500"
                  placeholder="House/Flat no, Road, Area, City, District"
                />
              </div>

              <div>
                <label htmlFor="deliveryZone" className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Area *
                </label>
                <select
                  id="deliveryZone"
                  name="deliveryZone"
                  required
                  value={formData.deliveryZone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="outside">Outside Dhaka (Tk 130)</option>
                  <option value="dhaka">Inside Dhaka (Tk 80)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-[5px] p-4 mb-2 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-teal-500 bg-teal-50 rounded-[5px] cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="w-4 h-4 mr-3 text-teal-600"
                />
                <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-[5px] cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  disabled
                  className="w-4 h-4 mr-3"
                />
                <span className="text-sm font-medium text-gray-500">bKash (Coming Soon)</span>
              </label>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isLoading || localItems.length === 0}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-[5px] text-base font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2 shadow-sm"
          >
            {isLoading ? 'Processing Order...' : 'Place Order'}
          </button>

          {/* Order Summary Card */}
          <div className="bg-white rounded-[5px] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {localItems.length} {localItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {localItems.map((item: CartItem) => {
                // Get stock status from variation or product
                const variationStock = item.variation?.node?.stockStatus;
                const productStock = item.product?.node?.stockStatus;
                const stockStatus = variationStock || productStock || 'IN_STOCK';
                const deliveryInfo = getDeliveryTime(stockStatus);
                
                return (
                  <div key={item.key} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex gap-3">
                      {/* Product Image with Border */}
                      <div className="w-20 h-20 border-[3px] border-gray-200 rounded-[5px] overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                          alt={item.product.node.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Product Title & Delete Button */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.product.node.name}
                            </h4>
                            {item.variation?.node?.name && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {(() => {
                                  const variationText = item.variation.node.name.replace(item.product.node.name + ' - ', '');
                                  const attributes = variationText.split(', ');
                                  
                                  // If we have exactly 2 attributes, assume they are Size and Color
                                  if (attributes.length === 2) {
                                    return `Size: ${attributes[0]} | Color: ${attributes[1]}`;
                                  }
                                  // Otherwise, try to detect attribute names from the variation data
                                  return variationText;
                                })()}
                              </p>
                            )}
                          </div>
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

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3 border-t-2 border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  Tk {localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">Delivery Charge</span>
                </div>
                <span className="font-medium text-gray-900">Tk {getDeliveryCharge()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-red-600">
                  Tk {(localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0) + getDeliveryCharge()).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
