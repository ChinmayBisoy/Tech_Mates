import { useState, useCallback, useEffect } from 'react'

const WISHLIST_KEY = 'tech_mates_wishlist'

/**
 * Hook for managing user's wishlist
 * Stores wishlist items in localStorage
 */
export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY)
      if (stored) {
        setWishlistItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  }, [])

  // Save wishlist to localStorage
  const saveWishlist = useCallback((items) => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
      setWishlistItems(items)
    } catch (error) {
      console.error('Failed to save wishlist:', error)
    }
  }, [])

  // Add item to wishlist
  const addToWishlist = useCallback(
    (itemId) => {
      setWishlistItems((prev) => {
        if (prev.includes(itemId)) return prev
        const updated = [...prev, itemId]
        saveWishlist(updated)
        return updated
      })
    },
    [saveWishlist],
  )

  // Remove item from wishlist
  const removeFromWishlist = useCallback(
    (itemId) => {
      setWishlistItems((prev) => {
        const updated = prev.filter((id) => id !== itemId)
        saveWishlist(updated)
        return updated
      })
    },
    [saveWishlist],
  )

  // Check if item is in wishlist
  const isInWishlist = useCallback((itemId) => wishlistItems.includes(itemId), [wishlistItems])

  // Toggle wishlist item
  const toggleWishlist = useCallback(
    (itemId) => {
      if (isInWishlist(itemId)) {
        removeFromWishlist(itemId)
      } else {
        addToWishlist(itemId)
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  )

  // Get all wishlist items
  const getWishlistItems = useCallback(() => wishlistItems, [wishlistItems])

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    saveWishlist([])
  }, [saveWishlist])

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    getWishlistItems,
    clearWishlist,
  }
}
