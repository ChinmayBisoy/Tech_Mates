import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionAPI } from '@/api/subscription.api'
import { useNavigate } from 'react-router-dom'

function SubscriptionStatus({ status }) {
  const statusConfig = {
    active: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle,
      label: 'Active',
    },
    trialing: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Clock,
      label: 'Trial',
    },
    past_due: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: AlertTriangle,
      label: 'Past Due',
    },
    cancelled: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: AlertCircle,
      label: 'Cancelled',
    },
  }

  const config = statusConfig[status] || statusConfig.active
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.text}`} />
      <span className={`font-semibold ${config.text}`}>{config.label}</span>
    </div>
  )
}

function SubscriptionDetailCard({ label, value, icon: Icon }) {
  return (
    <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon className="w-5 h-5 text-accent-500" />}
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export default function MySubscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Get current subscription
  const { data: subscription, isLoading, error, isError } = useQuery({
    queryKey: ['subscription', user?._id],
    queryFn: subscriptionAPI.getSubscription,
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: false,
  })

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: subscriptionAPI.cancelSubscription,
    onSuccess: () => {
      setShowCancelConfirm(false)
      queryClient.invalidateQueries({ queryKey: ['subscription', user?._id] })
    },
    onError: (error) => {
      console.error('Cancel error:', error)
    },
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPlan = (plan) => {
    return plan
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                  No Active Subscription
                </h2>
                <p className="text-red-700 dark:text-red-400 mb-6">
                  You don't have an active subscription yet. Upgrade to Pro to unlock
                  advanced features.
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  No Active Subscription
                </h2>
                <p className="text-amber-700 dark:text-amber-400 mb-6">
                  You don't have an active subscription. Start your Pro plan today!
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
                >
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? Math.ceil(
        (new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : 0

  const isCancelled = subscription?.status === 'cancelled'
  const willCancelAtPeriodEnd = subscription?.cancelAtPeriodEnd

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            My Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your TechMates Pro subscription
          </p>
        </div>

        {/* Cancellation Warning */}
        {willCancelAtPeriodEnd && !isCancelled && (
          <div className="mb-8 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                Subscription scheduled for cancellation
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Your subscription will end on{' '}
                <span className="font-semibold">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
                . You'll retain Pro benefits until then.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Overview Card */}
        <div className="rounded-2xl bg-gradient-to-br from-accent-50 to-white dark:from-accent-900/20 dark:to-surface border-2 border-accent-200 dark:border-accent-800 p-8 mb-8">
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Plan
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                TechMates Pro
              </h2>
              <p className="text-lg text-accent-600 dark:text-accent-400 font-semibold mt-2">
                {formatPlan(subscription.plan)}
              </p>
            </div>
            <div className="flex items-end justify-between sm:justify-start sm:flex-col">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
              <SubscriptionStatus status={subscription.status} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SubscriptionDetailCard
              label="Plan Cost"
              value={`$${(subscription.amount / 100).toFixed(2)}`}
              icon={CreditCard}
            />
            <SubscriptionDetailCard
              label="Billing Cycle"
              value={formatPlan(subscription.plan)}
              icon={RefreshCw}
            />
            <SubscriptionDetailCard
              label="Days Until Renewal"
              value={daysUntilRenewal > 0 ? `${daysUntilRenewal} days` : 'Ended'}
              icon={Calendar}
            />
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Period
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  From
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(subscription.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">To</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pro Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Unlimited listings
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Advanced analytics
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Priority support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/subscription')}
            className="w-full py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
          >
            View Other Plans
          </button>

          {!willCancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-3 rounded-lg border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
            >
              Cancel Subscription
            </button>
          )}
          {willCancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              variant="outline"
              className="w-full py-3 rounded-lg border-2 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold transition-colors"
            >
              Reactivate Subscription
            </button>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-surface rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {willCancelAtPeriodEnd
                  ? 'Reactivate Subscription?'
                  : 'Cancel Subscription?'}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {willCancelAtPeriodEnd
                  ? 'Your subscription will continue after the current period.'
                  : `Your subscription will end on ${formatDate(subscription.currentPeriodEnd)}. You'll keep access to Pro features until then.`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={() =>
                    cancelMutation.mutate(undefined, {
                      onSuccess: () => setShowCancelConfirm(false),
                    })
                  }
                  disabled={cancelMutation.isPending}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    willCancelAtPeriodEnd
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } ${cancelMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : willCancelAtPeriodEnd ? (
                    'Reactivate'
                  ) : (
                    'Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
