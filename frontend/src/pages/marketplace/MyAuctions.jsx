import { useState } from 'react'
import { Plus, Eye, Trash2, TrendingUp } from 'lucide-react'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { useAuctionStore } from '@/store/auctionStore'
import { cn } from '@/utils/cn'

export default function MyAuctions() {
  const { auctions, getActiveAuctions } = useAuctionStore()
  const [filterStatus, setFilterStatus] = useState('all') // all, active, closed

  // Get user's auctions (simulating - in real app would be user-specific)
  let myAuctions = auctions.filter((a) => a.owner.name === 'Tech Solutions Ltd' || a.owner.name === 'Creative Agency')

  if (filterStatus === 'active') {
    myAuctions = myAuctions.filter((a) => a.status === 'active')
  } else if (filterStatus === 'closed') {
    myAuctions = myAuctions.filter((a) => a.status === 'closed')
  }

  const activeCount = myAuctions.filter((a) => a.status === 'active').length
  const closedCount = myAuctions.filter((a) => a.status === 'closed').length
  const totalBids = myAuctions.reduce((sum, a) => sum + a.totalBids, 0)
  const totalValue = myAuctions.reduce((sum, a) => sum + a.currentBid, 0)

  const handleViewDetails = (auctionId) => {
    console.log('View auction details:', auctionId)
  }

  const handleEditAuction = (auctionId) => {
    console.log('Edit auction:', auctionId)
  }

  const handleDeleteAuction = (auctionId) => {
    console.log('Delete auction:', auctionId)
  }

  const handleViewBids = (auctionId) => {
    console.log('View bids for auction:', auctionId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <h1 className="text-4xl font-bold">My Auctions</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold transition-all">
              <Plus className="w-5 h-5" />
              Create Auction
            </button>
          </div>
          <p className="text-purple-100 text-lg">
            Manage your auctions, track bids, and monitor progress
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Auctions</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{myAuctions.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Active</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Bids</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalBids}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Value</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${totalValue}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'active', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-6 py-2 rounded-lg font-semibold transition-all',
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {status === 'all' ? '📋 All' : status === 'active' ? '🔴 Active' : '✅ Closed'}
            </button>
          ))}
        </div>

        {/* Auctions List/Grid */}
        {myAuctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No auctions yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first auction to start receiving bids
            </p>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Create Your First Auction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myAuctions.map((auction) => (
              <div
                key={auction.id}
                className={cn(
                  'border-2 rounded-lg p-4 flex items-center justify-between gap-4 transition-all hover:shadow-lg',
                  auction.status === 'active'
                    ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                )}
              >
                {/* Auction Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {auction.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                    <span className="text-gray-600 dark:text-gray-400">
                      ID: <span className="font-semibold">{auction.id}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Category: <span className="font-semibold">{auction.category}</span>
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      💰 ${auction.currentBid}
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      🔨 {auction.totalBids} bids
                    </span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-bold',
                        auction.status === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-500 text-white'
                      )}
                    >
                      {auction.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewBids(auction.id)}
                    title="View Bids"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    📊
                  </button>
                  <button
                    onClick={() => handleViewDetails(auction.id)}
                    title="View Details"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {auction.status === 'active' && (
                    <button
                      onClick={() => handleEditAuction(auction.id)}
                      title="Edit"
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAuction(auction.id)}
                    title="Delete"
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
