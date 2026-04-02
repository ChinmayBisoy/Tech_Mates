import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import SellerVerificationCard from './SellerVerificationCard';
import TierBadge from './TierBadge';

const VerificationBrowser = ({ sellers, onSellerClick, onVerify, isOwner = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('trustScore'); // trustScore, sales, name

  // Filter sellers
  let filtered = sellers.filter((seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = !filterTier || seller.verificationTier === filterTier;
    const matchesStatus = !filterStatus || seller.verificationStatus === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Sort sellers
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'trustScore':
        return b.trustScore - a.trustScore;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const statuses = ['verified', 'pending', 'rejected', 'unverified'];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by seller name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tier
              </label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value="">All Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value="trustScore">Trust Score</option>
                <option value="sales">Most Sales</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center
                    ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center
                    ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-bold">{filtered.length}</span> of{' '}
        <span className="font-bold">{sellers.length}</span> sellers
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No sellers found</p>
        </div>
      ) : (
        <div
          className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }`}
        >
          {filtered.map((seller) => (
            <SellerVerificationCard
              key={seller.id}
              seller={seller}
              onViewProfile={() => onSellerClick?.(seller)}
              onVerify={() => onVerify?.(seller.id)}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationBrowser;
