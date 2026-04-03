import { TrendingUp, TrendingDown, AlertCircle, Zap, Target, Calendar } from 'lucide-react'

export function EarningsForecast({ forecastData }) {
  const {
    projectedThisMonth = 0,
    projectedNextMonth = 0,
    projectedYearly = 0,
    pendingProjectsCount = 0,
    completionRate = 0,
    avgProjectValue = 0,
    growthTrend = 0,
  } = forecastData || {}

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return null
  }

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600 dark:text-green-400'
    if (value < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Forecast Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* This Month */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              This Month (Est.)
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ₹{projectedThisMonth.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on current pace
          </p>
        </div>

        {/* Next Month */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Next Month (Est.)
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ₹{projectedNextMonth.toLocaleString()}
          </p>
          <p className={`text-xs ${getTrendColor(projectedNextMonth - projectedThisMonth)}`}>
            {projectedNextMonth >= projectedThisMonth ? '↑' : '↓'}{' '}
            {Math.abs(
              ((projectedNextMonth - projectedThisMonth) / projectedThisMonth) * 100 || 0
            ).toFixed(1)}
            % vs this month
          </p>
        </div>

        {/* Yearly */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Annual Projection
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ₹{projectedYearly.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on current trajectory
          </p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Growth Potential */}
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-6">
          <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Growth Potential
          </h3>
          <div className="space-y-4">
            {/* Pending Projects */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg">
              <span className="text-sm text-green-800 dark:text-green-300">
                Pending Projects
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {pendingProjectsCount}
              </span>
            </div>

            {/* Avg Project Value */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg">
              <span className="text-sm text-green-800 dark:text-green-300">
                Avg Project Value
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{avgProjectValue.toLocaleString()}
              </span>
            </div>

            {/* Potential Earnings */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg border-2 border-green-300 dark:border-green-700">
              <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                Potential from Pending
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{(pendingProjectsCount * avgProjectValue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Indicators
          </h3>
          <div className="space-y-4">
            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-800 dark:text-blue-300">
                  Completion Rate
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Growth Trend */}
            <div className="p-3 bg-white dark:bg-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800 dark:text-blue-300">
                  Growth Trend (YoY)
                </span>
                <span className={`flex items-center gap-1 font-bold ${getTrendColor(growthTrend)}`}>
                  {getTrendIcon(growthTrend)}
                  {growthTrend > 0 ? '+' : ''}{growthTrend}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Breakdown */}
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Forecast Explanation</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">How It's Calculated</p>
            <ul className="space-y-1 text-xs">
              <li>• Based on your last 3 months earnings</li>
              <li>• Accounts for pending projects</li>
              <li>• Considers seasonal trends</li>
              <li>• Updates weekly with new data</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Tips to Increase Earnings</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Complete more projects</li>
              <li>✓ Increase project rates</li>
              <li>✓ Improve completion rate</li>
              <li>✓ Get positive client reviews</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900 dark:text-yellow-300 text-sm">
            Forecast Disclaimer
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-1">
            These projections are estimates based on historical data and may vary depending on project availability, 
            client demand, and market conditions. Use these as guidance only.
          </p>
        </div>
      </div>
    </div>
  )
}
