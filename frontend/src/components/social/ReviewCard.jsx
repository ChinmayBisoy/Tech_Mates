import React, { useState } from 'react';
import { Star, MessageCircle, Flag } from 'lucide-react';
import { useSocialStore } from '@/store/socialStore';

// Review Card Component - Display user reviews
export default function ReviewCard() {
  const { reviews } = useSocialStore();
  const [filter, setFilter] = useState('all');

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.ratingGiven >= parseInt(filter));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Reviews ({reviews.length})
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 'all'].map(rating => (
            <button
              key={rating}
              onClick={() => setFilter(rating === 'all' ? 'all' : rating.toString())}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filter === (rating === 'all' ? 'all' : rating.toString())
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {rating === 'all' ? 'All' : `${rating}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">No reviews yet</p>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewer}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">@{review.reviewer}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.ratingGiven
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Transaction: {review.transactionId}
                </p>
                <button className="text-gray-500 hover:text-red-500 transition">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
