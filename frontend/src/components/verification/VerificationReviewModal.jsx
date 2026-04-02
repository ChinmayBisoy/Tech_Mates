import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Download, FileText } from 'lucide-react';
import TierBadge from './TierBadge';
import BadgeDisplay from './BadgeDisplay';

const VerificationReviewModal = ({ seller, onClose, onApprove, onReject }) => {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onApprove(seller.id, notes);
      setAction(null);
      setNotes('');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onReject(seller.id, notes);
      setAction(null);
      setNotes('');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Review Seller Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Seller Info */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {seller.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{seller.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Joined: {seller.joinDate}
              </p>
              <div className="mt-2">
                <TierBadge tier={seller.verificationTier} size="sm" />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">Trust Score</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {seller.trustScore}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {seller.totalSales}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {seller.successRate}%
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {seller.responseTime}
              </p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Submitted Documents ({seller.documents.length})
            </h4>

            {seller.documents.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No documents submitted</p>
            ) : (
              <div className="space-y-2">
                {seller.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${
                        doc.status === 'verified'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {doc.status === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Uploaded: {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`
                          text-xs font-medium px-2 py-1 rounded
                          ${
                            doc.status === 'verified'
                              ? 'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                              : 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200'
                          }
                        `}
                      >
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          {seller.badges.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Current Badges</h4>
              <BadgeDisplay badges={seller.badges} size="md" showLabel={false} />
            </div>
          )}

          {/* Category Verifications */}
          {seller.categoryVerifications.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                Verified Categories
              </h4>
              <div className="space-y-2">
                {seller.categoryVerifications.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>{cat.sales} sales</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {cat.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          {!action ? (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-bold text-blue-900 dark:text-blue-100">Your Decision</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('approve')}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-bold transition-all
                    bg-green-600 hover:bg-green-700 text-white
                  `}
                >
                  ✓ Approve Verification
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-bold transition-all
                    bg-red-600 hover:bg-red-700 text-white
                  `}
                >
                  ✗ Reject Verification
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                {action === 'approve' ? '✓ Approve Verification' : '✗ Reject Verification'}
              </h4>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Add optional approval notes (e.g., verified documents successfully)...'
                    : 'Add rejection reason (required for seller feedback)...'
                }
                className={`
                  w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${action === 'reject' && !notes ? 'ring-2 ring-red-500' : ''}
                `}
                rows={4}
              />

              {action === 'reject' && !notes && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Rejection reason is required to inform the seller
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAction(null);
                    setNotes('');
                  }}
                  disabled={processing}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-all bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    action === 'approve' ? handleApprove() : handleReject()
                  }
                  disabled={
                    processing ||
                    (action === 'reject' && !notes.trim())
                  }
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-bold transition-all
                    ${
                      action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                        : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
                    }
                  `}
                >
                  {processing
                    ? 'Processing...'
                    : action === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationReviewModal;
