'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, MapPin, Phone, CreditCard, User } from 'lucide-react';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Get order details from URL params
  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const customerName = searchParams.get('name') || 'N/A';
  const phone = searchParams.get('phone') || 'N/A';
  const address = searchParams.get('address') || 'N/A';
  const total = searchParams.get('total') || '0';
  const deliveryCharge = searchParams.get('delivery') || '0';
  const itemCount = searchParams.get('items') || '0';

  useEffect(() => {
    // Play success sound
    const audio = new Audio('/success.mp3');
    audio.play().catch(() => console.log('Audio play failed'));

    // Show animation
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className={`text-center mb-8 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="inline-block relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed !</h2>
          <p className="text-gray-600">We&apos;ll call you to confirm your order</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-[5px] p-6 shadow-sm mb-4">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-xl font-bold text-gray-900">#{orderNumber}</p>
              </div>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-[5px] text-sm font-semibold">
                Pending
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="text-base font-medium text-gray-900">{customerName}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-base font-medium text-gray-900">{phone}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="text-base font-medium text-gray-900">{address}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Order Summary</p>
                <p className="text-base font-medium text-gray-900">{itemCount} {itemCount === '1' ? 'item' : 'items'}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-base font-medium text-gray-900">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-[5px] p-6 shadow-sm mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">Tk {(parseFloat(total) - parseFloat(deliveryCharge)).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-medium text-gray-900">Tk {deliveryCharge}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-red-600">Tk {total}</span>
            </div>
          </div>
        </div>


        {/* Order Number Reminder */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
           Thank you for your purchase
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <ThankYouContent />
    </Suspense>
  );
}

