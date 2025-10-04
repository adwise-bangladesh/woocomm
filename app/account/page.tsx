'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, ShoppingBag, Heart, Clock, Bell, ArrowRight, Package, CreditCard, MapPin, Phone } from 'lucide-react';

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
          <div className="max-w-4xl mx-auto">
            {/* Loading Header */}
            <div className="bg-white rounded-[5px] p-6 mb-4 shadow-sm">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[5px] p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-[5px] p-6 mb-4 shadow-sm">
            
            {/* Coming Soon Banner */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">Account Features Coming Soon!</h3>
                  <p className="text-sm text-orange-800">
                    We're working on exciting new account features including order history, wishlist, and personalized recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Profile Management */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-600">Manage your personal information</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Update personal details</p>
                <p>• Change password</p>
                <p>• Manage preferences</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                  <p className="text-sm text-gray-600">Track your past orders</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• View order details</p>
                <p>• Track delivery status</p>
                <p>• Reorder items</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>

            {/* Wishlist */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
                  <p className="text-sm text-gray-600">Save your favorite items</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Save favorite products</p>
                <p>• Get price alerts</p>
                <p>• Share wishlists</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">Manage your alerts</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Order updates</p>
                <p>• Price drop alerts</p>
                <p>• New arrivals</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>

            {/* Address Book */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Address Book</h3>
                  <p className="text-sm text-gray-600">Manage delivery addresses</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Add multiple addresses</p>
                <p>• Set default address</p>
                <p>• Quick checkout</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <p className="text-sm text-gray-600">Manage payment options</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Save payment methods</p>
                <p>• Quick checkout</p>
                <p>• Secure transactions</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-[5px] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/cart" 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">View Cart</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              
              <Link 
                href="/shop" 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Continue Shopping</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-[5px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">Need Help?</h3>
                <p className="text-sm text-orange-800">Contact our support team</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="tel:01926644575" 
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-orange-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900">Call: 01926644575</span>
              </a>
              
              <a 
                href="https://wa.me/8801926644575" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-orange-50 transition-colors"
              >
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="font-medium text-gray-900">WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}