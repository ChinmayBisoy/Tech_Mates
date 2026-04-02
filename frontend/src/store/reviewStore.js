import { create } from 'zustand';

const useReviewStore = create((set, get) => ({
  // All Reviews
  reviews: [
    {
      id: 1,
      productId: 101,
      userId: 1,
      userName: 'John Doe',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      rating: 5,
      title: 'Excellent quality!',
      content: 'Great product, exactly as described. Very satisfied with my purchase.',
      photos: ['https://via.placeholder.com/150?text=Photo1', 'https://via.placeholder.com/150?text=Photo2'],
      verifiedPurchase: true,
      date: '2024-03-20',
      helpfulCount: 24,
      unhelpfulCount: 2,
      isSeller: false,
      badges: ['verified-buyer', 'helpful-reviewer'],
      replies: [
        {
          id: 101,
          userId: 5,
          userName: 'Seller Response',
          content: 'Thank you for your kind review! We appreciate your business.',
          date: '2024-03-21',
          isSellerReply: true,
        },
      ],
    },
    {
      id: 2,
      productId: 101,
      userId: 2,
      userName: 'Jane Smith',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      rating: 4,
      title: 'Good, but slightly issue',
      content: 'Product arrived well packaged. One minor issue with the packaging but overall satisfied.',
      photos: [],
      verifiedPurchase: true,
      date: '2024-03-18',
      helpfulCount: 8,
      unhelpfulCount: 1,
      isSeller: false,
      badges: ['verified-buyer'],
      replies: [],
    },
    {
      id: 3,
      productId: 101,
      userId: 3,
      userName: 'Mike Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      rating: 3,
      title: 'Average product',
      content: 'It does what it says, but nothing special. Not worth the premium price.',
      photos: [],
      verifiedPurchase: false,
      date: '2024-03-15',
      helpfulCount: 5,
      unhelpfulCount: 3,
      isSeller: false,
      badges: [],
      replies: [],
    },
    {
      id: 4,
      productId: 101,
      userId: 4,
      userName: 'Sarah Williams',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      rating: 5,
      title: 'Amazing! Highly recommend',
      content: 'Best purchase I made this month. Great quality, fast shipping, excellent customer service.',
      photos: ['https://via.placeholder.com/150?text=Photo3'],
      verifiedPurchase: true,
      date: '2024-03-10',
      helpfulCount: 42,
      unhelpfulCount: 0,
      isSeller: false,
      badges: ['verified-buyer', 'helpful-reviewer', 'trusted-reviewer'],
      replies: [
        {
          id: 102,
          userId: 5,
          userName: 'Seller Response',
          content: 'Thank you Sarah! We hope to serve you again soon.',
          date: '2024-03-11',
          isSellerReply: true,
        },
      ],
    },
    {
      id: 5,
      productId: 101,
      userId: 6,
      userName: 'Tom Brown',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
      rating: 2,
      title: 'Not as advertised',
      content: 'Product is different from the listing pictures. Disappointed with quality.',
      photos: ['https://via.placeholder.com/150?text=Photo4'],
      verifiedPurchase: true,
      date: '2024-03-08',
      helpfulCount: 15,
      unhelpfulCount: 7,
      isSeller: false,
      badges: ['verified-buyer'],
      replies: [],
    },
  ],

  // User Reviews (what they posted)
  userReviews: [],

  // Review Statistics
  stats: {
    totalReviews: 5,
    averageRating: 4.2,
    ratingDistribution: {
      5: 2,
      4: 1,
      3: 1,
      2: 1,
      1: 0,
    },
    verifiedPurchaseCount: 4,
  },

  // Helpful Reviews (user marked as helpful)
  helpfulReviews: [],

  // ===== Review Operations =====
  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
      stats: {
        ...state.stats,
        totalReviews: state.stats.totalReviews + 1,
      },
    })),

  updateReview: (reviewId, updates) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, ...updates } : r)),
    })),

  deleteReview: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r.id !== reviewId),
      stats: {
        ...state.stats,
        totalReviews: state.stats.totalReviews - 1,
      },
    })),

  // ===== Helpful/Unhelpful Votes =====
  markHelpful: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      ),
      helpfulReviews: [...state.helpfulReviews, reviewId],
    })),

  markUnhelpful: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, unhelpfulCount: r.unhelpfulCount + 1 } : r
      ),
    })),

  isReviewHelpful: (reviewId) => {
    return get().helpfulReviews.includes(reviewId);
  },

  // ===== Reply to Reviews =====
  addReply: (reviewId, reply) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, replies: [...r.replies, reply] } : r
      ),
    })),

  deleteReply: (reviewId, replyId) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId
          ? { ...r, replies: r.replies.filter((rep) => rep.id !== replyId) }
          : r
      ),
    })),

  // ===== Review Filters & Sorting =====
  filterReviews: (productId, filters = {}) => {
    const state = get();
    let filtered = state.reviews.filter((r) => r.productId === productId);

    // Filter by rating
    if (filters.rating && filters.rating.length > 0) {
      filtered = filtered.filter((r) => filters.rating.includes(r.rating));
    }

    // Filter by verified purchase
    if (filters.verifiedOnly) {
      filtered = filtered.filter((r) => r.verifiedPurchase);
    }

    // Filter by photos
    if (filters.withPhotosOnly) {
      filtered = filtered.filter((r) => r.photos.length > 0);
    }

    // Sort
    if (filters.sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filters.sortBy === 'rating-high') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'rating-low') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  },

  // ===== User Badges =====
  getUserBadges: (userId) => {
    const state = get();
    const userReviews = state.reviews.filter((r) => r.userId === userId);
    const badges = [];

    // Trusted reviewer (5+ helpful reviews)
    const helpfulCount = userReviews.filter((r) => r.helpfulCount >= 5).length;
    if (helpfulCount >= 5) badges.push('trusted-reviewer');

    // Helpful reviewer (avg 8+ helpful votes)
    const avgHelpful = userReviews.reduce((sum, r) => sum + r.helpfulCount, 0) / userReviews.length;
    if (avgHelpful >= 8) badges.push('helpful-reviewer');

    // Verified buyer (all reviews have verified purchase)
    if (userReviews.every((r) => r.verifiedPurchase)) badges.push('verified-buyer');

    // Detailed reviewer (reviews with photos)
    const photoReviews = userReviews.filter((r) => r.photos.length > 0);
    if (photoReviews.length >= 3) badges.push('detailed-reviewer');

    return badges;
  },

  getReviewsForProduct: (productId) => {
    const state = get();
    return state.reviews.filter((r) => r.productId === productId);
  },

  getProductStats: (productId) => {
    const state = get();
    const productReviews = state.reviews.filter((r) => r.productId === productId);

    if (productReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedPurchaseCount: 0,
      };
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    let verifiedCount = 0;

    productReviews.forEach((r) => {
      ratingDistribution[r.rating]++;
      totalRating += r.rating;
      if (r.verifiedPurchase) verifiedCount++;
    });

    return {
      totalReviews: productReviews.length,
      averageRating: (totalRating / productReviews.length).toFixed(1),
      ratingDistribution,
      verifiedPurchaseCount: verifiedCount,
    };
  },

  // ===== Review Moderation =====
  flagReview: (reviewId, reason) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, flagged: true, flagReason: reason } : r
      ),
    })),

  unflagReview: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, flagged: false, flagReason: null } : r
      ),
    })),

  // ===== My Reviews (User Dashboard) =====
  getMyReviews: (userId) => {
    const state = get();
    return state.reviews.filter((r) => r.userId === userId);
  },

  getReviewById: (reviewId) => {
    const state = get();
    return state.reviews.find((r) => r.id === reviewId);
  },

  canUserReview: (userId, productId) => {
    // In real app, check if user purchased this product
    return true;
  },
}));

export default useReviewStore;
