import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { listingAPI } from '@/api/listing.api';
import { createPurchase } from '@/api/purchase.api';
import { SkillTags } from '@/components/profile/SkillTags';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { formatINR } from '@/utils/formatCurrency';
import {
  ArrowLeft,
  Star,
  Download,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ListingDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Fetch listing
  const listingQuery = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => listingAPI.getListingDetail(slug),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: () => createPurchase(listingQuery.data?.id),
    onSuccess: (data) => {
      // Redirect to Stripe checkout or payment gateway
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success('Purchase initiated!');
        navigate(`/purchase/success?sessionId=${data.sessionId}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to initiate purchase');
      setIsPurchasing(false);
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      navigate('/login');
      return;
    }

    setIsPurchasing(true);
    createPurchaseMutation.mutate();
  };

  const handlePrevImage = () => {
    const images = listingQuery.data?.images || [];
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = listingQuery.data?.images || [];
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (listingQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (listingQuery.error || !listingQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <ErrorState title="Listing not found" description="The listing you're looking for doesn't exist." onRetry={() => navigate('/projects')} />
        </div>
      </div>
    );
  }

  const listing = listingQuery.data;
  const images = listing.images || [];
  const discount = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary transition-colors hover:text-primary/80 dark:text-accent dark:hover:text-accent/80"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 mb-4">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt="Listing"
                    className="h-full w-full object-cover"
                  />

                  {/* Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/75"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/75"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 rounded-full bg-black/75 px-3 py-1 text-sm text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No images</div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-primary dark:border-accent' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details Section */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">About this listing</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{listing.description}</p>

              {/* Features */}
              {listing.features && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{listing.features}</p>
                </div>
              )}

              {/* What's Included */}
              {listing.includes && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What's Included</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{listing.includes}</p>
                </div>
              )}

              {/* Tech Stack */}
              {listing.techStack && listing.techStack.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Technologies Used</h3>
                  <SkillTags skills={listing.techStack} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Card */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={listing.seller.avatar || `https://ui-avatars.com/api/?name=${listing.seller.name}`}
                  alt={listing.seller.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{listing.seller.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {listing.seller.rating || 5.0}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to={`/profile/${listing.seller.id}`}
                className="block w-full rounded-lg border border-primary py-2 text-center font-semibold text-primary transition-colors hover:bg-primary/10 dark:border-accent dark:text-accent dark:hover:bg-accent/10"
              >
                View Profile
              </Link>
            </div>

            {/* Price Card */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary dark:text-accent">
                    ₹{formatINR(listing.price / 100)}
                  </span>
                  {listing.originalPrice && (
                    <span className="text-gray-500 line-through">
                      ₹{formatINR(listing.originalPrice / 100)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    Save {discount}%
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 border-b border-gray-200 pb-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Purchased by</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{listing.purchaseCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {listing.averageRating?.toFixed(1) || 'New'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Info */}
              {listing.support !== 'none' && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    📧 {listing.support.replace('-', ' ')} support included
                  </p>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={isPurchasing || createPurchaseMutation.isPending}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-accent dark:hover:bg-accent/90"
              >
                <ShoppingCart className="h-5 w-5" />
                {isPurchasing ? 'Processing...' : 'Buy Now'}
              </button>

              {/* Info */}
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
                Secure checkout powered by Stripe
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              {listing.documentation && (
                <a
                  href={listing.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  Docs
                </a>
              )}
              <button
                onClick={() => {
                  navigator.share({
                    title: listing.title,
                    text: listing.description,
                    url: window.location.href,
                  }).catch((e) => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  });
                }}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
