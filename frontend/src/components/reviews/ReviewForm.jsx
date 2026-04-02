import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import RatingStars from './RatingStars';
import useReviewStore from '@/store/reviewStore';

export default function ReviewForm({ productId = 101, onSuccess = null }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReview = useReviewStore((state) => state.addReview);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0 || !title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    const newReview = {
      id: Math.max(0, ...useReviewStore.getState().reviews.map((r) => r.id)) + 1,
      productId,
      userId: 1, // Current user
      userName: 'You',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      rating,
      title,
      content,
      photos,
      verifiedPurchase: true,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      unhelpfulCount: 0,
      isSeller: false,
      badges: ['verified-buyer'],
      replies: [],
    };

    addReview(newReview);
    
    setRating(0);
    setTitle('');
    setContent('');
    setPhotos([]);
    setIsSubmitting(false);

    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-6">Write a Review</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-slate-200 text-sm font-medium mb-2">Rating</label>
        <RatingStars rating={rating} onRate={setRating} interactive size="lg" />
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-slate-200 text-sm font-medium mb-2">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Great product, highly recommended!"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-slate-200 text-sm font-medium mb-2">Your Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition"
          rows="5"
          maxLength={1000}
        />
        <p className="text-xs text-slate-400 mt-1">{content.length}/1000</p>
      </div>

      {/* Photos */}
      <div className="mb-6">
        <label className="block text-slate-200 text-sm font-medium mb-2">Add Photos</label>
        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-700/20 hover:bg-slate-700/30 transition">
          <div className="text-center">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Click to upload photos (up to 5)</p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={photos.length >= 5}
            className="hidden"
          />
        </label>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img src={photo} alt={`Photo ${idx + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700 transition"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
