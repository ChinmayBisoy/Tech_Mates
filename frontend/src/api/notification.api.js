import instance from './axios'

export const notificationAPI = {
  getNotifications: async () => {
    const response = await instance.get('/notifications')
    return response.data
  },

  markAsRead: async (notificationId) => {
    const response = await instance.put(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await instance.put('/notifications/read-all')
    return response.data
  },

  deleteAllNotifications: async () => {
    const response = await instance.delete('/notifications/delete-all')
    return response.data
  },
}
