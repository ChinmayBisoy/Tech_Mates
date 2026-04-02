import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/shared/PageLoader'

export function Dashboard() {
  const { user, hasHydrated } = useAuth()

  // Wait for auth to hydrate
  if (!hasHydrated || !user) {
    return <PageLoader />
  }

  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  if (user.role === 'client') {
    return <Navigate to="/user/dashboard" replace />
  }
  if (user.role === 'developer') {
    return <Navigate to="/developer/dashboard" replace />
  }

  // Fallback to login if role is not recognized
  return <Navigate to="/login" replace />
}
