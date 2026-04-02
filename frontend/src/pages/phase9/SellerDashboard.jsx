import React from 'react';
import { BarChart3 } from 'lucide-react';
import KPICard from '@/components/analytics/KPICard';
import RevenueChart from '@/components/analytics/RevenueChart';

export const SellerDashboard_Phase9 = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Track your sales, earnings, and performance</p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KPICard />
        </div>

        {/* Charts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard_Phase9;
