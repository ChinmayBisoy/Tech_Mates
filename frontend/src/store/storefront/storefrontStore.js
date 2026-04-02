import { create } from 'zustand'

const useStorefrontStore = create((set, get) => ({
  // State
  storefronts: [
    {
      id: 1,
      sellerId: 101,
      storeName: 'TechVision Store',
      description: 'Premium tech solutions for modern businesses',
      bannerImageUrl: 'https://via.placeholder.com/1200x300',
      logoUrl: 'https://via.placeholder.com/200x200',
      coverImageUrl: 'https://via.placeholder.com/1600x400',
      tagline: 'Innovation Delivered Daily',
      theme: 'modern',
      layout: 'grid',
      establishedDate: '2023-01-15',
      website: 'https://example.com',
      socialLinks: {
        twitter: 'https://twitter.com/example',
        linkedin: 'https://linkedin.com/company/example',
        instagram: 'https://instagram.com/example',
        facebook: 'https://facebook.com/example'
      },
      categories: ['Software', 'Consulting', 'Development'],
      isVerified: true,
      isPremium: true,
      followers: 2340,
      totalRatings: 4.8,
      totalReviews: 156,
      successRate: 98,
      responseTime: 2,
      productsCount: 45,
      viewsThisMonth: 5600,
      followers: [],
      featuredProducts: [101, 102, 103],
      aboutUs: 'We are dedicated to delivering exceptional tech solutions...',
      businessHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { closed: true }
      },
      shippingInfo: {
        domesticShippingDays: 3,
        internationalShippingDays: 7,
        freeShippingThreshold: 100,
        returnPolicyDays: 30
      },
      socialStats: {
        followers: 2340,
        reviews: 156,
        products: 45,
        activeListings: 42
      },
      customization: {
        primaryColor: '#3B82F6',
        accentColor: '#1F2937',
        fontFamily: 'Inter, sans-serif'
      },
      createdAt: '2023-01-15',
      updatedAt: '2024-03-25'
    }
  ],

  sellerProducts: {
    101: [
      {
        id: 101,
        name: 'Web Development Package',
        price: 2500,
        discountedPrice: 2200,
        rating: 4.9,
        reviews: 42,
        image: 'https://via.placeholder.com/300x300',
        category: 'Development',
        badge: 'bestseller',
        sales: 156
      },
      {
        id: 102,
        name: 'Mobile App Consultation',
        price: 1500,
        discountedPrice: 1200,
        rating: 4.7,
        reviews: 28,
        image: 'https://via.placeholder.com/300x300',
        category: 'Consulting',
        badge: 'trending',
        sales: 89
      },
      {
        id: 103,
        name: 'Cloud Infrastructure Setup',
        price: 3000,
        discountedPrice: 2700,
        rating: 4.8,
        reviews: 35,
        image: 'https://via.placeholder.com/300x300',
        category: 'Infrastructure',
        badge: 'featured',
        sales: 72
      }
    ]
  },

  storefrontFollowers: {
    1: [
      { id: 501, name: 'John Buyer', avatar: 'https://via.placeholder.com/40x40', joinedDate: '2024-01-15' },
      { id: 502, name: 'Jane Developer', avatar: 'https://via.placeholder.com/40x40', joinedDate: '2024-02-20' }
    ]
  },

  // Create Storefront
  createStorefront: (sellerId, storeData) =>
    set((state) => ({
      storefronts: [
        ...state.storefronts,
        {
          id: Math.max(...state.storefronts.map(s => s.id), 0) + 1,
          sellerId,
          ...storeData,
          followers: [],
          socialStats: { followers: 0, reviews: 0, products: 0, activeListings: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    })),

  // Get Storefront by ID
  getStorefront: (storefrontId) => {
    const storefront = get().storefronts.find(s => s.id === storefrontId)
    return storefront
  },

  // Get Storefront by Seller ID
  getStorefrontBySeller: (sellerId) => {
    const storefront = get().storefronts.find(s => s.sellerId === sellerId)
    return storefront
  },

  // Update Storefront
  updateStorefront: (storefrontId, updates) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
    })),

  // customize theme
  customizeTheme: (storefrontId, { primaryColor, accentColor, fontFamily }) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? {
            ...s,
            customization: { primaryColor, accentColor, fontFamily },
            updatedAt: new Date().toISOString()
          }
          : s
      )
    })),

  // Add Featured Product
  addFeaturedProduct: (storefrontId, productId) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? {
            ...s,
            featuredProducts: [...(s.featuredProducts || []), productId].slice(0, 5)
          }
          : s
      )
    })),

  // Remove Featured Product
  removeFeaturedProduct: (storefrontId, productId) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, featuredProducts: (s.featuredProducts || []).filter(id => id !== productId) }
          : s
      )
    })),

  // Add Follower
  addFollower: (storefrontId, userId) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, followers: [...(s.followers || []), userId] }
          : s
      )
    })),

  // Remove Follower
  removeFollower: (storefrontId, userId) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, followers: (s.followers || []).filter(id => id !== userId) }
          : s
      )
    })),

  // Update Business Hours
  updateBusinessHours: (storefrontId, businessHours) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, businessHours, updatedAt: new Date().toISOString() }
          : s
      )
    })),

  // Update Shipping Info
  updateShippingInfo: (storefrontId, shippingInfo) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, shippingInfo, updatedAt: new Date().toISOString() }
          : s
      )
    })),

  // Update Social Links
  updateSocialLinks: (storefrontId, socialLinks) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, socialLinks, updatedAt: new Date().toISOString() }
          : s
      )
    })),

  // Search Storefronts
  searchStorefronts: (query) =>
    get().storefronts.filter(s =>
      s.storeName.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
    ),

  // Get Featured Storefronts (Premium/Verified)
  getFeaturedStorefronts: () =>
    get().storefronts.filter(s => s.isPremium && s.isVerified),

  // Get Top Storefronts (by rating)
  getTopStorefronts: (limit = 10) =>
    get().storefronts.sort((a, b) => b.totalRatings - a.totalRatings).slice(0, limit),

  // Get Trending Storefronts (by views this month)
  getTrendingStorefronts: (limit = 10) =>
    get().storefronts.sort((a, b) => b.viewsThisMonth - a.viewsThisMonth).slice(0, limit),

  // Get Storefronts by Category
  getStorefrontsByCategory: (category) =>
    get().storefronts.filter(s => s.categories?.includes(category)),

  // Track Store View
  trackStoreView: (storefrontId) =>
    set((state) => ({
      storefronts: state.storefronts.map(s =>
        s.id === storefrontId
          ? { ...s, viewsThisMonth: (s.viewsThisMonth || 0) + 1 }
          : s
      )
    })),

  // Get Store Stats
  getStoreStats: (storefrontId) => {
    const storefront = get().getStorefront(storefrontId)
    if (!storefront) return null
    return {
      storeName: storefront.storeName,
      totalRatings: storefront.totalRatings,
      totalReviews: storefront.totalReviews,
      successRate: storefront.successRate,
      responseTime: storefront.responseTime,
      productsCount: storefront.productsCount,
      viewsThisMonth: storefront.viewsThisMonth,
      followers: storefront.followers?.length || 0
    }
  }
}))

export default useStorefrontStore
