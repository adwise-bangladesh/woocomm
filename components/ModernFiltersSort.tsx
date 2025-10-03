'use client';

import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterState {
  priceRange: [number, number];
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
  maxPrice = 200000,
}: ModernFiltersSortProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem('productSort');
    const savedFilters = localStorage.getItem('productFilters');
    
    if (savedSort && savedSort !== sortBy) {
      onSortChange(savedSort);
    }
    
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setLocalFilters(parsedFilters);
        onFilterChange(parsedFilters);
      } catch (error) {
        console.warn('Failed to parse saved filters:', error);
      }
    }
  }, [onSortChange, onFilterChange, sortBy]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('productSort', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('productFilters', JSON.stringify(filters));
  }, [filters]);

  // Price range slider values
  const [minPrice, setMinPrice] = useState(filters.priceRange[0]);
  const [maxPriceValue, setMaxPriceValue] = useState(
    filters.priceRange[1] === 999999 ? maxPrice : filters.priceRange[1]
  );

  // Debounced price update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (minPrice !== filters.priceRange[0] || maxPriceValue !== filters.priceRange[1]) {
        setLocalFilters(prev => ({
          ...prev,
          priceRange: [minPrice, maxPriceValue === maxPrice ? 999999 : maxPriceValue]
        }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [minPrice, maxPriceValue, maxPrice, filters.priceRange]);

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
    filters.minRating !== null;

  // Generate filter chips
  const filterChips = useMemo(() => {
    const chips = [];
    
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) {
      chips.push({
        id: 'price',
        label: `Tk ${filters.priceRange[0].toLocaleString()} - Tk ${filters.priceRange[1].toLocaleString()}`,
        onRemove: () => {
          const newFilters = { ...filters, priceRange: [0, 999999] as [number, number] };
          setLocalFilters(newFilters);
          onFilterChange(newFilters);
        }
      });
    }
    
    if (filters.minRating !== null) {
      chips.push({
        id: 'rating',
        label: `${filters.minRating}+ Stars`,
        onRemove: () => {
          const newFilters = { ...filters, minRating: null };
          setLocalFilters(newFilters);
          onFilterChange(newFilters);
        }
      });
    }
    
    return chips;
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {searchTerm ? (
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">
                    {searchTerm}
                  </h1>
                  <p className="text-xs text-gray-600 mt-1">
                    Showing {filteredProducts} of {totalProducts} products
                  </p>
                </div>
              ) : (
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  Products
                </h1>
              )}
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 touch-manipulation"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-white text-xs rounded-full" style={{ backgroundColor: '#fe6c06' }}>
                  {[
                    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999,
                    filters.minRating !== null,
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        {filterChips.length > 0 && (
          <div className="py-3">
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
        )}

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
              {/* Sort Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'popularity', label: 'Popularity' },
                    { value: 'best-selling', label: 'Best Selling' },
                    { value: 'rating', label: 'Reviews' },
                    { value: 'new-arrivals', label: 'New Arrivals' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-[5px] transition-colors touch-manipulation min-h-[44px] ${
                        sortBy === option.value
                          ? 'text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-orange-300'
                      }`}
                      style={sortBy === option.value ? { backgroundColor: '#fe6c06' } : {}}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Price Range
                </label>
                <div className="space-y-4">
                  {/* Min Price Slider */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Minimum: Tk {minPrice.toLocaleString()}
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#fe6c06' }}
                    />
                  </div>

                  {/* Max Price Slider */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Maximum: Tk {maxPriceValue.toLocaleString()}
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#fe6c06' }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <span className="font-medium">Tk {minPrice.toLocaleString()}</span>
                    <span className="text-gray-400">—</span>
                    <span className="font-medium">Tk {maxPriceValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>


              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Minimum Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: null, label: 'All Ratings', stars: 0 },
                    { value: 3.0, label: '3+ Stars', stars: 3 },
                    { value: 3.5, label: '3.5+ Stars', stars: 3.5 },
                    { value: 4.0, label: '4+ Stars', stars: 4 },
                    { value: 4.5, label: '4.5+ Stars', stars: 4.5 },
                  ].map((option) => (
                    <button
                      key={option.value || 'all'}
                      onClick={() =>
                        setLocalFilters({
                          ...localFilters,
                          minRating: option.value,
                        })
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-[5px] transition-colors flex items-center gap-1 touch-manipulation min-h-[44px] ${
                        localFilters.minRating === option.value
                          ? 'text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-orange-300'
                      }`}
                      style={localFilters.minRating === option.value ? { backgroundColor: '#fe6c06' } : {}}
                    >
                      {option.value ? (
                        <>
                          {option.value}+ 
                          <span className="text-yellow-400">★</span>
                        </>
                      ) : (
                        option.label
                      )}
                    </button>
                  ))}
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
                    className="w-full px-4 py-2.5 text-white font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#fe6c06' }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
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

