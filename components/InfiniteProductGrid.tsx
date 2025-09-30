'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSessionClient } from '@/lib/graphql-client';
import { GET_PRODUCTS } from '@/lib/queries';
import ProductCard from './ProductCard';
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

  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage) return;

    setIsLoading(true);
    try {
      const client = createSessionClient();
      const data = await client.request(GET_PRODUCTS, {
        first: 12,
        after: endCursor,
      }) as { products: { nodes: Product[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } };

      if (data.products) {
        setProducts((prev) => [...prev, ...data.products.nodes]);
        setEndCursor(data.products.pageInfo.endCursor);
        setHasNextPage(data.products.pageInfo.hasNextPage);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [endCursor, hasNextPage, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        !isLoading &&
        hasNextPage
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, isLoading, hasNextPage]);

  return (
    <section className="py-6 bg-gray-50">
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
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading more products...</span>
        </div>
      )}

      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">You&apos;ve reached the end of the products!</p>
        </div>
      )}
    </section>
  );
}
