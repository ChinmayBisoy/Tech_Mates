import { create } from 'zustand';

const useOwnerStore = create((set, get) => ({
  // Owner Authentication
  isOwnerLoggedIn: false,
  ownerEmail: null,
  ownerRole: 'owner',

  // User Management
  allUsers: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seller', status: 'active', joinDate: '2024-01-15', totalSpent: 5200, totalEarned: 12500, verified: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'buyer', status: 'active', joinDate: '2024-02-10', totalSpent: 3400, totalEarned: 0, verified: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'seller', status: 'suspended', joinDate: '2023-11-20', totalSpent: 0, totalEarned: 8900, verified: false },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'buyer', status: 'active', joinDate: '2024-03-05', totalSpent: 7650, totalEarned: 0, verified: true },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'seller', status: 'active', joinDate: '2024-01-01', totalSpent: 1200, totalEarned: 45000, verified: true },
  ],

  // Disputes Management
  disputes: [
    { id: 1, sellerId: 1, buyerId: 2, auctionId: 101, status: 'open', title: 'Item not as described', amount: 250, dateCreated: '2024-03-20', evidence: 'Photos attached', resolution: null },
    { id: 2, sellerId: 5, buyerId: 4, auctionId: 105, status: 'resolved', title: 'Damaged during shipping', amount: 150, dateCreated: '2024-03-15', evidence: 'Video proof', resolution: 'Refund issued - $150' },
    { id: 3, sellerId: 1, buyerId: 1, auctionId: 102, status: 'open', title: 'Payment not received', amount: 500, dateCreated: '2024-03-22', evidence: 'Transaction ID: TXN123', resolution: null },
  ],

  // Transaction Monitoring
  allTransactions: [
    { id: 1, type: 'purchase', amount: 250, buyer: 'Jane Smith', seller: 'John Doe', date: '2024-03-20', status: 'completed', escrowStatus: 'released' },
    { id: 2, type: 'purchase', amount: 500, buyer: 'Sarah Williams', seller: 'Tom Brown', date: '2024-03-21', status: 'completed', escrowStatus: 'released' },
    { id: 3, type: 'commission', amount: 75, buyer: null, seller: null, date: '2024-03-22', status: 'pending', escrowStatus: 'pending' },
    { id: 4, type: 'purchase', amount: 150, buyer: 'Sarah Williams', seller: 'Tom Brown', date: '2024-03-22', status: 'pending', escrowStatus: 'held' },
    { id: 5, type: 'refund', amount: 250, buyer: 'John Doe', seller: 'Jane Smith', date: '2024-03-21', status: 'completed', escrowStatus: 'returned' },
  ],

  // Platform Reports & Analytics
  platformAnalytics: {
    totalUsers: 5,
    totalSellers: 3,
    totalBuyers: 2,
    activeListings: 42,
    totalTransactions: 250,
    totalRevenue: 45000,
    platformCommission: 4500,
    pendingDisputes: 2,
    resolvedDisputes: 98,
  },

  // Reported Content
  reportedContent: [
    { id: 1, type: 'listing', contentId: 101, reportedBy: 'Jane Smith', reason: 'Inappropriate content', status: 'pending', dateReported: '2024-03-20', description: 'Offensive title and images' },
    { id: 2, type: 'user', contentId: 3, reportedBy: 'Sarah Williams', reason: 'Fraudulent behavior', status: 'under-review', dateReported: '2024-03-21', description: 'Multiple dispute complaints' },
    { id: 3, type: 'message', contentId: 501, reportedBy: 'Mike Johnson', reason: 'Harassment', status: 'resolved', dateReported: '2024-03-15', description: 'Abusive language in messages' },
  ],

  // Platform Settings
  platformSettings: {
    commissionRate: 10,
    minListingPrice: 5,
    maxListingPrice: 100000,
    escrowHoldDays: 7,
    disputeResolutionDays: 14,
    platformName: 'Tech-Mates',
    maintenanceMode: false,
    suspicionThreshold: 5,
  },

  // ===== Owner Login =====
  loginOwner: (email, password) => {
    // Mock validation with env variables (in production, validate against backend)
    const envEmail = import.meta.env.VITE_OWNER_EMAIL || 'admin@tech-mates.com';
    const envPassword = import.meta.env.VITE_OWNER_PASSWORD || 'owner123';

    if (email === envEmail && password === envPassword) {
      set({ 
        isOwnerLoggedIn: true, 
        ownerEmail: email 
      });
      return { success: true, message: 'Owner logged in successfully' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  logoutOwner: () => set({ isOwnerLoggedIn: false, ownerEmail: null }),

  // ===== User Management =====
  suspendUser: (userId) => set((state) => ({
    allUsers: state.allUsers.map(user => 
      user.id === userId ? { ...user, status: 'suspended' } : user
    )
  })),

  activateUser: (userId) => set((state) => ({
    allUsers: state.allUsers.map(user => 
      user.id === userId ? { ...user, status: 'active' } : user
    )
  })),

  banUser: (userId) => set((state) => ({
    allUsers: state.allUsers.map(user => 
      user.id === userId ? { ...user, status: 'banned' } : user
    )
  })),

  verifyUser: (userId) => set((state) => ({
    allUsers: state.allUsers.map(user => 
      user.id === userId ? { ...user, verified: true } : user
    )
  })),

  // ===== Dispute Resolution =====
  resolveDispute: (disputeId, resolution) => set((state) => ({
    disputes: state.disputes.map(dispute => 
      dispute.id === disputeId ? { ...dispute, status: 'resolved', resolution } : dispute
    )
  })),

  rejectDispute: (disputeId) => set((state) => ({
    disputes: state.disputes.map(dispute => 
      dispute.id === disputeId ? { ...dispute, status: 'rejected' } : dispute
    )
  })),

  getOpenDisputes: () => {
    const state = get();
    return state.disputes.filter(d => d.status === 'open');
  },

  // ===== Content Moderation =====
  removeContent: (contentId) => set((state) => ({
    reportedContent: state.reportedContent.map(content =>
      content.id === contentId ? { ...content, status: 'removed' } : content
    )
  })),

  approveContent: (contentId) => set((state) => ({
    reportedContent: state.reportedContent.map(content =>
      content.id === contentId ? { ...content, status: 'approved' } : content
    )
  })),

  getPendingReports: () => {
    const state = get();
    return state.reportedContent.filter(c => c.status === 'pending' || c.status === 'under-review');
  },

  // ===== Platform Settings =====
  updateCommissionRate: (rate) => set((state) => ({
    platformSettings: { ...state.platformSettings, commissionRate: rate }
  })),

  updateDisputeResolutionDays: (days) => set((state) => ({
    platformSettings: { ...state.platformSettings, disputeResolutionDays: days }
  })),

  toggleMaintenanceMode: () => set((state) => ({
    platformSettings: { ...state.platformSettings, maintenanceMode: !state.platformSettings.maintenanceMode }
  })),

  updatePriceRange: (min, max) => set((state) => ({
    platformSettings: { 
      ...state.platformSettings, 
      minListingPrice: min,
      maxListingPrice: max
    }
  })),

  // ===== Analytics & Reports =====
  getDisputeStats: () => {
    const state = get();
    return {
      open: state.disputes.filter(d => d.status === 'open').length,
      resolved: state.disputes.filter(d => d.status === 'resolved').length,
      rejected: state.disputes.filter(d => d.status === 'rejected').length,
    };
  },

  getRevenueReport: (period = '30days') => {
    const state = get();
    // Mock revenue data
    const revenueData = [
      { date: 'Mar 21', revenue: 1500, commission: 150 },
      { date: 'Mar 22', revenue: 2000, commission: 200 },
      { date: 'Mar 23', revenue: 1800, commission: 180 },
    ];
    return { period, data: revenueData, total: state.platformAnalytics.totalRevenue };
  },

  getUserGrowthStats: () => {
    const state = get();
    return {
      totalUsers: state.platformAnalytics.totalUsers,
      sellers: state.platformAnalytics.totalSellers,
      buyers: state.platformAnalytics.totalBuyers,
      growth: '+12%',
    };
  },

  // ===== Helpers =====
  getUserById: (userId) => {
    const state = get();
    return state.allUsers.find(u => u.id === userId);
  },

  getDisputeById: (disputeId) => {
    const state = get();
    return state.disputes.find(d => d.id === disputeId);
  },

  getReportById: (reportId) => {
    const state = get();
    return state.reportedContent.find(c => c.id === reportId);
  },
}));

export default useOwnerStore;
