import instance from './axios'

export const listingAPI = {
  fetchListings: async (filters = {}, page = 1, limit = 12) => {
    const response = await instance.get('/listings', {
      params: { ...filters, page, limit },
    })
    return response.data
  },

  fetchFeaturedListings: async (limit = 6) => {
    const response = await instance.get('/listings', {
      params: { featured: true, limit },
    })
    return response.data
  },

  getListingDetail: async (slug) => {
    const response = await instance.get(`/listings/${slug}`)
    return response.data
  },

  getMyListings: async (page = 1, limit = 12) => {
    const response = await instance.get('/listings/my', {
      params: { page, limit },
    })
    return response.data
  },

  createListing: async (data) => {
    const response = await instance.post('/listings', data)
    return response.data
  },

  updateListing: async (id, data) => {
    const response = await instance.put(`/listings/${id}`, data)
    return response.data
  },

  deleteListing: async (id) => {
    const response = await instance.delete(`/listings/${id}`)
    return response.data
  },
}
