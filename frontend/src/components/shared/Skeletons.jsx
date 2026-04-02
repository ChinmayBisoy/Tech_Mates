// Reusable skeleton components for loading states
export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            i === lines - 1 ? 'w-4/5' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex gap-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-4"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}

export function AvatarSkeleton() {
  return (
    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
  )
}

export function GridCardsSkeleton({ columns = 3, count = 6 }) {
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 flex-shrink-0"></div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  )
}
