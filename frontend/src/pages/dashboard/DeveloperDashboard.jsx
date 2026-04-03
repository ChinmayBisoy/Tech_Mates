import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Briefcase, DollarSign, Star, Target, CheckCircle, Users, TrendingUp, Zap, Award, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/60 dark:from-base dark:via-surface dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 via-primary-600 to-cyan-500 dark:from-primary-700 dark:via-primary-600 dark:to-accent-600 px-8 pt-12 pb-20 relative overflow-hidden border-b border-indigo-400/20 dark:border-white/5">
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.20),transparent_45%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="text-indigo-100 text-sm font-semibold uppercase tracking-[0.18em] mb-3">Welcome back</p>
          <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-sm">
            Hey, {user?.name?.split(' ')[0] || 'Developer'}! 💪
          </h1>
          <p className="text-lg text-indigo-100/95 max-w-2xl">
            Your deliveries are on track. Here&apos;s how your work performance looks today.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Primary Stat - Lifetime Earnings */}
        <div className="mb-10 rounded-3xl border border-indigo-200/80 dark:border-gray-700 bg-gradient-to-r from-white via-indigo-50/70 to-cyan-50/70 dark:bg-surface p-6 shadow-xl shadow-indigo-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-200/60">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-indigo-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-[0.18em] mb-2">Lifetime Earnings</p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                ₹{(stats.totalEarnings / 100000).toFixed(2)}L
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">₹{stats.earningsThisMonth.toLocaleString()} this month</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-green-900/30 text-emerald-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
                <TrendingUp className="w-4 h-4" />
                +8% vs last month
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Active Projects */}
          <div className="bg-gradient-to-b from-white to-indigo-50/50 dark:bg-surface rounded-2xl border border-indigo-200/70 dark:border-gray-700 p-5 shadow-md hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3 ring-1 ring-blue-200/70">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Active Projects</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.activeProjects}</p>
            <p className="text-xs text-slate-500 dark:text-gray-500">In progress right now</p>
          </div>

          {/* Completed */}
          <div className="bg-gradient-to-b from-white to-emerald-50/50 dark:bg-surface rounded-2xl border border-emerald-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-emerald-200/40 transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 mb-4 ring-1 ring-green-200/70">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Completed</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.completedProjects}</p>
            <p className="text-xs text-slate-500 dark:text-gray-500">Total delivered</p>
          </div>

          {/* Clients */}
          <div className="bg-gradient-to-b from-white to-fuchsia-50/45 dark:bg-surface rounded-2xl border border-fuchsia-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-fuchsia-200/40 transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 mb-4 ring-1 ring-purple-200/70">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Clients</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.totalClients}</p>
            <p className="text-xs text-slate-500 dark:text-gray-500">Worked with you</p>
          </div>

          {/* Rating */}
          <div className="bg-gradient-to-b from-white to-amber-50/55 dark:bg-surface rounded-2xl border border-amber-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-amber-200/40 transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 mb-4 ring-1 ring-yellow-200/70">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Your Rating</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.avgRating}</p>
            <p className="text-xs text-slate-500 dark:text-gray-500">Based on reviews</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Performance Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-gradient-to-b from-white to-emerald-50/45 dark:bg-surface rounded-2xl border border-emerald-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-emerald-200/35 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 mb-3 ring-1 ring-green-200/70">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Response Rate</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.responseRate}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-500">Replies sent promptly</p>
            </div>

            <div className="bg-gradient-to-b from-white to-blue-50/45 dark:bg-surface rounded-2xl border border-blue-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-blue-200/35 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3 ring-1 ring-blue-200/70">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">On-Time Delivery</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.onTimeDelivery}%</p>
              <p className="text-xs text-slate-500 dark:text-gray-500">Milestones delivered on schedule</p>
            </div>

            <div className="bg-gradient-to-b from-white to-amber-50/45 dark:bg-surface rounded-2xl border border-amber-200/70 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:shadow-amber-200/35 transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 mb-3 ring-1 ring-amber-200/70">
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Developer Level</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">A+</p>
              <p className="text-xs text-slate-500 dark:text-gray-500">Based on quality and consistency</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <button 
              onClick={() => navigate('/se-market')}
              className="bg-gradient-to-b from-white to-indigo-50/55 dark:bg-surface rounded-2xl border border-indigo-200/70 dark:border-gray-700 p-6 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-indigo-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 mb-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Find New Work</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Browse fresh opportunities</p>
            </button>

            <button 
              onClick={() => navigate('/dashboard/contracts')}
              className="bg-gradient-to-b from-white to-emerald-50/45 dark:bg-surface rounded-2xl border border-emerald-200/70 dark:border-gray-700 p-6 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-emerald-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Active Contracts</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Manage your work</p>
            </button>

            <button 
              onClick={() => navigate('/se-market/my-proposals')}
              className="bg-gradient-to-b from-white to-fuchsia-50/45 dark:bg-surface rounded-2xl border border-fuchsia-200/70 dark:border-gray-700 p-6 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-fuchsia-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Your Proposals</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Track submissions</p>
            </button>

            <button 
              onClick={() => navigate('/profile/me')}
              className="bg-gradient-to-b from-white to-amber-50/50 dark:bg-surface rounded-2xl border border-amber-200/70 dark:border-gray-700 p-6 text-left hover:border-primary-500 hover:shadow-xl hover:shadow-amber-200/35 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 mb-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">View Profile</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Showcase your work</p>
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
