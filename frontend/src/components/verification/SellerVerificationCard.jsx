import React from 'react';
import { ExternalLink, Badge } from 'lucide-react';
import TierBadge from './TierBadge';
import BadgeDisplay from './BadgeDisplay';

const SellerVerificationCard = ({ seller, onViewProfile, onVerify, isOwner = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'border-green-400 dark:border-green-600';
      case 'pending':
        return 'border-yellow-400 dark:border-yellow-600';
      case 'rejected':
        return 'border-red-400 dark:border-red-600';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-4 transition-all hover:shadow-lg
        dark:hover:shadow-lg dark:shadow-gray-900/30
        ${getStatusColor(seller.verificationStatus)}
        ${getVerificationColor(seller.verificationStatus)}
      `}
    >
      {/* Header with Avatar and Tier */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3 flex-1">
          <img
            src={seller.avatar}
            alt={seller.name}
            className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
          />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 group">
              {seller.name}
              {seller.verificationStatus === 'verified' && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {seller.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Joined {seller.joinDate}
            </p>
          </div>
        </div>

        <TierBadge tier={seller.verificationTier} size="sm" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="bg-white/50 dark:bg-black/30 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Trust</p>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {seller.trustScore}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-black/30 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Sales</p>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {seller.totalSales}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-black/30 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Success</p>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {seller.successRate}%
          </p>
        </div>
        <div className="bg-white/50 dark:bg-black/30 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Response</p>
          <p className="font-bold text-xs text-gray-900 dark:text-gray-100">
            {seller.responseTime}
          </p>
        </div>
      </div>

      {/* Badges Section */}
      {seller.badges.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-600">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            <Badge className="w-3 h-3 inline mr-1" />
            Badges ({seller.badges.length})
          </p>
          <BadgeDisplay badges={seller.badges} size="md" showLabel={false} />
        </div>
      )}

      {/* Category Verifications */}
      {seller.categoryVerifications.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-600">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Verified Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {seller.categoryVerifications.map((cat) => (
              <div
                key={cat.category}
                className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    cat.level === 'professional'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }
                `}
              >
                {cat.category}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {seller.documents.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Documents ({seller.documents.length} verified)
          </p>
          <div className="space-y-1">
            {seller.documents.map((doc) => (
              <div key={doc.id} className="text-xs flex items-center gap-2">
                <span
                  className={`
                    w-2 h-2 rounded-full
                    ${
                      doc.status === 'verified'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }
                  `}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {doc.fileName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-300 dark:border-gray-600">
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className={`
              flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors
              flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-700 text-white
            `}
          >
            <ExternalLink className="w-4 h-4" />
            View Profile
          </button>
        )}

        {isOwner && onVerify && seller.verificationStatus === 'pending' && (
          <button
            onClick={onVerify}
            className={`
              flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors
              bg-green-600 hover:bg-green-700 text-white
            `}
          >
            Review & Approve
          </button>
        )}

        {!isOwner && seller.verificationStatus === 'pending' && (
          <div className="flex-1 py-2 px-3 rounded-lg text-center text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700">
            Pending Review
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerVerificationCard;
