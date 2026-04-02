import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  // Time period
  timePeriod: 'month',
  
  // Seller KPIs
  sellerKPIs: {
    totalSales: 12450.75,
    salesChange: 12.5,
    activeListings: 24,
    listingsChange: 3,
    averageRating: 4.8,
    ratingChange: 0.2,
    completionRate: 98.5,
    completionRateChange: 1.2,
    totalEarnings: 98750.25,
    netEarnings: 94250.25,
    monthlyEarnings: 8240.50,
    topCategory: 'Vintage Electronics',
  },

  // Buyer KPIs
  buyerKPIs: {
    totalSpent: 8750.25,
    spentChange: 5.8,
    itemsPurchased: 42,
    itemsChange: 8,
    averageOrderValue: 208.34,
    averageOrderChange: -2.3,
    favoriteSellers: 12,
    wishlistItems: 48,
    activeAuctions: 7,
    activeBids: 15,
  },

  // Revenue chart data (last 30 days)
  revenueData: [
    { date: '2025-02-25', revenue: 850 },
    { date: '2025-02-26', revenue: 1200 },
    { date: '2025-02-27', revenue: 950 },
    { date: '2025-02-28', revenue: 1450 },
    { date: '2025-03-01', revenue: 1100 },
    { date: '2025-03-02', revenue: 1350 },
    { date: '2025-03-03', revenue: 800 },
    { date: '2025-03-04', revenue: 1600 },
    { date: '2025-03-05', revenue: 1250 },
    { date: '2025-03-06', revenue: 1400 },
    { date: '2025-03-07', revenue: 1550 },
    { date: '2025-03-08', revenue: 1300 },
    { date: '2025-03-09', revenue: 1700 },
    { date: '2025-03-10', revenue: 1450 },
    { date: '2025-03-11', revenue: 1600 },
    { date: '2025-03-12', revenue: 1350 },
    { date: '2025-03-13', revenue: 1800 },
    { date: '2025-03-14', revenue: 1500 },
    { date: '2025-03-15', revenue: 1650 },
    { date: '2025-03-16', revenue: 1400 },
    { date: '2025-03-17', revenue: 1750 },
    { date: '2025-03-18', revenue: 1550 },
    { date: '2025-03-19', revenue: 1900 },
    { date: '2025-03-20', revenue: 1600 },
    { date: '2025-03-21', revenue: 1450 },
    { date: '2025-03-22', revenue: 1700 },
    { date: '2025-03-23', revenue: 1350 },
    { date: '2025-03-24', revenue: 1800 },
    { date: '2025-03-25', revenue: 1550 },
    { date: '2025-03-26', revenue: 1650 },
  ],

  // Sales by category
  categoryPerformance: [
    { category: 'Vintage Electronics', sales: 3450, percentage: 24.8, trend: 'up' },
    { category: 'Collectibles', sales: 2890, percentage: 20.7, trend: 'up' },
    { category: 'Furniture', sales: 2450, percentage: 17.6, trend: 'down' },
    { category: 'Artwork', sales: 2100, percentage: 15.1, trend: 'flat' },
    { category: 'Jewelry', sales: 1560, percentage: 11.2, trend: 'up' },
    { category: 'Other', sales: 1940, percentage: 10.6, trend: 'down' },
  ],

  // Top performing auctions
  topAuctions: [
    { id: 1, title: 'Vintage Apple Computer', sold: true, finalPrice: 4500, views: 1250, bids: 23, roi: 45 },
    { id: 2, title: 'Rare Comic Book Collection', sold: true, finalPrice: 3200, views: 890, bids: 18, roi: 60 },
    { id: 3, title: 'Antique Clock', sold: true, finalPrice: 1850, views: 650, bids: 12, roi: 35 },
    { id: 4, title: 'Signed Photo', sold: true, finalPrice: 1200, views: 480, bids: 8, roi: 50 },
    { id: 5, title: 'Designer Handbag', sold: false, currentBid: 850, views: 320, bids: 5, roi: null },
  ],

  // Transaction trends
  transactionData: [
    { date: '2025-03-01', completed: 15, cancelled: 2, disputed: 1 },
    { date: '2025-03-08', completed: 28, cancelled: 3, disputed: 1 },
    { date: '2025-03-15', completed: 32, cancelled: 2, disputed: 2 },
    { date: '2025-03-22', completed: 35, cancelled: 4, disputed: 1 },
    { date: '2025-03-26', completed: 18, cancelled: 1, disputed: 0 },
  ],

  // Customer satisfaction
  satisfactionMetrics: {
    overallSatisfaction: 4.7,
    shippingSpeed: 4.6,
    itemAccuracy: 4.9,
    communication: 4.8,
    resolveIssues: 4.5,
  },

  // Conversion metrics
  conversionMetrics: {
    viewsToClicks: 42.5,
    clicksToWatchlist: 18.3,
    watchlistToAuction: 28.5,
    auctionToWin: 12.8,
    successfulTransactions: 98.5,
  },

  // Actions
  setTimePeriod: (period) => {
    set({ timePeriod: period });
  },

  updateSellerKPIs: (kpis) => {
    set((state) => ({
      sellerKPIs: {
        ...state.sellerKPIs,
        ...kpis,
      },
    }));
  },

  updateBuyerKPIs: (kpis) => {
    set((state) => ({
      buyerKPIs: {
        ...state.buyerKPIs,
        ...kpis,
      },
    }));
  },

  addRevenueDataPoint: (date, revenue) => {
    set((state) => ({
      revenueData: [
        ...state.revenueData,
        { date, revenue },
      ].slice(-30), // Keep last 30 days
    }));
  },

  getTotalRevenue: () => {
    return (state) => state.revenueData.reduce((sum, d) => sum + d.revenue, 0);
  },

  getAverageRevenue: () => {
    return (state) => {
      const total = state.revenueData.reduce((sum, d) => sum + d.revenue, 0);
      return total / state.revenueData.length;
    };
  },

  getHighestRevenueDay: () => {
    return (state) => {
      if (state.revenueData.length === 0) return null;
      return state.revenueData.reduce((max, d) => (d.revenue > max.revenue ? d : max));
    };
  },

  getCategoryStats: (categoryName) => {
    return (state) => state.categoryPerformance.find(c => c.category === categoryName);
  },

  getTopCategoryByPercentage: () => {
    return (state) => {
      if (state.categoryPerformance.length === 0) return null;
      return state.categoryPerformance.reduce((max, c) => (c.percentage > max.percentage ? c : max));
    };
  },

  generateMonthlyReport: () => {
    return (state) => ({
      period: state.timePeriod,
      sellerKPIs: state.sellerKPIs,
      buyerKPIs: state.buyerKPIs,
      totalRevenue: state.revenueData.reduce((sum, d) => sum + d.revenue, 0),
      categoryPerformance: state.categoryPerformance,
      topAuctions: state.topAuctions,
      satisfactionMetrics: state.satisfactionMetrics,
      generatedAt: new Date(),
    });
  },

  getPerformanceTrend: () => {
    return (state) => {
      const week1 = state.revenueData.slice(0, 7).reduce((sum, d) => sum + d.revenue, 0);
      const week4 = state.revenueData.slice(21, 28).reduce((sum, d) => sum + d.revenue, 0);
      return ((week4 - week1) / week1 * 100).toFixed(2);
    };
  },
}));
