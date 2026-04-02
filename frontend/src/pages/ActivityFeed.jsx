import { useState, useEffect } from 'react'
import { useActivityStore } from '@/store/activityStore'
import { ActivityCard } from '@/components/activity/ActivityCard'
import { Zap, Filter } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ActivityFeed() {
  const { filteredActivities, filter, filterActivities } = useActivityStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: '🌟' },
    { value: 'posted', label: 'Projects Posted', icon: '📋' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'hired', label: 'Hired', icon: '💼' },
    { value: 'reviews', label: 'Reviews', icon: '⭐' }
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary-600" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Live Activity Feed
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time updates from the Tech-Mates community
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className={cn(
                'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all',
                isRefreshing && 'animate-spin'
              )}
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Projects Posted</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">24</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Completed Today</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">8</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400">Developers Online</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">156</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">4.8⭐</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter Activity</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => filterActivities(option.value)}
                className={cn(
                  'px-4 py-2 rounded-full font-medium text-sm transition-all duration-300',
                  filter === option.value
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No activities yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or check back later for new updates
              </p>
            </div>
          )}
        </div>

        {/* Live Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
          </span>
          Live updates enabled
        </div>
      </div>
    </div>
  )
}
