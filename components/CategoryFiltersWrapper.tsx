'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import CategoryFilters, { FilterState } from './CategoryFilters';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { logger } from '@/lib/utils/performance';
import { createSessionClient } from '@/lib/graphql-client';
import { Loader2 } from 'lucide-react';
import { gql } from 'graphql-request';

  const LOAD_MORE_CATEGORY_PRODUCTS = gql`
    query LoadMoreCategoryProducts($slug: String!, $first: Int = 20, $after: String) {
      products(
        first: $first
        after: $after
        where: { 
          category: $slug
          orderby: { field: DATE, order: DESC }
        }
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
  categoryId: string;
  categoryDatabaseId: number;
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
}

export default function CategoryFiltersWrapper({ 
  initialProducts, 
  categoryName, 
  totalCount,
  categorySlug,
  categoryId,
  categoryDatabaseId,
  initialEndCursor,
  initialHasNextPage
}: CategoryFiltersWrapperProps) {
  // Debug: Log initial setup
  console.log('🔍 Category:', categorySlug, '| Database ID:', categoryDatabaseId, '| Initial products:', initialProducts.length);

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const MIN_LOAD_INTERVAL = 500;
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    inStock: null,
    onSale: null,
    rating: null,
  });

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
      console.log('🔍 Loading more products for:', categorySlug);
      
      const client = createSessionClient();
      const data = await client.request(LOAD_MORE_CATEGORY_PRODUCTS, {
        slug: categorySlug,
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
        console.log('🔍 Loaded', newProducts.length, 'more products for category:', categorySlug);
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

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSortChange = useCallback((newSortBy: string) => {
    logger.debug('Sort changed', { from: sortBy, to: newSortBy });
    setSortBy(newSortBy);
  }, [sortBy]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    logger.debug('Filters changed', { filters: newFilters });
    setFilters(newFilters);
  }, []);

  // Helper functions (don't need useCallback since not passed as props)
  const getProductRating = (product: Product): number => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  };

  const extractPrice = (priceString: string | null | undefined): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
  };

  const checkIfOnSale = (product: Product): boolean => {
    return !!(product.salePrice && product.regularPrice && 
      extractPrice(product.salePrice) < extractPrice(product.regularPrice));
  };

  // Pre-calculate expensive values to avoid recalculating in filters
  const productsWithMetadata = useMemo(() => {
    return allProducts.map(product => ({
      product,
      price: extractPrice(product.price || product.regularPrice),
      isOnSale: checkIfOnSale(product),
      rating: getProductRating(product),
      isInStock: product.stockStatus === 'IN_STOCK' || product.stockStatus === 'FAST_DELIVERY' || product.stockStatus === 'REGULAR_DELIVERY'
    }));
  }, [allProducts]);


  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...productsWithMetadata];

    // Apply filters
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) {
      filtered = filtered.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    }

    if (filters.inStock !== null) {
      filtered = filtered.filter(p => filters.inStock ? p.isInStock : !p.isInStock);
    }

    if (filters.onSale !== null) {
      filtered = filtered.filter(p => filters.onSale ? p.isOnSale : !p.isOnSale);
    }

    if (filters.rating !== null) {
      filtered = filtered.filter(p => p.rating >= filters.rating!);
    }

    // Sort products
    switch (sortBy) {
      case 'popularity':
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      // Default and 'date' keep original order
    }

    return filtered.map(item => item.product); // Return back to Product[] type
  }, [productsWithMetadata, filters, sortBy]);

  return (
    <>
      <CategoryFilters onSortChange={handleSortChange} onFilterChange={handleFilterChange} />
      
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
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-600 text-lg mb-2">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
              {filteredAndSortedProducts.map((product) => (
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

