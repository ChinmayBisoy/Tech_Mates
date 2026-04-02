import React, { useState, useEffect } from 'react';
import { useRealTimeStore } from '@/store/realTimeStore';
import { Bell, MapPin, TrendingUp } from 'lucide-react';

// Notification Center Component - Displays live real-time updates
export default function NotificationCenter() {
  const { liveEvents, activeConnections, isConnected, removeLiveEvent } = useRealTimeStore();
  const [filter, setFilter] = useState('all');

  const filteredEvents = filter === 'all' 
    ? liveEvents 
    : liveEvents.filter(e => e.type === filter);

  const getEventIcon = (type) => {
    switch (type) {
      case 'auction':
        return '🔨';
      case 'message':
        return '💬';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  };

  const getEventColor = (action) => {
    switch (action) {
      case 'outbid':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'bid_placed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'new_message':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = (Date.now() - date.getTime()) / 1000;
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Live Updates
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activeConnections} online
          </span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'auction', 'message', 'payment'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No {filter !== 'all' ? filter : ''} events yet</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border ${getEventColor(event.action)} transition hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {event.action === 'bid_placed' && `${event.bidder} placed a bid`}
                      {event.action === 'outbid' && 'You\'ve been outbid!'}
                      {event.action === 'new_message' && `Message from ${event.from}`}
                      {event.action === 'auction_ending_soon' && 'Auction ending soon'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.action === 'bid_placed' && `Bid: $${event.amount}`}
                      {event.action === 'outbid' && `New bid: $${event.newBidderAmount}`}
                      {event.action === 'new_message' && event.content}
                      {event.action === 'auction_ending_soon' && `Time left: ${event.timeLeft}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatTimeAgo(event.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeLiveEvent(event.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
