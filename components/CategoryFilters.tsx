'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterState {
  priceRange: [number, number];
  inStock: boolean | null;
  onSale: boolean | null;
  rating: number | null;
}

interface CategoryFiltersProps {
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export default function CategoryFilters({ onSortChange, onFilterChange }: CategoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 999999],
    inStock: null,
    onSale: null,
    rating: null,
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      priceRange: [0, 999999],
      inStock: null,
      onSale: null,
      rating: null,
    };
    setFilters(cleared);
    setSortBy('default');
    onSortChange('default');
    onFilterChange(cleared);
  };

  const hasActiveFilters = 
    filters.priceRange[0] !== 0 || 
    filters.priceRange[1] !== 999999 || 
    filters.inStock !== null || 
    filters.onSale !== null || 
    filters.rating !== null;

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 hidden sm:block">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="default">Default</option>
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="date">Latest</option>
              <option value="price">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {isOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0] === 0 ? '' : filters.priceRange[0]}
                  onChange={(e) => handleFilterChange({ 
                    priceRange: [Number(e.target.value) || 0, filters.priceRange[1]] 
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1] === 999999 ? '' : filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({ 
                    priceRange: [filters.priceRange[0], Number(e.target.value) || 999999] 
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => handleFilterChange({ 
                      inStock: e.target.checked ? true : null 
                    })}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>

            {/* On Sale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Offers
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale === true}
                    onChange={(e) => handleFilterChange({ 
                      onSale: e.target.checked ? true : null 
                    })}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleFilterChange({ rating })}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{rating}+ Stars</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === null}
                    onChange={() => handleFilterChange({ rating: null })}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">All Ratings</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

