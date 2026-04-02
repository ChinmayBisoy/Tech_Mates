import { create } from 'zustand';

export const useRealTimeStore = create((set) => ({
  // Connection state
  connections: {
    auction: false,
    messages: false,
    notifications: false,
  },
  
  // Live events
  liveEvents: [
    { id: 1, type: 'auction', action: 'bid_placed', auctionId: 1, bidder: 'john_doe', amount: 150, timestamp: new Date(Date.now() - 2000) },
    { id: 2, type: 'auction', action: 'auction_ending_soon', auctionId: 2, timeLeft: '5m', timestamp: new Date(Date.now() - 5000) },
    { id: 3, type: 'message', action: 'new_message', from: 'alice@example.com', content: 'Hi, interested in buying...', timestamp: new Date(Date.now() - 8000) },
    { id: 4, type: 'auction', action: 'outbid', auctionId: 1, newBidderAmount: 160, timestamp: new Date(Date.now() - 15000) },
  ],

  // Active connections count
  activeConnections: 342,
  
  // Last update timestamp
  lastUpdate: new Date(),

  // Actions
  connectWebSocket: (channel) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [channel]: true,
      },
    }));
  },

  disconnectWebSocket: (channel) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [channel]: false,
      },
    }));
  },

  addLiveEvent: (event) => {
    set((state) => ({
      liveEvents: [
        {
          id: Math.max(...state.liveEvents.map(e => e.id), 0) + 1,
          timestamp: new Date(),
          ...event,
        },
        ...state.liveEvents.slice(0, 49), // Keep only 50 most recent
      ],
      lastUpdate: new Date(),
    }));
  },

  removeLiveEvent: (eventId) => {
    set((state) => ({
      liveEvents: state.liveEvents.filter(e => e.id !== eventId),
    }));
  },

  updateActiveConnections: (count) => {
    set({
      activeConnections: count,
      lastUpdate: new Date(),
    });
  },

  getLiveEventsByType: (type) => {
    return (state) => state.liveEvents.filter(e => e.type === type);
  },

  getLiveEventsByAuction: (auctionId) => {
    return (state) => state.liveEvents.filter(e => e.auctionId === auctionId);
  },

  clearOldEvents: (olderThanMs = 3600000) => {
    const cutoffTime = Date.now() - olderThanMs;
    set((state) => ({
      liveEvents: state.liveEvents.filter(e => e.timestamp.getTime() > cutoffTime),
    }));
  },

  isConnected: (channel) => {
    return (state) => state.connections[channel] || false;
  },
}));
