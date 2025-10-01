'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createSessionClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import ProductCard from '@/components/ProductCard';
import CategoryFilters, { FilterState } from '@/components/CategoryFilters';
import { Product } from '@/lib/types';
import { Search, Loader2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!, $first: Int = 50) {
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
    inStock: null,
    onSale: null,
    rating: null,
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
          first: 50,
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

  // Helper to get product rating (same logic as ProductCard)
  const getProductRating = (product: Product): number => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Helper to extract numeric price
    const extractPrice = (priceString: string | null | undefined): number => {
      if (!priceString) return 0;
      return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
    };

    // Helper to check if product is on sale
    const checkIfOnSale = (product: Product): boolean => {
      return !!(product.salePrice && product.regularPrice && 
        extractPrice(product.salePrice) < extractPrice(product.regularPrice));
    };

    let filtered = [...products];

    // Apply price filter
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) {
      filtered = filtered.filter((product) => {
        const price = extractPrice(product.price || product.regularPrice);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply stock filter
    if (filters.inStock !== null) {
      filtered = filtered.filter((product) => {
        const inStock = product.stockStatus === 'IN_STOCK';
        return filters.inStock ? inStock : !inStock;
      });
    }

    // Apply sale filter
    if (filters.onSale !== null) {
      filtered = filtered.filter((product) => {
        const onSale = checkIfOnSale(product);
        return filters.onSale ? onSale : !onSale;
      });
    }

    // Apply rating filter
    if (filters.rating !== null) {
      filtered = filtered.filter((product) => {
        const rating = getProductRating(product);
        return rating >= filters.rating!;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      case 'rating':
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      case 'date':
        break;
      case 'price':
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
  }, [products, filters, sortBy]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
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
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Only show filters if there are products */}
      {products.length > 0 && (
        <CategoryFilters onSortChange={setSortBy} onFilterChange={setFilters} />
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Only show results count if there are products */}
        {products.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredAndSortedProducts.length === 0
              ? `No products match your filters. Try adjusting them.`
              : `Showing ${filteredAndSortedProducts.length} of ${products.length} products for "${query}"`}
          </div>
        )}

        {/* Results */}
        {products.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          {/* Icon Container */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
              <Search className="w-6 h-6 text-teal-600" strokeWidth={2} />
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
            Try adjusting your filters or search with different keywords
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Link
              href="/categories"
              className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all hover:shadow-lg font-medium"
            >
              <Package className="w-5 h-5" />
              Browse All Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-teal-600 hover:text-teal-600 transition-all font-medium"
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
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors"
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
                inStock: null,
                onSale: null,
                rating: null,
              });
              setSortBy('default');
            }}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
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

