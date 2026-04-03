import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Check, Loader2, Lock, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import * as subscriptionAPI from '@/api/subscription.api'
import SubscriptionPricingCard from '@/components/payment/SubscriptionPricingCard'
import useSubscriptionStore from '@/store/subscriptionStore'
import { showToast } from '@/lib/toast'

export default function Subscription() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { currentSubscription, setCurrentSubscription, setSelectedPlan } =
    useSubscriptionStore()

  // Get current subscription
  const { data: mySubscription, isLoading: isLoadingCurrent, refetch } = useQuery({
    queryKey: ['current-subscription', user?._id],
    queryFn: subscriptionAPI.getSubscription,
    enabled: !!user,
    staleTime: 0, // Always refetch to ensure fresh data
    retry: (failureCount, error) => {
      // 404 is expected if user has no subscription
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
  })

  // Refetch subscription data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      refetch()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetch])

  // Update store when subscription changes
  useEffect(() => {
    if (mySubscription) {
      setCurrentSubscription(mySubscription)
    }
  }, [mySubscription, setCurrentSubscription])

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: (planId) => subscriptionAPI.upgradeSubscription(planId),
    onSuccess: (data) => {
      setCurrentSubscription(data)
      showToast.success('Subscription upgraded successfully!')
      setTimeout(() => {
        navigate('/settings')
      }, 1500)
    },
    onError: (error) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to upgrade subscription'
      showToast.error(errorMsg)
    },
  })

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    if (plan.id === 'free') {
      // Free tier - process directly
      upgradeMutation.mutate('free')
    } else {
      // Paid tiers - redirect to checkout
      navigate(`/subscription/checkout/${plan.id}`)
    }
  }

  if (isLoadingCurrent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
              Subscription Plans
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to grow your freelance business. Get unlimited listings,
            advanced analytics, and priority support.
          </p>
        </div>

        {/* Current Subscription Info */}
        {mySubscription && mySubscription.id !== 'free' && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 text-lg">
                  ✓ Currently subscribed to{' '}
                  <span className="uppercase text-blue-600 dark:text-blue-400">
                    {mySubscription.planId || mySubscription.plan}
                  </span>{' '}
                  plan
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Renews on:{' '}
                  {mySubscription.currentPeriodEnd
                    ? new Date(
                        mySubscription.currentPeriodEnd
                      ).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {subscriptionAPI.SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionPricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={
                mySubscription &&
                (mySubscription.planId === plan.id || mySubscription.plan === plan.id)
              }
              isLoading={
                upgradeMutation.isPending &&
                (upgradeMutation.variables === plan.id || upgradeMutation.variables?.id === plan.id)
              }
              onSelectPlan={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Can I switch plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! You can upgrade or downgrade at any time. Changes take effect on your next billing date.
                Upgrades are prorated.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! Start with our Free plan with no credit card required. Upgrade anytime to Pro or Max.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely. Cancel your subscription at any time. Your access continues until the end of your
                current billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                What payment methods work?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. Payments are secure and
                encrypted.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! 7-day money-back guarantee if you're unhappy. Contact support for details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                How often is billing?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Billed monthly on the same date each month. You can downgrade before the next billing date.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Why upgrade?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Unlimited Listings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Post as many projects as you want, no limits.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track earnings, views, and client engagement.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Priority Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get help 24/7 from our dedicated team.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Premium Badge
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show clients you're a verified professional.
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {upgradeMutation.isError && (
          <div className="mt-8 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">
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
