/**
 * Progressive Product Grid Component
 * Implements virtual scrolling and intelligent progressive loading
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';

interface ProgressiveProductGridProps {
  products: Product[];
  isLoadingMore: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  className?: string;
}

const ITEMS_PER_PAGE = 20;
const TRIGGER_DISTANCE = 1200; // Load when 1200px from bottom

export default function ProgressiveProductGrid({
  products,
  isLoadingMore,
  hasNextPage,
  onLoadMore,
  className = ''
}: ProgressiveProductGridProps) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);

  // Calculate visible products based on current page
  const productsToShow = useMemo(() => {
    const endIndex = Math.min(page * ITEMS_PER_PAGE, products.length);
    return products.slice(0, endIndex);
  }, [products, page]);

  // Progressive reveal with animation
  useEffect(() => {
    if (productsToShow.length > visibleProducts.length) {
      // Animate new products in
      const newProducts = productsToShow.slice(visibleProducts.length);
      const animationDelay = 50; // 50ms between each product

      newProducts.forEach((product, index) => {
        setTimeout(() => {
          setVisibleProducts(prev => [...prev, product]);
        }, index * animationDelay);
      });
    } else {
      setVisibleProducts(productsToShow);
    }
  }, [productsToShow, visibleProducts.length]);

  // Infinite scroll hook with intersection observer
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (
      scrollTop + clientHeight >= scrollHeight - TRIGGER_DISTANCE &&
      !isLoadingMore &&
      hasNextPage &&
      visibleProducts.length === products.length
    ) {
      onLoadMore();
    }

    // Check if we need to show more local products
    if (
      page * ITEMS_PER_PAGE < products.length &&
      scrollTop + clientHeight >= scrollHeight - TRIGGER_DISTANCE
    ) {
      setPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasNextPage, visibleProducts.length, products.length, page, onLoadMore]);

  useEffect(() => {
    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  // Reset page when products change
  useEffect(() => {
    setPage(1);
    setVisibleProducts([]);
  }, [products]);

  return (
    <div className={`w-full ${className}`}>
      {/* Products Grid with Progressive Loading */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${Math.min(index * 0.05, 1)}s`,
              animationFillMode: 'both'
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
        
        {/* Advanced Skeleton Loaders */}
        {isLoadingMore && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton
                key={`skeleton-${i}`}
                index={i}
                animationDelay={0.1 + i * 0.05}
              />
            ))}
          </>
        )}
      </div>

      {/* Progressive Loading Indicator */}
      {!isLoadingMore && page * ITEMS_PER_PAGE < products.length && (
        <div className="flex justify-center py-6">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Load More Products ({products.length - visibleProducts.length} remaining)
          </button>
        </div>
      )}

      {/* End of Products Message */}
      {visibleProducts.length === products.length && !hasNextPage && products.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            ✨ All {products.length} products loaded
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !isLoadingMore && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m2-6h4v4H8V7zm8 0h4v4h-4V7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

// Advanced Product Skeleton Component
function ProductSkeleton({ index, animationDelay }: { index: number; animationDelay: number }) {
  return (
    <div
      className="product-skeleton"
      style={{
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'both'
      }}
    >
      <div className="bg-white overflow-hidden rounded-[5px] animate-pulse">
        {/* Image skeleton with shimmer */}
        <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative overflow-hidden">
          <div className="shimmer" />
        </div>
        
        {/* Content skeleton */}
        <div className="p-3 space-y-2">
          {/* Title skeleton - variable width */}
          <div className={`h-4 bg-gray-200 rounded ${index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-4/5' : 'w-3/4'}`} />
          
          {/* Price skeleton */}
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          
          {/* Rating skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }
        
        .product-skeleton {
          animation: fade-in-up 0.6s ease-out;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
