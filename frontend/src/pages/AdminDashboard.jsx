import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Users,
  Gavel,
  AlertCircle,
  DollarSign,
  Settings,
  BarChart3,
  Lock,
  Pause,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Shield,
} from 'lucide-react';
import useOwnerStore from '@/store/ownerStore';
import VerificationManagementTab from '@/components/admin/VerificationManagementTab';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const {
    isOwnerLoggedIn,
    ownerEmail,
    logoutOwner,
    allUsers,
    disputes,
    allTransactions,
    platformAnalytics,
    reportedContent,
    platformSettings,
    suspendUser,
    activateUser,
    banUser,
    verifyUser,
    resolveDispute,
    removeContent,
    approveContent,
    updateCommissionRate,
    getPendingReports,
    getOpenDisputes,
  } = useOwnerStore();

  const handleLogout = () => {
    logoutOwner();
    navigate('/');
  };

  if (!isOwnerLoggedIn) {
    return navigate('/owner-login');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Owner: {ownerEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-lg border border-red-600/30 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Users" value={platformAnalytics.totalUsers} icon={Users} color="blue" />
          <StatCard label="Active Listings" value={platformAnalytics.activeListings} icon={BarChart3} color="green" />
          <StatCard label="Total Revenue" value={`$${platformAnalytics.totalRevenue}`} icon={DollarSign} color="purple" />
          <StatCard label="Open Disputes" value={getOpenDisputes().length} icon={Gavel} color="yellow" />
          <StatCard label="Pending Reports" value={getPendingReports().length} icon={AlertCircle} color="red" />
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg border border-slate-700/50 mb-6">
          <div className="flex flex-wrap gap-1 p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'verification', label: 'Verification', icon: Shield },
              { id: 'disputes', label: 'Disputes', icon: Gavel },
              { id: 'moderation', label: 'Moderation', icon: AlertCircle },
              { id: 'transactions', label: 'Transactions', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueCard data={platformAnalytics} />
              <DisputeStats disputes={disputes} />
              <QuickActionsCard setActiveTab={setActiveTab} />
              <PlatformHealthCard platformAnalytics={platformAnalytics} />
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersTable
              users={allUsers}
              onSuspend={suspendUser}
              onActivate={activateUser}
              onBan={banUser}
              onVerify={verifyUser}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <VerificationManagementTab />
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <DisputesTable
              disputes={disputes}
              onResolve={resolveDispute}
              selectedDispute={selectedDispute}
              setSelectedDispute={setSelectedDispute}
            />
          )}

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <ModerationTable
              reports={reportedContent}
              onRemove={removeContent}
              onApprove={approveContent}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <TransactionsTable transactions={allTransactions} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsPanel
              settings={platformSettings}
              onUpdateCommission={updateCommissionRate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Components =====

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className="w-10 h-10 opacity-40" />
      </div>
    </div>
  );
}

