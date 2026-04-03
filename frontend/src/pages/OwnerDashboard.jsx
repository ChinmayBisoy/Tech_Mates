import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useOwnerStore from '@/store/ownerStore'
import {
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Check,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Clock,
  Award,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const {
    isOwnerLoggedIn,
    ownerEmail,
    logoutOwner,
    platformAnalytics,
  } = useOwnerStore()

  const [stats] = useState({
    totalRevenue: 2500000,
    totalUsers: 1250,
    activeListings: 450,
    commissionEarned: 125000,
    openDisputes: 12,
    platformHealth: 98,
    monthlyGrowth: 15,
    disputeResolutionRate: 94,
    userRetentionRate: 87,
    avgTransactionValue: 8500,
  })

  const [recentActivity] = useState([
    { id: 1, title: 'New user registered', type: 'user', date: '5 mins ago', value: '1' },
    { id: 2, title: 'Payment processed successfully', type: 'payment', date: '12 mins ago', value: '₹25,000' },
    { id: 3, title: 'Dispute raised by user', type: 'dispute', date: '45 mins ago', value: 'Proj-001' },
    { id: 4, title: 'KYC verification completed', type: 'kyc', date: '2 hours ago', value: '3 users' },
    { id: 5, title: 'Seller listing posted', type: 'listing', date: '3 hours ago', value: 'Web Dev' },
    { id: 6, title: 'Review published', type: 'review', date: '5 hours ago', value: '5 ⭐' },
  ])

  useEffect(() => {
    if (!isOwnerLoggedIn) {
      navigate('/owner-login')
    }
  }, [isOwnerLoggedIn, navigate])

  const handleLogout = () => {
    logoutOwner()
    navigate('/')
  }

  if (!isOwnerLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Owner Portal</h1>
              <p className="text-xs text-gray-600 dark:text-slate-400">{ownerEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </button>
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

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 px-6 pt-20 pb-28">
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_100%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Zap className="w-4 h-4 text-blue-200 animate-pulse" />
              <span className="text-sm font-semibold text-blue-100">Platform Control Center</span>
            </div>

            <h1 className="text-6xl font-black text-white mb-6 leading-tight">
              Welcome back,<br />
              <span className="text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text">
                Owner
              </span>
              <span className="text-5xl ml-2">🎯</span>
            </h1>

            <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
              Your platform is thriving. Monitor growth, manage operations, and grow your marketplace with real-time insights.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Primary Stat - Total Revenue */}
        <div className="mb-12 rounded-3xl border border-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 dark:border-gradient-to-r dark:from-blue-700 dark:via-cyan-700 dark:to-slate-700 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 p-8 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30 transition-all duration-300 hover:shadow-3xl hover:shadow-blue-300/60 dark:hover:shadow-blue-900/50 hover:-translate-y-1">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-full">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">💰 Total Platform Revenue</span>
              </div>
              <h2 className="text-6xl font-black text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-300 dark:to-cyan-300 bg-clip-text mb-2">
                ₹{(stats.totalRevenue / 100000).toFixed(2)}L
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">
                <span className="font-bold text-lg">₹{stats.commissionEarned.toLocaleString()}</span> commission earned
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl font-bold shadow-lg backdrop-blur-sm">
                <TrendingUp className="w-5 h-5" />
                <span>+{stats.monthlyGrowth}% this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Users */}
          <div className="group relative bg-gradient-to-br from-white to-purple-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-purple-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-300/40 dark:hover:shadow-purple-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-purple-300 dark:hover:border-purple-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/20 ring-1 ring-purple-200/70 dark:ring-purple-700/50">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">👥</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Total Users</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active on platform</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Active Listings */}
          <div className="group relative bg-gradient-to-br from-white to-blue-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 ring-1 ring-blue-200/70 dark:ring-blue-700/50">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Active Listings</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.activeListings}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Live opportunities</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '90%' }} />
            </div>
          </div>

          {/* Open Disputes */}
          <div className="group relative bg-gradient-to-br from-white to-red-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-red-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-red-300/40 dark:hover:shadow-red-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-red-300 dark:hover:border-red-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20 ring-1 ring-red-200/70 dark:ring-red-700/50">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">⚖️</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Open Disputes</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.openDisputes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting resolution</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: `${(stats.openDisputes / 50) * 100}%` }} />
            </div>
          </div>

          {/* Platform Health */}
          <div className="group relative bg-gradient-to-br from-white to-emerald-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-emerald-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300 dark:hover:border-emerald-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 ring-1 ring-emerald-200/70 dark:ring-emerald-700/50">
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">✅</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Platform Health</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.platformHealth}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">System operational</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full" style={{ width: `${stats.platformHealth}%` }} />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dispute Resolution Rate */}
            <div className="group relative bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-emerald-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dispute Resolution</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-green-900/20 ring-2 ring-green-200/70 dark:ring-green-700/50">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text mb-4">
                {stats.disputeResolutionRate}%
              </p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-green-100">
                  <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.disputeResolutionRate}%` }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200/50 dark:border-green-700/50">
                <Award className="w-4 h-4" />
                Excellent Performance
              </div>
            </div>

            {/* User Retention Rate */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Retention</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20 ring-2 ring-blue-200/70 dark:ring-blue-700/50">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text mb-4">
                {stats.userRetentionRate}%
              </p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-blue-100">
                  <div className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.userRetentionRate}%` }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200/50 dark:border-blue-700/50">
                <TrendingUp className="w-4 h-4" />
                Strong Loyalty
              </div>
            </div>

            {/* Avg Transaction Value */}
            <div className="group relative bg-gradient-to-br from-white to-amber-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-amber-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-amber-300/40 dark:hover:shadow-amber-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Avg Transaction</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20 ring-2 ring-amber-200/70 dark:ring-amber-700/50">
                  <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text mb-4">
                ₹{(stats.avgTransactionValue / 1000).toFixed(1)}K
              </p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-amber-100">
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-amber-200/50 dark:border-amber-700/50">
                <TrendingUp className="w-4 h-4" />
                Growing Trend
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Recent Platform Activity
            </h2>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700 overflow-hidden shadow-lg">
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                      activity.type === 'user' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      activity.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'dispute' ? 'bg-red-100 dark:bg-red-900/30' :
                      activity.type === 'kyc' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'listing' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      {activity.type === 'user' && <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                      {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {activity.type === 'dispute' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {activity.type === 'kyc' && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {activity.type === 'listing' && <Briefcase className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
                      {activity.type === 'review' && <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{activity.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/owner-analytics')}
              className="bg-gradient-to-b from-white to-blue-50/55 dark:bg-slate-800 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-6 text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-200/35 dark:hover:shadow-blue-900/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Platform Analytics</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">View detailed metrics</p>
            </button>

            <button
              onClick={() => navigate('/owner-reports')}
              className="bg-gradient-to-b from-white to-purple-50/55 dark:bg-slate-800 rounded-2xl border border-purple-200/70 dark:border-slate-700 p-6 text-left hover:border-purple-500 hover:shadow-xl hover:shadow-purple-200/35 dark:hover:shadow-purple-900/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Reports & Insights</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Financial & growth reports</p>
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-b from-white to-red-50/55 dark:bg-slate-800 rounded-2xl border border-red-200/70 dark:border-slate-700 p-6 text-left hover:border-red-500 hover:shadow-xl hover:shadow-red-200/35 dark:hover:shadow-red-900/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mb-3 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Dispute Resolution</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Handle disputes</p>
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-b from-white to-green-50/55 dark:bg-slate-800 rounded-2xl border border-green-200/70 dark:border-slate-700 p-6 text-left hover:border-green-500 hover:shadow-xl hover:shadow-green-200/35 dark:hover:shadow-green-900/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">User Management</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Manage users & verify</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
