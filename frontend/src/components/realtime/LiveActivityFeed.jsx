import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { useRealTimeStore } from '@/store/realTimeStore';

// Live Activity Feed - Shows real-time marketplace activity
export default function LiveActivityFeed() {
  const { liveEvents } = useRealTimeStore();

  const recentEvents = liveEvents.slice(0, 8);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Live Activity</h3>
        <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
      </div>

      <div className="space-y-2">
        {recentEvents.map(event => (
          <div
            key={event.id}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {event.action === 'bid_placed' && `💰 New bid: $${event.amount}`}
                    {event.action === 'outbid' && `⬆️ Bid increased: $${event.newBidderAmount}`}
                    {event.action === 'new_message' && `💬 New message`}
                    {event.action === 'auction_ending_soon' && `⏱️ Ending soon`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.bidder || event.from || 'Someone'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                now
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
