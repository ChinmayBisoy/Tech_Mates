import axios from './axios';

/**
 * Purchase Dashboard API
 */
export const myPurchasesAPI = {
  // Get user's purchases
  getMyPurchases: async (page = 1, limit = 12, filters = {}) => {
    const response = await axios.get('/purchases/my', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get purchase detail
  getPurchaseDetail: async (purchaseId) => {
    const response = await axios.get(`/purchases/${purchaseId}`);
    return response.data;
  },

  // Download purchase file
  downloadFile: async (purchaseId) => {
    const response = await axios.get(`/purchases/${purchaseId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Leave review on purchase
  leavePurchaseReview: async (purchaseId, review) => {
    const response = await axios.post(`/purchases/${purchaseId}/review`, review);
    return response.data;
  },

  // Request support
  requestSupport: async (purchaseId, message) => {
    const response = await axios.post(`/purchases/${purchaseId}/support`, { message });
    return response.data;
  },

  // Request refund
  requestRefund: async (purchaseId, reason) => {
    const response = await axios.post(`/purchases/${purchaseId}/refund`, { reason });
    return response.data;
  },
};

/**
 * Listings Dashboard API
 */
export const myListingsAPI = {
  // Get user's listings
  getMyListings: async (page = 1, limit = 12, filters = {}) => {
    const response = await axios.get('/listings/my', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get listing detail
  getListingDetail: async (listingId) => {
    const response = await axios.get(`/listings/${listingId}`);
    return response.data;
  },

  // Update listing
  updateListing: async (listingId, data) => {
    const response = await axios.put(`/listings/${listingId}`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (listingId) => {
    const response = await axios.delete(`/listings/${listingId}`);
    return response.data;
  },

  // TODO: Listing stats endpoints not yet implemented
  // getListingStats: async (listingId) => { ... }
  // getAllListingsStats: async () => { ... }
};

/**
 * Review & Rating API
 */
export const reviewAPI = {
  // Get reviews for listing (via reviews API, not listings)
  getListingReviews: async (listingId, page = 1, limit = 10, sort = 'recent') => {
    const response = await axios.get(`/reviews/listing/${listingId}`, {
      params: { page, limit, sort },
    });
    return response.data;
  },

  // Submit review
  submitReview: async (data) => {
    const response = await axios.post('/reviews', data);
    return response.data;
  },

  // TODO: These endpoints are not yet implemented on backend
  // getMyReviews, updateReview, deleteReview, getReviewStats
};

/**
 * Wishlist API
 */
export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async (page = 1, limit = 12) => {
    const response = await axios.get('/wishlist', {
      params: { page, limit },
    });
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (listingId) => {
    const response = await axios.post('/wishlist', { listingId });
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (listingId) => {
    const response = await axios.delete(`/wishlist/${listingId}`);
    return response.data;
  },

  // TODO: These endpoints are not yet implemented
  // isInWishlist, clearWishlist
};

/**
 * Seller Analytics API
 * Uses admin analytics endpoints when available, with safe fallbacks for non-admin users.
 */
export const analyticsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await axios.get('/admin/analytics', {
        params: { range: 'today' },
      });

      const data = response.data || {};
      const summary = data.summary || {};

      return {
        totalRevenue: summary.revenue || 0,
        revenueChange: 0,
        totalSales: summary.totalPurchases || 0,
        salesChange: 0,
        averageRating: summary.avgRating || 0,
        ratingChange: 0,
        totalCustomers: summary.totalUsers || 0,
        customersChange: 0,
      };
    } catch (_error) {
      return {
        totalRevenue: 0,
        revenueChange: 0,
        totalSales: 0,
        salesChange: 0,
        averageRating: 0,
        ratingChange: 0,
        totalCustomers: 0,
        customersChange: 0,
      };
    }
  },

  getRevenueData: async () => {
    try {
      const response = await axios.get('/admin/analytics/revenue');
      return response.data || { chart: [] };
    } catch (_error) {
      return { chart: [] };
    }
  },

  getSalesData: async () => ({ items: [], max: 0 }),

  getTopListings: async () => ({ listings: [] }),

  getPerformanceMetrics: async () => ({}),
};
