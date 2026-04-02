import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-base flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-danger mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
