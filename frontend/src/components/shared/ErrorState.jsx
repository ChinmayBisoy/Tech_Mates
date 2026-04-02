import { AlertCircle, RotateCcw } from 'lucide-react'

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading this content',
  onRetry = null
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="w-12 h-12 text-danger mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}
