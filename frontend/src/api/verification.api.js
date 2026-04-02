// Seller Verification & Badges API Blueprint
// 50+ methods across 12 modules

// ===== 1. VERIFICATION REQUEST & SUBMISSION =====
export const verificationAPI = {
  // Submit verification request with documents
  submitVerificationRequest: async (sellerId, documents) => {
    // POST /api/verification/submit
    // Body: { sellerId, documents: [{ type, fileName, file }], metadata }
    // Returns: { requestId, status, submittedAt, expectedReviewDate }
  },

  // Get seller verification status
  getVerificationStatus: async (sellerId) => {
    // GET /api/verification/status/:sellerId
    // Returns: { status, tier, trustScore, documents, badges, verificationDate }
  },

  // Cancel verification request (only if pending)
  cancelVerificationRequest: async (requestId) => {
    // DELETE /api/verification/requests/:requestId
    // Returns: { success, message }
  },

  // Resubmit verification with new documents
  resubmitVerification: async (requestId, newDocuments) => {
    // PUT /api/verification/requests/:requestId/resubmit
    // Body: { documents }
    // Returns: { requestId, status, message }
  },

  // Get verification request history
  getVerificationHistory: async (sellerId) => {
    // GET /api/verification/history/:sellerId
    // Returns: [{ requestId, submittedAt, status, reviewedAt, reviewer, notes }]
  },
};

// ===== 2. DOCUMENT MANAGEMENT =====
export const documentAPI = {
  // Upload verification document
  uploadDocument: async (sellerId, documentType, file) => {
    // POST /api/documents/upload
    // FormData: { sellerId, documentType, file }
    // Returns: { documentId, fileName, status, uploadedAt }
  },

  // Verify document (admin/owner only)
  verifyDocument: async (documentId) => {
    // PUT /api/documents/:documentId/verify
    // Returns: { documentId, status: 'verified', verifiedAt, verifiedBy }
  },

  // Reject document with reason
  rejectDocument: async (documentId, reason) => {
    // PUT /api/documents/:documentId/reject
    // Body: { reason }
    // Returns: { documentId, status: 'rejected', rejectionReason }
  },

  // Get document details
  getDocument: async (documentId) => {
    // GET /api/documents/:documentId
    // Returns: { id, sellerId, type, fileName, status, uploadedAt, verifiedAt, url }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    // DELETE /api/documents/:documentId
    // Returns: { success, message }
  },

  // Get all documents for seller
  getSellerDocuments: async (sellerId) => {
    // GET /api/sellers/:sellerId/documents
    // Returns: [{ id, type, fileName, status, uploadedAt }]
  },
};

// ===== 3. BADGE MANAGEMENT =====
export const badgeAPI = {
  // Award badge to seller
  awardBadge: async (sellerId, badgeId) => {
    // POST /api/badges/award
    // Body: { sellerId, badgeId }
    // Returns: { badgeId, awardedAt, reason }
  },

  // Revoke badge from seller
  revokeBadge: async (sellerId, badgeId) => {
    // DELETE /api/badges/revoke
    // Body: { sellerId, badgeId }
    // Returns: { success, message, revokedAt }
  },

  // Get seller badges
  getSellerBadges: async (sellerId) => {
    // GET /api/sellers/:sellerId/badges
    // Returns: [{ id, name, icon, description, earnedAt, tier }]
  },

  // Get all available badges
  getAllBadges: async () => {
    // GET /api/badges
    // Returns: [{ id, name, icon, description, criteria, rarity }]
  },

  // Get badge criteria
  getBadgeCriteria: async (badgeId) => {
    // GET /api/badges/:badgeId/criteria
    // Returns: { criteria, progressPercentage, earned, earnedAt }
  },

  // Check badge eligibility
  checkBadgeEligibility: async (sellerId, badgeId) => {
    // GET /api/badges/:badgeId/check-eligibility/:sellerId
    // Returns: { eligible, missingCriteria, progressPercentage }
  },

  // Auto-award badges based on metrics
  autoAwardBadges: async (sellerId) => {
    // POST /api/badges/auto-check/:sellerId
    // Returns: { newBadges: [{ id, name }], totalBadges }
  },
};

// ===== 4. TRUST SCORE CALCULATION =====
export const trustScoreAPI = {
  // Calculate trust score
  calculateTrustScore: async (sellerId) => {
    // POST /api/trust-score/calculate/:sellerId
    // Returns: { score, breakdown: { sales: 0, rating: 0, volume: 0, ... }, factors }
  },

  // Get trust score history
  getTrustScoreHistory: async (sellerId) => {
    // GET /api/trust-score/history/:sellerId
    // Returns: [{ date, score, change }]
  },

  // Get trust score factors
  getTrustScoreFactors: async (sellerId) => {
    // GET /api/trust-score/factors/:sellerId
    // Returns: { successRate, salesVolume, responseTime, policyCompliance, reportedIssues }
  },

  // Update trust score calculation rules
  updateTrustScoreRules: async (rules) => {
    // PUT /api/trust-score/rules (admin only)
    // Body: { rules: { sales: weight, rating: weight, ... } }
    // Returns: { success, newRules }
  },
};

