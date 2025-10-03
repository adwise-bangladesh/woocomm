'use client';

import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

interface CategoryFiltersProps {
  onSortChange: (sort: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: [number, number];
  inStock: boolean | null;
  onSale: boolean | null;
  rating: number | null;
}

const sortOptions = [
  { value: 'default', label: 'Default sorting' },
  { value: 'popularity', label: 'Sort by popularity' },
  { value: 'rating', label: 'Sort by average rating' },
  { value: 'date', label: 'Sort by latest' },
  { value: 'price', label: 'Sort by price: low to high' },
  { value: 'price-desc', label: 'Sort by price: high to low' },
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: 999999 },
  { label: 'Under Tk 500', min: 0, max: 500 },
  { label: 'Tk 500 - Tk 1,000', min: 500, max: 1000 },
  { label: 'Tk 1,000 - Tk 2,000', min: 1000, max: 2000 },
  { label: 'Tk 2,000 - Tk 5,000', min: 2000, max: 5000 },
  { label: 'Above Tk 5,000', min: 5000, max: 999999 },
];

const ratingOptions = [5, 4, 3, 2, 1];

export default function CategoryFilters({ onSortChange, onFilterChange }: CategoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    inStock: null,
    onSale: null,
    rating: null,
  });

  const handleSortChange = (value: string) => {
    onSortChange(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: number | boolean | [number, number] | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 999999],
      inStock: null,
      onSale: null,
      rating: null,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.priceRange[0] !== 0 || 
    filters.priceRange[1] !== 999999 ||
    filters.inStock !== null ||
    filters.onSale !== null ||
    filters.rating !== null;

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative text-gray-900"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">Filters</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <select
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full appearance-none bg-gray-100 hover:bg-gray-200 border-0 rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 py-4 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.label}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={
                          filters.priceRange[0] === range.min &&
                          filters.priceRange[1] === range.max
                        }
                        onChange={() =>
                          handleFilterChange('priceRange', [range.min, range.max])
                        }
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === null}
                      onChange={() => handleFilterChange('inStock', null)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">All Products</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === true}
                      onChange={() => handleFilterChange('inStock', true)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === false}
                      onChange={() => handleFilterChange('inStock', false)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Out of Stock</span>
                  </label>
                </div>
              </div>

              {/* Sale Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="sale"
                      checked={filters.onSale === null}
                      onChange={() => handleFilterChange('onSale', null)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">All Products</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="sale"
                      checked={filters.onSale === true}
                      onChange={() => handleFilterChange('onSale', true)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">On Sale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="sale"
                      checked={filters.onSale === false}
                      onChange={() => handleFilterChange('onSale', false)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Regular Price</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === null}
                      onChange={() => handleFilterChange('rating', null)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">All Ratings</span>
                  </label>
                  {ratingOptions.map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        {rating}
                        <span className="text-yellow-400">★</span>
                        & above
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

