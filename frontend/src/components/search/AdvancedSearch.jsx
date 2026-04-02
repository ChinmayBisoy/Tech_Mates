import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, TrendingUp } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';

// Advanced Search Component - Complex filtering and search
export default function AdvancedSearch() {
  const { searchQuery, filters, setSearchQuery, setFilters, clearFilters, searchResults, filterResults, sortResults } = useSearchStore();
  const [showFilters, setShowFilters] = useState(false);

  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(localFilters);
  };

  const displayResults = sortResults(filterResults(searchResults, localFilters), localFilters.sortBy);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search auctions, items, sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-2.5 px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Search
        </button>
      </form>

      {/* Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters {showFilters && '✕'}
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.priceRange.min}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: { ...localFilters.priceRange, min: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.priceRange.max}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: { ...localFilters.priceRange, max: parseInt(e.target.value) || 10000 },
                  })
                }
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Condition
            </label>
            <div className="space-y-2">
              {['excellent', 'good', 'fair', 'needs repair'].map(cond => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.condition.includes(cond)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalFilters({
                          ...localFilters,
                          condition: [...localFilters.condition, cond],
                        });
                      } else {
                        setLocalFilters({
                          ...localFilters,
                          condition: localFilters.condition.filter(c => c !== cond),
                        });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              clearFilters();
              setLocalFilters(filters);
            }}
            className="w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {displayResults.length} results
      </p>

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayResults.map(result => (
          <div
            key={result.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                {result.title}
              </h4>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                ${result.currentBid || result.price}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>👁️ {result.views} views</span>
                <span>🔨 {result.bids} bids</span>
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">
                View Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