// ===== 5. SELLER TIER MANAGEMENT =====
export const tierAPI = {
  // Get seller tier
  getSellerTier: async (sellerId) => {
    // GET /api/tiers/seller/:sellerId
    // Returns: { tier, minScore, benefits, upgradeRequirements }
  },

  // Upgrade tier
  upgradeTier: async (sellerId, newTier) => {
    // PUT /api/tiers/upgrade
    // Body: { sellerId, newTier }
    // Returns: { tier, upgradedAt, benefits }
  },

  // Downgrade tier
  downgradeTier: async (sellerId, reason) => {
    // PUT /api/tiers/downgrade
    // Body: { sellerId, reason }
    // Returns: { tier, downgradedAt, reason }
  },

  // Get all tiers
  getAllTiers: async () => {
    // GET /api/tiers
    // Returns: [{ tier, name, minScore, requirements, benefits, sellerCount }]
  },

  // Get tier benefits
  getTierBenefits: async (tier) => {
    // GET /api/tiers/:tier/benefits
    // Returns: { tier, benefits: [{ benefit, description }], color }
  },

  // Get tier requirements
  getTierRequirements: async (tier) => {
    // GET /api/tiers/:tier/requirements
    // Returns: { tier, requirements: [{ requirement, currentProgress }] }
  },
};

// ===== 6. CATEGORY VERIFICATION =====
export const categoryVerificationAPI = {
  // Request category verification
  requestCategoryVerification: async (sellerId, category) => {
    // POST /api/categories/verify
    // Body: { sellerId, category, supportingDocuments }
    // Returns: { requestId, category, status }
  },

  // Approve category verification
  approveCategoryVerification: async (requestId, level = 'basic') => {
    // PUT /api/categories/verify/:requestId/approve
    // Body: { level } (basic, intermediate, professional)
    // Returns: { category, level, approvedAt }
  },

  // Reject category verification
  rejectCategoryVerification: async (requestId, reason) => {
    // PUT /api/categories/verify/:requestId/reject
    // Body: { reason }
    // Returns: { requestId, status: 'rejected', reason }
  },

  // Get seller category verifications
  getSellerCategoryVerifications: async (sellerId) => {
    // GET /api/sellers/:sellerId/category-verifications
    // Returns: [{ category, level, verified, sales, verifiedAt }]
  },

  // Get category requirements
  getCategoryRequirements: async (category) => {
    // GET /api/categories/:category/requirements
    // Returns: { category, requiredDocuments, minExperience, restrictions }
  },
};

// ===== 7. BADGE DISPLAY & SHOWCASE =====
export const badgeDisplayAPI = {
  // Get seller badge showcase
  getBadgeShowcase: async (sellerId) => {
    // GET /api/badges/showcase/:sellerId
    // Returns: { badges: [{ id, icon, name }], displayOrder, total }
  },

  // Update badge display order
  updateBadgeDisplayOrder: async (sellerId, badgeOrder) => {
    // PUT /api/badges/showcase/:sellerId/order
    // Body: { badgeOrder: [badgeId] }
    // Returns: { success, displayOrder }
  },

  // Hide badge from profile (seller hides one of their badges)
  hideBadge: async (sellerId, badgeId) => {
    // PUT /api/badges/:badgeId/hide
    // Body: { sellerId }
    // Returns: { success, badgeId }
  },

  // Feature badge (admin/owner)
  featureBadge: async (badgeId, featured = true) => {
    // PUT /api/badges/:badgeId/feature
    // Body: { featured }
    // Returns: { badgeId, featured }
  },
};

// ===== 8. VERIFICATION ADMIN OPERATIONS =====
export const adminVerificationAPI = {
  // Get pending verifications
  getPendingVerifications: async (limit = 20, offset = 0) => {
    // GET /api/admin/verifications/pending?limit=20&offset=0
    // Returns: [{ requestId, sellerId, sellerName, submittedAt, documentsCount }]
  },

  // Review verification request
  reviewVerificationRequest: async (requestId, approved, notes = '') => {
    // PUT /api/admin/verifications/:requestId/review
    // Body: { approved, notes }
    // Returns: { requestId, status, reviewedAt, reviewed By }
  },

  // Get verification requests by status
  getVerificationsByStatus: async (status) => {
    // GET /api/admin/verifications/status/:status
    // Returns: [{ requestId, sellerId, status, submittedAt }]
  },

  // Bulk process verifications
  bulkProcessVerifications: async (requestIds, action, notes) => {
    // POST /api/admin/verifications/bulk
    // Body: { requestIds, action: 'approve'|'reject', notes }
    // Returns: { processed, succeeded, failed }
  },

  // Get verification statistics
  getVerificationStats: async () => {
    // GET /api/admin/statistics/verifications
    // Returns: { totalRequests, approved, rejected, pending, averageReviewTime }
  },

  // Get seller ranking by trust score
  getSellerRanking: async (limit = 100) => {
    // GET /api/admin/sellers/ranking?limit=100
    // Returns: [{ rank, sellerId, sellerName, trustScore, badges, tier }]
  },
};

