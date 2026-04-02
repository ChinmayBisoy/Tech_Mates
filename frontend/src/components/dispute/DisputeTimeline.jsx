import { MessageCircle, FileText, AlertCircle, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'

export function DisputeTimeline({ messages, evidence, createdDate }) {
  // Combine messages and evidence into a single timeline
  const timeline = [
    ...messages.map((msg) => ({
      ...msg,
      type: 'message',
      timestamp: msg.timestamp,
    })),
    ...evidence.map((ev) => ({
      ...ev,
      type: 'evidence',
      timestamp: ev.timestamp,
    })),
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'evidence':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      case 'evidence':
        return <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dispute Timeline</h3>
        <span className="ml-auto text-sm font-semibold text-gray-600 dark:text-gray-400">
          {timeline.length} {timeline.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative space-y-3">
        {/* Initial Creation Point */}
        <div className="relative pl-8 pb-4 border-l-2 border-gray-300 dark:border-gray-600">
          <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-white dark:border-surface" />
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Dispute Created
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {formatTime(createdDate)}
            </p>
          </div>
        </div>

        {/* Timeline Entries */}
        {timeline.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No messages or evidence submitted yet.
            </p>
          </div>
        ) : (
          timeline.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'relative pl-8',
                index < timeline.length - 1 && 'pb-4 border-l-2 border-gray-300 dark:border-gray-600'
              )}
            >
              {/* Timeline Dot */}
              <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-white dark:bg-surface border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>

              {/* Timeline Content */}
              <div className={cn('border-2 p-3 rounded-lg', getTypeColor(item.type))}>
                {item.type === 'message' ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.sender}
                      </p>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        💬 Message
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {item.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTime(item.timestamp)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.submittedBy}
                      </p>
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                        📎 {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {item.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTime(item.timestamp)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
