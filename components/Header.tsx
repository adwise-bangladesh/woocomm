'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Search, User, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  path: string;
}

interface HeaderProps {
  menuItems?: MenuItem[];
}

export default function Header({ menuItems = [] }: HeaderProps) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div className="hidden lg:block bg-gray-800 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>📞 +880 1234567890</span>
            <span>📧 support@zonash.com</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-teal-400 transition-colors">
              📦 TRACK ORDER
            </Link>
            <Link href="/new-user" className="hover:text-teal-400 transition-colors">
              🎁 NEW USER
            </Link>
            <Link href="/sell" className="hover:text-teal-400 transition-colors">
              🏪 SELL WITH US
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header - Desktop */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-teal-600 text-white font-bold text-2xl px-3 py-2 rounded">
                Z
              </div>
              <span className="text-2xl font-bold text-gray-900">Zonash</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for brands, products, categories..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Login/Signup */}
              <Link
                href="/account"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <User className="w-6 h-6" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Login/Signup</span>
                  <span className="text-sm font-semibold">Account</span>
                </div>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center gap-3 relative group"
              >
                <div className="relative">
                  <ShoppingCart className="w-7 h-7 text-gray-700 group-hover:text-teal-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Shopping cart</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation Menu */}
          {menuItems.length > 0 && (
            <nav className="border-t border-gray-200 py-2">
              <ul className="flex items-center gap-8">
                <li>
                  <button className="flex items-center gap-2 text-gray-700 hover:text-teal-600 font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Categories
                  </button>
                </li>
                {menuItems.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.path || item.url}
                      className="text-gray-700 hover:text-teal-600 font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white shadow-md">
        <div className="px-4">
          {/* Top Mobile Header */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-teal-600 text-white font-bold text-xl px-2 py-1 rounded">
                Z
              </div>
              <span className="text-xl font-bold text-gray-900">Zonash</span>
            </Link>

            {/* Mobile Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://m.me/your-page"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </a>

              <Link href="/cart" className="relative text-gray-700 hover:text-teal-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-600"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Mobile Menu */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>

          <a
            href="https://wa.me/your-number"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-xs mt-1">WhatsApp</span>
          </a>

          <Link
            href="/categories"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs mt-1">Categories</span>
          </Link>

          <Link
            href="/cart"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-teal-600 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1/2 translate-x-3 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
}