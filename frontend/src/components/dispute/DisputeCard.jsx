import { AlertCircle, Check, Clock, FileText } from 'lucide-react'
import { cn } from '@/utils/cn'

export function DisputeCard({ dispute, onViewDetails, onAddEvidence, onMessage }) {
  const priorityConfig = {
    high: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', badge: 'bg-red-600' },
    medium: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', badge: 'bg-yellow-600' },
    low: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'bg-blue-600' },
  }

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', badgeColor: 'bg-red-600' },
    'under-review': { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', badgeColor: 'bg-yellow-600' },
    resolved: { icon: Check, color: 'text-green-600 dark:text-green-400', badgeColor: 'bg-green-600' },
    closed: { icon: FileText, color: 'text-gray-600 dark:text-gray-400', badgeColor: 'bg-gray-600' },
  }

  const priorityConfig_ = priorityConfig[dispute.priority] || priorityConfig.medium
  const statusConfig_ = statusConfig[dispute.status] || statusConfig.open
  const StatusIcon = statusConfig_.icon

  const isResolvable = dispute.status === 'open' || dispute.status === 'under-review'
  const daysRemaining = Math.ceil((new Date(dispute.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysRemaining < 0

  return (
    <div
      className={cn(
        'border-2 rounded-lg overflow-hidden bg-white dark:bg-surface transition-all hover:shadow-lg',
        priorityConfig_.bg
      )}
    >
      {/* Header with Priority & Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={cn('w-5 h-5', statusConfig_.color)} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {dispute.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID: {dispute.id} • Category: {dispute.category.replace('_', ' ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-bold text-white', priorityConfig_.badge)}>
            {dispute.priority.toUpperCase()}
          </span>
          <span className={cn('px-3 py-1 rounded-full text-xs font-bold text-white', statusConfig_.badgeColor)}>
            {dispute.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300">{dispute.description}</p>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-200 dark:border-gray-700">
          {/* Claimant */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dispute.claimant.avatar}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Claimant</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {dispute.claimant.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{dispute.claimant.role}</p>
            </div>
          </div>

          {/* Respondent */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dispute.respondent.avatar}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Respondent</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {dispute.respondent.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{dispute.respondent.role}</p>
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Claim Amount</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${dispute.amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Requested Reduction</span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{dispute.claimReduction}%</span>
          </div>
        </div>

        {/* Evidence & Messages Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">📎 Evidence</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{dispute.evidence?.length || 0}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">💬 Messages</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{dispute.messages?.length || 0}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Created: {new Date(dispute.createdDate).toLocaleDateString()}
          </span>
          <span
            className={cn(
              'font-semibold',
              isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {isOverdue
              ? `⚠️ Overdue ${Math.abs(daysRemaining)} days`
              : `📅 ${daysRemaining} days left`}
          </span>
        </div>

        {/* Arbitrator Info (if assigned) */}
        {dispute.arbitrator && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded flex items-center gap-2">
            <span className="text-2xl">{dispute.arbitrator.avatar}</span>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Assigned Arbitrator</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{dispute.arbitrator.name}</p>
            </div>
          </div>
        )}

        {/* Resolution Summary (if resolved) */}
        {dispute.resolution && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              ✓ Resolved: {dispute.resolution.decision.replace('_', ' ').toUpperCase()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{dispute.resolution.reason}</p>
            {dispute.refundAmount > 0 && (
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                💰 Refund: ${dispute.refundAmount}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => onViewDetails(dispute.id)}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          👁️ View Details
        </button>
        {isResolvable && (
          <>
            <button
              onClick={() => onAddEvidence(dispute.id)}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              📎 Add Evidence
            </button>
            <button
              onClick={() => onMessage(dispute.id)}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              💬 Message
            </button>
          </>
        )}
      </div>
    </div>
  )
}
