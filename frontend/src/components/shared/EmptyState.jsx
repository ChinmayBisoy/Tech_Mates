import { Inbox } from 'lucide-react'

export function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No items found', 
  description = 'Try adjusting your filters or search terms' 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
        {description}
      </p>
    </div>
  )
}
