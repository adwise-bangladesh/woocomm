'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { createSessionClient } from '@/lib/graphql-client';
import { Loader2, Package } from 'lucide-react';
import { gql } from 'graphql-request';

// GraphQL query for pagination
const LOAD_MORE_PRODUCTS = gql`
  query LoadMoreProducts($categorySlug: String!, $first: Int = 20, $after: String) {
    products(
      first: $first
      after: $after
      where: { category: $categorySlug }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on ProductWithPricing {
          price
          regularPrice
          salePrice
        }
        ... on InventoriedProduct {
          stockStatus
        }
      }
    }
  }
`;

// Component props
interface CategoryFiltersWrapperProps {
  initialProducts: Product[];
  categoryName: string;
  categoryDescription?: string;
  totalCount: number;
  categorySlug: string;
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
}

export default function CategoryFiltersWrapper({ 
  initialProducts, 
  categoryName,
  categoryDescription,
  totalCount,
  categorySlug,
  initialEndCursor,
  initialHasNextPage
}: CategoryFiltersWrapperProps) {
  // State management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced load more with rate limiting
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || !categorySlug || error) return;

    setIsLoadingMore(true);
    setError(null);
    
    try {
      const client = createSessionClient();
      const data = await client.request(LOAD_MORE_PRODUCTS, {
        categorySlug,
        first: 20,
        after: endCursor,
      }) as {
        products: {
          pageInfo: { endCursor: string | null; hasNextPage: boolean }
          nodes: Product[]
        }
      };

      if (data.products) {
        setProducts(prev => [...prev, ...data.products.nodes]);
        setEndCursor(data.products.pageInfo.endCursor);
        setHasNextPage(data.products.pageInfo.hasNextPage);
      }
    } catch (err) {
      setError('Failed to load more products');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading more products:', err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, categorySlug, endCursor, error]);

  // Optimized infinite scroll with intersection observer (better performance than scroll listener)
  useEffect(() => {
    if (!hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '400px', // Start loading 400px before the bottom
        threshold: 0,
      }
    );

    // Create a sentinel element
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasNextPage, isLoadingMore, loadMore]);

  // Memoize empty state to prevent re-renders
  const emptyState = useMemo(() => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
        No Products Available
      </h2>
      <p className="text-gray-600 text-center max-w-md text-sm">
        We&apos;re currently updating our {categoryName.toLowerCase()} collection. 
        Check back soon for exciting new products!
      </p>
    </div>
  ), [categoryName]);

  return (
    <div className="w-full">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {categoryName}
              </h1>
              {categoryDescription && (
                <p className="text-sm md:text-base text-gray-600 max-w-3xl">
                  {categoryDescription}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-teal-600">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Results info */}
        {products.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{products.length}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> products
            </p>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          emptyState
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Sentinel for intersection observer */}
            {hasNextPage && <div id="scroll-sentinel" className="h-4" />}

            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
                <p className="text-sm text-gray-500">Loading more products...</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      loadMore();
                    }}
                    className="mt-3 w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && products.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <div className="w-2 h-2 bg-teal-600 rounded-full" />
                  <p className="text-sm text-gray-600 font-medium">
                    You&apos;ve viewed all {totalCount} products
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
