import { useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { EscrowTransactionCard } from '@/components/escrow/EscrowTransactionCard'
import { MilestoneTracker } from '@/components/escrow/MilestoneTracker'
import { useEscrowStore } from '@/store/escrowStore'
import { cn } from '@/utils/cn'

export default function Escrow() {
  const { getEscrows, getEscrowsByStatus, calculateTotalProgress } = useEscrowStore()
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedEscrow, setSelectedEscrow] = useState(null)

  let escrows = getEscrows()

  if (filterStatus !== 'all') {
    escrows = getEscrowsByStatus(filterStatus)
  }

  const statusCounts = {
    pending: getEscrowsByStatus('pending').length,
    'in-progress': getEscrowsByStatus('in-progress').length,
    completed: getEscrowsByStatus('completed').length,
    disputed: getEscrowsByStatus('disputed').length,
  }

  const totalEscrowed = escrows.reduce((sum, e) => sum + e.totalAmount, 0)
  const totalReleased = escrows.reduce((sum, e) => sum + e.releasedAmount, 0)

  const handleViewDetails = (escrowId) => {
    setSelectedEscrow(escrowId)
  }

  const handleManage = (escrowId) => {
    console.log('Manage escrow:', escrowId)
  }

  const selectedEscrowData = selectedEscrow ? getEscrows().find((e) => e.id === selectedEscrow) : null

  return (
    <div className="min-h-screen bg-white dark:bg-base">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Escrow Management</h1>
          </div>
          <p className="text-green-100 text-lg">
            Secure payments, milestone tracking, and automatic fund release
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Held</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${totalEscrowed}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Released</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${totalReleased}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Transactions</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{escrows.length}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Remaining</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              ${totalEscrowed - totalReleased}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Avg Progress</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {escrows.length > 0
                ? Math.round(escrows.reduce((sum, e) => sum + calculateTotalProgress(e.id), 0) / escrows.length)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Transactions List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold transition-all text-sm',
                    filterStatus === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {status === 'all' ? `📋 All (${escrows.length})` : `${status} (${statusCounts[status]})`}
                </button>
              ))}
            </div>

            {/* Transactions */}
            {escrows.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No escrow transactions yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Escrow transactions will appear here once created
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {escrows.map((escrow) => (
                  <EscrowTransactionCard
                    key={escrow.id}
                    escrow={escrow}
                    onViewDetails={handleViewDetails}
                    onManage={handleManage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Transaction Details */}
          <div className="lg:col-span-1">
            {selectedEscrowData ? (
              <div className="bg-white dark:bg-surface border-2 border-green-500 dark:border-green-600 rounded-lg p-4 sticky top-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {selectedEscrowData.projectTitle}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ID: {selectedEscrowData.id}
                  </p>
                </div>

                {/* Parties */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedEscrowData.buyer.avatar}</span>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Buyer</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedEscrowData.buyer.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedEscrowData.seller.avatar}</span>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Seller</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedEscrowData.seller.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg space-y-1 border border-green-200 dark:border-green-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Total:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${selectedEscrowData.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Released:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${selectedEscrowData.releasedAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Remaining:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ${selectedEscrowData.totalAmount - selectedEscrowData.releasedAmount}
                    </span>
                  </div>
                </div>

                {/* Milestone Tracker */}
                <MilestoneTracker
                  milestones={selectedEscrowData.milestones}
                  totalProgress={calculateTotalProgress(selectedEscrowData.id)}
                />

                <button
                  onClick={() => setSelectedEscrow(null)}
                  className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close Details
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">👈</div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                  Select a transaction to view details and milestone progress
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
