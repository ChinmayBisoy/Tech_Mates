import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatINR } from '@/utils/formatCurrency';
import { SkillTags } from '@/components/profile/SkillTags';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWishlist } from '@/hooks/useWishlist';

export function ListingCard({ listing, onWishlistToggle = null }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const wishlistId = `listing_${listing.id}`;
  const isWishlisted = isInWishlist(wishlistId);
  const images = listing.images || [];
  const techStack = listing.techStack?.slice(0, 3) || [];

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      removeFromWishlist(wishlistId);
    } else {
      addToWishlist(wishlistId);
    }
    onWishlistToggle?.(listing.id, !isWishlisted);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      to={`/projects/${listing.slug}`}
      className="group flex flex-col rounded-lg border border-gray-200 overflow-hidden bg-white transition-all hover:border-primary hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-accent"
    >
      {/* Image Carousel */}
      <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Image Navigation (if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/75"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/75"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image Indicator Dots */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndex(idx);
                      }}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-all',
                        idx === currentImageIndex
                          ? 'bg-white w-3'
                          : 'bg-white/50 hover:bg-white/75'
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleWishlistToggle();
              }}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-500 transition-all hover:bg-white hover:scale-110 dark:bg-gray-900/90"
            >
              <Heart
                className={cn('h-5 w-5', isWishlisted ? 'fill-current' : '')}
              />
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No images
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="line-clamp-2 font-bold text-gray-900 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-accent">
          {listing.title}
        </h3>

        {/* Seller Profile */}
        <div className="mt-3 flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-gray-700">
          <img
            src={listing.seller.avatar || `https://ui-avatars.com/api/?name=${listing.seller.name}`}
            alt={listing.seller.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {listing.seller.name}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {listing.seller.rating || 5.0}
              </span>
            </div>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {listing.description}
        </p>

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            <SkillTags skills={techStack} />
          </div>
        )}

        {/* Footer: Price and Rating */}
        <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary dark:text-accent">
                ₹{formatINR(listing.price / 100)}
              </span>
              {listing.originalPrice && listing.originalPrice > listing.price && (
                <span className="text-xs text-gray-500 line-through dark:text-gray-400">
                  ₹{formatINR(listing.originalPrice / 100)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {listing.averageRating?.toFixed(1) || 'New'}
              <span className="text-gray-500">({listing.purchaseCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Discount Badge */}
        {listing.originalPrice && listing.originalPrice > listing.price && (
          <div className="mt-2 inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400 w-fit">
            -{Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off
          </div>
        )}
      </div>
    </Link>
  );
}
