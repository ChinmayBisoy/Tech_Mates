import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Trophy, Users } from 'lucide-react';
import useVerificationStore from '@/store/verificationStore';
import useOwnerStore from '@/store/ownerStore';
import { useAuth } from '@/hooks/useAuth';
import DocumentUploader from '@/components/verification/DocumentUploader';
import VerificationStatus from '@/components/verification/VerificationStatus';
import VerificationBrowser from '@/components/verification/VerificationBrowser';
import VerificationReviewModal from '@/components/verification/VerificationReviewModal';
import BadgeDisplay from '@/components/verification/BadgeDisplay';
import TierBadge from '@/components/verification/TierBadge';

const SellerVerificationPage = () => {
  const navigate = useNavigate();
  const { isDeveloper } = useAuth();
  const isOwnerLoggedIn = useOwnerStore((state) => state.isOwnerLoggedIn);

  const {
    sellers,
    documentTypes,
    verificationTiers,
    getSellerByUserId,
    uploadDocument,
    submitVerification,
    updateVerificationStatus,
    calculateTrustScore,
    approveVerification,
    rejectVerification,
  } = useVerificationStore();

  const [activeTab, setActiveTab] = useState('myVerification');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewingSellerForModal, setReviewingSellerForModal] = useState(null);

  // Demo: User is seller with ID 1
  const currentUserSeller = getSellerByUserId(1) || sellers[0];

  const handleDocumentUpload = (docType, fileName) => {
    uploadDocument(currentUserSeller.id, docType, fileName);
  };

  const handleSubmitVerification = () => {
    submitVerification(currentUserSeller.id);
    alert('Verification request submitted! Our team will review your documents within 3-5 business days.');
  };

  const handleApproveVerification = (sellerId, notes) => {
    approveVerification(sellerId, notes);
    setReviewingSellerForModal(null);
    alert('Seller verification approved! They will be notified immediately.');
  };

  const handleRejectVerification = (sellerId, reason) => {
    rejectVerification(sellerId, reason);
    setReviewingSellerForModal(null);
    alert('Seller verification rejected. They will receive feedback to resubmit.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-slate-800/95 dark:bg-gray-900/95 backdrop-blur border-b border-slate-700/50 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Developer Verification & Badges
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Back
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-slate-700">
            {[
              { id: 'myVerification', label: 'My Verification', icon: Shield },
              { id: 'browse', label: 'Browse Sellers', icon: Users },
              { id: 'tiers', label: 'Tier Information', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 font-medium transition-colors flex items-center gap-2
                    border-b-2 -mb-px
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab: My Verification */}
        {activeTab === 'myVerification' && (
          <div className="space-y-6">
            {/* Developer Info Badge */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-100">
                    This is your seller profile
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Submit your verification documents to get a seller badge and access all marketplace features.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <VerificationStatus
              seller={currentUserSeller}
              onViewDetails={() => setShowDetails(!showDetails)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Alert */}
                {currentUserSeller.verificationStatus === 'pending' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                          Under Review
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Your verification request is being processed. We'll notify you once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Upload Section */}
                {currentUserSeller.verificationStatus !== 'verified' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Submit Documents for Verification
                    </h3>

                    <DocumentUploader
                      documentTypes={documentTypes}
                      onUpload={handleDocumentUpload}
                      existingDocuments={currentUserSeller.documents}
                    />

                    <button
                      onClick={handleSubmitVerification}
                      disabled={
                        currentUserSeller.documents.length === 0 ||
                        currentUserSeller.verificationStatus === 'pending'
                      }
                      className={`
                        w-full mt-6 py-3 px-4 rounded-lg font-bold transition-all
                        ${
                          currentUserSeller.documents.length > 0 &&
                          currentUserSeller.verificationStatus !== 'pending'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {currentUserSeller.verificationStatus === 'pending'
                        ? 'Verification in Progress...'
                        : 'Submit for Verification'}
                    </button>
                  </div>
                )}

                {/* Badges Section */}
                {currentUserSeller.badges.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Your Badges
                    </h3>
                    <BadgeDisplay badges={currentUserSeller.badges} size="lg" />
                  </div>
                )}

                {/* Category Verifications */}
                {currentUserSeller.categoryVerifications.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Category Verifications
                    </h3>
                    <div className="space-y-2">
                      {currentUserSeller.categoryVerifications.map((cat) => (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {cat.category}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {cat.sales} sales • {cat.level} level
                            </p>
                          </div>
                          <span className="text-green-500">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Requirements */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Requirements for{' '}
                    <TierBadge
                      tier={verificationTiers[currentUserSeller.verificationTier]?.name.toLowerCase()}
                      size="sm"
                    />
                  </h4>

                  {currentUserSeller.verificationTier && (
                    <ul className="space-y-2 text-sm">
                      {verificationTiers[currentUserSeller.verificationTier]?.requirements.map(
                        (req, idx) => (
                          <li key={idx} className="flex gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-green-500 font-bold">✓</span>
                            {req}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                    Benefits
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    {verificationTiers[currentUserSeller.verificationTier]?.benefits.map(
                      (benefit, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-blue-500">⭐</span>
                          {benefit}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Browse Sellers */}
        {activeTab === 'browse' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <VerificationBrowser
              sellers={sellers.filter((s) => s.verificationStatus === 'verified')}
              onSellerClick={setSelectedSeller}
              onVerify={(sellerId) => {
                const seller = sellers.find((s) => s.id === sellerId);
                setReviewingSellerForModal(seller);
              }}
              isOwner={isOwnerLoggedIn}
            />

            {/* Review Modal - Only for Owner */}
            {isOwnerLoggedIn && reviewingSellerForModal && (
              <VerificationReviewModal
                seller={reviewingSellerForModal}
                onClose={() => setReviewingSellerForModal(null)}
                onApprove={handleApproveVerification}
                onReject={handleRejectVerification}
              />
            )}
          </div>
        )}

        {/* Tab: Tier Information */}
        {activeTab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(verificationTiers).map(([tierId, tier]) => (
              <div
                key={tierId}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {tier.name}
                  </h3>
                  <TierBadge tier={tierId} size="md" />
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Minimum Trust Score: <span className="font-bold">{tier.minScore}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Requirements
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {tier.requirements.map((req, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-green-500">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Benefits
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-blue-500">⭐</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {sellers
                  .filter((s) => s.verificationTier === tierId)
                  .length > 0 && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                    <p>
                      Current sellers in this tier:{' '}
                      <span className="font-bold">
                        {sellers.filter((s) => s.verificationTier === tierId).length}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerVerificationPage;

// © 2026 Tech-Mates. All rights reserved.
