import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Plus, DollarSign, Star, Target, CheckCircle, Users, TrendingUp, Zap, Award, Clock, ArrowRight } from 'lucide-react'

export default function DeveloperDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats] = useState({
    totalEarnings: 125000,
    activeProjects: 3,
    completedProjects: 18,
    responseRate: 95,
    onTimeDelivery: 98,
    totalClients: 12,
    avgRating: 4.9,
    earningsThisMonth: 32000,
  })
  const [recentActivity] = useState([
    { id: 1, title: 'Your proposal was accepted', date: '2 hours ago', icon: 'proposal' },
    { id: 2, title: 'Client approved your milestone', date: '1 day ago', icon: 'milestone' },
    { id: 3, title: 'Payment received ₹10,000', date: '2 days ago', icon: 'payment' },
    { id: 4, title: 'Client left a 5-star review', date: '3 days ago', icon: 'review' },
  ])

  useEffect(() => {
    console.log('Developer Dashboard loaded')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 px-4 sm:px-6 lg:px-8 pt-20 pb-28">
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_100%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Zap className="w-4 h-4 text-blue-200 animate-pulse" />
              <span className="text-sm font-semibold text-blue-100">Performance Hub</span>
            </div>

            <h1 className="text-6xl font-black text-white mb-6 leading-tight">
              Welcome back,<br/>
              <span className="text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text">{user?.name?.split(' ')[0] || 'Developer'}</span>
              <span className="text-5xl ml-2">💪</span>
            </h1>

            <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
              You're building incredible momentum. Continue delivering excellence and watch your success grow exponentially.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Primary Stat - Total Earnings */}
        <div className="mb-12 rounded-3xl border border-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 dark:border-gradient-to-r dark:from-blue-700 dark:via-cyan-700 dark:to-slate-700 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 p-8 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30 transition-all duration-300 hover:shadow-3xl hover:shadow-blue-300/60 dark:hover:shadow-blue-900/50 hover:-translate-y-1">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-full">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">💰 Lifetime Earnings</span>
              </div>
              <h2 className="text-6xl font-black text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-300 dark:to-cyan-300 bg-clip-text mb-2">
                ₹{(stats.totalEarnings / 100000).toFixed(2)}L
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">
                <span className="font-bold text-lg">₹{stats.earningsThisMonth.toLocaleString()}</span> earned this month
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl font-bold shadow-lg backdrop-blur-sm">
                <TrendingUp className="w-5 h-5" />
                <span>+8% vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Active Projects */}
          <div className="group relative bg-gradient-to-br from-white to-blue-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 ring-1 ring-blue-200/70 dark:ring-blue-700/50">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Active Projects</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.activeProjects}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Currently working on</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Completed */}
          <div className="group relative bg-gradient-to-br from-white to-emerald-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-emerald-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300 dark:hover:border-emerald-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 ring-1 ring-emerald-200/70 dark:ring-emerald-700/50">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">✅</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Completed</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.completedProjects}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total delivered</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Clients */}
          <div className="group relative bg-gradient-to-br from-white to-purple-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-purple-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-300/40 dark:hover:shadow-purple-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-purple-300 dark:hover:border-purple-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/20 ring-1 ring-purple-200/70 dark:ring-purple-700/50">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">👥</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Happy Clients</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.totalClients}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Repeat customers</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-600 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Rating */}
          <div className="group relative bg-gradient-to-br from-white to-amber-50/80 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-amber-200/70 dark:border-slate-700 p-6 shadow-lg hover:shadow-2xl hover:shadow-amber-300/40 dark:hover:shadow-amber-900/30 transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 dark:hover:border-amber-600">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 ring-1 ring-amber-200/70 dark:ring-amber-700/50">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" />
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">⭐</div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Your Rating</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.avgRating}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Highly rated</p>
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full" style={{ width: `${(stats.avgRating / 5) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Performance Metrics - Premium Styled */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Response Rate */}
            <div className="group relative bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-emerald-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response Rate</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-green-900/20 ring-2 ring-green-200/70 dark:ring-green-700/50">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text mb-4">{stats.responseRate}%</p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-green-100">
                  <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.responseRate}%` }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200/50 dark:border-green-700/50">
                <Award className="w-4 h-4" />
                Excellent - Above 90%
              </div>
            </div>

            {/* On-Time Delivery */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">On-Time Delivery</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20 ring-2 ring-blue-200/70 dark:ring-blue-700/50">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text mb-4">{stats.onTimeDelivery}%</p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-blue-100">
                  <div className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.onTimeDelivery}%` }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200/50 dark:border-blue-700/50">
                <Award className="w-4 h-4" />
                Trusted - Premium Tier
              </div>
            </div>

            {/* Client Satisfaction */}
            <div className="group relative bg-gradient-to-br from-white to-amber-50/70 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-amber-200/70 dark:border-slate-700 p-8 shadow-lg hover:shadow-2xl hover:shadow-amber-300/40 dark:hover:shadow-amber-900/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Satisfaction</h3>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20 ring-2 ring-amber-200/70 dark:ring-amber-700/50">
                  <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-current" />
                </div>
              </div>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text mb-4">{(stats.avgRating * 20).toFixed(0)}%</p>
              <div className="space-y-2 mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ring-1 ring-amber-100">
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.avgRating * 20}%` }} />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-amber-200/50 dark:border-amber-700/50">
                <Award className="w-3.5 h-3.5" />
                Exceptional - {stats.avgRating} stars
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">What's next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <button 
              onClick={() => navigate('/se-market')}
              className="bg-gradient-to-b from-white to-indigo-50/55 dark:bg-surface rounded-2xl border border-indigo-200/70 dark:border-gray-700 p-5 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-indigo-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 mb-2 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Find New Work</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Browse fresh opportunities</p>
            </button>

            <button 
              onClick={() => navigate('/dashboard/contracts')}
              className="bg-gradient-to-b from-white to-emerald-50/45 dark:bg-surface rounded-2xl border border-emerald-200/70 dark:border-gray-700 p-5 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-emerald-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Active Contracts</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Manage your work</p>
            </button>

            <button 
              onClick={() => navigate('/se-market/my-proposals')}
              className="bg-gradient-to-b from-white to-fuchsia-50/45 dark:bg-surface rounded-2xl border border-fuchsia-200/70 dark:border-gray-700 p-5 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-fuchsia-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">Your Proposals</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Track submissions</p>
            </button>

            <button 
              onClick={() => navigate('/profile/me')}
              className="bg-gradient-to-b from-white to-amber-50/50 dark:bg-surface rounded-2xl border border-amber-200/70 dark:border-gray-700 p-5 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-amber-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 mb-2 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">View Profile</p>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Showcase your work</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-b from-white to-slate-50/70 dark:bg-surface rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center ring-1 ring-slate-200/70">
                  {activity.icon === 'proposal' && <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  {activity.icon === 'milestone' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  {activity.icon === 'payment' && <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  {activity.icon === 'review' && <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{activity.date}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
