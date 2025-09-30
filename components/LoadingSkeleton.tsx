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

