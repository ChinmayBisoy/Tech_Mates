import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiBaseURL = import.meta.env.VITE_API_URL || '/api'

const instance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const shouldSkipRefresh = (url = '') => {
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token')
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

instance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse wrapper: extract .data from { statusCode, data, message, success, pagination? }
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      }
    }
    return response
  },
  (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance(originalRequest)
          })
          .catch(() => {
            useAuthStore.getState().clearAuth()
            window.location.href = '/login'
            return Promise.reject(error)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const { user, refreshToken } = useAuthStore.getState()

      if (!refreshToken) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      return axios
        .post(
          `${apiBaseURL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        )
        .then((response) => {
          const payload = response.data?.data ?? response.data
          const newAccessToken = payload?.accessToken || payload?.token

          if (!newAccessToken) {
            throw new Error('No access token returned from refresh endpoint')
          }

          useAuthStore.getState().setAuth(user, newAccessToken, payload?.refreshToken || refreshToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)

          return instance(originalRequest)
        })
        .catch((refreshError) => {
          processQueue(refreshError, null)
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        })
        .finally(() => {
          isRefreshing = false
        })
    }

    return Promise.reject(error)
  }
)

export default instance
