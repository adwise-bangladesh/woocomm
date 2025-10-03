export function SliderSkeleton() {
  return (
    <div className="w-full h-[150px] md:h-[300px] lg:h-[400px] bg-gray-200 animate-pulse rounded-[5px]" />
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gray-200 animate-pulse" />
              <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[2px] bg-gray-200" />
          <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
          <div className="flex-1 h-[2px] bg-gray-200" />
        </div>
      </div>
      <div className="w-full lg:container lg:mx-auto lg:px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-2 space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Image Gallery Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white sticky top-4 p-4 rounded-[5px]">
              {/* Main Image */}
              <div className="aspect-square bg-gray-200 animate-pulse rounded-[5px] mb-4" />
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-[5px]" />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="space-y-2">
            <div className="bg-white rounded-[5px] p-3 sticky top-4">
              {/* Title */}
              <div className="h-6 bg-gray-200 animate-pulse rounded mb-3" />
              
              {/* Reviews */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
                <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Price */}
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-baseline gap-2">
                  <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />
                  <div className="w-16 h-5 bg-gray-200 animate-pulse rounded" />
                  <div className="w-12 h-5 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>

              {/* Variant Selector */}
              <div className="mb-4 pb-4 border-b space-y-3">
                <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-16 h-10 bg-gray-200 animate-pulse rounded-md" />
                  ))}
                </div>
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-16 h-10 bg-gray-200 animate-pulse rounded-md" />
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="mb-3 pb-3 border-b space-y-2">
                <div className="w-full h-3 bg-gray-200 animate-pulse rounded" />
                <div className="w-3/4 h-3 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-200 animate-pulse rounded-full" />
                  <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-4">
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg" />
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg" />
              </div>

              {/* Contact Options */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              </div>

              {/* Delivery Charges */}
              <div className="mb-4 pb-4 border-b space-y-2">
                <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div className="w-20 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-12 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-14 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mb-3 p-3 bg-gray-100 rounded-lg space-y-2">
                <div className="w-28 h-3 bg-gray-200 animate-pulse rounded" />
                <div className="w-full h-3 bg-gray-200 animate-pulse rounded" />
                <div className="w-2/3 h-3 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Product Code & Share */}
              <div className="flex items-center justify-between">
                <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Skeleton */}
      <div className="container mx-auto px-2 mt-4">
        <div className="bg-white rounded-[5px] p-4 space-y-3">
          <div className="w-40 h-6 bg-gray-200 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
            <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Category Name */}
              <div className="h-8 md:h-10 bg-gray-200 animate-pulse rounded w-48 md:w-64 mb-2" />
              {/* Category Description */}
              <div className="space-y-2 max-w-3xl">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              </div>
            </div>
            {/* Total Count */}
            <div className="text-right flex-shrink-0">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 animate-pulse rounded w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Info Skeleton */}
        <div className="mb-4">
          <div className="h-5 bg-gray-200 animate-pulse rounded w-48" />
        </div>

        {/* Product Grid - Match actual grid styling */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden">
              {/* Product Image */}
              <div className="aspect-square bg-gray-200 animate-pulse" />
              
              {/* Product Info */}
              <div className="p-2 space-y-2">
                {/* Product Name */}
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                
                {/* Price */}
                <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
                
                {/* Reviews */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading More Skeleton */}
        <div className="flex justify-center items-center py-8 mt-4">
          <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-4 md:py-6">
        <SliderSkeleton />
      </section>
      <div className="py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <CategoriesSkeleton />
      <ProductGridSkeleton />
    </div>
  );
}

