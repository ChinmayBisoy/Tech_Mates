import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { myPurchasesAPI } from '@/api/dashboard.api';
import { useAuth } from '@/hooks/useAuth';
import { Download, Star, MessageSquare, RotateCcw, ArrowLeft } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';

export default function MyPurchases() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const purchasesQuery = useQuery({
    queryKey: ['my-purchases', page, selectedStatus],
    queryFn: () =>
      myPurchasesAPI.getMyPurchases(page, 12, {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }),
  });

  const purchases = purchasesQuery.data?.purchases || [];
  const totalPages = purchasesQuery.data?.pagination?.totalPages || 1;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your purchases</p>
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Purchases</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your purchased items and manage downloads
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {['all', 'active', 'completed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-primary text-white dark:bg-accent'
                  : 'border border-gray-300 text-gray-700 hover:border-primary dark:border-gray-600 dark:text-gray-300 dark:hover:border-accent'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {purchasesQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading purchases...</p>
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">No purchases found</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <>
            {/* Purchases List */}
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex gap-4">
                    {/* Listing Image */}
                    {purchase.listing?.images?.[0] && (
                      <img
                        src={purchase.listing.images[0]}
                        alt={purchase.listing.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    )}

                    {/* Purchase Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {purchase.listing?.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Order #: {purchase.id.slice(0, 8)}</span>
                        <span>
                          Purchased:{' '}
                          {new Date(purchase.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            purchase.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : purchase.status === 'refunded'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </div>

                      {/* Price & Rating */}
                      <div className="mt-3 flex items-center gap-6">
                        <div>
                          <span className="text-2xl font-bold text-primary dark:text-accent">
                            ₹{formatINR(purchase.amount / 100)}
                          </span>
                        </div>

                        {purchase.listing?.averageRating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {purchase.listing.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Download className="h-4 w-4" />
                        Download
                      </button>

                      <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Star className="h-4 w-4" />
                        Review
                      </button>

                      {purchase.status === 'completed' && (
                        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                          <MessageSquare className="h-4 w-4" />
                          Support
                        </button>
                      )}

                      {purchase.status !== 'refunded' && (
                        <button className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20">
                          <RotateCcw className="h-4 w-4" />
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
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
