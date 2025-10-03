export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider Skeleton */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="w-full h-[150px] md:h-[300px] lg:h-[400px] bg-gray-200 animate-pulse rounded-[5px]" />
      </section>

      {/* Quick Links Skeleton */}
      <section className="py-3 md:py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-100 animate-pulse rounded-lg">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                <div className="h-2.5 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-100 animate-pulse rounded-lg">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                <div className="h-2.5 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gray-200 animate-pulse rounded-full mb-2"></div>
                <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section Title */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[2px] bg-gray-200"></div>
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="flex-1 h-[2px] bg-gray-200"></div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="w-full lg:container lg:mx-auto lg:px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}