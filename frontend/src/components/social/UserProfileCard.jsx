import React from 'react';
import { Mail, Phone, Globe, Users, Star, Shield } from 'lucide-react';
import { useSocialStore } from '@/store/socialStore';

// User Profile Card - Display user information and stats
export default function UserProfileCard() {
  const { userProfile, followers, following } = useSocialStore();

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'email_verified':
        return <Mail className="w-4 h-4" />;
      case 'phone_verified':
        return <Phone className="w-4 h-4" />;
      case 'seller_verified':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header background */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />

      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end gap-4 mb-4 -mt-12">
          <img
            src={userProfile.avatar}
            alt={userProfile.username}
            className="w-24 h-24 rounded-lg border-4 border-white dark:border-gray-800 shadow-lg"
          />
        </div>

        {/* User info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">@{userProfile.username}</p>
          {userProfile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">{userProfile.bio}</p>
          )}
          
          {/* Location */}
          {userProfile.location && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">📍 {userProfile.location}</p>
          )}
        </div>

        {/* Verified badges */}
        {userProfile.verifiedBadges.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {userProfile.verifiedBadges.map(badge => (
              <div
                key={badge}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
              >
                {getBadgeIcon(badge)}
                {badge.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.followers}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.following}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.totalReviews}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.averageRating}</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
          </div>
        </div>

        {/* Trust score */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{userProfile.trustScore}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${userProfile.trustScore}%` }}
            />
          </div>
        </div>

        {/* Website and social links */}
        {(userProfile.website || userProfile.socialLinks) && (
          <div className="flex gap-3 flex-wrap">
            {userProfile.website && (
              <a
                href={userProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {userProfile.socialLinks?.twitter && (
              <a
                href={`https://twitter.com/${userProfile.socialLinks.twitter.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                𝕏 Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
