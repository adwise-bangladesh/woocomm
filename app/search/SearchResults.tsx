'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createSessionClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import ProductCard from '@/components/ProductCard';
import ModernFiltersSort, { FilterState } from '@/components/ModernFiltersSort';
import { Product } from '@/lib/types';
import { Search, Loader2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!, $first: Int = 100) {
    products(first: $first, where: { search: $search }) {
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

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    minRating: null,
  });

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const client = createSessionClient();
        const data = await client.request(SEARCH_PRODUCTS, {
          search: query,
          first: 100,
        }) as { products: { nodes: Product[] } };

        setProducts(data.products?.nodes || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  // Helper functions (defined inside useMemo to avoid dependency issues)
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
    // Use the helper functions
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
        // Reverse order (assuming newer products are later in the array)
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

  // Calculate max price for slider
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 200000;
    const prices = products.map(p => extractPrice(p.price || p.regularPrice));
    return Math.max(200000, Math.ceil(Math.max(...prices) / 1000) * 1000); // Minimum 200000, round up to nearest 1000
  }, [products, extractPrice]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#fe6c06' }} />
          <p className="text-gray-600">Searching for &quot;{query}&quot;...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#fe6c06' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Search className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search for Products</h2>
          <p className="text-gray-600 mb-6">Enter a search term to find products</p>
          <Link
            href="/"
            className="px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#fe6c06' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Filters & Sort */}
      {products.length > 0 && (
        <ModernFiltersSort
          searchTerm={query}
          totalProducts={products.length}
          filteredProducts={filteredAndSortedProducts.length}
          sortBy={sortBy}
          filters={filters}
          onSortChange={setSortBy}
          onFilterChange={setFilters}
          maxPrice={maxPrice}
        />
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Results */}
        {products.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <Search className="w-6 h-6" strokeWidth={2} style={{ color: '#fe6c06' }} />
              </div>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
              No Products Found
            </h2>
            <p className="text-gray-600 mb-2 text-center max-w-md text-base">
              We couldn&apos;t find any products matching <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
            </p>
            <p className="text-gray-500 mb-8 text-center max-w-md text-sm">
              Try searching with different keywords
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Link
                href="/categories"
                className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-lg transition-all hover:shadow-lg font-medium"
                style={{ backgroundColor: '#fe6c06' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
              >
                <Package className="w-5 h-5" />
                Browse All Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-orange-600 hover:text-orange-600 transition-all font-medium"
              >
                Go to Homepage
              </Link>
            </div>

            {/* Popular Searches Suggestion */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books'].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          // Products exist but filters hide them all
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
