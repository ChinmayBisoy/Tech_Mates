import axios from './axios'

export const chatAPI = {
  getRooms: async () => {
    const response = await axios.get('/chat/rooms')
    return response.data
  },

  createRoom: async (payload) => {
    const response = await axios.post('/chat/rooms', payload)
    return response.data
  },

  getMessages: async (roomId, params = {}) => {
    const response = await axios.get(`/chat/rooms/${roomId}/messages`, {
      params,
    })
    return response.data
  },

  deleteMessageForEveryone: async (messageId) => {
    const response = await axios.delete(`/chat/messages/${messageId}`)
    return response.data
  },

  deleteMessageForMe: async (messageId) => {
    const response = await axios.delete(`/chat/messages/${messageId}/me`)
    return response.data
  },

  clearRoomMessages: async (roomId) => {
    const response = await axios.delete(`/chat/rooms/${roomId}/messages`)
    return response.data
  },
}
