import { create } from 'zustand';

const useVerificationStore = create((set, get) => ({
  // Sellers
  sellers: [
    {
      id: 1,
      name: 'John\'s Tech Store',
      userId: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john_store',
      email: 'john@techstore.com',
      verificationTier: 'gold',
      trustScore: 92,
      totalSales: 450,
      successRate: 98.5,
      joinDate: '2023-06-15',
      responseTime: '< 1 hour',
      verificationStatus: 'verified',
      verificationDate: '2024-02-10',
      badges: [
        { id: 1, name: 'Verified Seller', icon: '✓', color: 'green', earned: '2024-02-10' },
        { id: 2, name: 'Fast Responder', icon: '⚡', color: 'yellow', earned: '2024-01-15' },
        { id: 3, name: 'Excellent Ratings', icon: '⭐', color: 'gold', earned: '2024-03-01' },
        { id: 4, name: 'Trusted Seller', icon: '🛡️', color: 'blue', earned: '2024-02-28' },
      ],
      documents: [
        { id: 1, type: 'idProof', fileName: 'ID_Proof.pdf', status: 'verified', uploadedAt: '2024-02-08' },
        { id: 2, type: 'businessRegistration', fileName: 'Business_Reg.pdf', status: 'verified', uploadedAt: '2024-02-08' },
        { id: 3, type: 'bankStatement', fileName: 'Bank_Statement.pdf', status: 'verified', uploadedAt: '2024-02-09' },
      ],
      categoryVerifications: [
        { category: 'Electronics', verified: true, level: 'professional', sales: 250 },
        { category: 'Computers', verified: true, level: 'professional', sales: 200 },
      ],
    },
    {
      id: 2,
      name: 'Sarah\'s Marketplace',
      userId: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_store',
      email: 'sarah@marketplace.com',
      verificationTier: 'silver',
      trustScore: 78,
      totalSales: 180,
      successRate: 96.2,
      joinDate: '2023-09-20',
      responseTime: '< 2 hours',
      verificationStatus: 'verified',
      verificationDate: '2024-01-15',
      badges: [
        { id: 1, name: 'Verified Seller', icon: '✓', color: 'green', earned: '2024-01-15' },
        { id: 2, name: 'Fast Responder', icon: '⚡', color: 'yellow', earned: '2024-02-01' },
      ],
      documents: [
        { id: 1, type: 'idProof', fileName: 'ID_Proof.pdf', status: 'verified', uploadedAt: '2024-01-10' },
        { id: 2, type: 'businessRegistration', fileName: 'Business_Reg.pdf', status: 'verified', uploadedAt: '2024-01-10' },
      ],
      categoryVerifications: [
        { category: 'Fashion', verified: true, level: 'intermediate', sales: 180 },
      ],
    },
    {
      id: 3,
      name: 'Unverified Seller',
      userId: 6,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=unverified',
      email: 'seller@unverified.com',
      verificationTier: 'bronze',
      trustScore: 45,
      totalSales: 15,
      successRate: 85,
      joinDate: '2024-02-01',
      responseTime: '< 6 hours',
      verificationStatus: 'pending',
      verificationDate: null,
      badges: [],
      documents: [],
      categoryVerifications: [],
    },
  ],

  // Verification tiers
  verificationTiers: {
    bronze: {
      name: 'Bronze',
      minScore: 0,
      requirements: [
        'Email verification',
        'At least 1 completed transaction',
      ],
      benefits: ['Basic seller badge', 'Can list products'],
      color: '#CD7F32',
    },
    silver: {
      name: 'Silver',
      minScore: 70,
      requirements: [
        'ID verification',
        'Min 50 sales',
        'Min 95% success rate',
      ],
      benefits: ['Silver badge', 'Higher visibility', 'Promoted in search'],
      color: '#C0C0C0',
    },
    gold: {
      name: 'Gold',
      minScore: 85,
      requirements: [
        'Full business verification',
        'Min 200 sales',
        'Min 98% success rate',
        'Business registration proof',
      ],
      benefits: ['Gold badge', 'Priority support', 'Featured seller'],
      color: '#FFD700',
    },
    platinum: {
      name: 'Platinum',
      minScore: 95,
      requirements: [
        'Premium verification',
        'Min 500 sales',
        'Min 99% success rate',
        'Premium support SLA',
      ],
      benefits: ['Platinum badge', 'VIP support', 'Premium featured', 'Custom storefront'],
      color: '#E5E4E2',
    },
  },

  // Document types required
  documentTypes: [
    { id: 'idProof', name: 'ID Proof', required: true, description: 'Valid government ID' },
    { id: 'businessRegistration', name: 'Business Registration', required: false, description: 'Business license or registration' },
    { id: 'bankStatement', name: 'Bank Statement', required: false, description: 'Recent bank statement' },
    { id: 'taxCertificate', name: 'Tax Certificate', required: false, description: 'Tax registration proof' },
  ],

  // All available badges
  allBadges: [
    { id: 1, name: 'Verified Seller', icon: '✓', description: 'Seller identity verified', color: 'green' },
    { id: 2, name: 'Fast Responder', icon: '⚡', description: 'Responds within 2 hours', color: 'yellow' },
    { id: 3, name: 'Excellent Ratings', icon: '⭐', description: 'Average 4.8+ stars', color: 'gold' },
    { id: 4, name: 'Trusted Seller', icon: '🛡️', description: 'High transaction success', color: 'blue' },
    { id: 5, name: 'Top Performer', icon: '🏆', description: 'Top 1% of sellers', color: 'purple' },
    { id: 6, name: 'New Seller', icon: '🌟', description: 'Recently joined', color: 'cyan' },
  ],

  // ===== Verification Operations =====
  getSellerById: (sellerId) => {
    const state = get();
    return state.sellers.find((s) => s.id === sellerId);
  },

  getSellerByUserId: (userId) => {
    const state = get();
    return state.sellers.find((s) => s.userId === userId);
  },

  updateSellerVerification: (sellerId, updates) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId ? { ...s, ...updates } : s
      ),
    })),

  // ===== Trust Score Calculation =====
  calculateTrustScore: (sellerId) => {
    const state = get();
    const seller = state.sellers.find((s) => s.id === sellerId);
    if (!seller) return 0;

    let score = 50; // Base score

    // Success rate (0-30 points)
    score += (seller.successRate / 100) * 30;

    // Sales count (0-15 points)
    const maxSales = 500;
    score += Math.min((seller.totalSales / maxSales) * 15, 15);

    // Verification documents (0-5 points)
    score += Math.min((seller.documents.length / 4) * 5, 5);

    // Badges (0-5 points)
    score += Math.min((seller.badges.length / 5) * 5, 5);

    return Math.round(Math.min(score, 100));
  },

  // ===== Tier Management =====
  getSellerTier: (sellerId) => {
    const state = get();
    const seller = state.sellers.find((s) => s.id === sellerId);
    if (!seller) return 'bronze';
    return seller.verificationTier;
  },

  determineTierByScore: (trustScore) => {
    if (trustScore >= 95) return 'platinum';
    if (trustScore >= 85) return 'gold';
    if (trustScore >= 70) return 'silver';
    return 'bronze';
  },

  // ===== Badge Management =====
  addBadge: (sellerId, badgeId) =>
    set((state) => ({
      sellers: state.sellers.map((s) => {
        if (s.id === sellerId) {
          const badge = state.allBadges.find((b) => b.id === badgeId);
          if (badge && !s.badges.find((b) => b.id === badgeId)) {
            return {
              ...s,
              badges: [
                ...s.badges,
                { ...badge, earned: new Date().toISOString().split('T')[0] },
              ],
            };
          }
        }
        return s;
      }),
    })),

  removeBadge: (sellerId, badgeId) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? { ...s, badges: s.badges.filter((b) => b.id !== badgeId) }
          : s
      ),
    })),

  getSellerBadges: (sellerId) => {
    const state = get();
    const seller = state.sellers.find((s) => s.id === sellerId);
    return seller?.badges || [];
  },

  // ===== Document Management =====
  uploadDocument: (sellerId, documentType, fileName) =>
    set((state) => ({
      sellers: state.sellers.map((s) => {
        if (s.id === sellerId) {
          const existingDoc = s.documents.find((d) => d.type === documentType);
          if (existingDoc) {
            return {
              ...s,
              documents: s.documents.map((d) =>
                d.type === documentType
                  ? {
                      ...d,
                      fileName,
                      status: 'pending',
                      uploadedAt: new Date().toISOString().split('T')[0],
                    }
                  : d
              ),
            };
          } else {
            return {
              ...s,
              documents: [
                ...s.documents,
                {
                  id: s.documents.length + 1,
                  type: documentType,
                  fileName,
                  status: 'pending',
                  uploadedAt: new Date().toISOString().split('T')[0],
                },
              ],
            };
          }
        }
        return s;
      }),
    })),

  verifyDocument: (sellerId, documentId) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              documents: s.documents.map((d) =>
                d.id === documentId ? { ...d, status: 'verified' } : d
              ),
            }
          : s
      ),
    })),

  rejectDocument: (sellerId, documentId, reason) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              documents: s.documents.map((d) =>
                d.id === documentId
                  ? { ...d, status: 'rejected', rejectionReason: reason }
                  : d
              ),
            }
          : s
      ),
    })),

  // ===== Verification Status =====
  submitVerification: (sellerId) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? { ...s, verificationStatus: 'pending' }
          : s
      ),
    })),

  updateVerificationStatus: (sellerId, status) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              verificationStatus: status,
              verificationDate: status === 'verified' ? new Date().toISOString().split('T')[0] : s.verificationDate,
            }
          : s
      ),
    })),

  // ===== Category Verification =====
  verifyCategoryForSeller: (sellerId, category, level) =>
    set((state) => ({
      sellers: state.sellers.map((s) => {
        if (s.id === sellerId) {
          const existing = s.categoryVerifications.find((c) => c.category === category);
          if (existing) {
            return {
              ...s,
              categoryVerifications: s.categoryVerifications.map((c) =>
                c.category === category ? { ...c, verified: true, level } : c
              ),
            };
          } else {
            return {
              ...s,
              categoryVerifications: [
                ...s.categoryVerifications,
                { category, verified: true, level, sales: 0 },
              ],
            };
          }
        }
        return s;
      }),
    })),

  // ===== Owner Verification Actions =====
  approveVerification: (sellerId, notes = '') =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              verificationStatus: 'verified',
              verificationDate: new Date().toISOString().split('T')[0],
              verificationNotes: notes,
            }
          : s
      ),
    })),

  rejectVerification: (sellerId, reason = '') =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              verificationStatus: 'rejected',
              rejectionReason: reason,
              verificationNotes: reason,
            }
          : s
      ),
    })),

  resetVerificationRequest: (sellerId) =>
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === sellerId
          ? { ...s, verificationStatus: 'pending', verificationNotes: '' }
          : s
      ),
    })),

  getVerificationNotes: (sellerId) => {
    const state = get();
    const seller = state.sellers.find((s) => s.id === sellerId);
    return seller?.verificationNotes || '';
  },

  // ===== Query Methods =====
  getVerifiedSellers: () => {
    const state = get();
    return state.sellers.filter((s) => s.verificationStatus === 'verified');
  },

  getPendingVerifications: () => {
    const state = get();
    return state.sellers.filter((s) => s.verificationStatus === 'pending');
  },

  getSellersByTier: (tier) => {
    const state = get();
    return state.sellers.filter((s) => s.verificationTier === tier);
  },

  getTopVerifiedSellers: (limit = 10) => {
    const state = get();
    return state.sellers
      .filter((s) => s.verificationStatus === 'verified')
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, limit);
  },

  searchSellersByName: (query) => {
    const state = get();
    return state.sellers.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  },
}));

export default useVerificationStore;
