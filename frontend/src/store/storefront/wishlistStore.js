import { create } from 'zustand'

const useWishlistStore = create((set, get) => ({
  wishlists: [
    {
      id: 1,
      userId: 1,
      name: 'My Wishlist',
      description: 'Products I want to buy',
      isPublic: false,
      items: [
        { id: 101, productId: 101, price: 2500, addedDate: new Date(), priceHistory: [2500, 2450] },
        { id: 102, productId: 102, price: 1500, addedDate: new Date(), priceHistory: [1500] }
      ],
      followers: [2, 3],
      createdDate: new Date(),
      sharedWith: [],
      tags: ['work', 'projects']
    }
  ],

  addToWishlist: (userId, productId, price) =>
    set((state) => ({
      wishlists: state.wishlists.map(w =>
        w.userId === userId
          ? {
            ...w,
            items: [
              ...w.items,
              { id: Date.now(), productId, price, addedDate: new Date(), priceHistory: [price] }
            ]
          }
          : w
      )
    })),

  removeFromWishlist: (wislistId, itemId) =>
    set((state) => ({
      wishlists: state.wishlists.map(w =>
        w.id === wislistId
          ? { ...w, items: w.items.filter(i => i.id !== itemId) }
          : w
      )
    })),

  getUserWishlists: (userId) => get().wishlists.filter(w => w.userId === userId),

  createWishlist: (userId, name, description) =>
    set((state) => ({
      wishlists: [
        ...state.wishlists,
        {
          id: Date.now(),
          userId,
          name,
          description,
          isPublic: false,
          items: [],
          followers: [],
          createdDate: new Date(),
          sharedWith: [],
          tags: []
        }
      ]
    })),

  shareWishlist: (wishlistId, withUserIds) =>
    set((state) => ({
      wishlists: state.wishlists.map(w =>
        w.id === wishlistId
          ? { ...w, sharedWith: withUserIds, isPublic: true }
          : w
      )
    })),

  watchPriceChanges: (wishlistId, itemId) => {
    const wishlist = get().wishlists.find(w => w.id === wishlistId)
    const item = wishlist?.items.find(i => i.id === itemId)
    return item?.priceHistory || []
  },

  getAveragePrice: (wishlistId) => {
    const wishlist = get().wishlists.find(w => w.id === wishlistId)
    const total = wishlist?.items.reduce((sum, item) => sum + item.price, 0) || 0
    return Math.round(total / (wishlist?.items.length || 1))
  },

  getSavingsOpportunities: (wishlistId) => {
    const wishlist = get().wishlists.find(w => w.id === wishlistId)
    return wishlist?.items
      .map(item => ({
        itemId: item.id,
        discount: Math.round((item.priceHistory[0] - item.price) / item.priceHistory[0] * 100)
      }))
      .filter(s => s.discount > 0) || []
  }
}))

export default useWishlistStore
