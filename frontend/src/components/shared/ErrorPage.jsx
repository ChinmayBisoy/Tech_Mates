import { useRouteError, useNavigate } from 'react-router-dom'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorStatus = error?.status || 'Error'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Oops!
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          {errorStatus === 'Error' || errorStatus === 'NotFound' 
            ? 'Something went wrong'
            : `Error ${errorStatus}`
          }
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-3">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8">
          Error ID: {Math.random().toString(36).substr(2, 9)}
        </p>
      </div>
    </div>
  )
}
