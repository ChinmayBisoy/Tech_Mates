import { DollarSign, Check, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

export function EscrowTransactionCard({ escrow, onViewDetails, onManage }) {
  const statusConfig = {
    pending: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      badge: 'bg-yellow-600',
      icon: Clock,
    },
    'in-progress': {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      badge: 'bg-blue-600',
      icon: AlertCircle,
    },
    completed: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      badge: 'bg-green-600',
      icon: Check,
    },
    disputed: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      badge: 'bg-red-600',
      icon: AlertCircle,
    },
  }

  const config = statusConfig[escrow.status]
  const Icon = config?.icon || Clock

  const progressPercentage = (escrow.releasedAmount / escrow.totalAmount) * 100

  return (
    <div
      className={cn(
        'border-2 rounded-lg overflow-hidden bg-white dark:bg-surface transition-all hover:shadow-lg',
        config?.bg
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {escrow.projectTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Transaction ID: {escrow.transactionId}
          </p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-bold text-white', config?.badge)}>
          {escrow.status.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Parties */}
        <div className="grid grid-cols-2 gap-3">
          {/* Buyer */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{escrow.buyer.avatar}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Buyer</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {escrow.buyer.name}
              </p>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{escrow.seller.avatar}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Seller</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {escrow.seller.name}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Payment Progress
            </p>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Amount Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              Released: <span className="font-bold text-green-600 dark:text-green-400">${escrow.releasedAmount}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Total: <span className="font-bold text-primary-600 dark:text-primary-400">${escrow.totalAmount}</span>
            </span>
          </div>
        </div>

        {/* Milestone Summary */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-bold text-gray-900 dark:text-white">
              {escrow.milestones?.filter((m) => m.status === 'completed').length || 0}/
              {escrow.milestones?.length || 0}
            </span>{' '}
            milestones completed
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Timeline: <span className="font-bold text-gray-900 dark:text-white">{escrow.timeline} days</span>
          </p>
        </div>

        {/* Milestone Progress Indicators */}
        <div className="flex gap-1">
          {escrow.milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                milestone.status === 'completed'
                  ? 'bg-green-600'
                  : milestone.status === 'in-progress'
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
              )}
              title={milestone.title}
            />
          ))}
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => onViewDetails(escrow.id)}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          📋 View Details
        </button>
        {escrow.status !== 'completed' && (
          <button
            onClick={() => onManage(escrow.id)}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            ⚙️ Manage
          </button>
        )}
      </div>
    </div>
  )
}
