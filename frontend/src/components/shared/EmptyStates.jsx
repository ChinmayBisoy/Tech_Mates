import { Plus, Search, AlertCircle, Home, Inbox, Star } from 'lucide-react'

export function EmptyState({ icon: Icon, title, description, action, actionText }) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  )
}

export function EmptyProjects({ onCreateNew }) {
  return (
    <EmptyState
      icon={Inbox}
      title="No Projects Yet"
      description="Start earning by posting your first project on the marketplace. Clients are waiting for skilled developers like you!"
      action={onCreateNew}
      actionText="Post a Project"
    />
  )
}

export function EmptyEarnings() {
  return (
    <EmptyState
      icon={Star}
      title="No Earnings Yet"
      description="Complete projects to start earning. Your first milestone payment will appear here once a project is completed."
    />
  )
}

export function EmptySearch({ searchTerm }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms or filters.`}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No Notifications"
      description="You're all caught up! New notifications will appear here."
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Star}
      title="No Favorites Yet"
      description="Save projects and developers you're interested in. They'll appear here for easy access."
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={Inbox}
      title="No Messages"
      description="Your conversations will appear here. Start chatting with clients and developers!"
    />
  )
}

export function ErrorState({ title, description, action, actionText, icon: Icon = AlertCircle }) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
        <Icon className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
