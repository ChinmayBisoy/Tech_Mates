import ReviewCard from './ReviewCard';

export default function ReviewsList({ reviews = [], isOwner = false, emptyMessage = 'No reviews yet' }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} isOwner={isOwner} />
      ))}
    </div>
  );
}
