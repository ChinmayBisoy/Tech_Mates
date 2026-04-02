import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from './ProtectedRoute'
import { PageLoader } from '@/components/shared/PageLoader'

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, hasHydrated } = useAuth()

  // Wait for auth state to load from localStorage
  if (!hasHydrated) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}
