import React from 'react';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import TierBadge from './TierBadge';

const VerificationStatus = ({ seller, onViewDetails }) => {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      label: 'Verified',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      label: 'Pending Verification',
    },
    rejected: {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      label: 'Verification Rejected',
    },
    unverified: {
      icon: AlertCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800',
      label: 'Not Verified',
    },
  };

  const config = statusConfig[seller.verificationStatus] || statusConfig.unverified;
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {config.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {seller.verificationDate
                ? `Verified on ${seller.verificationDate}`
                : 'Not yet verified'}
            </p>
          </div>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className={`
              p-2 rounded-lg transition-colors
              hover:bg-white/50 dark:hover:bg-black/20
            `}
            title="View details"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Trust Score */}
      <div className="bg-white/50 dark:bg-black/20 rounded p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Trust Score
          </span>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {seller.trustScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              seller.trustScore >= 85
                ? 'bg-green-500'
                : seller.trustScore >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${seller.trustScore}%` }}
          />
        </div>
      </div>

      {/* Tier Badge */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Seller Tier
        </p>
        <TierBadge tier={seller.verificationTier} size="md" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/50 dark:bg-black/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Sales</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {seller.totalSales}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-black/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {seller.successRate}%
          </p>
        </div>
        <div className="bg-white/50 dark:bg-black/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Response</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {seller.responseTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
