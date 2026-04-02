import { Shield, CheckCircle, BadgeCheck, Zap } from 'lucide-react'

// Badge types and their configurations
export const BADGE_TYPES = {
  email_verified: {
    icon: CheckCircle,
    label: 'Email Verified',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    tooltip: 'Email address verified',
  },
  identity_verified: {
    icon: BadgeCheck,
    label: 'Identity Verified',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    tooltip: 'Photo ID verified',
  },
  bank_verified: {
    icon: Shield,
    label: 'Bank Verified',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    tooltip: 'Bank account verified for payouts',
  },
  top_rated: {
    icon: Zap,
    label: 'Top Rated',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    tooltip: '5-star average rating',
  },
  pro_subscription: {
    icon: BadgeCheck,
    label: 'Pro Member',
    color: 'text-accent-500',
    bgColor: 'bg-accent-100 dark:bg-accent-900/30',
    tooltip: 'Premium subscription member',
  },
  max_subscription: {
    icon: Zap,
    label: 'Max Tier',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    tooltip: 'Elite Max tier member',
  },
}

// Badge component to display individual badges
export function Badge({ type, size = 'md' }) {
  const badge = BADGE_TYPES[type]
  if (!badge) return null

  const Icon = badge.icon

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div
      title={badge.tooltip}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bgColor} cursor-help`}
    >
      <Icon className={`${sizes[size]} ${badge.color}`} />
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {badge.label}
      </span>
    </div>
  )
}

// Badges display component
export function UserBadges({ badges, variant = 'grid' }) {
  if (!badges || badges.length === 0) return null

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {badges.map((badge) => (
          <Badge key={badge} type={badge} />
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Badge key={badge} type={badge} size="sm" />
        ))}
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Verifications & Badges
        </h3>
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <Badge key={badge} type={badge} size="lg" />
          ))}
        </div>
      </div>
    )
  }

  return null
}

// Badge request/verification form
export function VerificationForm({ type, onSubmit, onCancel }) {
  const badge = BADGE_TYPES[type]
  if (!badge) return null

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Badge type={type} size="lg" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Get {badge.label}
        </h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {badge.tooltip}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {type === 'identity_verified' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo ID
              </label>
              <input type="file" accept="image/*" required className="w-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Accepted: Passport, Driver's License, National ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selfie with ID
              </label>
              <input type="file" accept="image/*" required className="w-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Required for verification
              </p>
            </div>
          </>
        )}

        {type === 'bank_verified' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g., Bank of America"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                placeholder="Full name as shown on bank account"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Statement
              </label>
              <input type="file" accept=".pdf,.jpg,.png" required className="w-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recent bank statement (last 3 months)
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-2 px-4 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
          >
            Submit for Verification
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Verification status display
export function VerificationStatus({ status }) {
  const statuses = {
    pending: {
      label: 'Pending Verification',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      icon: '⏳',
    },
    verified: {
      label: 'Verified',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      icon: '✓',
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      icon: '✕',
    },
  }

  const current = statuses[status] || statuses.pending

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${current.color}`}>
      <span>{current.icon}</span>
      <span className="text-sm font-medium">{current.label}</span>
    </div>
  )
}
