'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import CategoryFilters, { FilterState } from './CategoryFilters';
import { Product } from '@/lib/types';
import { logger, useDiscountCalculator, useReviewStatsGenerator, throttle } from '@/lib/utils/performance';
import { createSessionClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
// Cache utilities available for future enhancements
import ProgressiveProductGrid from './ProgressiveProductGrid';

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
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Category:', categorySlug, '| Database ID:', categoryDatabaseId, '| Initial products:', initialProducts.length);
  }

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  // ProgressiveProductGrid now handles load more detection internally
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

  // Throttled infinite scroll effect for better performance
  useEffect(() => {
    const throttledLoadMore = throttle(() => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1200 &&
        !isLoadingMore &&
        hasNextPage
      ) {
        loadMore();
      }
    }, 150);
    
    const handleScroll = () => throttledLoadMore();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
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

  // Memoized helper functions for better performance
  const discountCalculator = useDiscountCalculator();
  const reviewStatsGenerator = useReviewStatsGenerator();

  const getProductRating = useCallback((product: Product): number => {
    return reviewStatsGenerator(product.id).rating;
  }, [reviewStatsGenerator]);

  const extractPrice = useCallback((priceString: string | null | undefined): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
  }, []);

  const checkIfOnSale = useCallback((product: Product): boolean => {
    const discount = discountCalculator(product.salePrice, product.regularPrice);
    return discount !== null && discount > 0;
  }, [discountCalculator]);

  // Pre-calculate expensive values to avoid recalculating in filters
  const productsWithMetadata = useMemo(() => {
    return allProducts.map(product => ({
      product,
      price: extractPrice(product.price || product.regularPrice),
      isOnSale: checkIfOnSale(product),
      rating: getProductRating(product),
      isInStock: product.stockStatus === 'IN_STOCK' || product.stockStatus === 'FAST_DELIVERY' || product.stockStatus === 'REGULAR_DELIVERY'
    }));
  }, [allProducts, extractPrice, checkIfOnSale, getProductRating]);


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

        {/* Enhanced Progressive Product Grid */}
        <ProgressiveProductGrid
          products={filteredAndSortedProducts}
          isLoadingMore={isLoadingMore}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
        />
      </div>
    </>
  );
}

