import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import * as subscriptionAPI from '@/api/subscription.api'

const useSubscriptionStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentSubscription: null,
        plans: [],
        selectedPlan: null,
        loading: false,
        error: null,

        // Actions
        setCurrentSubscription: (subscription) =>
          set({ currentSubscription: subscription }),

        setSelectedPlan: (plan) => set({ selectedPlan: plan }),

        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error }),

        // Fetch plans
        fetchPlans: async () => {
          set({ loading: true, error: null })
          try {
            const plans = await subscriptionAPI.getSubscriptionPlans()
            set({ plans, loading: false })
            return plans
          } catch (error) {
            const errorMsg = error?.message || 'Failed to fetch plans'
            set({ error: errorMsg, loading: false })
            throw error
          }
        },

        // Get current subscription
        fetchCurrentSubscription: async () => {
          set({ loading: true, error: null })
          try {
            const subscription = await subscriptionAPI.getSubscription()
            set({ currentSubscription: subscription, loading: false })
            return subscription
          } catch (error) {
            // 404 is expected if user has no subscription
            if (error?.statusCode !== 404) {
              const errorMsg = error?.message || 'Failed to fetch subscription'
              set({ error: errorMsg })
            }
            set({ loading: false })
            return null
          }
        },

        // Upgrade subscription
        upgradeSubscription: async (planId) => {
          set({ loading: true, error: null })
          try {
            const response = await subscriptionAPI.upgradeSubscription(planId)
            set({ currentSubscription: response, loading: false })
            return response
          } catch (error) {
            const errorMsg = error?.message || 'Failed to upgrade subscription'
            set({ error: errorMsg, loading: false })
            throw error
          }
        },

        // Cancel subscription
        cancelSubscription: async () => {
          set({ loading: true, error: null })
          try {
            const response = await subscriptionAPI.cancelSubscription()
            set({ currentSubscription: null, loading: false })
            return response
          } catch (error) {
            const errorMsg = error?.message || 'Failed to cancel subscription'
            set({ error: errorMsg, loading: false })
            throw error
          }
        },

        // Clear errors
        clearError: () => set({ error: null }),

        // Reset
        reset: () =>
          set({
            currentSubscription: null,
            plans: [],
            selectedPlan: null,
            loading: false,
            error: null,
          }),
      }),
      {
        name: 'subscription-store',
      }
    )
  )
)

export default useSubscriptionStore
