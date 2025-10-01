'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CategoryFilters from '@/components/CategoryFilters';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Zap } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
  image: {
    sourceUrl: string;
    altText: string | null;
  } | null;
}

interface FlashSaleClientProps {
  category: Category | null;
  initialProducts: Product[];
  initialPageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export default function FlashSaleClient({
  category,
  initialProducts,
}: FlashSaleClientProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 6, minutes: 0, seconds: 0 });

  // Timer logic - 6 hours, refreshes every 10 minutes per user
  useEffect(() => {
    // Get or create timer start time from localStorage
    const getTimerStartTime = () => {
      const stored = localStorage.getItem('flashSaleTimerStart');
      if (stored) {
        const startTime = parseInt(stored, 10);
        const now = Date.now();
        const elapsed = now - startTime;
        
        // If more than 10 minutes (600000ms) have passed, reset timer
        if (elapsed >= 600000) {
          const newStartTime = Date.now();
          localStorage.setItem('flashSaleTimerStart', newStartTime.toString());
          return newStartTime;
        }
        return startTime;
      } else {
        const newStartTime = Date.now();
        localStorage.setItem('flashSaleTimerStart', newStartTime.toString());
        return newStartTime;
      }
    };

    const startTime = getTimerStartTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      // If 10 minutes passed, reset
      if (elapsed >= 600000) {
        const newStartTime = Date.now();
        localStorage.setItem('flashSaleTimerStart', newStartTime.toString());
        return;
      }

      // Calculate remaining time (6 hours = 21600000ms)
      const totalTime = 21600000; // 6 hours in milliseconds
      const remaining = totalTime - (elapsed % totalTime);

      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Flash Sale Category Not Found</h1>
          <p className="text-gray-600 mb-4">
            Please create a product category with slug &quot;flash-sale&quot; in WordPress.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner with Category Image and Timer */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-red-500 to-orange-500">
        {category.image?.sourceUrl ? (
          <Image
            src={category.image.sourceUrl}
            alt={category.image.altText || category.name}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8 items-center">
          {category.description && (
            <p className="text-white/90 text-lg mb-6 max-w-2xl text-center">
              {category.description}
            </p>
          )}

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
            <div className="flex gap-2 text-white">
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs uppercase">Hours</span>
              </div>
              <div className="flex items-center text-2xl font-bold">:</div>
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs uppercase">Mins</span>
              </div>
              <div className="flex items-center text-2xl font-bold">:</div>
              <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CategoryFilters onSortChange={() => {}} onFilterChange={() => {}} />

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-gray-600">
          Showing {initialProducts.length} flash sale {initialProducts.length === 1 ? 'product' : 'products'}
        </div>

        {initialProducts.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No flash sale products available right now.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
            {initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

