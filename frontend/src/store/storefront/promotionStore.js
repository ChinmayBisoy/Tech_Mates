import { create } from 'zustand'

const usePromotionStore = create((set, get) => ({
  promotions: [
    {
      id: 1,
      sellerId: 101,
      title: 'Spring Sale',
      description: '30% off all products',
      discountType: 'percentage',
      discountValue: 30,
      code: 'SPRING30',
      minPurchase: 100,
      maxDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicableProducts: [101, 102, 103],
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
      redemptions: []
    }
  ],

  createPromotion: (sellerId, promoData) =>
    set((state) => ({
      promotions: [
        ...state.promotions,
        { id: Date.now(), sellerId, ...promoData, usageCount: 0, redemptions: [] }
      ]
    })),

  applyPromoCode: (code, orderAmount) => {
    const promo = get().promotions.find(p => p.code === code && p.isActive)
    if (!promo || orderAmount < promo.minPurchase) return null
    
    const discount = promo.discountType === 'percentage'
      ? (orderAmount * promo.discountValue) / 100
      : promo.discountValue
    
    return Math.min(discount, promo.maxDiscount)
  },

  getValidPromotions: (sellerId) =>
    get().promotions.filter(p => p.sellerId === sellerId && p.isActive && new Date() < p.endDate),

  redeemPromoCode: (promotionId, userId) =>
    set((state) => ({
      promotions: state.promotions.map(p =>
        p.id === promotionId
          ? {
            ...p,
            usageCount: p.usageCount + 1,
            redemptions: [...p.redemptions, { userId, timestamp: Date.now() }]
          }
          : p
      )
    })),

  getFlashSales: () =>
    get().promotions.filter(p => p.isActive && p.discountValue >= 40),

  getSeasonalPromotions: () => [
    { season: 'Spring', discount: 30 },
    { season: 'Summer', discount: 40 },
    { season: 'Fall', discount: 25 },
    { season: 'Winter', discount: 50 }
  ],

  getBulkDiscounts: () => [
    { quantity: 5, discount: 5 },
    { quantity: 10, discount: 10 },
    { quantity: 20, discount: 15 },
    { quantity: 50, discount: 25 }
  ]
}))

export default usePromotionStore
