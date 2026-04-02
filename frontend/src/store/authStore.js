import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        _hasHydrated: false,

        setHydrated: () => set({ _hasHydrated: true }),

        setAuth: (user, accessToken, refreshToken) => {
          set((state) => ({
            user,
            accessToken,
            refreshToken: refreshToken ?? state.refreshToken,
            _hasHydrated: true,
          }))
        },

        updateUser: (updates) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }))
        },

        logout: () => {
          set({ user: null, accessToken: null, refreshToken: null })
        },

        clearAuth: () => {
          set({ user: null, accessToken: null, refreshToken: null })
        },

        isAuthenticated: () => {
          const state = useAuthStore.getState()
          return state.user !== null && state.accessToken !== null
        },
      }),
      {
        name: 'techmates-auth',
        onRehydrateStorage: () => (state) => {
          // Mark as hydrated after localStorage is loaded
          state?.setHydrated()
        },
      }
    )
  )
)
