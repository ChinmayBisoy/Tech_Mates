import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  CheckSquare,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/cn';

const milestoneStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    icon: Clock,
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  funded: {
    label: 'Funded',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900',
    icon: DollarSign,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  submitted: {
    label: 'Work Submitted',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900',
    icon: Send,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900',
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
  },
  released: {
    label: 'Payment Released',
    color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900',
    icon: CheckSquare,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  revision_requested: {
    label: 'Revision Requested',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900',
    icon: RefreshCw,
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900',
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

export function MilestoneItem({ 
  milestone, 
  index, 
  total,
  isLast,
  onAction = null,
  userRole = 'viewer'
}) {
  const config = milestoneStatusConfig[milestone.status] || milestoneStatusConfig.pending;
  const Icon = config.icon;
  const isCompleted = ['approved', 'released'].includes(milestone.status);

  return (
    <div className="relative">
      {/* Vertical Line (if not last) */}
      {!isLast && (
        <div className="absolute left-6 top-20 w-0.5 h-24 bg-gray-200 dark:bg-gray-700" />
      )}

      <div className={cn(
        'rounded-lg border-2 p-4 transition-all',
        config.color,
        isCompleted ? 'ring-2 ring-green-200 dark:ring-green-900' : ''
      )}>
        {/* Header with status */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              'rounded-full p-2 flex-shrink-0',
              isCompleted 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-white dark:bg-gray-900'
            )}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Milestone {index + 1} of {total}
              </p>
              <h4 className="font-bold text-gray-900 dark:text-white">
                {milestone.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {config.label}
              </p>
            </div>
          </div>
          <div className="rounded-full px-3 py-1 text-xs font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {Math.round((index + 1) / total * 100)}%
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 my-4 border-t border-current border-opacity-20 py-4">
          {/* Amount */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
            <p className="font-bold text-primary dark:text-accent">
              ₹{formatINR(milestone.amount / 100)}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Due Date</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {formatDate(new Date(milestone.dueDate))}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {milestone.status === 'revision_requested' ? 'Revision' : config.label}
            </p>
          </div>
        </div>

        {/* Description */}
        {milestone.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {milestone.description}
          </p>
        )}

        {/* Work Submission (if submitted) */}
        {milestone.status === 'submitted' && milestone.submission && (
          <div className="mb-3 rounded-lg bg-white/50 dark:bg-gray-900/50 p-3 border border-yellow-200 dark:border-yellow-900">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Work Submitted by Developer</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {milestone.submission.details}
            </p>
            {milestone.submission.deliverables && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📎 Deliverables: {milestone.submission.deliverables.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Revision Request (if revision requested) */}
        {milestone.status === 'revision_requested' && milestone.revisionRequest && (
          <div className="mb-3 rounded-lg bg-white/50 dark:bg-gray-900/50 p-3 border border-orange-200 dark:border-orange-900">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <RefreshCw className="h-3 w-3" />
              Revision Requested
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {milestone.revisionRequest.reason}
            </p>
          </div>
        )}

        {/* Dispute (if disputed) */}
        {milestone.status === 'disputed' && milestone.dispute && (
          <div className="mb-3 rounded-lg bg-white/50 dark:bg-gray-900/50 p-3 border border-red-200 dark:border-red-900">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              Dispute Filed
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {milestone.dispute.reason}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Filed on {formatDate(new Date(milestone.dispute.createdAt))}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {onAction && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-current border-opacity-20">
            {/* Client Actions */}
            {userRole === 'client' && milestone.status === 'pending' && (
              <button
                onClick={() => onAction('fund', milestone.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <DollarSign className="h-4 w-4" />
                Fund Milestone
              </button>
            )}

            {userRole === 'client' && milestone.status === 'submitted' && (
              <>
                <button
                  onClick={() => onAction('approve', milestone.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => onAction('requestRevision', milestone.id)}
                  className="flex-1 rounded-lg border border-orange-300 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Request Revision
                </button>
                <button
                  onClick={() => onAction('dispute', milestone.id)}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <AlertCircle className="h-4 w-4 inline" />
                </button>
              </>
            )}

            {userRole === 'client' && milestone.status === 'approved' && (
              <button
                onClick={() => onAction('release', milestone.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <CheckSquare className="h-4 w-4" />
                Release Payment
              </button>
            )}

            {/* Developer Actions */}
            {userRole === 'developer' && milestone.status === 'funded' && (
              <button
                onClick={() => onAction('submitWork', milestone.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
                Submit Work
              </button>
            )}

            {userRole === 'developer' && milestone.status === 'revision_requested' && (
              <button
                onClick={() => onAction('submitRevision', milestone.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
              >
                <RefreshCw className="h-4 w-4" />
                Submit Revision
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
