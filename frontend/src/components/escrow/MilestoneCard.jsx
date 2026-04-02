import { CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react'
import { cn } from '@/utils/cn'

export function MilestoneCard({ milestone, onRequestRelease, onApprove, isRequester, canApprove }) {
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-600 text-white',
    },
    'in-progress': {
      icon: Play,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-600 text-white',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      badge: 'bg-yellow-600 text-white',
    },
  }

  const config = statusConfig[milestone.status] || statusConfig.pending
  const Icon = config.icon

  const isOverdue =
    milestone.dueDate && new Date(milestone.dueDate).getTime() < Date.now() && milestone.status !== 'completed'

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className={cn(
        'border-2 rounded-lg p-4 transition-all hover:shadow-md',
        config.bg,
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={cn('w-6 h-6 flex-shrink-0 mt-0.5', config.color)} />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {milestone.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {milestone.percentage}% • ${milestone.amount}
            </p>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-bold uppercase', config.badge)}>
          {milestone.status}
        </span>
      </div>

      {/* Deliverables */}
      <div className="mb-3 pl-9">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">DELIVERABLES</p>
        <ul className="space-y-1">
          {milestone.deliverables?.map((deliverable, index) => (
            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              {deliverable}
            </li>
          ))}
        </ul>
      </div>

      {/* Progress Bar (if in-progress) */}
      {milestone.status === 'in-progress' && milestone.progressPercentage !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">PROGRESS</p>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {milestone.progressPercentage}%
            </p>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
              style={{ width: `${milestone.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline Info */}
      <div className="flex items-center justify-between text-sm mb-3 pl-9">
        {milestone.completedDate && (
          <span className="text-gray-600 dark:text-gray-400">
            ✓ Completed {formatDate(milestone.completedDate)}
          </span>
        )}
        {milestone.dueDate && milestone.status !== 'completed' && (
          <span className={cn('font-semibold', isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')}>
            {isOverdue ? '⚠️' : '📅'} Due {formatDate(milestone.dueDate)}
          </span>
        )}
      </div>

      {/* Actions */}
      {isRequester && milestone.status === 'completed' && (
        <button
          onClick={() => onRequestRelease(milestone.id)}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          💰 Request Payment Release
        </button>
      )}

      {canApprove && milestone.status === 'completed' && (
        <button
          onClick={() => onApprove(milestone.id)}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          ✓ Approve & Release Payment
        </button>
      )}

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
            This milestone is overdue. Please contact the seller.
          </p>
        </div>
      )}
    </div>
  )
}
