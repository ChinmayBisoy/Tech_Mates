import { TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export function BidHistory({ bids, topBidder }) {
  if (!bids || bids.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No bids yet. Be the first to bid!</p>
      </div>
    )
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Bid History ({bids.length})
        </h3>
      </div>

      {/* Bids List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {bids.map((bid, index) => (
          <div
            key={bid.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              index === 0
                ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border-2 border-green-400 dark:border-green-600'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                index === 0
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              #{index + 1}
            </div>

            {/* Bidder Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {bid.bidder}
                </p>
                {bid.bidder === topBidder && (
                  <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                    🏆 Leader
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(bid.timestamp)}
              </p>
            </div>

            {/* Bid Amount */}
            <div className="text-right">
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                ${bid.amount}
              </p>
              {index > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +${bid.amount - bids[index - 1].amount}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Highest Bid</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
            ${bids[0]?.amount || 0}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Bids</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{bids.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Increment</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
            ${((bids[0]?.amount - (bids[bids.length - 1]?.amount || 0)) / bids.length).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  )
}
