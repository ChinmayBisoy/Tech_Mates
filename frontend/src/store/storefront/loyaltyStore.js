import { create } from 'zustand'

const useLoyaltyStore = create((set, get) => ({
  programs: [
    {
      id: 1,
      sellerId: 101,
      name: 'Tech Rewards',
      description: 'Earn points on every purchase',
      tier: {
        bronze: { minPoints: 0, benefits: ['1% bonus'] },
        silver: { minPoints: 500, benefits: ['2% bonus', 'Birthday discount'] },
        gold: { minPoints: 1500, benefits: ['3% bonus', 'Birthday discount', 'Early access'] },
        platinum: { minPoints: 5000, benefits: ['5% bonus', 'Everything', 'Concierge'] }
      },
      pointsPerDollar: 1,
      redeemRate: 100, // 100 points = $1
      isActive: true
    }
  ],

  memberAccounts: [
    {
      id: 1,
      userId: 1,
      sellerId: 101,
      currentPoints: 2340,
      tier: 'gold',
      joinDate: new Date(),
      lastPurchaseDate: new Date(),
      totalPointsEarned: 5600,
      totalPointsRedeemed: 3260,
      badges: ['Top Buyer', 'Loyalty Champion'],
      referrals: 5
    }
  ],

  joinLoyaltyProgram: (userId, sellerId) =>
    set((state) => ({
      memberAccounts: [
        ...state.memberAccounts,
        {
          id: Date.now(),
          userId,
          sellerId,
          currentPoints: 0,
          tier: 'bronze',
          joinDate: new Date(),
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
          badges: [],
          referrals: 0
        }
      ]
    })),

  earnPoints: (userId, sellerId, amount) => {
    const program = get().programs.find(p => p.sellerId === sellerId)
    const points = amount * (program?.pointsPerDollar || 1)
    
    set((state) => ({
      memberAccounts: state.memberAccounts.map(m =>
        m.userId === userId && m.sellerId === sellerId
          ? {
            ...m,
            currentPoints: m.currentPoints + points,
            totalPointsEarned: m.totalPointsEarned + points,
            lastPurchaseDate: new Date()
          }
          : m
      )
    }))
    return points
  },

  redeemPoints: (userId, sellerId, points) =>
    set((state) => ({
      memberAccounts: state.memberAccounts.map(m =>
        m.userId === userId && m.sellerId === sellerId && m.currentPoints >= points
          ? {
            ...m,
            currentPoints: m.currentPoints - points,
            totalPointsRedeemed: m.totalPointsRedeemed + points
          }
          : m
      )
    })),

  getMemberTier: (userId, sellerId) => {
    const member = get().memberAccounts.find(m => m.userId === userId && m.sellerId === sellerId)
    return member?.tier || 'bronze'
  },

  getMemberPoints: (userId, sellerId) => {
    const member = get().memberAccounts.find(m => m.userId === userId && m.sellerId === sellerId)
    return member?.currentPoints || 0
  },

  getBadges: (userId, sellerId) => {
    const member = get().memberAccounts.find(m => m.userId === userId && m.sellerId === sellerId)
    return member?.badges || []
  },

  getReferralBonus: (referrerId, referredUserId) => 100, // 100 points per referral
  
  getExclusiveDeals: (tier) => {
    const deals = {
      bronze: [],
      silver: [{ discount: 5, apply: 'Birthday discount' }],
      gold: [{ discount: 10, apply: 'Early access' }, { discount: 5, apply: 'Birthday' }],
      platinum: [{ discount: 20, apply: 'Exclusive items' }, { discount: 10, apply: 'Birthday' }]
    }
    return deals[tier] || []
  }
}))

export default useLoyaltyStore
