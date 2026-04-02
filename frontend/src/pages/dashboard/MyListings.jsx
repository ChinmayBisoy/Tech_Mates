import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { myListingsAPI } from '@/api/dashboard.api';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Trash2, Eye, Plus, ArrowLeft, BarChart3 } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const listingsQuery = useQuery({
    queryKey: ['my-listings', page],
    queryFn: () => myListingsAPI.getMyListings(page, 12),
  });

  const deleteMutation = useMutation({
    mutationFn: (listingId) => myListingsAPI.deleteListing(listingId),
    onSuccess: () => {
      toast.success('Listing deleted successfully');
      listingsQuery.refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete listing');
    },
  });

  const listings = listingsQuery.data?.listings || [];
  const totalPages = listingsQuery.data?.pagination?.totalPages || 1;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your listings</p>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Listings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and monitor your published projects
            </p>
          </div>

          <button
            onClick={() => navigate('/projects/post')}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
          >
            <Plus className="h-5 w-5" />
            New Listing
          </button>
        </div>

        {/* Empty State */}
        {listingsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading listings...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">You haven't created any listings yet</p>
            <button
              onClick={() => navigate('/projects/post')}
              className="mt-4 rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            {/* Listings Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  {listing.images?.[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="h-40 w-full object-cover"
                    />
                  )}

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                      {listing.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {listing.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                        <span className="font-bold text-primary dark:text-accent">
                          ₹{formatINR(listing.price / 100)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Purchases</span>
                        <span className="font-bold">{listing.purchaseCount || 0}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Rating</span>
                        <span className="font-bold">
                          {listing.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            listing.isPublished
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {listing.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
                    <button
                      onClick={() => navigate(`/projects/${listing.slug}`)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/projects/${listing.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/projects/${listing.id}/stats`)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Stats
                    </button>

                    <button
                      onClick={() => setDeleteId(listing.id)}
                      disabled={deleteId === listing.id && deleteMutation.isPending}
                      className="rounded-lg border border-red-300 p-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteId === listing.id && (
                    <div className="border-t border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                        Delete this listing?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() =>
                            deleteMutation.mutate(listing.id)
                          }
                          disabled={deleteMutation.isPending}
                          className="flex-1 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="flex-1 rounded border border-red-300 px-3 py-1 text-sm font-bold text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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
