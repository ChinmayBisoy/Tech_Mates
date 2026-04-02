export function PageLoader() {
  return (
    <div className="min-h-screen bg-white dark:bg-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {/* Card image skeleton */}
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />

              {/* Card content skeleton */}
              <div className="p-6">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
