import { Check, Lock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const colorMap = {
  gray: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface',
  blue: 'border-blue-500 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-surface shadow-lg',
  purple: 'border-purple-500 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-surface shadow-lg',
}

export default function SubscriptionPricingCard({
  plan,
  isCurrentPlan,
  onSelectPlan,
  isLoading,
}) {
  const navigate = useNavigate()

  const handleSelect = () => {
    if (plan.id === 'free') {
      // Free tier - no need for payment
      onSelectPlan?.(plan)
    } else {
      // Redirect to checkout
      navigate(`/subscription/checkout/${plan.id}`)
    }
  }

  return (
    <div
      className={`relative rounded-3xl border-2 transition-all h-full flex flex-col ${
        plan.popular
          ? colorMap.blue
          : colorMap[plan.color] || colorMap.gray
      } overflow-hidden hover:shadow-xl transition-shadow`}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold text-white ${
            plan.popular ? 'bg-blue-500' : 'bg-purple-500'
          }`}
        >
          {plan.badge}
        </div>
      )}

      <div className="p-8 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {plan.description}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                {plan.priceDisplay}
              </span>
              {plan.price > 0 && (
                <>
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    / month
                  </span>
                </>
              )}
            </div>
            {plan.savings && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">
                ✨ {plan.savings} on annual
              </p>
            )}
          </div>

          {/* Billing info */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {plan.billingCycle}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSelect}
          disabled={isLoading || isCurrentPlan}
          className={`w-full py-3 px-4 rounded-xl font-semibold mb-6 transition-all ${
            isCurrentPlan
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default'
              : plan.popular
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCurrentPlan ? '✓ Current Plan' : plan.cta}
        </button>

        {/* Features */}
        <div className="space-y-3 flex-1">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Includes
          </p>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}

          {/* Limitations for free tier */}
          {plan.limitations && plan.limitations.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-6">
                Not included
              </p>
              {plan.limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {limitation}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer note */}
        {plan.price > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Lock className="w-3 h-3 inline mr-1" />
            Cancel anytime, no questions asked
          </p>
        )}
      </div>
    </div>
  )
}
