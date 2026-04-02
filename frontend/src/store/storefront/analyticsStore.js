import { create } from 'zustand'

const useAnalyticsStore = create((set, get) => ({
  sellerAnalytics: [
    {
      id: 1,
      sellerId: 101,
      period: 'monthly',
      views: 5600,
      clicks: 1240,
      conversions: 234,
      revenue: 45600,
      orders: 234,
      averageOrderValue: 195,
      topProducts: [101, 102, 103],
      trafficSources: { direct: 40, organic: 35, referral: 25 },
      conversionRate: 18.8,
      customerAcquisitionCost: 12.50,
      repeatCustomerRate: 35,
      avgCustomerLifetimeValue: 450,
      graph: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        revenue: [9500, 11200, 8900, 16000],
        orders: [45, 52, 41, 96]
      }
    }
  ],

  buyerAnalytics: [
    {
      id: 1,
      userId: 1,
      totalSpent: 12340,
      totalOrders: 28,
      averageOrderValue: 441,
      favoriteCategories: ['Development', 'Consulting'],
      mostFrequentSeller: 101,
      wishlistItems: 15,
      reviewsWritten: 23
    }
  ],

  getSellerAnalytics: (sellerId) =>
    get().sellerAnalytics.find(a => a.sellerId === sellerId),

  getBuyerAnalytics: (userId) =>
    get().buyerAnalytics.find(a => a.userId === userId),

  trackPageView: (sellerId) =>
    set((state) => ({
      sellerAnalytics: state.sellerAnalytics.map(a =>
        a.sellerId === sellerId ? { ...a, views: a.views + 1 } : a
      )
    })),

  trackConversion: (sellerId) =>
    set((state) => ({
      sellerAnalytics: state.sellerAnalytics.map(a =>
        a.sellerId === sellerId ? { ...a, conversions: a.conversions + 1 } : a
      )
    })),

  calculateMetrics: (sellerId) => {
    const analytics = get().getSellerAnalytics(sellerId)
    if (!analytics) return null
    return {
      conversionRate: ((analytics.conversions / analytics.views) * 100).toFixed(2),
      ctr: ((analytics.clicks / analytics.views) * 100).toFixed(2),
      aov: (analytics.revenue / analytics.orders).toFixed(2)
    }
  },

  getTopPerformingProducts: (sellerId, limit = 5) => {
    const analytics = get().getSellerAnalytics(sellerId)
    return analytics?.topProducts.slice(0, limit) || []
  },

  getTrafficAnalysis: (sellerId) => {
    const analytics = get().getSellerAnalytics(sellerId)
    return analytics?.trafficSources || {}
  }
}))

export default useAnalyticsStore
