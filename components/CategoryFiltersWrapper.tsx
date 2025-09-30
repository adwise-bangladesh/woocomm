'use client';

import { useState, useMemo } from 'react';
import CategoryFilters, { FilterState } from './CategoryFilters';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';

interface CategoryFiltersWrapperProps {
  initialProducts: Product[];
}

export default function CategoryFiltersWrapper({ initialProducts }: CategoryFiltersWrapperProps) {
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    inStock: null,
    onSale: null,
    rating: null,
  });

  // Helper to get product rating (using same logic as ProductCard)
  const getProductRating = (product: Product): number => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Helper to extract numeric price (defined inside useMemo)
    const extractPrice = (priceString: string | null | undefined): number => {
      if (!priceString) return 0;
      return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
    };

    // Helper to check if product is on sale
    const checkIfOnSale = (product: Product): boolean => {
      return !!(product.salePrice && product.regularPrice && 
        extractPrice(product.salePrice) < extractPrice(product.regularPrice));
    };

    let filtered = [...initialProducts];

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
        // Sort by rating (popularity proxy)
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      
      case 'rating':
        // Sort by rating
        filtered.sort((a, b) => getProductRating(b) - getProductRating(a));
        break;
      
      case 'date':
        // Keep original order (latest first from GraphQL)
        break;
      
      case 'price':
        // Low to high
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price || a.regularPrice);
          const priceB = extractPrice(b.price || b.regularPrice);
          return priceA - priceB;
        });
        break;
      
      case 'price-desc':
        // High to low
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price || a.regularPrice);
          const priceB = extractPrice(b.price || b.regularPrice);
          return priceB - priceA;
        });
        break;
      
      default:
        // Default - keep original order
        break;
    }

    return filtered;
  }, [initialProducts, filters, sortBy]);

  return (
    <>
      <CategoryFilters onSortChange={setSortBy} onFilterChange={setFilters} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} of {initialProducts.length} products
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
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

