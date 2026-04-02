import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { wishlistAPI } from '@/api/dashboard.api';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', page],
    queryFn: () => wishlistAPI.getWishlist(page, 12),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (listingId) => wishlistAPI.removeFromWishlist(listingId),
    onSuccess: () => {
      toast.success('Removed from wishlist');
      wishlistQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    },
  });

  const items = wishlistQuery.data?.items || [];
  const totalPages = wishlistQuery.data?.totalPages || 1;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your wishlist</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Empty State */}
        {wishlistQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wishlist...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Your wishlist is empty</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Add items to your wishlist to save them for later
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden dark:border-gray-700 dark:bg-gray-900 hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-400" />
                    )}

                    {/* Heart Icon */}
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      disabled={removeMutation.isPending}
                      className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow-lg transition-transform hover:scale-110 disabled:opacity-50 dark:bg-gray-800"
                    >
                      <Heart className="h-5 w-5 fill-red-600" />
                    </button>

                    {/* Discount Badge */}
                    {item.originalPrice && (
                      <div className="absolute left-2 top-2 rounded-lg bg-red-500 px-2 py-1 text-sm font-bold text-white">
                        -
                        {Math.round(
                          ((item.originalPrice - item.price) / item.originalPrice) * 100
                        )}
                        %
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>

                    {/* Seller Info */}
                    {item.seller && (
                      <div className="mt-3 flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <img
                          src={
                            item.seller.avatar ||
                            `https://ui-avatars.com/api/?name=${item.seller.name}`
                          }
                          alt={item.seller.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.seller.name}
                        </span>
                      </div>
                    )}

                    {/* Price & Rating */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary dark:text-accent">
                          ₹{formatINR(item.price / 100)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{formatINR(item.originalPrice / 100)}
                          </span>
                        )}
                      </div>

                      {item.averageRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.averageRating.toFixed(1)}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => navigate(`/projects/${item.slug}`)}
                    className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-4 py-2 ${
                        p === page
                          ? 'bg-primary text-white dark:bg-accent'
                          : 'border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
