import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb() {
  const location = useLocation()
  
  // Map paths to friendly names
  const pathMap = {
    '': 'Home',
    'dashboard': 'Dashboard',
    'projects': 'Projects',
    'browse': 'Browse Projects',
    'post': 'Post Project',
    'earnings': 'Earnings',
    'subscription': 'Subscription',
    'my-subscription': 'My Subscription',
    'withdraw': 'Withdraw Funds',
    'performance-metrics': 'Performance Metrics',
    'settings': 'Settings',
    'profile': 'Profile',
    'help': 'Help',
    'admin': 'Administration',
  }

  const generateBreadcrumbs = () => {
    const pathArray = location.pathname
      .split('/')
      .filter((p) => p)
      .slice(0, 3) // Limit to 3 levels

    if (pathArray.length === 0) return null

    const breadcrumbs = [
      { label: 'Home', path: '/' },
      ...pathArray.map((segment, index) => ({
        label: pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: '/' + pathArray.slice(0, index + 1).join('/'),
        isCurrent: index === pathArray.length - 1,
      })),
    ]

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (!breadcrumbs || breadcrumbs.length <= 1) return null

  return (
    <nav className="py-3 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 rounded-b-lg">
      <ol className="flex items-center gap-2 max-w-7xl mx-auto flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index === 0 ? (
              <Link
                to={crumb.path}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Home"
              >
                <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                {crumb.isCurrent ? (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
