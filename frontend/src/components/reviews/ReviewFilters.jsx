import { Filter, X } from 'lucide-react';

export default function ReviewFilters({ onFilterChange = null, filters = {} }) {
  const handleRatingChange = (rating) => {
    const newRatings = filters.rating?.includes(rating)
      ? filters.rating.filter((r) => r !== rating)
      : [...(filters.rating || []), rating];

    onFilterChange?.({ ...filters, rating: newRatings });
  };

  const handleVerifiedChange = () => {
    onFilterChange?.({ ...filters, verifiedOnly: !filters.verifiedOnly });
  };

  const handlePhotosChange = () => {
    onFilterChange?.({ ...filters, withPhotosOnly: !filters.withPhotosOnly });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange?.({ ...filters, sortBy });
  };

  const resetFilters = () => {
    onFilterChange?.({ rating: [], verifiedOnly: false, withPhotosOnly: false, sortBy: 'recent' });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Filters</h3>
        </div>
        {(filters.rating?.length > 0 || filters.verifiedOnly || filters.withPhotosOnly) && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Rating Filter */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">Rating</label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.rating?.includes(rating) || false}
                onChange={() => handleRatingChange(rating)}
                className="w-4 h-4 rounded border-gray-300 bg-white text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:checked:bg-accent dark:checked:border-accent"
              />
              <span className="text-slate-300 text-sm">
                {'⭐'.repeat(rating)} {rating} Star{rating !== 1 ? 's' : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Verified Purchase Filter */}
      <div className="border-t border-slate-700/30 pt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={handleVerifiedChange}
            className="w-4 h-4 rounded border-gray-300 bg-white text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:checked:bg-accent dark:checked:border-accent"
          />
          <span className="text-slate-300 text-sm">Verified Purchases Only</span>
        </label>
      </div>

      {/* Photos Filter */}
      <div className="border-t border-slate-700/30 pt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.withPhotosOnly || false}
            onChange={handlePhotosChange}
            className="w-4 h-4 rounded border-gray-300 bg-white text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:checked:bg-accent dark:checked:border-accent"
          />
          <span className="text-slate-300 text-sm">With Photos</span>
        </label>
      </div>

      {/* Sort By */}
      <div className="border-t border-slate-700/30 pt-3">
        <label className="text-sm font-medium text-slate-300 mb-2 block">Sort By</label>
        <select
          value={filters.sortBy || 'recent'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>
    </div>
  );
}
