'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export interface FilterState {
  priceRange: [number, number];
  inStock: boolean | null;
  onSale: boolean | null;
  minRating: number | null;
}

interface ModernFiltersSortProps {
  searchTerm?: string;
  totalProducts: number;
  filteredProducts: number;
  sortBy: string;
  filters: FilterState;
  onSortChange: (sort: string) => void;
  onFilterChange: (filters: FilterState) => void;
  maxPrice?: number;
}

export default function ModernFiltersSort({
  searchTerm,
  totalProducts,
  filteredProducts,
  sortBy,
  filters,
  onSortChange,
  onFilterChange,
  maxPrice = 50000,
}: ModernFiltersSortProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Price range slider values
  const [minPrice, setMinPrice] = useState(filters.priceRange[0]);
  const [maxPriceValue, setMaxPriceValue] = useState(
    filters.priceRange[1] === 999999 ? maxPrice : filters.priceRange[1]
  );

  const handleApplyFilters = () => {
    onFilterChange({
      ...localFilters,
      priceRange: [minPrice, maxPriceValue === maxPrice ? 999999 : maxPriceValue],
    });
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 999999],
      inStock: null,
      onSale: null,
      minRating: null,
    };
    setLocalFilters(clearedFilters);
    setMinPrice(0);
    setMaxPriceValue(maxPrice);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 999999 ||
    filters.inStock !== null ||
    filters.onSale !== null ||
    filters.minRating !== null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {searchTerm ? (
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Search Results
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    for &quot;<span className="font-semibold text-gray-900">{searchTerm}</span>&quot;
                  </p>
                </div>
              ) : (
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Products
                </h1>
              )}
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                  {[
                    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999,
                    filters.inStock !== null,
                    filters.onSale !== null,
                    filters.minRating !== null,
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sort and Count Section */}
        <div className="py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-semibold text-gray-900">{filteredProducts}</span>{' '}
            {filteredProducts !== totalProducts && (
              <>
                of <span className="font-semibold text-gray-900">{totalProducts}</span>
              </>
            )}{' '}
            {filteredProducts === 1 ? 'product' : 'products'}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer transition-colors"
            >
              <option value="default">Default Sorting</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="best-selling">Sort by Best Selling</option>
              <option value="rating">Sort by Reviews</option>
              <option value="new-arrivals">Sort by New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {isFilterOpen && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filter Products</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range Slider */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Price Range
                </label>
                <div className="space-y-4">
                  {/* Min Price Slider */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Minimum: ৳{minPrice.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= maxPriceValue) {
                          setMinPrice(value);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  {/* Max Price Slider */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Maximum: ৳{maxPriceValue.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={maxPriceValue}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= minPrice) {
                          setMaxPriceValue(value);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <span className="font-medium">৳{minPrice.toLocaleString()}</span>
                    <span className="text-gray-400">—</span>
                    <span className="font-medium">৳{maxPriceValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Availability
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={localFilters.inStock === true}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          inStock: e.target.checked ? true : null,
                        })
                      }
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      In Stock Only
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={localFilters.onSale === true}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          onSale: e.target.checked ? true : null,
                        })
                      }
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      On Sale
                    </span>
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={localFilters.minRating === rating}
                        onChange={() =>
                          setLocalFilters({
                            ...localFilters,
                            minRating: rating,
                          })
                        }
                        className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1">
                        {rating}+ <span className="text-yellow-500">★</span>
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={localFilters.minRating === null}
                      onChange={() =>
                        setLocalFilters({
                          ...localFilters,
                          minRating: null,
                        })
                      }
                      className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      All Ratings
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 invisible md:visible">
                  Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

