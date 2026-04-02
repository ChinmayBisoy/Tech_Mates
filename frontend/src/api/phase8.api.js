import api from './axios'

/**
 * Phase 8 API Layer - Auctions, Escrow, and Dispute Management
 */

// ============================================================================
// AUCTIONS API
// ============================================================================

export const auctionAPI = {
  // Get all active auctions
  getActiveAuctions: async () => {
    const { data } = await api.get('/auctions/active')
    return data
  },

  // Get all auctions by status
  getAuctionsByStatus: async (status) => {
    const { data } = await api.get(`/auctions/status/${status}`)
    return data
  },

  // Get auction by ID
  getAuctionById: async (id) => {
    const { data } = await api.get(`/auctions/${id}`)
    return data
  },

  // Get user's auctions
  getUserAuctions: async (userId) => {
    const { data } = await api.get(`/auctions/user/${userId}`)
    return data
  },

  // Create new auction
  createAuction: async (auctionData) => {
    const { data } = await api.post('/auctions', auctionData)
    return data
  },

  // Update auction
  updateAuction: async (id, updateData) => {
    const { data } = await api.put(`/auctions/${id}`, updateData)
    return data
  },

  // Delete auction
  deleteAuction: async (id) => {
    const { data } = await api.delete(`/auctions/${id}`)
    return data
  },

  // Search auctions
  searchAuctions: async (query) => {
    const { data } = await api.get('/auctions/search', {
      params: { q: query },
    })
    return data
  },

  // Filter auctions by category
  filterByCategory: async (category) => {
    const { data } = await api.get('/auctions/filter/category', {
      params: { category },
    })
    return data
  },
}

// ============================================================================
// BIDDING API
// ============================================================================

export const biddingAPI = {
  // Place a bid
  placeBid: async (auctionId, bidAmount) => {
    const { data } = await api.post(`/bids/${auctionId}`, {
      amount: bidAmount,
    })
    return data
  },

  // Get bid history for auction
  getBidHistory: async (auctionId) => {
    const { data } = await api.get(`/bids/auction/${auctionId}/history`)
    return data
  },

  // Get user's bids
  getUserBids: async (userId) => {
    const { data } = await api.get(`/bids/user/${userId}`)
    return data
  },

  // Retract bid
  retractBid: async (bidId) => {
    const { data } = await api.delete(`/bids/${bidId}`)
    return data
  },

  // Get top bids for auction
  getTopBids: async (auctionId, limit = 10) => {
    const { data } = await api.get(`/bids/auction/${auctionId}/top`, {
      params: { limit },
    })
    return data
  },

  // Auto-bid setup
  setupAutoBid: async (auctionId, maxBidAmount) => {
    const { data } = await api.post(`/bids/auto/${auctionId}`, {
      maxAmount: maxBidAmount,
    })
    return data
  },
}

// ============================================================================
// ESCROW API
// ============================================================================

export const escrowAPI = {
  // Get all escrow transactions
  getEscrows: async () => {
    const { data } = await api.get('/escrow')
    return data
  },

  // Get escrow by ID
  getEscrowById: async (id) => {
    const { data } = await api.get(`/escrow/${id}`)
    return data
  },

  // Get user's escrows (as buyer or seller)
  getUserEscrows: async (userId) => {
    const { data } = await api.get(`/escrow/user/${userId}`)
    return data
  },

  // Get escrows by status
  getEscrowsByStatus: async (status) => {
    const { data } = await api.get(`/escrow/status/${status}`)
    return data
  },

  // Create new escrow transaction
  createEscrow: async (escrowData) => {
    const { data } = await api.post('/escrow', escrowData)
    return data
  },

  // Update milestone
  updateMilestone: async (escrowId, milestoneId, updateData) => {
    const { data } = await api.put(`/escrow/${escrowId}/milestone/${milestoneId}`, updateData)
    return data
  },

  // Request payment release
  requestPaymentRelease: async (escrowId, milestoneId) => {
    const { data } = await api.post(`/escrow/${escrowId}/milestone/${milestoneId}/release-request`)
    return data
  },

  // Approve payment release
  approvePaymentRelease: async (escrowId, milestoneId) => {
    const { data } = await api.post(`/escrow/${escrowId}/milestone/${milestoneId}/approve-release`)
    return data
  },

  // Get payment releases for escrow
  getPaymentReleases: async (escrowId) => {
    const { data } = await api.get(`/escrow/${escrowId}/releases`)
    return data
  },

  // Get milestone details
  getMilestoneDetails: async (escrowId, milestoneId) => {
    const { data } = await api.get(`/escrow/${escrowId}/milestone/${milestoneId}`)
    return data
  },
}

