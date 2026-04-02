import { Star, MapPin, Calendar, Sparkles } from 'lucide-react'
import { formatAbsolute } from '@/utils/formatDate'

export function ProfileHeader({ user = {}, action = null }) {
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const getTierColor = (tier) => {
    const tiers = {
      new: 'bg-slate-100/90 text-slate-700 ring-1 ring-slate-200',
      rising: 'bg-sky-100/90 text-sky-800 ring-1 ring-sky-200',
      trusted: 'bg-emerald-100/90 text-emerald-800 ring-1 ring-emerald-200',
      top: 'bg-indigo-100/90 text-indigo-800 ring-1 ring-indigo-200',
      elite: 'bg-amber-100/90 text-amber-900 ring-1 ring-amber-200',
    }
    return tiers[tier] || tiers.new
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/80 p-6 md:p-8 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.35)]">
      <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative flex flex-col gap-7">
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-2xl flex items-center justify-center ring-4 ring-white shadow-lg">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 truncate">
                    {user.name}
                  </h1>
                  {user.username && (
                    <p className="mt-1 text-base font-medium text-slate-500">
                      @{user.username}
                    </p>
                  )}
                </div>

                {action}
              </div>

              {user.role === 'developer' && user.tier && (
                <span className={`inline-flex w-fit items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getTierColor(user.tier)}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Tier
                </span>
              )}
            </div>

            {user.bio && (
              <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-3xl">
                {user.bio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-slate-200">
                <Calendar className="w-4 h-4 text-slate-500" />
                Joined {formatAbsolute(user.createdAt)}
              </div>
              {user.location && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-slate-200">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avg Rating</p>
            <div className="mt-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-bold text-slate-900">{(user.avgRating || 0).toFixed(1)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reviews</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{user.totalReviews || 0}</p>
          </div>

          {user.role === 'developer' && (
            <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{user.totalContractsCompleted || 0}</p>
            </div>
          )}

          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-2 text-2xl font-bold capitalize text-slate-900">{user.role || 'user'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
