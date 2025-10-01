'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createSessionClient } from '@/lib/graphql-client';
import { GET_PRODUCTS } from '@/lib/queries';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface InfiniteProductGridProps {
  initialProducts: Product[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
}

export default function InfiniteProductGrid({
  initialProducts,
  initialEndCursor,
  initialHasNextPage,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const MIN_LOAD_INTERVAL = 500; // Reduced to 500ms for smoother loading

  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage) return;

    // Rate limiting: prevent requests within 500ms
    const now = Date.now();
    if (now - lastLoadTime < MIN_LOAD_INTERVAL) {
      return;
    }

    setIsLoading(true);
    setLastLoadTime(now);
    
    try {
      const client = createSessionClient();
      // Load 20 products at a time for smoother experience
      const data = await client.request(GET_PRODUCTS, {
        first: 20,
        after: endCursor,
      }) as { products: { nodes: Product[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } };

      if (data.products) {
        const newProductsCount = data.products.nodes.length;
        setProducts((prev) => [...prev, ...data.products.nodes]);
        setEndCursor(data.products.pageInfo.endCursor);
        setHasNextPage(data.products.pageInfo.hasNextPage);
        
        // Announce to screen readers
        setAnnouncement(`Loaded ${newProductsCount} more products`);
        setTimeout(() => setAnnouncement(''), 1000);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading more products:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endCursor, hasNextPage, isLoading, lastLoadTime]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Debounced scroll handler to prevent excessive calls
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Trigger earlier (1200px before end) for smoother experience
        // This gives time to load products before user reaches the end
        if (
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1200 &&
          !isLoading &&
          hasNextPage
        ) {
          loadMore();
        }
      }, 150); // Reduced debounce to 150ms for more responsive loading
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadMore, isLoading, hasNextPage]);

  return (
    <section className="py-6 bg-gray-50">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="container mx-auto px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-wide whitespace-nowrap">
            Products For You
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
        </div>
      </div>
      <div className="w-full lg:container lg:mx-auto lg:px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {/* Show skeleton loaders while loading */}
          {isLoading && (
            <>
              {[...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          )}
        </div>
      </div>

      <div ref={loadMoreRef}>
        {isLoading && (
          <div className="flex justify-center items-center py-4 animate-fadeIn">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span className="ml-2 text-xs text-gray-500">Loading...</span>
          </div>
        )}

        {!hasNextPage && products.length > 0 && (
          <div className="text-center py-8 animate-fadeIn">
            <p className="text-sm text-gray-500">You&apos;ve seen all products</p>
          </div>
        )}
      </div>
    </section>
  );
}
