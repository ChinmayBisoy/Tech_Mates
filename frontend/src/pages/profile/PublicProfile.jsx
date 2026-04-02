import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Edit, ExternalLink, Globe, Github, Linkedin, Instagram } from 'lucide-react'
import { userAPI } from '@/api/user.api'
import { reviewAPI } from '@/api/review.api'
import { useAuth } from '@/hooks/useAuth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { SkillTags } from '@/components/profile/SkillTags'
import { ReviewList } from '@/components/profile/ReviewList'
import { PageLoader } from '@/components/shared/PageLoader'
import { ErrorState } from '@/components/shared/ErrorState'

function PublicProfile() {
  const { id, userId } = useParams()
  const rawProfileId = userId || id
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const currentUserId = String(currentUser?._id || currentUser?.id || '')
  const normalizedProfileId =
    rawProfileId && rawProfileId !== 'undefined' && rawProfileId !== 'null'
      ? rawProfileId
      : ''
  const viewedProfileId = String(
    normalizedProfileId === 'me' ? currentUserId : normalizedProfileId || currentUserId || ''
  )
  const isSelfProfileRoute = Boolean(
    currentUserId &&
      (
        normalizedProfileId === 'me' ||
        !normalizedProfileId ||
        normalizedProfileId === currentUserId
      )
  )
  const isOwnProfile = Boolean(currentUserId && viewedProfileId && currentUserId === viewedProfileId)

  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['profile', viewedProfileId],
    queryFn: async () => {
      if (!normalizedProfileId || normalizedProfileId === 'me' || normalizedProfileId === currentUserId) {
        return userAPI.getMe()
      }

      return userAPI.getProfile(normalizedProfileId)
    },
    enabled: !isSelfProfileRoute && !!viewedProfileId,
  })

  const user = isSelfProfileRoute ? (currentUser || {}) : (userResponse || {})

  const profileLinks = [
    ...(Array.isArray(user.portfolioLinks) ? user.portfolioLinks : []),
  ]

  const githubUrl = user.githubUsername
    ? `https://github.com/${user.githubUsername.replace(/^@/, '')}`
    : ''

  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', 'user', isSelfProfileRoute ? currentUserId : viewedProfileId],
    queryFn: () => reviewAPI.getUserReviews(isSelfProfileRoute ? currentUserId : viewedProfileId),
    enabled: !!(isSelfProfileRoute ? currentUserId : viewedProfileId),
  })

  const reviews = reviewsResponse?.reviews || []

  if (!isSelfProfileRoute && userLoading) return <PageLoader />

  if (!isSelfProfileRoute && userError) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <ErrorState
            title="Profile not found"
            message="The user you're looking for doesn't exist"
            onRetry={() => refetchUser()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader
          user={user}
          action={
            isOwnProfile ? (
              <button
                onClick={() => navigate('/profile/edit')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-md shadow-primary-300/40 transition-all hover:-translate-y-0.5"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : null
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {user.skills && user.skills.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Skills
                </h3>
                <SkillTags skills={user.skills} />
              </div>
            )}

            {profileLinks.length > 0 || user.website || githubUrl || user.linkedin || user.instagram ? (
              <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Links
                </h3>
                <div className="space-y-3">
                  {profileLinks.map((link, index) => (
                    <a
                      key={`${link}-${index}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 ring-1 ring-slate-200 dark:ring-gray-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Globe className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        Portfolio {index + 1}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300" />
                    </a>
                  ))}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 ring-1 ring-slate-200 dark:ring-gray-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Globe className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        Website
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300" />
                    </a>
                  )}
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 ring-1 ring-slate-200 dark:ring-gray-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Github className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        GitHub
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 ring-1 ring-slate-200 dark:ring-gray-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Linkedin className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        LinkedIn
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300" />
                    </a>
                  )}
                  {user.instagram && (
                    <a
                      href={user.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 ring-1 ring-slate-200 dark:ring-gray-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Instagram className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                        Instagram
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300" />
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Reviews
              </h2>
              {reviewsLoading ? (
                <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-12 text-center">
                  <p className="text-slate-600 dark:text-gray-400">
                    Loading reviews...
                  </p>
                </div>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfile
