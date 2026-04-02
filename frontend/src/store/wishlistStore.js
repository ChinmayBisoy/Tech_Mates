import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export const useWishlistStore = create(
  devtools(
    persist(
      (set) => ({
        wishlistedIds: new Set(),

        addToWishlist: (listingId) => {
          set((state) => ({
            wishlistedIds: new Set([...state.wishlistedIds, listingId]),
          }))
        },

        removeFromWishlist: (listingId) => {
          set((state) => {
            const newSet = new Set(state.wishlistedIds)
            newSet.delete(listingId)
            return { wishlistedIds: newSet }
          })
        },

        isWishlisted: (listingId) => {
          const state = useWishlistStore.getState()
          return state.wishlistedIds.has(listingId)
        },

        clearWishlist: () => {
          set({ wishlistedIds: new Set() })
        },
      }),
      {
        name: 'techmates-wishlist',
      }
    )
  )
)
