import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/api/dashboard.api';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Star, Users, AlertCircle 
} from 'lucide-react';
import { useState } from 'react';

function StatCard({ icon: Icon, label, value, trend, trendPercentage, currency = false }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {currency ? '₹' : ''}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {trend && (
            <div className={`mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{trendPercentage}% from last month</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3 dark:bg-accent/10">
          <Icon className="h-6 w-6 text-primary dark:text-accent" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState('month'); // week, month, year

  // Fetch dashboard statistics
  const statsQuery = useQuery({
    queryKey: ['seller-stats', period],
    queryFn: () => analyticsAPI.getDashboardStats(period),
  });

  // Fetch revenue data
  const revenueQuery = useQuery({
    queryKey: ['revenue-data', period],
    queryFn: () => analyticsAPI.getRevenueData(period),
  });

  // Fetch sales data
  const salesQuery = useQuery({
    queryKey: ['sales-data', period],
    queryFn: () => analyticsAPI.getSalesData(period),
  });

  // Fetch top listings
  const topListingsQuery = useQuery({
    queryKey: ['top-listings', period],
    queryFn: () => analyticsAPI.getTopListings(period),
  });

  // Fetch performance metrics
  const performanceQuery = useQuery({
    queryKey: ['performance-metrics', period],
    queryFn: () => analyticsAPI.getPerformanceMetrics(period),
  });

  const isLoading = statsQuery.isLoading || revenueQuery.isLoading;
  const stats = statsQuery.data || {};
  const revenueData = revenueQuery.data || {};
  const salesData = salesQuery.data || {};
  const topListings = topListingsQuery.data?.listings || [];
  const performance = performanceQuery.data || {};

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seller Analytics
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track your sales performance and business metrics
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 font-medium capitalize transition ${
                period === p
                  ? 'bg-primary text-white dark:bg-accent'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={Math.round(stats.totalRevenue || 0)}
          trend={stats.revenueChange > 0 ? 'up' : 'down'}
          trendPercentage={Math.abs(stats.revenueChange || 0)}
          currency={true}
        />

        <StatCard
          icon={ShoppingCart}
          label="Total Sales"
          value={stats.totalSales || 0}
          trend={stats.salesChange > 0 ? 'up' : 'down'}
          trendPercentage={Math.abs(stats.salesChange || 0)}
        />

        <StatCard
          icon={Star}
          label="Average Rating"
          value={(stats.averageRating || 0).toFixed(1)}
          trend={stats.ratingChange > 0 ? 'up' : 'down'}
          trendPercentage={Math.abs(stats.ratingChange || 0)}
        />

        <StatCard
          icon={Users}
          label="Total Customers"
          value={stats.totalCustomers || 0}
          trend={stats.customersChange > 0 ? 'up' : 'down'}
          trendPercentage={Math.abs(stats.customersChange || 0)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          {revenueData.chart ? (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center dark:bg-gray-800">
              <p className="text-gray-500 text-sm">
                Chart integration ready - connect to charting library
              </p>
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center dark:bg-gray-800">
              <p className="text-gray-500 text-sm">No data available</p>
            </div>
          )}
        </div>

        {/* Sales Analytics */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Sales Analytics
          </h3>
          {salesData.items && salesData.items.length > 0 ? (
            <div className="space-y-4">
              {salesData.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className="h-full bg-primary dark:bg-accent"
                        style={{ width: `${(item.value / (salesData.max || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No sales data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Top Performing Listings
        </h3>

        {topListings.length === 0 ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No listings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Listing
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topListings.map((listing, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {listing.image && (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{listing.price?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">
                      {listing.sales || 0}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                      ₹{listing.revenue?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-900 dark:text-white">
                          {listing.rating?.toFixed(1) || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">
                      {listing.reviewCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {Object.keys(performance).length > 0 && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {(performance.conversionRate || 0).toFixed(2)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {performance.conversionTrend > 0 ? '↑' : '↓'} {Math.abs(performance.conversionTrend || 0)}%
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {performance.responseTime || '—'}
              </span>
              <span className="text-gray-500">hours</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Avg. inquiry response</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {(performance.satisfaction || 0).toFixed(0)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Based on reviews</p>
          </div>
        </div>
      )}
    </div>
  );
}
