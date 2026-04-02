import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * Hook to check if auth state has been loaded from localStorage
 * This prevents flickering during initial page load when persist is rehydrating
 */
export const useAuthPersist = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Check if persist has finished loading
    const unsubscribe = useAuthStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true)
    })

    // Also check if already hydrated (fast path for already-loaded state)
    if (useAuthStore.persist?.getOptions?.()?.enabled) {
      setIsHydrated(true)
    }

    return () => unsubscribe?.()
  }, [])

  return isHydrated
}