// ============================================================================
// DISPUTE API
// ============================================================================

export const disputeAPI = {
  // Get all disputes
  getDisputes: async () => {
    const { data } = await api.get('/disputes')
    return data
  },

  // Get dispute by ID
  getDisputeById: async (id) => {
    const { data } = await api.get(`/disputes/${id}`)
    return data
  },

  // Get user's disputes
  getUserDisputes: async (userId) => {
    const { data } = await api.get(`/disputes/user/${userId}`)
    return data
  },

  // Get disputes by status
  getDisputesByStatus: async (status) => {
    const { data } = await api.get(`/disputes/status/${status}`)
    return data
  },

  // Get disputes by priority
  getDisputesByPriority: async (priority) => {
    const { data } = await api.get(`/disputes/priority/${priority}`)
    return data
  },

  // Create new dispute
  createDispute: async (disputeData) => {
    const { data } = await api.post('/disputes', disputeData)
    return data
  },

  // Add evidence
  addEvidence: async (disputeId, evidenceData) => {
    const formData = new FormData()
    formData.append('type', evidenceData.type)
    formData.append('content', evidenceData.content)
    if (evidenceData.files && evidenceData.files.length > 0) {
      evidenceData.files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
    }
    const { data } = await api.post(`/disputes/${disputeId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Add message/comment
  addMessage: async (disputeId, message) => {
    const { data } = await api.post(`/disputes/${disputeId}/message`, {
      content: message,
    })
    return data
  },

  // Submit dispute for review
  submitForReview: async (disputeId) => {
    const { data } = await api.post(`/disputes/${disputeId}/submit-review`)
    return data
  },

  // Get dispute timeline
  getDisputeTimeline: async (disputeId) => {
    const { data } = await api.get(`/disputes/${disputeId}/timeline`)
    return data
  },

  // Resolve dispute (admin only)
  resolveDispute: async (disputeId, resolutionData) => {
    const { data } = await api.post(`/disputes/${disputeId}/resolve`, resolutionData)
    return data
  },

  // Get dispute statistics
  getDisputeStats: async () => {
    const { data } = await api.get('/disputes/stats/overview')
    return data
  },

  // Get disputes for arbitrator
  getArbitratorDisputes: async (arbitratorId) => {
    const { data } = await api.get(`/disputes/arbitrator/${arbitratorId}`)
    return data
  },
}

// ============================================================================
// COMBINED MARKETPLACE API
// ============================================================================

export const marketplaceAPI = {
  // Get marketplace dashboard stats
  getMarketplaceStats: async () => {
    const { data } = await api.get('/marketplace/stats')
    return data
  },

  // Get activity feed
  getActivityFeed: async (limit = 20) => {
    const { data } = await api.get('/marketplace/activity', {
      params: { limit },
    })
    return data
  },

  // Get trending auctions
  getTrendingAuctions: async (limit = 10) => {
    const { data } = await api.get('/marketplace/trending', {
      params: { limit },
    })
    return data
  },

  // Get top sellers
  getTopSellers: async (limit = 10) => {
    const { data } = await api.get('/marketplace/top-sellers', {
      params: { limit },
    })
    return data
  },

  // Get recommendations
  getRecommendations: async (userId) => {
    const { data } = await api.get(`/marketplace/recommendations/${userId}`)
    return data
  },
}

export default {
  auctionAPI,
  biddingAPI,
  escrowAPI,
  disputeAPI,
  marketplaceAPI,
}
