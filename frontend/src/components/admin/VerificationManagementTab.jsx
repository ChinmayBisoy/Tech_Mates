import React, { useState } from 'react';
import { Shield, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import useVerificationStore from '@/store/verificationStore';
import VerificationReviewModal from '@/components/verification/VerificationReviewModal';

const VerificationManagementTab = () => {
  const {
    sellers,
    getPendingVerifications,
    getVerifiedSellers,
    approveVerification,
    rejectVerification,
  } = useVerificationStore();

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, verified, rejected
  const [stats, setStats] = useState({
    pending: getPendingVerifications().length,
    verified: getVerifiedSellers().length,
    rejected: sellers.filter((s) => s.verificationStatus === 'rejected').length,
  });

  const filteredSellers = sellers.filter((s) => {
    if (filter === 'pending') return s.verificationStatus === 'pending';
    if (filter === 'verified') return s.verificationStatus === 'verified';
    if (filter === 'rejected') return s.verificationStatus === 'rejected';
    return true;
  });

  const handleApprove = (sellerId, notes) => {
    approveVerification(sellerId, notes);
    setSelectedSeller(null);
    setStats({
      ...stats,
      pending: stats.pending - 1,
      verified: stats.verified + 1,
    });
  };

  const handleReject = (sellerId, reason) => {
    rejectVerification(sellerId, reason);
    setSelectedSeller(null);
    setStats({
      ...stats,
      pending: stats.pending - 1,
      rejected: stats.rejected + 1,
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Verified Sellers</p>
              <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-800 rounded-lg p-2">
        {[
          { value: 'pending', label: 'Pending', count: stats.pending },
          { value: 'verified', label: 'Verified', count: stats.verified },
          { value: 'rejected', label: 'Rejected', count: stats.rejected },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`
              px-4 py-2 rounded-lg transition font-medium
              ${
                filter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Sellers Table */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Seller</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Trust Score</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Stats</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Documents</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No sellers found
                </td>
              </tr>
            ) : (
              filteredSellers.map((seller) => (
                <tr key={seller.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-white">{seller.name}</p>
                        <p className="text-xs text-gray-400">{seller.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        px-2 py-1 rounded text-sm font-bold
                        ${
                          seller.trustScore >= 85
                            ? 'bg-green-500/20 text-green-400'
                            : seller.trustScore >= 70
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }
                      `}
                    >
                      {seller.trustScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="text-gray-300">
                      {seller.totalSales} sales • {seller.successRate}% success
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {seller.documents.length} uploaded
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${
                          seller.verificationStatus === 'verified'
                            ? 'bg-green-500/20 text-green-400'
                            : seller.verificationStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }
                      `}
                    >
                      {seller.verificationStatus.charAt(0).toUpperCase() +
                        seller.verificationStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {seller.verificationStatus === 'pending' ? (
                      <button
                        onClick={() => setSelectedSeller(seller)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
                      >
                        Review
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-slate-700 text-gray-400 text-sm rounded font-medium cursor-not-allowed">
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedSeller && (
        <VerificationReviewModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default VerificationManagementTab;
