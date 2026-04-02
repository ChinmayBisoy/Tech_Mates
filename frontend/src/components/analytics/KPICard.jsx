import React from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';

// KPI Card - Display key performance indicator
export default function KPICard() {
  const { sellerKPIs, buyerKPIs } = useAnalyticsStore();

  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  const formatNumber = (value) => value.toLocaleString();

  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Seller KPIs */}
      <div className="col-span-1 sm:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Seller Dashboard</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(sellerKPIs.totalSales)}</p>
            <p className={`text-xs mt-1 ${getTrendColor(sellerKPIs.salesChange)}`}>
              +{sellerKPIs.salesChange}% from last month
            </p>
          </div>

          {/* Active Listings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Listings</p>
              <Package className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellerKPIs.activeListings}</p>
            <p className={`text-xs mt-1 ${getTrendColor(sellerKPIs.listingsChange)}`}>
              +{sellerKPIs.listingsChange} new
            </p>
          </div>

          {/* Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Rating</p>
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellerKPIs.averageRating}⭐</p>
            <p className={`text-xs mt-1 ${getTrendColor(sellerKPIs.ratingChange)}`}>
              +{sellerKPIs.ratingChange} from last month
            </p>
          </div>

          {/* Completion Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completion</p>
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellerKPIs.completionRate}%</p>
            <p className={`text-xs mt-1 ${getTrendColor(sellerKPIs.completionRateChange)}`}>
              +{sellerKPIs.completionRateChange}%
            </p>
          </div>
        </div>
      </div>

      {/* Buyer KPIs */}
      <div className="col-span-1 sm:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Buyer Dashboard</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Spent */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(buyerKPIs.totalSpent)}</p>
            <p className={`text-xs mt-1 ${getTrendColor(buyerKPIs.spentChange)}`}>
              +{buyerKPIs.spentChange}% from last month
            </p>
          </div>

          {/* Items Purchased */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Purchased</p>
              <Package className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{buyerKPIs.itemsPurchased}</p>
            <p className={`text-xs mt-1 ${getTrendColor(buyerKPIs.itemsChange)}`}>
              +{buyerKPIs.itemsChange} items
            </p>
          </div>

          {/* Active Auctions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Auctions</p>
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{buyerKPIs.activeAuctions}</p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {buyerKPIs.activeBids} bids placed
            </p>
          </div>

          {/* Wishlist */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Wishlist</p>
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{buyerKPIs.wishlistItems}</p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {buyerKPIs.favoriteSellers} sellers followed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
