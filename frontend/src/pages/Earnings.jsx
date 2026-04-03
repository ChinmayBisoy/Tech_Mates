import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PieChart,
  User,
  Briefcase,
  Target,
  FileText,
  CreditCard,
  TrendingDown,
  Wallet,
  TrendingUp as TrendingUpIcon,
  Filter,
  Calendar,
  Settings,
  Share2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { walletAPI } from '@/api/wallet.api'
import { earningsAPI } from '@/api/earnings.api'
import { useNavigate } from 'react-router-dom'
import { EarningsCommissionBreakdown } from '@/components/earnings/EarningsCommissionBreakdown'
import { PayoutManagement } from '@/components/earnings/PayoutManagement'
import { EarningsForecast } from '@/components/earnings/EarningsForecast'
import { PayoutHistory } from '@/components/earnings/PayoutHistory'
import { showToast } from '@/lib/toast'

// Tab components
function OverviewTab({ earningsData }) {
  const transactions = earningsData?.transactions || []
  const summary = earningsData?.summary || {}
  const pagination = earningsData?.pagination || {}
  const totalEarnings = summary.totalEarnings || 0
  const releasedEarnings = summary.totalEarnings || 0
  const pendingEarnings = summary.pendingEarnings || 0
  const thisMonthEarnings = summary.thisMonthEarnings || 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format((amount || 0) / 100)
  }

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EarningCard
          label="Total Lifetime Earnings"
          amount={totalEarnings}
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="All-time total"
        />
        <EarningCard
          label="This Month"
          amount={thisMonthEarnings}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="Current month"
        />
        <EarningCard
          label="Available to Withdraw"
          amount={releasedEarnings}
          icon={CheckCircle}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          trend="Ready for payout"
        />
        <EarningCard
          label="Pending Approval"
          amount={pendingEarnings}
          icon={Clock}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          trend="In escrow"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Total Transactions
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {pagination.total || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {transactions.length} shown on this page
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Average Transaction
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {pagination.total > 0 ? formatCurrency(totalEarnings / pagination.total) : '₹0'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Per transaction
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Completion Rate
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {pagination.total > 0 ? '95%' : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Successfully completed
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last 10 of {pagination.total || 0}
            </span>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.slice(0, 10).map((transaction) => (
              <TransactionRow key={transaction._id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Start working on projects to see your earnings
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-300">Performance</h3>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-400">
            Your earnings are growing at a steady pace. Keep working on high-value projects!
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Goals</h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            You're 65% towards your next milestone. {formatCurrency(totalEarnings)} more to reach ₹50,000!
          </p>
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['earnings-analytics'],
    queryFn: () => earningsAPI.getEarningsAnalytics('month'),
  })

  if (isLoading) return <LoadingState />

  const data = analytics || {}

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-500" />
            Monthly Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Monthly: ₹{(data.averageMonthly || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Highest Month: ₹{(data.highestMonth || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-500" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <MetricItem
              label="Average Hourly Rate"
              value={`₹${(data.avgHourlyRate || 0).toLocaleString()}`}
            />
            <MetricItem
              label="Total Projects"
              value={data.totalProjects || 0}
            />
            <MetricItem
              label="Completion Rate"
              value={`${data.completionRate || 0}%`}
            />
            <MetricItem
              label="Client Satisfaction"
              value={`${data.avgRating || 0}/5.0`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BreakdownTab() {
  const [breakdownType, setBreakdownType] = useState('project')

  const { data: byProject } = useQuery({
    queryKey: ['earnings-breakdown-project'],
    queryFn: () => earningsAPI.getEarningsByProject(),
  })

  const { data: byClient } = useQuery({
    queryKey: ['earnings-breakdown-client'],
    queryFn: () => earningsAPI.getEarningsByClient(),
  })

  const { data: bySkill } = useQuery({
    queryKey: ['earnings-breakdown-skill'],
    queryFn: () => earningsAPI.getEarningsBySkill(),
  })

  const getDisplayData = () => {
    switch (breakdownType) {
      case 'project':
        return byProject?.items || []
      case 'client':
        return byClient?.items || []
      case 'skill':
        return bySkill?.items || []
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Breakdown Type Selector */}
      <div className="flex gap-3 flex-wrap">
        {[
          { value: 'project', label: 'By Project', icon: Briefcase },
          { value: 'client', label: 'By Client', icon: User },
          { value: 'skill', label: 'By Skill', icon: TrendingUp },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setBreakdownType(value)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              breakdownType === value
                ? 'bg-accent-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Breakdown List */}
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  {breakdownType === 'project' && 'Project'}
                  {breakdownType === 'client' && 'Client'}
                  {breakdownType === 'skill' && 'Skill'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Earnings
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {getDisplayData().map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-semibold">
                    ₹{(item.earnings || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                    {item.count || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                    {((item.percentage || 0) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ForecastTab() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['earnings-forecast'],
    queryFn: () => earningsAPI.getEarningsForecast(),
  })

  if (isLoading) return <LoadingState />

  const data = forecast || {}

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            Forecast
          </h3>
          <div className="space-y-4">
            <ForecastItem
              label="Projected This Month"
              amount={data.projectedThisMonth}
            />
            <ForecastItem
              label="Projected Next Month"
              amount={data.projectedNextMonth}
            />
            <ForecastItem
              label="Projected Yearly"
              amount={data.projectedYearly}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-500" />
            Growth Potential
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on {data.pendingProjectsCount || 0} pending projects
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                Potential additional earnings
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                ₹{(data.potentialEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaxTab({ navigate }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { data: taxReport, isLoading } = useQuery({
    queryKey: ['tax-report', selectedYear],
    queryFn: () => earningsAPI.generateTaxReport(selectedYear),
  })

  if (isLoading) return <LoadingState />

  const data = taxReport || {}

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex gap-2">
        {[2024, 2025, 2026].map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedYear === year
                ? 'bg-accent-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tax Summary */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tax Summary for {selectedYear}
          </h3>
          <div className="space-y-4">
            <TaxItem
              label="Total Income"
              value={`₹${(data.totalIncome || 0).toLocaleString()}`}
            />
            <TaxItem
              label="Platform Fees"
              value={`₹${(data.platformFees || 0).toLocaleString()}`}
            />
            <TaxItem
              label="Net Income"
              value={`₹${(data.netIncome || 0).toLocaleString()}`}
            />
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <TaxItem
                label="Tax Liability (Estimated)"
                value={`₹${(data.estimatedTax || 0).toLocaleString()}`}
                highlight
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-500" />
            Tax Documents
          </h3>
          <div className="space-y-3">
            <TaxDocumentButton
              label="Download 1099"
              onClick={() => alert('1099 document download')}
            />
            <TaxDocumentButton
              label="Download Invoice Summary"
              onClick={() => alert('Invoice summary download')}
            />
            <TaxDocumentButton
              label="Download Tax Report (PDF)"
              onClick={() => alert('Tax report download')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportTab() {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportLoading, setExportLoading] = useState(false)

  const handleExport = async () => {
    setExportLoading(true)
    try {
      await earningsAPI.exportEarningsData(exportFormat)
      alert(`Earnings data exported as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      alert('Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-accent-500" />
          Export Earnings Data
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Format
            </label>
            <div className="flex gap-3">
              {['csv', 'pdf', 'excel'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors uppercase text-sm ${
                    exportFormat === format
                      ? 'bg-accent-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="w-full py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exportLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          📋 What's included
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• All transactions (sent, received, pending)</li>
          <li>• Project details and earnings breakdown</li>
          <li>• Client information</li>
          <li>• Tax-relevant information</li>
          <li>• Date range flexibility</li>
        </ul>
      </div>
    </div>
  )
}

// Helper Components
function EarningCard({ label, amount, icon: Icon, color, trend }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format((val || 0) / 100)
  }

  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(amount)}
          </h3>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TransactionRow({ transaction }) {
  const [expanded, setExpanded] = useState(false)
  const isIncoming = transaction.type === 'milestone_release' || transaction.type === 'milestone_payment'
  const amount = transaction.developerEarnings || transaction.amount || 0

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format((val || 0) / 100)
  }

  return (
    <>
      <div 
        className="flex items-center justify-between py-4 px-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`p-2 rounded-lg ${
              isIncoming
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {isIncoming ? (
              <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {transaction.type === 'milestone_release'
                ? 'Milestone Payment Released'
                : 'Milestone Earned'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p
            className={`font-bold text-lg ${
              isIncoming
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isIncoming ? '+' : '-'}{formatCurrency(Math.abs(amount))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
            {transaction.status}
          </p>
        </div>
      </div>

      {/* Expanded Commission Details */}
      {expanded && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700">
          <EarningsCommissionBreakdown transaction={transaction} />
        </div>
      )}
    </>
  )
}

function MetricItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function ForecastItem({ label, amount }) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        ₹{(amount || 0).toLocaleString()}
      </p>
    </div>
  )
}

function TaxItem({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <p className={`text-sm ${highlight ? 'font-semibold' : ''} text-gray-600 dark:text-gray-400`}>
        {label}
      </p>
      <p
        className={`${highlight ? 'font-bold text-lg text-accent-600 dark:text-accent-400' : 'font-medium text-gray-900 dark:text-white'}`}
      >
        {value}
      </p>
    </div>
  )
}

function TaxDocumentButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
    >
      <span className="text-gray-900 dark:text-white font-medium">{label}</span>
      <Download className="w-4 h-4 text-accent-500" />
    </button>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
    </div>
  )
}

export default function EarningsPage() {
  const { user, isDeveloper } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  console.log('[EarningsPage] Current user:', user);
  console.log('[EarningsPage] isDeveloper:', isDeveloper);

  const { data: earningsResponse, isLoading, isError, error } = useQuery({
    queryKey: ['earnings', user?._id],
    queryFn: async () => {
      console.log('[EarningsQuery] Calling API...');
      const result = await walletAPI.getEarnings(1, 50);
      console.log('[EarningsQuery] API Result:', result);
      return result;
    },
    enabled: !!user && isDeveloper,
    staleTime: 5 * 60 * 1000,
  })

  // Extract data from response (already unwrapped by axios interceptor)
  console.log('[EarningsPage] earningsResponse:', earningsResponse);
  console.log('[EarningsPage] isLoading:', isLoading);
  console.log('[EarningsPage] isError:', isError);
  console.log('[EarningsPage] error:', error);
  
  const earningsData = earningsResponse || {}

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-yellow-900 dark:text-yellow-300">
                Earnings Dashboard - Developers Only
              </h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    )
  }

  if (isError) {
    console.error('Earnings API Error:', error)
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load earnings data'
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-semibold">{errorMessage}</p>
              <p className="text-red-600 dark:text-red-500 text-sm mt-1">User role: {user?.role || 'unknown'} | isDeveloper: {isDeveloper.toString()}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'breakdown', label: 'Breakdown', icon: PieChart },
    { id: 'forecast', label: 'Forecast', icon: TrendingUpIcon },
    { id: 'payout-history', label: 'History', icon: Clock },
    { id: 'tax', label: 'Tax & Compliance', icon: FileText },
    { id: 'export', label: 'Export', icon: Download },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Slim Premium Hero Section - Like Dashboard */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-40 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Wallet className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-semibold text-blue-100">Earnings Dashboard</span>
            </div>
            
            <h1 className="text-4xl font-black text-white mb-3 leading-tight">
              Your Earnings Dashboard
            </h1>
            
            <p className="text-base text-blue-100">
              Track, analyze, and manage your earnings with complete transparency and control.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Withdraw Button - Below Banner */}
        <div className="mb-8">
          <button
            onClick={() => setActiveTab('payout')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <CreditCard className="w-5 h-5" />
            Withdraw Funds
          </button>
        </div>

        {/* Premium Tab Navigation */}
        <div className="mb-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-1.5 flex flex-wrap gap-2 shadow-lg">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab earningsData={earningsData} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'breakdown' && <BreakdownTab />}
          {activeTab === 'forecast' && <EarningsForecast forecastData={earningsData?.forecast} />}
          {activeTab === 'payout' && <PayoutManagement releasedEarnings={earningsData?.summary?.totalEarnings || 0} kycVerified={user?.kycVerified} />}
          {activeTab === 'payout-history' && <PayoutHistory />}
          {activeTab === 'tax' && <TaxTab navigate={navigate} />}
          {activeTab === 'export' && <ExportTab />}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              💡 How Earnings Work
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <li>• Earnings are held in escrow until milestones are approved</li>
              <li>• Once released, funds are ready for withdrawal</li>
              <li>• Platform fee (5-10%) deducted from earnings</li>
              <li>• Tax documents auto-generated quarterly</li>
            </ul>
          </div>

          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3">
              ✓ Ready to Withdraw?
            </h3>
            <p className="text-sm text-green-800 dark:text-green-400 mb-4">
              You have ₹{(earningsData?.summary?.totalEarnings || 0).toLocaleString()} available
            </p>
            <button
              onClick={() => navigate('/withdraw')}
              className="w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Request Payout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
