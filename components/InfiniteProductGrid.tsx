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
    <section className="py-4" style={{ backgroundColor: '#ededed' }}>
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 px-1">Products For You</h2>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px]">
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
