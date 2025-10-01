'use client';

import { useCartStore } from '@/lib/store';
import { createSessionClient } from '@/lib/graphql-client';
import { CHECKOUT } from '@/lib/mutations';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Clock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, isEmpty, sessionToken, clearCart } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    deliveryMethod: 'inside-dhaka',
    paymentMethod: 'cod',
  });

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getDeliveryCharge = () => {
    return formData.deliveryMethod === 'inside-dhaka' ? 80 : 130;
  };

  const getDeliveryTime = () => {
    return '1-3 days';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, simulate order placement
      // In a real app, you'd integrate with your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
      clearCart();
      alert(`Order placed successfully! Order #${orderNumber}\n\nWe'll contact you within 24 hours to confirm your order.`);
      router.push('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to complete checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmpty || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products before checking out!</p>
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
      <div className="container mx-auto px-2 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Customer Information Card */}
          <div className="bg-white rounded-[5px] p-3 mb-2">
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
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Enter your full name"
                />
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
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                />
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
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent resize-none"
                  placeholder="House/Flat no, Road, Area, City, District"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method Card */}
          <div className="bg-white rounded-[5px] p-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Delivery Method</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded cursor-pointer hover:border-gray-300">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="inside-dhaka"
                    checked={formData.deliveryMethod === 'inside-dhaka'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Inside Dhaka</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Tk 80
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        1-3 days
                      </span>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded cursor-pointer hover:border-gray-300">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="outside-dhaka"
                    checked={formData.deliveryMethod === 'outside-dhaka'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Outside Dhaka</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Tk 130
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        1-3 days
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-[5px] p-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:border-gray-300">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  disabled
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm font-medium text-gray-500">bKash (Coming Soon)</span>
              </label>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-[5px] p-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Order Summary</h3>

            <div className="space-y-3 mb-3">
              {items.map((item) => (
                <div key={item.key} className="flex gap-2 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                      alt={item.product.node.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product.node.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="text-gray-900">Tk {getDeliveryCharge()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span className="text-red-600">Tk {parseInt(total?.replace(/[^0-9]/g, '') || '0') + getDeliveryCharge()}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
