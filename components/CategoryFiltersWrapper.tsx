'use client';

import { useState, useCallback, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { createSessionClient } from '@/lib/graphql-client';
import { Loader2 } from 'lucide-react';
import { gql } from 'graphql-request';

export interface FilterState {
  priceRange: [number, number];
  inStock: boolean | null;
  onSale: boolean | null;
  rating: number | null;
}

  const LOAD_MORE_CATEGORY_PRODUCTS = gql`
    query LoadMoreCategoryProducts($categorySlug: String!, $first: Int = 20, $after: String) {
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

interface CategoryFiltersWrapperProps {
  initialProducts: Product[];
  categoryName?: string;
  totalCount?: number;
  categorySlug: string;
  categoryDatabaseId: number;
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
}

export default function CategoryFiltersWrapper({ 
  initialProducts, 
  categoryName, 
  totalCount,
  categorySlug,
  categoryDatabaseId,
  initialEndCursor,
  initialHasNextPage
}: CategoryFiltersWrapperProps) {
  // Debug: Log initial setup
  console.log('🔍 Category ID:', categoryDatabaseId, '| Slug:', categorySlug, '| Initial products:', initialProducts.length);

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const MIN_LOAD_INTERVAL = 500;

  // Load more products function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || !categorySlug) return;

    const now = Date.now();
    if (now - lastLoadTime < MIN_LOAD_INTERVAL) {
      return;
    }

    setIsLoadingMore(true);
    setLastLoadTime(now);
    
    try {
      console.log('🔍 Loading more products for category:', categorySlug);
      
      const client = createSessionClient();
      const data = await client.request(LOAD_MORE_CATEGORY_PRODUCTS, {
        categorySlug: categorySlug,
        first: 20,
        after: endCursor,
      }) as {
        products: {
          pageInfo: { endCursor: string | null; hasNextPage: boolean }
          nodes: Product[]
        }
      };

      if (data.products) {
        const newProducts = data.products.nodes;
        console.log('🔍 Loaded', newProducts.length, 'more products');
        setAllProducts(prev => [...prev, ...newProducts]);
        setEndCursor(data.products.pageInfo.endCursor);
        setHasNextPage(data.products.pageInfo.hasNextPage);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading more products:', error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, categorySlug, endCursor, lastLoadTime]);

  // Infinite scroll effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1200 &&
          !isLoadingMore &&
          hasNextPage
        ) {
          loadMore();
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadMore, isLoadingMore, hasNextPage]);


  return (
    <>
      <div className="w-full lg:container lg:mx-auto lg:px-4 py-6">
        {/* Category Info */}
        {categoryName && (
          <div className="mb-4 px-4 lg:px-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {categoryName}
              </h1>
              <span className="text-sm text-gray-500 font-medium">
                {totalCount} items
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {allProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-600 text-lg mb-2">No products found</p>
            <p className="text-sm text-gray-500">Check back later for products in this category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {/* Show skeleton loaders while loading */}
              {isLoadingMore && (
                <>
                  {[...Array(10)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-white overflow-hidden">
                      <div className="aspect-square bg-gray-200 animate-pulse"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span className="ml-2 text-xs text-gray-500">Loading more products...</span>
              </div>
            )}

            {/* End message */}
            {!hasNextPage && allProducts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">You&apos;ve seen all products</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
