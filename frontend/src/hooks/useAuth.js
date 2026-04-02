import { useAuthStore } from '@/store/authStore'
import { isProfileComplete } from '@/utils/profileCompletion'

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuth = useAuthStore((state) => state.setAuth)
  const updateUser = useAuthStore((state) => state.updateUser)
  const logout = useAuthStore((state) => state.logout)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const _hasHydrated = useAuthStore((state) => state._hasHydrated)

  return {
    user,
    accessToken,
    setAuth,
    updateUser,
    logout,
    clearAuth,
    isAuthenticated: isAuthenticated(),
    isProfileComplete: isProfileComplete(user),
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user' || user?.role === 'client',
    isDeveloper: user?.role === 'developer',
    hasHydrated: _hasHydrated,
  }
}
