import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Users, MessageSquare, Star, Calendar } from 'lucide-react';
import { myListingsAPI } from '@/api/dashboard.api';

export function ListingStats() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ['listing-stats', id],
    queryFn: () => myListingsAPI.getListingStats(id),
  });

  const stats = statsQuery.data || {};

  if (statsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/projects/my')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Listing Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400">{stats.title}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalSales || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')} revenue
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 dark:bg-accent/10">
              <TrendingUp className="h-6 w-6 text-primary dark:text-accent" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalCustomers || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.repeatCustomers || 0} repeat customers
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {(stats.averageRating || 0).toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.totalReviews || 0} reviews
              </p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Response Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.responseRate || 0}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Avg {stats.avgResponseTime || '—'} hrs
              </p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rating Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats[`${rating}StarCount`] || 0;
              const percentage =
                stats.totalReviews > 0
                  ? Math.round((count / stats.totalReviews) * 100)
                  : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                    {rating}★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Timeline */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentSales && stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sale.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{sale.amount?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">{sale.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                No sales data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.views || 0}
            </p>
            <p className="mt-1 text-xs text-gray-500">This month</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.conversionRate || 0).toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-gray-500">View to purchase</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Wishlist Adds</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.wishlistAdds || 0}
            </p>
            <p className="mt-1 text-xs text-gray-500">Total saves</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/projects/${id}/edit`)}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
        >
          Edit Listing
        </button>
        <button
          onClick={() => navigate('/projects/my')}
          className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
        >
          Back
        </button>
      </div>
    </div>
  );
}
