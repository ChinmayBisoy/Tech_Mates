import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useOwnerStore from '@/store/ownerStore'
import {
  ArrowLeft,
  Download,
  Filter,
  LogOut,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react'

export default function OwnerReports() {
  const navigate = useNavigate()
  const { isOwnerLoggedIn, ownerEmail, logoutOwner } = useOwnerStore()
  
  const [reportType, setReportType] = useState('financial')
  const [dateRange, setDateRange] = useState('30days')

  const [financialReports] = useState([
    {
      id: 1,
      date: '2024-03-01',
      period: 'March 2024',
      totalRevenue: 2500000,
      commissionEarned: 125000,
      disbursed: 120000,
      pending: 5000,
      transactions: 450,
      status: 'Completed',
    },
    {
      id: 2,
      date: '2024-02-01',
      period: 'February 2024',
      totalRevenue: 2200000,
      commissionEarned: 110000,
      disbursed: 108000,
      pending: 2000,
      transactions: 420,
      status: 'Completed',
    },
    {
      id: 3,
      date: '2024-01-01',
      period: 'January 2024',
      totalRevenue: 2000000,
      commissionEarned: 100000,
      disbursed: 99000,
      pending: 1000,
      transactions: 380,
      status: 'Completed',
    },
  ])

  const [userReports] = useState([
    {
      id: 1,
      date: '2024-03-15',
      metric: 'Total Users',
      value: 1250,
      growth: 8.5,
      newUsers: 125,
      activeUsers: 980,
      retentionRate: 87,
    },
    {
      id: 2,
      date: '2024-02-15',
      metric: 'Total Users',
      value: 1150,
      growth: 6.2,
      newUsers: 98,
      activeUsers: 920,
      retentionRate: 85,
    },
  ])

  const [sellerReports] = useState([
    {
      id: 1,
      date: '2024-03-15',
      totalSellers: 450,
      activeSellers: 380,
      newSellers: 45,
      verifiedSellers: 420,
      suspendedSellers: 5,
      topCategories: 'Web Dev, Mobile App, Design',
    },
    {
      id: 2,
      date: '2024-02-15',
      totalSellers: 420,
      activeSellers: 360,
      newSellers: 38,
      verifiedSellers: 400,
      suspendedSellers: 4,
      topCategories: 'Web Dev, Mobile App, Consulting',
    },
  ])

  const [disputeReports] = useState([
    {
      id: 1,
      date: '2024-03-15',
      totalDisputes: 45,
      resolvedDisputes: 40,
      openDisputes: 5,
      buyerWins: 18,
      sellerWins: 22,
      resolutionRate: 94,
      avgResolutionTime: '2.3 days',
    },
    {
      id: 2,
      date: '2024-02-15',
      totalDisputes: 50,
      resolvedDisputes: 48,
      openDisputes: 2,
      buyerWins: 20,
      sellerWins: 28,
      resolutionRate: 96,
      avgResolutionTime: '2.1 days',
    },
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Insights</h1>
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
        {/* Report Type Selector */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7" />
            Comprehensive Reports
          </h2>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white font-medium hover:border-gray-300 dark:hover:border-slate-600 transition"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export All</span>
            </button>
          </div>
        </div>

        {/* Report Type Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-200 dark:border-slate-700">
          {[
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'sellers', label: 'Sellers', icon: Briefcase },
            { id: 'disputes', label: 'Disputes', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition font-medium ${
                reportType === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Financial Reports */}
        {reportType === 'financial' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Financial Reports</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-6 font-bold text-gray-900 dark:text-white">Period</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Total Revenue</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Commission</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Transactions</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Status</th>
                      <th className="text-center py-3 px-6 font-bold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">{report.period}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">₹{(report.totalRevenue / 100000).toFixed(2)}L</td>
                        <td className="py-4 px-6 text-right text-green-600 dark:text-green-400 font-semibold">₹{(report.commissionEarned / 1000).toFixed(0)}K</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.transactions}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            {report.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition">
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Reports */}
        {reportType === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-700/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Growth & Activity Reports</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-6 font-bold text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Total Users</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">New Users</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Active Users</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Retention %</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Growth %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">{report.date}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.value.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right text-blue-600 dark:text-blue-400 font-semibold">{report.newUsers}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.activeUsers.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right text-green-600 dark:text-green-400 font-semibold">{report.retentionRate}%</td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            {report.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Seller Reports */}
        {reportType === 'sellers' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seller & Listing Performance Reports</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-6 font-bold text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Total Sellers</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Active Sellers</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">New Sellers</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Verified</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Suspended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">{report.date}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.totalSellers}</td>
                        <td className="py-4 px-6 text-right text-blue-600 dark:text-blue-400 font-semibold">{report.activeSellers}</td>
                        <td className="py-4 px-6 text-right text-green-600 dark:text-green-400 font-semibold">{report.newSellers}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.verifiedSellers}</td>
                        <td className="py-4 px-6 text-right text-red-600 dark:text-red-400 font-semibold">{report.suspendedSellers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Reports */}
        {reportType === 'disputes' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-700 dark:to-slate-700/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dispute Resolution Reports</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                      <th className="text-left py-3 px-6 font-bold text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Total Disputes</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Resolved</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Open</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Buyer Wins</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Seller Wins</th>
                      <th className="text-right py-3 px-6 font-bold text-gray-900 dark:text-white">Avg Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputeReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">{report.date}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.totalDisputes}</td>
                        <td className="py-4 px-6 text-right text-green-600 dark:text-green-400 font-semibold">{report.resolvedDisputes}</td>
                        <td className="py-4 px-6 text-right text-yellow-600 dark:text-yellow-400 font-semibold">{report.openDisputes}</td>
                        <td className="py-4 px-6 text-right text-blue-600 dark:text-blue-400 font-semibold">{report.buyerWins}</td>
                        <td className="py-4 px-6 text-right text-purple-600 dark:text-purple-400 font-semibold">{report.sellerWins}</td>
                        <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{report.avgResolutionTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
