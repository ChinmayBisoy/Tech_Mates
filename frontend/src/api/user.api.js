import instance from './axios'

export const userAPI = {
  getProfile: async (userId) => {
    const response = await instance.get(`/users/${userId}`)
    return response.data
  },

  getMe: async () => {
    const response = await instance.get('/users/me')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await instance.put('/users/me', data)
    return response.data
  },

  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await instance.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getDashboard: async () => {
    const response = await instance.get('/users/me/dashboard')
    return response.data
  },

  searchDevelopers: async (query, filters = {}) => {
    const response = await instance.get('/users/search', {
      params: { q: query, ...filters },
    })
    return response.data
  },
}
