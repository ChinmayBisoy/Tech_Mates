import { useQuery } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import { reviewAPI } from '@/api/dashboard.api';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function ReviewList({ listingId, limit = 5 }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');

  const reviewsQuery = useQuery({
    queryKey: ['reviews', listingId, page, sortBy],
    queryFn: () => reviewAPI.getListingReviews(listingId, page, limit, sortBy),
  });

  const statsQuery = useQuery({
    queryKey: ['review-stats', listingId],
    queryFn: () => reviewAPI.getReviewStats(listingId),
  });

  const reviews = reviewsQuery.data?.reviews || [];
  const stats = statsQuery.data || {};
  const totalPages = reviewsQuery.data?.totalPages || 1;

  if (reviewsQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Customer Reviews
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Average Rating */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stats.averageRating?.toFixed(1) || '—'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">out of 5</span>
              </div>
              <div className="mt-2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(stats.averageRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Based on {stats.totalReviews || 0} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats[`${rating}StarCount`] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? Math.round((count / stats.totalReviews) * 100)
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                      {rating} stars
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sort & Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Reviews ({stats.totalReviews || 0})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.reviewer?.avatar && (
                      <img
                        src={review.reviewer.avatar}
                        alt={review.reviewer.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.reviewer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title and Content */}
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {review.title}
                  </h4>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {review.content}
                  </p>
                </div>

                {/* Delete Button (if author) */}
                {user?.id === review.reviewer?.id && (
                  <button className="ml-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Helpful Counter */}
              {review.helpfulCount > 0 && (
                <p className="mt-3 text-xs text-gray-500">
                  {review.helpfulCount} found this helpful
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-2 ${
                  p === page
                    ? 'bg-primary text-white dark:bg-accent'
                    : 'border border-gray-300 dark:border-gray-600'
                }`}
              >
                {p}
              </button>
            ))}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
