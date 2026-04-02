import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useAuctionStore = create(
  subscribeWithSelector((set, get) => ({
    auctions: [
      {
        id: 'A001',
        title: 'Custom Website Development',
        description: 'Build a modern e-commerce website with React and Node.js',
        category: 'Web Development',
        currentBid: 2500,
        initialBid: 1500,
        totalBids: 12,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        owner: {
          name: 'Tech Solutions Ltd',
          avatar: '🏢',
          rating: 4.8,
          reviews: 156,
        },
        topBidder: {
          name: 'John Developer',
          avatar: '👨‍💻',
          bid: 2500,
        },
        image: '🌐',
      },
      {
        id: 'A002',
        title: 'Mobile App UI Design',
        description: 'Design a beautiful mobile app interface for iOS and Android',
        category: 'Design',
        currentBid: 1200,
        initialBid: 800,
        totalBids: 8,
        endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        owner: {
          name: 'Creative Agency',
          avatar: '🎨',
          rating: 4.9,
          reviews: 89,
        },
        topBidder: {
          name: 'Sarah Designer',
          avatar: '👩‍🎨',
          bid: 1200,
        },
        image: '📱',
      },
      {
        id: 'A003',
        title: 'Database Optimization',
        description: 'Optimize legacy database for 10x performance improvement',
        category: 'Development',
        currentBid: 3800,
        initialBid: 2000,
        totalBids: 15,
        endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        owner: {
          name: 'Enterprise Tech',
          avatar: '🔧',
          rating: 4.7,
          reviews: 203,
        },
        topBidder: {
          name: 'Alex Dev',
          avatar: '👨‍💼',
          bid: 3800,
        },
        image: '🗄️',
      },
      {
        id: 'A004',
        title: 'Brand Logo Design',
        description: 'Professional logo design for startup brand identity',
        category: 'Branding',
        currentBid: 650,
        initialBid: 350,
        totalBids: 5,
        endsAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'closed',
        owner: {
          name: 'Design Hub',
          avatar: '🎭',
          rating: 4.6,
          reviews: 124,
        },
        topBidder: {
          name: 'Lisa Brand',
          avatar: '👩‍🔬',
          bid: 650,
        },
        image: '🏷️',
        winner: 'Lisa Brand',
      },
    ],

    bidHistory: [
      { auctionId: 'A001', bidder: 'John Developer', amount: 2500, timestamp: Date.now() - 10 * 60 * 1000 },
      { auctionId: 'A001', bidder: 'Mike Dev', amount: 2400, timestamp: Date.now() - 20 * 60 * 1000 },
      { auctionId: 'A001', bidder: 'John Developer', amount: 2300, timestamp: Date.now() - 30 * 60 * 1000 },
    ],

    // Get all active auctions
    getActiveAuctions: () => {
      return get().auctions.filter((a) => a.status === 'active')
    },

    // Get all closed auctions
    getClosedAuctions: () => {
      return get().auctions.filter((a) => a.status === 'closed')
    },

    // Get user's active auctions
    getUserAuctions: (userId) => {
      return get().auctions.filter((a) => a.owner.name.includes(userId) && a.status === 'active')
    },

    // Get auction by ID
    getAuctionById: (id) => {
      return get().auctions.find((a) => a.id === id)
    },

    // Place a bid
    placeBid: (auctionId, bidderName, bidAmount) => {
      set((state) => ({
        auctions: state.auctions.map((auction) =>
          auction.id === auctionId && bidAmount > auction.currentBid
            ? {
                ...auction,
                currentBid: bidAmount,
                totalBids: auction.totalBids + 1,
                topBidder: {
                  name: bidderName,
                  avatar: '👤',
                  bid: bidAmount,
                },
              }
            : auction
        ),
        bidHistory: [
          ...state.bidHistory,
          {
            auctionId,
            bidder: bidderName,
            amount: bidAmount,
            timestamp: Date.now(),
          },
        ],
      }))

      return {
        success: bidAmount > get().getAuctionById(auctionId)?.currentBid,
        message: 'Bid placed successfully!',
      }
    },

    // Get bid history for auction
    getBidHistory: (auctionId) => {
      return get().bidHistory
        .filter((b) => b.auctionId === auctionId)
        .sort((a, b) => b.timestamp - a.timestamp)
    },

    // Create new auction
    createAuction: (auctionData) => {
      const newAuction = {
        ...auctionData,
        id: `A${Date.now()}`,
        status: 'active',
        totalBids: 0,
        topBidder: null,
      }
      set((state) => ({
        auctions: [...state.auctions, newAuction],
      }))
      return newAuction.id
    },

    // Get time remaining for auction
    getTimeRemaining: (auctionId) => {
      const auction = get().getAuctionById(auctionId)
      if (!auction) return 0
      const remaining = new Date(auction.endsAt).getTime() - Date.now()
      return Math.max(0, remaining)
    },

    // Format time remaining
    formatTimeRemaining: (milliseconds) => {
      const seconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}d ${hours % 24}h`
      if (hours > 0) return `${hours}h ${minutes % 60}m`
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`
      return `${seconds}s`
    },

    // Close expired auctions
    closeExpiredAuctions: () => {
      set((state) => ({
        auctions: state.auctions.map((auction) => {
          const timeRemaining = new Date(auction.endsAt).getTime() - Date.now()
          return timeRemaining <= 0 && auction.status === 'active'
            ? { ...auction, status: 'closed', winner: auction.topBidder?.name }
            : auction
        }),
      }))
    },

    // Search auctions
    searchAuctions: (query) => {
      const lowerQuery = query.toLowerCase()
      return get().auctions.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerQuery) ||
          a.description.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery)
      )
    },

    // Filter auctions by category
    filterByCategory: (category) => {
      if (!category || category === 'all') return get().auctions
      return get().auctions.filter((a) => a.category === category)
    },

    // Sort auctions
    sortAuctions: (sortBy) => {
      const auctions = [...get().auctions]
      switch (sortBy) {
        case 'price-high':
          return auctions.sort((a, b) => b.currentBid - a.currentBid)
        case 'price-low':
          return auctions.sort((a, b) => a.currentBid - b.currentBid)
        case 'ending-soon':
          return auctions.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
        case 'newest':
          return auctions.sort((a, b) => b.id.localeCompare(a.id))
        default:
          return auctions
      }
    },
  }))
)