function RevenueCard({ data }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Revenue Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Revenue</span>
          <span className="text-2xl font-bold text-green-400">${data.totalRevenue}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Platform Commission (10%)</span>
          <span className="text-xl font-semibold text-blue-400">${data.platformCommission}</span>
        </div>
        <div className="border-t border-slate-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Average Transaction</span>
            <span className="text-lg font-semibold text-slate-300">
              ${Math.round(data.totalRevenue / data.totalTransactions)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisputeStats({ disputes }) {
  const stats = {
    open: disputes.filter(d => d.status === 'open').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    rejected: disputes.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Dispute Statistics</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" /> Open
          </span>
          <span className="text-xl font-bold text-yellow-400">{stats.open}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" /> Resolved
          </span>
          <span className="text-xl font-bold text-green-400">{stats.resolved}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Rejected
          </span>
          <span className="text-xl font-bold text-red-400">{stats.rejected}</span>
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard({ setActiveTab }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab('disputes')}
          className="w-full text-left px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 transition"
        >
          → Resolve Open Disputes
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className="w-full text-left px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition"
        >
          → Review Reported Content
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className="w-full text-left px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition"
        >
          → Manage Users
        </button>
      </div>
    </div>
  );
}

function PlatformHealthCard({ platformAnalytics }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Platform Health</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">User Activity</span>
            <span className="text-green-400 font-semibold">Good</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Dispute Rate</span>
            <span className="text-yellow-400 font-semibold">Moderate</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTable({ users, onSuspend, onActivate, onBan, onVerify }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-white font-semibold">User</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Verified</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-300 capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : user.status === 'suspended'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </td>
                <td className="px-4 py-3 space-x-2">
                  {user.status === 'active' ? (
                    <button
                      onClick={() => onSuspend(user.id)}
                      className="text-yellow-400 hover:text-yellow-300 transition text-sm"
                    >
                      <Pause className="w-4 h-4 inline" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(user.id)}
                      className="text-green-400 hover:text-green-300 transition text-sm"
                    >
                      <CheckCircle className="w-4 h-4 inline" /> Activate
                    </button>
                  )}
                  {!user.verified && (
                    <button
                      onClick={() => onVerify(user.id)}
                      className="text-blue-400 hover:text-blue-300 transition text-sm"
                    >
                      <Shield className="w-4 h-4 inline" /> Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisputesTable({ disputes, onResolve }) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [activeDisputeId, setActiveDisputeId] = useState(null);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-white font-semibold">Issue</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Amount</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium">{dispute.title}</p>
                    <p className="text-xs text-slate-400">Buyer: {dispute.buyerId} → Seller: {dispute.sellerId}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-semibold">${dispute.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      dispute.status === 'open'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}
                  >
                    {dispute.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{dispute.dateCreated}</td>
                <td className="px-4 py-3">
                  {dispute.status === 'open' && (
                    <button
                      onClick={() => setActiveDisputeId(activeDisputeId === dispute.id ? null : dispute.id)}
                      className="text-blue-400 hover:text-blue-300 transition text-sm"
                    >
                      Resolve →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModerationTable({ reports, onRemove, onApprove }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-white font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Reason</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Reported By</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                <td className="px-4 py-3">
                  <span className="capitalize px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs">
                    {report.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-white">{report.reason}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      report.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : report.status === 'under-review'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{report.reportedBy}</td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => onApprove(report.id)}
                    className="text-green-400 hover:text-green-300 transition text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRemove(report.id)}
                    className="text-red-400 hover:text-red-300 transition text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsTable({ transactions }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-white font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Amount</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Parties</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Escrow</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                <td className="px-4 py-3">
                  <span className="capitalize px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs">
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-semibold">${tx.amount}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{tx.buyer || tx.seller || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold ${
                      tx.status === 'completed'
                        ? 'text-green-400'
                        : tx.status === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm capitalize">{tx.escrowStatus}</td>
                <td className="px-4 py-3 text-slate-400 text-sm">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onUpdateCommission }) {
  const [commissionRate, setCommissionRate] = useState(settings.commissionRate);
  const [minPrice, setMinPrice] = useState(settings.minListingPrice);
  const [maxPrice, setMaxPrice] = useState(settings.maxListingPrice);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Commission Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Commission Rate (%)</label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => {
                setCommissionRate(e.target.value);
                onUpdateCommission(parseFloat(e.target.value));
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-2">Current: {commissionRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Minimum Price ($)</label>
            <input
              type="number"
              value={minPrice}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Maximum Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Dispute Resolution</h3>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Resolution Time (days)</label>
          <input
            type="number"
            value={settings.disputeResolutionDays}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Platform Status</h3>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Maintenance Mode</span>
          <div className="w-12 h-6 bg-slate-700 rounded-full cursor-pointer">
            <div className="w-5 h-5 bg-slate-400 rounded-full m-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
// © 2026 Tech-Mates. All rights reserved.
