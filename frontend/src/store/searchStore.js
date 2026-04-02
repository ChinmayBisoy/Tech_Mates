import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  // Current search query
  searchQuery: '',
  
  // Search filters
  filters: {
    categories: [],
    priceRange: { min: 0, max: 10000 },
    condition: [],
    seller: null,
    rating: 0,
    auctionType: [],
    sortBy: 'relevance',
    dateRange: { start: null, end: null },
  },

  // Search results
  searchResults: [
    {
      id: 1,
      type: 'auction',
      title: 'Vintage Apple Macintosh 128K',
      price: 1500,
      currentBid: 1200,
      seller: 'alice_seller',
      rating: 4.8,
      reviews: 156,
      image: 'https://via.placeholder.com/300x200?text=Mac+128K',
      condition: 'good',
      views: 450,
      bids: 12,
      timeLeft: '2d 5h',
    },
    {
      id: 2,
      type: 'auction',
      title: 'Rare Comic Book First Edition',
      price: 800,
      currentBid: 650,
      seller: 'bob_buyer',
      rating: 4.6,
      reviews: 89,
      image: 'https://via.placeholder.com/300x200?text=Comic+Book',
      condition: 'excellent',
      views: 320,
      bids: 8,
      timeLeft: '1d 3h',
    },
    {
      id: 3,
      type: 'auction',
      title: 'Antique Persian Rug',
      price: 2000,
      currentBid: 1800,
      seller: 'charlie_collector',
      rating: 4.9,
      reviews: 234,
      image: 'https://via.placeholder.com/300x200?text=Persian+Rug',
      condition: 'excellent',
      views: 680,
      bids: 18,
      timeLeft: '3d 6h',
    },
  ],

  // Trending searches
  trendingSearches: [
    { query: 'vintage watches', count: 5230, trend: 'up' },
    { query: 'collectible cards', count: 4120, trend: 'up' },
    { query: 'art prints', count: 3890, trend: 'flat' },
    { query: 'antique furniture', count: 3450, trend: 'down' },
    { query: 'gaming consoles', count: 3200, trend: 'up' },
  ],

  // Saved searches
  savedSearches: [
    {
      id: 'saved_1',
      name: 'Vintage Tech',
      query: 'vintage technology',
      filters: {
        categories: ['Electronics'],
        condition: ['excellent', 'good'],
        minPrice: 100,
        maxPrice: 5000,
      },
      createdAt: new Date(Date.now() - 2592000000),
      alertCount: 12,
    },
    {
      id: 'saved_2',
      name: 'Affordable Art',
      query: 'art',
      filters: {
        categories: ['Artwork'],
        minPrice: 50,
        maxPrice: 500,
      },
      createdAt: new Date(Date.now() - 1296000000),
      alertCount: 5,
    },
  ],

  // AI recommendations
  recommendations: [
    {
      id: 'rec_1',
      reason: 'Based on items you\'ve viewed',
      title: 'Vintage Film Camera',
      price: 450,
      seller: 'photo_seller',
      rating: 4.7,
      match: 92,
    },
    {
      id: 'rec_2',
      reason: 'Trending in your interests',
      title: 'Retro Game Console',
      price: 350,
      seller: 'gaming_store',
      rating: 4.8,
      match: 88,
    },
    {
      id: 'rec_3',
      reason: 'Similar to your purchases',
      title: 'Rare Vinyl Record',
      price: 180,
      seller: 'music_collector',
      rating: 4.6,
      match: 85,
    },
  ],

  // Recent searches
  recentSearches: [
    'vintage watches',
    'collectible coins',
    'antique clocks',
    'art deco furniture',
    'signed memorabilia',
  ],

  // Popular categories
  popularCategories: [
    { name: 'Vintage Electronics', count: 12450, trend: 'up' },
    { name: 'Collectibles', count: 10230, trend: 'up' },
    { name: 'Artwork', count: 8760, trend: 'flat' },
    { name: 'Furniture', count: 7450, trend: 'down' },
    { name: 'Jewelry', count: 6890, trend: 'up' },
  ],

  // Actions
  setSearchQuery: (query) => {
    set({
      searchQuery: query,
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        categories: [],
        priceRange: { min: 0, max: 10000 },
        condition: [],
        seller: null,
        rating: 0,
        auctionType: [],
        sortBy: 'relevance',
        dateRange: { start: null, end: null },
      },
    });
  },

  search: (query) => {
    set({
      searchQuery: query,
      recentSearches: [
        query,
        ...((state) => state.recentSearches
          .filter(s => s !== query)
          .slice(0, 4)
        ),
      ],
    });
  },

  addSavedSearch: (searchConfig) => {
    set((state) => ({
      savedSearches: [
        {
          id: `saved_${Date.now()}`,
          createdAt: new Date(),
          alertCount: 0,
          ...searchConfig,
        },
        ...state.savedSearches,
      ],
    }));
  },

  removeSavedSearch: (searchId) => {
    set((state) => ({
      savedSearches: state.savedSearches.filter(s => s.id !== searchId),
    }));
  },

  updateSavedSearch: (searchId, updates) => {
    set((state) => ({
      savedSearches: state.savedSearches.map(s =>
        s.id === searchId ? { ...s, ...updates } : s
      ),
    }));
  },

  addToRecentSearches: (query) => {
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter(s => s !== query).slice(0, 4),
      ],
    }));
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  filterResults: (results, filterCriteria) => {
    return results.filter(item => {
      if (filterCriteria.priceRange) {
        const price = item.currentBid || item.price;
        if (price < filterCriteria.priceRange.min || price > filterCriteria.priceRange.max)
          return false;
      }
      if (filterCriteria.minRating && item.rating < filterCriteria.minRating) return false;
      if (filterCriteria.condition && !filterCriteria.condition.includes(item.condition))
        return false;
      return true;
    });
  },

  sortResults: (results, sortBy) => {
    const sorted = [...results];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.currentBid || a.price) - (b.currentBid || b.price));
      case 'price-high':
        return sorted.sort((a, b) => (b.currentBid || b.price) - (a.currentBid || a.price));
      case 'newest':
        return sorted.reverse();
      case 'most-views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'ending-soon':
        return sorted.sort((a, b) => a.timeLeft?.localeCompare(b.timeLeft) || 0);
      default:
        return sorted;
    }
  },

  getRecommendationsForUser: () => {
    return (state) => state.recommendations;
  },

  searchByCategory: (category) => {
    return (state) =>
      state.searchResults.filter(r =>
        r.category?.toLowerCase().includes(category.toLowerCase())
      );
  },

  getPopularItems: () => {
    return (state) =>
      state.searchResults
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
  },

  getTrendingItems: () => {
    return (state) =>
      state.searchResults
        .filter(r => r.bids > 5)
        .sort((a, b) => b.bids - a.bids)
        .slice(0, 10);
  },
}));
