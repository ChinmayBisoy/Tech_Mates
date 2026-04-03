import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useOwnerStore from '@/store/ownerStore'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  LogOut,
  Shield,
  BarChart3,
} from 'lucide-react'

export default function OwnerAnalytics() {
  const navigate = useNavigate()
  const { isOwnerLoggedIn, ownerEmail, logoutOwner } = useOwnerStore()
  
  const [dateRange, setDateRange] = useState('30days')
  const [analyticsData] = useState({
    users: {
      total: 1250,
      new: 125,
      active: 980,
      retained: 875,
      churn: 12,
      trend: 8.5,
    },
    revenue: {
      total: 2500000,
      commission: 125000,
      transactions: 450,
      avgValue: 8500,
      dayAvg: 83333,
      trend: 12.3,
    },
    listings: {
      active: 450,
      completed: 385,
      pending: 42,
      canceled: 8,
      trend: 5.2,
    },
    performance: {
      platformUptime: 99.8,
      avgResponseTime: 245,
      errorRate: 0.2,
      transactions: 450,
      disputes: 12,
      resolutionRate: 94,
    },
  })

  const [timeSeriesData] = useState([
    { date: '1 Mar', users: 1100, revenue: 75000, transactions: 38 },
    { date: '5 Mar', users: 1150, revenue: 85000, transactions: 42 },
    { date: '10 Mar', users: 1200, revenue: 95000, transactions: 48 },
    { date: '15 Mar', users: 1240, revenue: 105000, transactions: 52 },
    { date: '20 Mar', users: 1250, revenue: 115000, transactions: 58 },
    { date: '25 Mar', users: 1260, revenue: 125000, transactions: 65 },
    { date: 'Today', users: 1275, revenue: 132000, transactions: 68 },
  ])

  useEffect(() => {
    if (!isOwnerLoggedIn) {
      navigate('/owner-login')
    }
  }, [isOwnerLoggedIn, navigate])

  if (!isOwnerLoggedIn) {
    return null
  }

  const handleLogout = () => {
    logoutOwner()
    navigate('/')
  }

  const MetricCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className={`bg-gradient-to-br from-white to-${color}-50/50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-${color}-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-50 dark:from-${color}-900/40 dark:to-${color}-900/20 ring-1 ring-${color}-200/70`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
          trend >= 0
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className={`text-slate-600 dark:text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider`}>{title}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{change}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner-dashboard')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
              <p className="text-xs text-gray-600 dark:text-slate-400">{ownerEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7" />
            Analytics Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white font-medium hover:border-gray-300 dark:hover:border-slate-600 transition"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* User Metrics */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Users"
              value={analyticsData.users.total.toLocaleString()}
              change="Platform-wide"
              icon={Users}
              color="purple"
              trend={analyticsData.users.trend}
            />
            <MetricCard
              title="New Users"
              value={analyticsData.users.new}
              change="This month"
              icon={Users}
              color="blue"
              trend={analyticsData.users.trend}
            />
            <MetricCard
              title="Active Users"
              value={analyticsData.users.active.toLocaleString()}
              change="This week"
              icon={Users}
              color="green"
              trend={8.2}
            />
            <MetricCard
              title="Retained Users"
              value={analyticsData.users.retained.toLocaleString()}
              change="Last 30 days"
              icon={Users}
              color="emerald"
              trend={analyticsData.users.trend}
            />
            <MetricCard
              title="Churn Rate"
              value={`${analyticsData.users.churn}%`}
              change="Low - Good"
              icon={Users}
              color="red"
              trend={-2.1}
            />
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`₹${(analyticsData.revenue.total / 100000).toFixed(1)}L`}
              change="Platform total"
              icon={DollarSign}
              color="green"
              trend={analyticsData.revenue.trend}
            />
            <MetricCard
              title="Commission Earned"
              value={`₹${(analyticsData.revenue.commission / 1000).toFixed(0)}K`}
              change="Platform share"
              icon={DollarSign}
              color="emerald"
              trend={analyticsData.revenue.trend}
            />
            <MetricCard
              title="Transactions"
              value={analyticsData.revenue.transactions}
              change="This period"
              icon={Briefcase}
              color="blue"
              trend={10.5}
            />
            <MetricCard
              title="Avg Transaction"
              value={`₹${(analyticsData.revenue.avgValue / 1000).toFixed(1)}K`}
              change="Growing trend"
              icon={DollarSign}
              color="cyan"
              trend={5.8}
            />
            <MetricCard
              title="Daily Average"
              value={`₹${(analyticsData.revenue.dayAvg / 1000).toFixed(0)}K`}
              change="Per day"
              icon={DollarSign}
              color="amber"
              trend={analyticsData.revenue.trend}
            />
          </div>
        </div>

        {/* Listing Metrics */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Listing Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Listings"
              value={analyticsData.listings.active}
              change="Live opportunities"
              icon={Briefcase}
              color="blue"
              trend={analyticsData.listings.trend}
            />
            <MetricCard
              title="Completed"
              value={analyticsData.listings.completed}
              change="This period"
              icon={Briefcase}
              color="green"
              trend={analyticsData.listings.trend}
            />
            <MetricCard
              title="Pending"
              value={analyticsData.listings.pending}
              change="Awaiting action"
              icon={Briefcase}
              color="yellow"
              trend={-2.3}
            />
            <MetricCard
              title="Canceled"
              value={analyticsData.listings.canceled}
              change="Low cancellation"
              icon={Briefcase}
              color="red"
              trend={-5.2}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700 p-8 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Performance</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Platform Uptime</span>
                    <span className="text-2xl font-black text-green-600 dark:text-green-400">{analyticsData.performance.platformUptime}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: '99.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Avg Response Time</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{analyticsData.performance.avgResponseTime}ms</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Excellent performance</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Error Rate</span>
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">{analyticsData.performance.errorRate}%</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Very low - Excellent</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700 p-8 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Platform Health</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Dispute Resolution</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{analyticsData.performance.resolutionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Open Disputes</span>
                    <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{analyticsData.performance.disputes}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Managed efficiently</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Successful Transactions</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{analyticsData.performance.transactions}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This period</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart Data */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700 p-8 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Trend Analysis (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-bold text-gray-900 dark:text-white">Date</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900 dark:text-white">Users</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900 dark:text-white">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {timeSeriesData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="py-4 px-4 text-gray-900 dark:text-white font-semibold">{row.date}</td>
                    <td className="py-4 px-4 text-right text-gray-900 dark:text-white">{row.users.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-gray-900 dark:text-white">₹{(row.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-4 px-4 text-right text-gray-900 dark:text-white">{row.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
