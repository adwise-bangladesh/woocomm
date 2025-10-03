'use client';

import { useState, useMemo, useCallback } from 'react';
import CategoryFilters, { FilterState } from './CategoryFilters';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { logger } from '@/lib/utils/performance';

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
    return initialProducts.map(product => ({
      product,
      price: extractPrice(product.price || product.regularPrice),
      isOnSale: checkIfOnSale(product),
      rating: getProductRating(product),
      isInStock: product.stockStatus === 'IN_STOCK' || product.stockStatus === 'FAST_DELIVERY' || product.stockStatus === 'REGULAR_DELIVERY'
    }));
  }, [initialProducts]);


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
        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600 px-4 lg:px-0">
          Showing {filteredAndSortedProducts.length} of {initialProducts.length} products
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
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

