import instance from './axios'

export const authAPI = {
  register: async (data) => {
    const response = await instance.post('/auth/register', data)
    return response.data
  },

  login: async (credentials) => {
    const response = await instance.post('/auth/login', credentials)
    return response.data
  },

  logout: async () => {
    const response = await instance.post('/auth/logout')
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await instance.post('/auth/refresh-token', { refreshToken })
    return response.data
  },

  getMe: async () => {
    const response = await instance.get('/auth/me')
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await instance.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token, password) => {
    const response = await instance.post(`/auth/reset-password/${token}`, {
      password,
    })
    return response.data
  },
}
