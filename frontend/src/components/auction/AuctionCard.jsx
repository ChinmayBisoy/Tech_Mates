import { useState } from 'react'
import { Clock, DollarSign, Eye, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export function AuctionCard({ auction, onPlaceBid, onViewDetails }) {
  const [showRating, setShowRating] = useState(false)

  // Calculate time remaining
  const timeRemaining = new Date(auction.endsAt).getTime() - Date.now()
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)

  const isEnding = timeRemaining < 24 * 60 * 60 * 1000

  // Color scheme by status
  const statusConfig = {
    active: {
      border: 'border-blue-500 dark:border-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      badge: 'bg-blue-600 text-white',
    },
    closed: {
      border: 'border-gray-400 dark:border-gray-600',
      bg: 'bg-gray-50 dark:bg-gray-800/30',
      badge: 'bg-gray-500 text-white',
    },
  }

  const config = statusConfig[auction.status] || statusConfig.active

  return (
    <div
      className={cn(
        'border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'bg-white dark:bg-surface',
        config.border
      )}
    >
      {/* Image & Status */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center overflow-hidden">
        <div className="text-6xl">{auction.image}</div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
              config.badge
            )}
          >
            {auction.status}
          </span>
        </div>

        {/* Ending Soon Badge */}
        {isEnding && auction.status === 'active' && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Ending Soon
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
            {auction.category}
          </span>
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-yellow-500 transition-colors"
            onMouseEnter={() => setShowRating(true)}
            onMouseLeave={() => setShowRating(false)}
          >
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {auction.owner.rating}
            </span>
            <span className="text-yellow-500 text-lg">⭐</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-primary-600 transition-colors">
          {auction.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {auction.description}
        </p>

        {/* Owner */}
        <div className="flex items-center gap-2 py-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-2xl">{auction.owner.avatar}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {auction.owner.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {auction.owner.reviews} reviews
            </p>
          </div>
        </div>

        {/* Bid Info */}
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Current Bid
            </p>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {auction.currentBid}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Total Bids
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {auction.totalBids}
            </p>
          </div>
        </div>

        {/* Top Bidder */}
        {auction.topBidder && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Top Bidder
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{auction.topBidder.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {auction.topBidder.name}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                  💰 ${auction.topBidder.bid}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        {auction.status === 'active' && (
          <div
            className={cn(
              'p-2 rounded-lg text-center font-semibold text-sm',
              isEnding
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            )}
          >
            ⏱️ {days}d {hours}h {minutes}m remaining
          </div>
        )}

        {/* Winner Info (for closed auctions) */}
        {auction.status === 'closed' && auction.winner && (
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Winner
            </p>
            <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
              🏆 {auction.winner}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onViewDetails(auction.id)}
            className={cn(
              'flex-1 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-1',
              'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white hover:-translate-y-0.5',
              auction.status === 'closed' && 'from-gray-500 to-gray-600'
            )}
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
          {auction.status === 'active' && (
            <button
              onClick={() => onPlaceBid(auction.id)}
              className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg text-white hover:-translate-y-0.5"
            >
              💰 Bid Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
