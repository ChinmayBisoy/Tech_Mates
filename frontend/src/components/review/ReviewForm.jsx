import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reviewAPI } from '@/api/dashboard.api';
import { Star, Send, Loader } from 'lucide-react';

export function ReviewForm({ listingId, purchaseId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      reviewAPI.submitReview({
        listingId,
        purchaseId,
        rating,
        title,
        content,
      }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Your Review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your detailed thoughts..."
          maxLength={500}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 resize-none bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500">
          {content.length}/500 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50 dark:bg-accent dark:hover:bg-accent/90"
        >
          {submitMutation.isPending ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Review
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
