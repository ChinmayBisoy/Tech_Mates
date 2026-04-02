import React from 'react';
import { Search } from 'lucide-react';
import AdvancedSearch from '@/components/search/AdvancedSearch';

export const AdvancedSearchPage_Phase9 = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Search</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Find exactly what you're looking for with powerful filters</p>
        </div>

        {/* Search Component */}
        <AdvancedSearch />
      </div>
    </div>
  );
};

export default AdvancedSearchPage_Phase9;
