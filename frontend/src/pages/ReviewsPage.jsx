import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import ReviewsList from '@/components/reviews/ReviewsList';
import RatingStars from '@/components/reviews/RatingStars';
import useReviewStore from '@/store/reviewStore';

export default function ReviewsPage({ productId = 101, productName = 'Product Name', isOwner = false }) {
  const [filters, setFilters] = useState({
    rating: [],
    verifiedOnly: false,
    withPhotosOnly: false,
    sortBy: 'recent',
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const filterReviews = useReviewStore((state) => state.filterReviews);
  const getProductStats = useReviewStore((state) => state.getProductStats);

  const filteredReviews = filterReviews(productId, filters);
  const stats = getProductStats(productId);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Customer Reviews</h1>
          <p className="text-slate-400 text-sm">{productName}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Rating Summary */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Average Rating</p>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold text-white">{stats.averageRating}</div>
                <div>
                  <RatingStars rating={parseFloat(stats.averageRating)} size="md" />
                  <p className="text-xs text-slate-400 mt-1">{stats.totalReviews} reviews</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Rating Distribution</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-6">{rating}⭐</span>
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
                        style={{
                          width: `${(stats.ratingDistribution?.[rating] || 0) / Math.max(...Object.values(stats.ratingDistribution || {})) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 w-6">{stats.ratingDistribution?.[rating] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Purchases */}
            <div>
              <p className="text-slate-400 text-sm mb-2">Verified Information</p>
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm font-medium">✓ {stats.verifiedPurchaseCount} Verified</p>
                  <p className="text-green-400/70 text-xs">Verified purchases</p>
                </div>
                {!isOwner && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 transition font-medium text-sm"
                  >
                    {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && !isOwner && (
          <div className="mb-8">
            <ReviewForm productId={productId} onSuccess={() => setShowReviewForm(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <ReviewFilters filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Reviews */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Customer Reviews</h2>
                <p className="text-sm text-slate-400">{filteredReviews.length} reviews</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">
                  {filteredReviews.length > 0 ? `${filteredReviews.reduce((sum, r) => sum + r.replies.length, 0)} replies` : 'No replies'}
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <ReviewsList
              reviews={filteredReviews}
              isOwner={isOwner}
              emptyMessage={filteredReviews.length === 0 ? 'No reviews match your filters' : 'Be the first to review'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// © 2026 Tech-Mates. All rights reserved.
