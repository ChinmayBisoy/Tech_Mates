import React from 'react';
import { Users } from 'lucide-react';
import UserProfileCard from '@/components/social/UserProfileCard';
import ReviewCard from '@/components/social/ReviewCard';

export const UserProfiles_Phase9 = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Profiles</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Connect with buyers and sellers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <UserProfileCard />
          </div>

          {/* Reviews & Feedback */}
          <div className="lg:col-span-2">
            <ReviewCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles_Phase9;
