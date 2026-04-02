import { create } from 'zustand'

const useRecommendationStore = create((set, get) => ({
  recommendations: [
    {
      id: 1,
      userId: 1,
      products: [
        { productId: 101, title: 'Web Dev Service', score: 0.95, reason: 'Based on your browsing' },
        { productId: 102, title: 'App Development', score: 0.88, reason: 'Similar to purchases' },
        { productId: 103, title: 'Consulting', score: 0.82, reason: 'Trending in your category' }
      ],
      sellers: [
        { sellerId: 5, name: 'Tech Solutions', score: 0.92 },
        { sellerId: 6, name: 'Dev Pro', score: 0.85 }
      ],
      categories: ['Development', 'Consulting', 'Design'],
      viewHistory: [],
      purchaseHistory: [],
      lastUpdated: new Date()
    }
  ],

  viewedProducts: {},
  purchaseHistory: {},

  getRecommendations: (userId) => {
    const recs = get().recommendations.find(r => r.userId === userId)
    return recs?.products || []
  },

  getRecommendedSellers: (userId) => {
    const recs = get().recommendations.find(r => r.userId === userId)
    return recs?.sellers || []
  },

  trackProductView: (userId, productId) => 
    set((state) => {
      const tracking = state.viewedProducts[userId] || []
      return {
        viewedProducts: {
          ...state.viewedProducts,
          [userId]: [...tracking, { productId, timestamp: Date.now() }].slice(-50)
        }
      }
    }),

  trackPurchase: (userId, productId) =>
    set((state) => {
      const history = state.purchaseHistory[userId] || []
      return {
        purchaseHistory: {
          ...state.purchaseHistory,
          [userId]: [...history, { productId, timestamp: Date.now() }]
        }
      }
    }),

  generatePersonalizedRecs: (userId) => {
    const views = get().viewedProducts[userId] || []
    const purchases = get().purchaseHistory[userId] || []
    
    return {
      products: views.slice(-5).map((v, i) => ({
        productId: v.productId,
        score: 0.7 + (i * 0.05),
        reason: 'Based on your browsing'
      })),
      sellers: [],
      categories: []
    }
  },

  getAIRecommendations: (userId, limit = 5) => get().getRecommendations(userId).slice(0, limit),

  getRelatedProducts: (productId) => [
    { productId: productId + 1, similarity: 0.92 },
    { productId: productId + 2, similarity: 0.85 },
    { productId: productId + 3, similarity: 0.78 }
  ],

  getTrendingProducts: () => [
    { productId: 101, trend: 0.95 },
    { productId: 102, trend: 0.88 },
    { productId: 103, trend: 0.82 }
  ]
}))

export default useRecommendationStore
