import { CreditCard, PieChart, AlertCircle, TrendingUp } from 'lucide-react'

export function EarningsCommissionBreakdown({ transaction }) {
  const amount = transaction.amount || 0
  const developerEarnings = transaction.developerEarnings || 0
  const platformFee = transaction.platformFee || 0
  const commissionRate = transaction.commissionRate || 0

  const developerPercentage = amount > 0 ? (developerEarnings / amount) * 100 : 0
  const platformPercentage = amount > 0 ? (platformFee / amount) * 100 : 0

  return (
    <div className="rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-500" />
          Earnings Breakdown
        </h4>
        <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          Commission: {commissionRate}%
        </span>
      </div>

      {/* Visual Breakdown */}
      <div className="mb-5">
        <div className="flex h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div
            className="bg-green-500 flex items-center justify-center text-xs font-bold text-white transition-all"
            style={{ width: `${developerPercentage}%` }}
            title={`Developer: ${developerPercentage.toFixed(1)}%`}
          >
            {developerPercentage > 20 && `${developerPercentage.toFixed(0)}%`}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-xs font-bold text-white transition-all"
            style={{ width: `${platformPercentage}%` }}
            title={`Platform: ${platformPercentage.toFixed(1)}%`}
          >
            {platformPercentage > 20 && `${platformPercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400 mb-1">Your Earnings</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{developerEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {developerPercentage.toFixed(1)}% of total
          </p>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400 mb-1">Platform Fee</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₹{platformFee.toLocaleString()}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {platformPercentage.toFixed(1)}% of total
          </p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-700 dark:text-gray-300">Total Transaction Amount</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{amount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
