'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import ModernFiltersSort, { FilterState } from './ModernFiltersSort';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    minRating: null,
  });

  // Helper functions (memoized to avoid dependency issues)
  const getProductRating = useMemo(() => (product: Product): number => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  }, []);

  const getSalesCount = useMemo(() => (product: Product): number => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return productIdHash % 1000;
  }, []);

  const extractPrice = useMemo(() => (priceString: string | null | undefined): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
  }, []);


  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply price filter
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) {
      filtered = filtered.filter((product) => {
        const price = extractPrice(product.price || product.regularPrice);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }


    // Apply rating filter
    if (filters.minRating !== null) {
      filtered = filtered.filter((product) => {
        const rating = getProductRating(product);
        return rating >= filters.minRating!;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      case 'best-selling':
        filtered.sort((a, b) => getSalesCount(b) - getSalesCount(a));
        break;
      case 'rating':
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      case 'new-arrivals':
        filtered.reverse();
        break;
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price || a.regularPrice);
          const priceB = extractPrice(b.price || b.regularPrice);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price || a.regularPrice);
          const priceB = extractPrice(b.price || b.regularPrice);
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [products, filters, sortBy, getProductRating, getSalesCount, extractPrice]);

  // Calculate max price
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 200000;
    const prices = products.map(p => extractPrice(p.price || p.regularPrice));
    return Math.max(200000, Math.ceil(Math.max(...prices) / 1000) * 1000); // Minimum 200000, round up to nearest 1000
  }, [products, extractPrice]);

  // Load more products
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

  // Set initialized after mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '400px',
        threshold: 0,
      }
    );

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

  // Empty state
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
      {/* Category Header with Description */}
      {categoryDescription && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <p className="text-sm md:text-base text-gray-700 max-w-3xl">
              {categoryDescription}
            </p>
          </div>
        </div>
      )}

      {/* Modern Filters & Sort */}
      {products.length > 0 && (
        <ModernFiltersSort
          searchTerm={categoryName}
          totalProducts={totalCount}
          filteredProducts={filteredAndSortedProducts.length}
          sortBy={sortBy}
          filters={filters}
          onSortChange={setSortBy}
          onFilterChange={setFilters}
          maxPrice={maxPrice}
        />
      )}

      {/* Products Section */}
      <div className="container mx-auto py-6">
        {/* Products Grid */}
        {!isInitialized ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-2 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          emptyState
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
              No Products Match Your Filters
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-md text-sm">
              Try adjusting your filters to see more results
            </p>
            <button
              onClick={() => {
                setFilters({
                  priceRange: [0, 999999],
                  minRating: null,
                });
                setSortBy('default');
              }}
              className="px-6 py-2.5 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#fe6c06' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Sentinel for intersection observer */}
            {hasNextPage && <div id="scroll-sentinel" className="h-4" />}

            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mb-2" style={{ color: '#fe6c06' }} />
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
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fe6c06' }} />
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
