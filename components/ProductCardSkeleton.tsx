/**
 * Product Card Skeleton Loader
 * Shows while products are loading for a smoother UX
 */

export default function ProductCardSkeleton() {
  return (
    <div className="group block bg-white overflow-hidden relative animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-gray-200"></div>

      {/* Product Info Skeleton */}
      <div className="p-3 space-y-2">
        {/* Title Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>

        {/* Price Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Reviews Skeleton */}
        <div className="flex items-center gap-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
}

