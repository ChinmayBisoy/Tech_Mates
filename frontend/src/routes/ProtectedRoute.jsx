import { Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/shared/PageLoader'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasHydrated, isProfileComplete, user } = useAuth()
  const location = useLocation()

  // Wait for auth state to load from localStorage
  if (!hasHydrated) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isSetupRoute = location.pathname === '/profile/setup'
  const isAdmin = user?.role === 'admin'

  if (!isAdmin && !isProfileComplete && !isSetupRoute) {
    return <Navigate to="/profile/setup" replace />
  }

  return children
}
