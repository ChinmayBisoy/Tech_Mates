import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Zap,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionAPI, SUBSCRIPTION_PLANS } from '@/api/subscription.api'

// Validation Schema
const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardHolder: z.string().min(3, 'Card holder name required'),
  expiryMonth: z.string().regex(/^\d{2}$/, 'Invalid month'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Invalid year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
})

export default function SubscriptionCheckout() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)

  // Find selected plan
  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)

  const methods = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: user?.name || '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
  })

  const { register, handleSubmit, formState: { errors }, watch } = methods

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData) =>
      subscriptionAPI.upgradeSubscription({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        paymentData,
      }),
    onSuccess: () => {
      setPaymentSuccess(true)
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/subscription-success', {
          state: { plan: selectedPlan },
        })
      }, 2000)
    },
    onError: (error) => {
      alert(
        error?.message || 'Payment failed. Please try again.'
      )
    },
  })

  const onSubmit = (data) => {
    processPaymentMutation.mutate(data)
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/subscription')}
            className="mb-6 text-accent-500 hover:text-accent-600 font-medium text-sm flex items-center gap-1"
          >
            ← Back to Plans
          </button>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
            <p className="text-red-700 dark:text-red-400">Plan not found</p>
          </div>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to subscription confirmation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/subscription')}
          className="mb-6 text-accent-500 hover:text-accent-600 font-medium text-sm flex items-center gap-1"
        >
          ← Back to Plans
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-8 rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h3>

              {/* Plan Details */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    selectedPlan.id === 'pro'
                      ? 'bg-accent-100 dark:bg-accent-900/30'
                      : selectedPlan.id === 'max'
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Zap className={`w-5 h-5 ${
                      selectedPlan.id === 'pro'
                        ? 'text-accent-600'
                        : selectedPlan.id === 'max'
                        ? 'text-purple-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedPlan.description}
                    </p>
                  </div>
                </div>

                {selectedPlan.id !== 'free' && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monthly charge
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedPlan.priceDisplay}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Billing cycle</span>
                      <span>{selectedPlan.billingCycle}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  Includes:
                </p>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {selectedPlan.features.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    +{selectedPlan.features.length - 3} more features
                  </p>
                )}
              </div>

              {/* Total */}
              {selectedPlan.id !== 'free' && (
                <div className="p-4 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                      {selectedPlan.priceDisplay}
                    </span>
                  </div>
                </div>
              )}

              {selectedPlan.id === 'free' && (
                <button
                  onClick={() => {
                    processPaymentMutation.mutate({})
                  }}
                  disabled={processPaymentMutation.isPending}
                  className="w-full py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {processPaymentMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Activate Free Tier'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            {selectedPlan.id === 'free' ? (
              <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Get Started with Free Tier
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    No credit card required. Start listing projects immediately.
                  </p>
                  <ul className="text-left space-y-2 max-w-sm mx-auto mb-8">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent-500" />
                    Payment Details
                  </h3>

                  {/* Card Holder Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      {...register('cardHolder')}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition"
                    />
                    {errors.cardHolder && (
                      <p className="text-red-500 text-xs mt-1">{errors.cardHolder.message}</p>
                    )}
                  </div>

                  {/* Card Number */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength="16"
                      placeholder="4532 1234 5678 9010"
                      {...register('cardNumber')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition tracking-widest"
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Month
                      </label>
                      <input
                        type="text"
                        maxLength="2"
                        placeholder="MM"
                        {...register('expiryMonth')}
                        className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition text-center"
                      />
                      {errors.expiryMonth && (
                        <p className="text-red-500 text-xs mt-1">{errors.expiryMonth.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        maxLength="2"
                        placeholder="YY"
                        {...register('expiryYear')}
                        className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition text-center"
                      />
                      {errors.expiryYear && (
                        <p className="text-red-500 text-xs mt-1">{errors.expiryYear.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="123"
                        {...register('cvv')}
                        className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition text-center"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Your payment information is secure and encrypted
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processPaymentMutation.isPending}
                    className="w-full py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay {selectedPlan.priceDisplay}
                      </>
                    )}
                  </button>

                  {/* Disclaimer */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    * This is a demo payment form for testing. No actual charges will be made.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