// ===== 9. VERIFICATION COMPLIANCE =====
export const complianceAPI = {
  // Check seller compliance
  checkSellerCompliance: async (sellerId) => {
    // GET /api/compliance/check/:sellerId
    // Returns: { compliant, violations, warnings, lastCheckDate }
  },

  // Flag compliance violation
  flagCompliance: async (sellerId, violationType, reason) => {
    // POST /api/compliance/flag
    // Body: { sellerId, violationType, reason }
    // Returns: { violationId, flaggedAt, status }
  },

  // Resolve compliance violation
  resolveCompliance: async (violationId, resolution) => {
    // PUT /api/compliance/violations/:violationId/resolve
    // Body: { resolution }
    // Returns: { violationId, status: 'resolved', resolvedAt }
  },

  // Get compliance policy
  getCompliancePolicy: async () => {
    // GET /api/compliance/policy
    // Returns: { policies: [{ id, name, description, consequences }] }
  },
};

// ===== 10. VERIFICATION ANALYTICS =====
export const verificationAnalyticsAPI = {
  // Get verification analytics
  getVerificationAnalytics: async (timeRange = '30d') => {
    // GET /api/analytics/verification?range=30d
    // Returns: { submitted, approved, rejected, avgReviewTime, trends }
  },

  // Get seller distribution by tier
  getSellerDistributionByTier: async () => {
    // GET /api/analytics/sellers/tier-distribution
    // Returns: { bronze: 100, silver: 50, gold: 20, platinum: 5 }
  },

  // Get trust score distribution
  getTrustScoreDistribution: async () => {
    // GET /api/analytics/trust-score/distribution
    // Returns: { 0-25: 10, 25-50: 20, 50-75: 40, 75-100: 30 }
  },

  // Get badge popularity
  getBadgePopularity: async () => {
    // GET /api/analytics/badges/popularity
    // Returns: [{ badgeId, name, awardedCount, percentage }]
  },
};

// ===== 11. VERIFICATION NOTIFICATIONS =====
export const verificationNotificationAPI = {
  // Send verification status update
  sendStatusNotification: async (sellerId, status, message) => {
    // POST /api/notifications/verification-status
    // Body: { sellerId, status, message }
    // Returns: { notificationId, sentAt }
  },

  // Send badge earned notification
  sendBadgeNotification: async (sellerId, badgeId) => {
    // POST /api/notifications/badge-earned
    // Body: { sellerId, badgeId }
    // Returns: { notificationId, sentAt }
  },

  // Send tier upgrade notification
  sendTierUpgradeNotification: async (sellerId, newTier) => {
    // POST /api/notifications/tier-upgraded
    // Body: { sellerId, newTier }
    // Returns: { notificationId, sentAt }
  },

  // Send document rejection notification
  sendDocumentRejectionNotification: async (sellerId, documentId, reason) => {
    // POST /api/notifications/document-rejected
    // Body: { sellerId, documentId, reason }
    // Returns: { notificationId, sentAt }
  },
};

// ===== 12. VERIFICATION EXPORT & REPORTING =====
export const verificationReportAPI = {
  // Export verification data
  exportVerificationData: async (format = 'csv') => {
    // GET /api/reports/verification/export?format=csv
    // Returns: File download (CSV, PDF, XLSX)
  },

  // Generate verification report
  generateVerificationReport: async (timeRange = '30d') => {
    // POST /api/reports/verification/generate
    // Body: { timeRange }
    // Returns: { reportId, generatedAt, url }
  },

  // Get seller verification certificate
  getVerificationCertificate: async (sellerId) => {
    // GET /api/certificates/verification/:sellerId
    // Returns: { certificateUrl, issuedAt, expiresAt, certificateNumber }
  },

  // Generate badge certificate
  getBadgeCertificate: async (sellerId, badgeId) => {
    // GET /api/certificates/badge/:sellerId/:badgeId
    // Returns: { certificateUrl, issuedAt, certificateNumber }
  },
};

export default {
  verification: verificationAPI,
  documents: documentAPI,
  badges: badgeAPI,
  trustScore: trustScoreAPI,
  tiers: tierAPI,
  categories: categoryVerificationAPI,
  badgeDisplay: badgeDisplayAPI,
  admin: adminVerificationAPI,
  compliance: complianceAPI,
  analytics: verificationAnalyticsAPI,
  notifications: verificationNotificationAPI,
  reports: verificationReportAPI,
};
