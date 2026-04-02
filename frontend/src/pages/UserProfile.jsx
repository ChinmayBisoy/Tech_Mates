import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Star,
  CheckCircle,
  Calendar,
  Award,
  Edit3,
  Upload,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Placeholder user data (in real app, fetch from API)
  const [profile] = useState({
    id: userId,
    name: 'John Developer',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer',
    bio: 'Experienced full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
    rating: 4.8,
    reviews: 152,
    completedProjects: 89,
    joinDate: '2022-03-15',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    hourlyRate: '₹1500',
    isVerified: true,
    tier: 'Top',
  });

  const isOwnProfile = currentUser?.id === userId || currentUser?._id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-accent-400 hover:text-primary-700 dark:hover:text-accent-300 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero/Profile Card */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface shadow-lg overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative">
            <div className="pointer-events-none absolute -top-20 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="px-6 sm:px-8 pb-8 -mt-14 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5 justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative w-fit">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-surface shadow-xl"
                  />
                  {profile.isVerified && (
                    <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                      <Award className="w-3.5 h-3.5" />
                      {profile.tier} Tier
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                    {profile.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile/edit')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-accent dark:hover:bg-accent-600 px-4 py-2.5 text-white font-semibold transition-colors whitespace-nowrap h-fit"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {profile.bio}
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{profile.rating}</span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reviews</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.reviews}</p>
              </div>

              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.completedProjects}</p>
              </div>

              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.hourlyRate}/hr</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
