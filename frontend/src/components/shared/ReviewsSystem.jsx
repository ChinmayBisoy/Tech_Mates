import { useState } from 'react'
import { Star, MessageSquare, Send, Loader2 } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '@/api/axios'

// Review display component
export function ReviewCard({ review }) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4 flex-1">
          <img
            src={review.reviewerAvatar || 'https://via.placeholder.com/48'}
            alt={review.reviewerName}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {review.reviewerName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {review.role} • {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {review.rating}.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.text}</p>

      {/* Project Info */}
      {review.projectName && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">Project</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {review.projectName}
          </p>
        </div>
      )}

      {/* Reply Section */}
      {review.reply ? (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
            Developer's Reply
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">{review.reply}</p>
        </div>
      ) : (
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-sm text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 mt-4"
        >
          <MessageSquare className="w-4 h-4" />
          Reply
        </button>
      )}

      {showReply && (
        <ReviewReplyForm reviewId={review._id} onSubmit={() => setShowReply(false)} />
      )}
    </div>
  )
}

// Write review component
export function WriteReviewForm({ developerId, projectId, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const hoverRating = useState(0)[0]

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/api/reviews', data)
      return response.data
    },
    onSuccess: () => {
      onSuccess?.()
      setText('')
      setRating(5)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim().length < 10) {
      alert('Review must be at least 10 characters')
      return
    }

    submitReviewMutation.mutate({
      developerId,
      projectId,
      rating,
      text,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Share Your Experience
      </h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors cursor-pointer ${
                  i < rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review (minimum 10 characters)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell others about your experience working with this developer..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none resize-none"
          rows="4"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {text.length}/500 characters
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitReviewMutation.isPending}
        className="w-full py-2 px-4 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitReviewMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </button>
    </form>
  )
}

// Reviews summary component
export function ReviewsSummary({ developerId }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', developerId],
    queryFn: async () => {
      const response = await axios.get(`/api/reviews?developerId=${developerId}`)
      return response.data.data || []
    },
  })

  if (isLoading) return <div>Loading reviews...</div>

  const sortedReviews = reviews?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  ) || []

  if (!sortedReviews.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No reviews yet. Be the first to review!
      </div>
    )
  }

  const avgRating = (
    sortedReviews.reduce((sum, r) => sum + r.rating, 0) / sortedReviews.length
  ).toFixed(1)

  const ratingCounts = {
    5: sortedReviews.filter((r) => r.rating === 5).length,
    4: sortedReviews.filter((r) => r.rating === 4).length,
    3: sortedReviews.filter((r) => r.rating === 3).length,
    2: sortedReviews.filter((r) => r.rating === 2).length,
    1: sortedReviews.filter((r) => r.rating === 1).length,
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700">
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {avgRating}
          </div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(avgRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on {sortedReviews.length} review{sortedReviews.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Rating Distribution
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {rating} ★
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{
                      width: `${(ratingCounts[rating] / sortedReviews.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {ratingCounts[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Reviews</h3>
        {sortedReviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  )
}

// Reply to review form
function ReviewReplyForm({ reviewId, onSubmit }) {
  const [reply, setReply] = useState('')

  const submitReplyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/api/reviews/${reviewId}/reply`, data)
      return response.data
    },
    onSuccess: () => {
      onSubmit()
      setReply('')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (reply.trim()) {
      submitReplyMutation.mutate({ reply })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write your reply..."
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
        rows="2"
      />
      <button
        type="submit"
        disabled={submitReplyMutation.isPending}
        className="mt-2 py-1 px-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {submitReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  )
}
