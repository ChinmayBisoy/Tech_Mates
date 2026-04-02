import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, onRate = null, size = 'md', interactive = false }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          disabled={!interactive}
          className={`transition ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${!interactive ? 'cursor-default' : ''}`}
        >
          <Star
            className={`${sizes} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : star - rating < 1 && star - rating > 0
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-slate-400'
            }`}
          />
        </button>
      ))}
      <span className="text-sm font-medium text-slate-400 ml-2">{rating.toFixed(1)}</span>
    </div>
  );
}
