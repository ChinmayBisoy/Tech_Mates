export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />

      {/* Content skeleton */}
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
  )
}
