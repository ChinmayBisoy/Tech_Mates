import { useState } from 'react'
import { Search, Filter, SortAsc, Zap } from 'lucide-react'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { useAuctionStore } from '@/store/auctionStore'
import { cn } from '@/utils/cn'

export default function ActiveAuctions() {
  const { getActiveAuctions, searchAuctions, filterByCategory, sortAuctions } = useAuctionStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('ending-soon')
  const [showFilters, setShowFilters] = useState(false)

  // Get all auctions
  let displayedAuctions = getActiveAuctions()

  // Apply search
  if (searchQuery) {
    displayedAuctions = searchAuctions(searchQuery).filter((a) => a.status === 'active')
  }

  // Apply category filter
  if (selectedCategory !== 'all') {
    displayedAuctions = displayedAuctions.filter((a) => a.category === selectedCategory)
  }

  // Apply sorting
  displayedAuctions = sortAuctions(sortBy).filter((a) => displayedAuctions.find((d) => d.id === a.id))

  // Get unique categories
  const categories = ['all', ...new Set(getActiveAuctions().map((a) => a.category))]

  const handlePlaceBid = (auctionId) => {
    // Navigate to auction detail with bid form
    console.log('Place bid for auction:', auctionId)
  }

  const handleViewDetails = (auctionId) => {
    // Navigate to auction detail page
    console.log('View details for auction:', auctionId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Live Auctions</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Find the best freelancers and projects in real-time bidding auctions
          </p>
          <p className="text-sm text-blue-200">
            🔴 {displayedAuctions.length} active auction{displayedAuctions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all',
                'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
                'border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500'
              )}
            />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 flex-wrap items-center">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={cn(
              'px-4 py-2 border-2 rounded-lg transition-all',
              'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
              'border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500'
            )}
          >
            <option value="ending-soon">⏰ Ending Soon</option>
            <option value="price-high">💰 Highest Price</option>
            <option value="price-low">💵 Lowest Price</option>
            <option value="newest">✨ Newest</option>
          </select>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'all' || sortBy !== 'ending-soon') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSortBy('ending-soon')
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-semibold"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-surface text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    )}
                  >
                    {category === 'all' ? '🌐 All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auctions Grid */}
        {displayedAuctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No auctions found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSortBy('ending-soon')
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View All Auctions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onPlaceBid={handlePlaceBid}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Active Auctions</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{displayedAuctions.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Bids</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {displayedAuctions.reduce((sum, a) => sum + a.totalBids, 0)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Highest Bid</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              ${Math.max(...displayedAuctions.map((a) => a.currentBid), 0)}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Avg Rating</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {(displayedAuctions.reduce((sum, a) => sum + a.owner.rating, 0) / displayedAuctions.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
