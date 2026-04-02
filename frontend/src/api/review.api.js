import instance from './axios'

export const reviewAPI = {
  createReview: async (data) => {
    const response = await instance.post('/reviews', data)
    return response.data
  },

  getUserReviews: async (userId, page = 1, limit = 10) => {
    const response = await instance.get(`/reviews/user/${userId}`, {
      params: { page, limit },
    })
    return response.data
  },

  getListingReviews: async (listingId, page = 1, limit = 10) => {
    const response = await instance.get(`/reviews/listing/${listingId}`, {
      params: { page, limit },
    })
    return response.data
  },
}
