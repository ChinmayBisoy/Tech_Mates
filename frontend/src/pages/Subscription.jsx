import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AlertCircle, Check, Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionAPI, SUBSCRIPTION_PLANS } from '@/api/subscription.api'
import { showToast } from '@/lib/toast'

// Stripe will be loaded lazily when needed
let stripePromise = null
const getStripe = () => {
  if (!stripePromise && typeof window !== 'undefined') {
    return import('@stripe/stripe-js').then(({ loadStripe }) => {
      return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    })
  }
  return Promise.resolve(stripePromise)
}

function SubscriptionCard({ plan, isCurrentPlan, isLoading, onSelectPlan }) {
  return (
    <div
      className={`relative rounded-2xl border-2 transition-all ${
        plan.popular
          ? 'border-accent-500 bg-gradient-to-br from-accent-50/50 to-white dark:from-accent-900/10 dark:to-surface shadow-xl'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface'
      } overflow-hidden`}
    >
      {plan.badge && (
        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-lg text-xs font-bold text-white ${
          plan.popular ? 'bg-accent-500' : 'bg-purple-500'
        }`}>
          {plan.badge}
        </div>
      )}

      <div className="p-8">
        {/* Plan Header */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {plan.description}
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
              {plan.priceDisplay}
            </span>
            {plan.period !== 'always' && (
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                / {plan.period}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {plan.billingCycle}
          </p>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-4">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-3 rounded-lg border-2 border-accent-500 text-accent-600 dark:text-accent-400 font-semibold text-center opacity-75 cursor-not-allowed"
          >
            ✓ Current Plan
          </button>
        ) : (
          <button
            onClick={() => onSelectPlan(plan)}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              plan.popular
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              plan.cta
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Subscription() {
  const navigate = useNavigate()
  const { user, isDeveloper } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Redirect if not a developer
  useEffect(() => {
    if (!isDeveloper && user) {
      navigate('/dashboard')
    }
  }, [isDeveloper, user, navigate])

  // Get current subscription
  const { data: currentSubscription, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['subscription', user?._id],
    queryFn: subscriptionAPI.getSubscription,
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      // 404 is expected if user has no subscription
      if (error.status === 404) return false
      return failureCount < 2
    },
  })

  // Upgrade subscription
  const upgradeMutation = useMutation({
    mutationFn: (plan) => subscriptionAPI.upgradeSubscription(plan),
    onSuccess: async (data) => {
      alert('Subscription upgraded successfully!')
      // Refetch subscription data
      window.location.href = '/my-subscription'
    },
    onError: (error) => {
      console.error('Upgrade error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to upgrade subscription'
      alert(`Error: ${errorMsg}`)
    },
  })

  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') {
      // Free tier - process directly
      upgradeMutation.mutate(plan)
    } else {
      // Paid tiers - redirect to checkout
      navigate(`/subscription/checkout/${plan.id}`)
    }
  }

  if (isLoadingCurrent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6 p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Only developers can upgrade to Pro plan
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Upgrade to TechMates Pro
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get access to advanced features, unlimited listings, and priority support
            to grow your freelance business faster.
          </p>
        </div>

        {/* Current Subscription Info */}
        {user?.isPro && (
          <div className="mb-8 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300">
                  You are currently subscribed to a Pro plan
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Renews on:{' '}
                  {currentSubscription?.currentPeriodEnd
                    ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={
                user?.isPro && (currentSubscription?.planId === plan.id || currentSubscription?.plan === plan.id)
              }
              isLoading={upgradeMutation.isPending && selectedPlan?.id === plan.id}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can cancel your subscription at any time from your
                subscription management page. Your access continues until the end of
                your current billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American Express)
                through Stripe, our secure payment processor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can change your plan at any time. The change will take effect
                at your next billing date. If you upgrade, you'll be prorated for the
                difference.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We offer a 7-day money-back guarantee if you're not satisfied with your
                subscription. Please contact our support team for more details.
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {upgradeMutation.isError && (
          <div className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                Upgrade failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {upgradeMutation.error?.message ||
                  'Something went wrong. Please try again.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
