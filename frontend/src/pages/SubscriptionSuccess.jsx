import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ArrowRight, Mail, Calendar, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function SubscriptionSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const plan = location.state?.plan
  const subscription = location.state?.subscription

  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + 1)

  const handleBackToSubscription = () => {
    // Invalidate queries before navigating to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    queryClient.invalidateQueries({ queryKey: ['subscription'] })
    navigate('/subscription')
  }

  const handleGoToDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    queryClient.invalidateQueries({ queryKey: ['subscription'] })
    navigate('/dashboard')
  }

  // If user somehow lands here without plan, redirect back
  if (!plan) {
    setTimeout(() => {
      navigate('/subscription')
    }, 2000)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Redirecting to subscription page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Welcome to {plan.name}! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your subscription has been activated successfully
          </p>
        </div>

        {/* Subscription Details Card */}
        <div className="rounded-2xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Subscription Details
          </h2>

          <div className="space-y-6">
            {/* Plan Info */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {plan.priceDisplay}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  per {plan.period}
                </p>
              </div>
            </div>

            {/* Renewal Date */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Renewal</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {renewalDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Confirmation Email</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  A confirmation email has been sent to your account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-8 mb-8">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-6">
            Transaction Summary
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Order ID</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 font-mono">
                ORD-{new Date().getTime()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Payment Status</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Paid Successfully
              </p>
            </div>

            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Amount Charged</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {plan.priceDisplay}
              </p>
            </div>

            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Payment Method</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Credit/Debit Card
              </p>
            </div>

            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Subscription Starts</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Next Billing Date</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {renewalDate.toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="rounded-2xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            What's Included
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="h-3 w-3 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Next Steps
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                1
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                Go to your <strong>Dashboard</strong> to access premium features
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                2
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                Visit <strong>Settings</strong> to manage your subscription and billing
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                3
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                Check your email for invoice and setup instructions
              </span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleGoToDashboard}
            className="py-3 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Go to Dashboard
          </button>
          <button
            onClick={handleBackToSubscription}
            className="py-3 px-6 rounded-lg border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold transition-colors"
          >
            View My Subscription
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ✅ Your subscription is now active! Check your email for invoice.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? <button className="text-blue-500 hover:text-blue-600 font-medium">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  )
}
