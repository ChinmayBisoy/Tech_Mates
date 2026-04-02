import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '@/store/analyticsStore';

// Revenue Chart Component - Displays revenue trends
export default function RevenueChart() {
  const { revenueData, categoryPerformance, getHighestRevenueDay, getTotalRevenue } = useAnalyticsStore();

  const highestDay = getHighestRevenueDay()();
  const totalRevenue = getTotalRevenue()();
  const avgRevenue = totalRevenue / revenueData.length;

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${avgRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per day average</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${highestDay?.revenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{highestDay?.date}</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              dot={false}
              strokeWidth={2}
              name="Daily Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryPerformance}
                dataKey="sales"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Categories</h3>
          <div className="space-y-3">
            {categoryPerformance.map((cat, idx) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.category}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
