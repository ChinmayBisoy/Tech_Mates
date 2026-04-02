import { Star } from 'lucide-react'
import { formatRelative } from '@/utils/formatDate'
import { EmptyState } from '@/components/shared/EmptyState'

export function ReviewList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState title="No reviews yet" description="This user hasn't received any reviews" />
  }

  const calculateAverageRating = (ratings) => {
    if (!ratings) return 0
    const values = Object.values(ratings).filter((v) => typeof v === 'number')
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
  }

  // Group reviews by star rating
  const ratingCounts = reviews.reduce((acc, review) => {
    const rating = Math.round(calculateAverageRating(review.ratings))
    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Rating Breakdown
        </h3>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < stars
                          ? 'text-warning fill-warning'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {count} {count === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reviews
        </h3>

        {reviews.map((review) => {
          const avgRating = calculateAverageRating(review.ratings)

          return (
            <div key={review._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(avgRating)
                              ? 'text-warning fill-warning'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.reviewerName}
                    </span>
                    {' • '}
                    {formatRelative(review.createdAt)}
                  </p>
                </div>
              </div>

              {/* Rating Details */}
              {review.ratings && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  {review.ratings.quality && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Quality</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-full rounded ${
                              i < review.ratings.quality
                                ? 'bg-success'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {review.ratings.communication && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Communication</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-full rounded ${
                              i < review.ratings.communication
                                ? 'bg-success'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {review.ratings.deadline && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Deadline</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-full rounded ${
                              i < review.ratings.deadline
                                ? 'bg-success'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {review.ratings.value && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Value</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-full rounded ${
                              i < review.ratings.value
                                ? 'bg-success'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Text */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {review.body}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
