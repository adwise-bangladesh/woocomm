export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-1 space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
