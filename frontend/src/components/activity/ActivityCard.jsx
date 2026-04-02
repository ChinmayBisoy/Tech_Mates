import { Link } from 'react-router-dom'
import { Clock, MapPin, DollarSign, Star } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ActivityCard({ activity }) {
  const getActivityColor = (type) => {
    const colors = {
      project_posted: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10',
      developer_hired: 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10',
      project_completed: 'border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/10',
      requirement_posted: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10',
      milestone_completed: 'border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-900/10',
      proposal_submitted: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10',
      developer_rated: 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-900/10'
    }
    return colors[type] || 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10'
  }

  const getActivityBadge = (type) => {
    const badges = {
      project_posted: { label: 'New Project', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      developer_hired: { label: 'Hired', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      project_completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      requirement_posted: { label: 'New Requirement', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
      milestone_completed: { label: 'Milestone', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
      proposal_submitted: { label: 'Proposal', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
      developer_rated: { label: 'Review', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' }
    }
    return badges[type] || { label: 'Activity', color: 'bg-gray-100 text-gray-800' }
  }

  const formatTime = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const badge = getActivityBadge(activity.type)

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all hover:shadow-lg dark:hover:shadow-lg/20',
      getActivityColor(activity.type)
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <img
            src={activity.user.avatar}
            alt={activity.user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {activity.title}
              </h3>
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap', badge.color)}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              by <span className="font-medium text-gray-900 dark:text-white">{activity.user.name}</span>
            </p>
          </div>

          {/* Icon */}
          <div className="text-2xl flex-shrink-0">{activity.icon}</div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          {formatTime(activity.timestamp)}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
        {activity.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        {/* Category */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
          {activity.category}
        </span>

        {/* Budget */}
        {activity.budget && (
          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-3 h-3" />
            {activity.budget}
          </span>
        )}

        {/* Rating */}
        {activity.user.rating && (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <Star className="w-3 h-3 fill-current" />
            {activity.user.rating}.0
          </span>
        )}
      </div>

      {/* Action Button */}
      <button className="mt-4 w-full py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm">
        View Details
      </button>
    </div>
  )
}
