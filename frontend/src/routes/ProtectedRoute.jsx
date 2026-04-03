import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/shared/PageLoader'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasHydrated } = useAuth()

  // Wait for auth state to load from localStorage
  if (!hasHydrated) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
