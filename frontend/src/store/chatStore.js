import { create } from 'zustand'
import { chatAPI } from '@/api/chat.api'
import { useAuthStore } from '@/store/authStore'

const normalizeRoom = (room, currentUserId) => {
  const participants = Array.isArray(room?.participants) ? room.participants : []
  const otherParticipant = participants.find(
    (participant) => String(participant?._id || participant?.id) !== String(currentUserId)
  )

  return {
    id: String(room?._id || room?.id),
    participantId: String(otherParticipant?._id || otherParticipant?.id || ''),
    participantName: otherParticipant?.name || 'Unknown user',
    participantAvatar: otherParticipant?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherParticipant?.name || 'User')}`,
    lastMessage: room?.lastMessage || 'No messages yet',
    lastMessageAt: room?.lastMessageAt || room?.updatedAt || room?.createdAt || null,
  }
}

const normalizeMessage = (message) => ({
  id: String(message?._id || message?.id),
  roomId: String(message?.roomId || ''),
  senderId: String(message?.senderId?._id || message?.senderId || ''),
  senderName: message?.senderId?.name || 'Unknown',
  senderAvatar: message?.senderId?.avatar || null,
  content: message?.content || '',
  createdAt: message?.createdAt || new Date().toISOString(),
  type: message?.type || 'text',
})

const buildRoomPreviewFromMessages = (messages = []) => {
  const lastMessage = messages[messages.length - 1]
  return {
    lastMessage: lastMessage?.content || 'No messages yet',
    lastMessageAt: lastMessage?.createdAt || null,
  }
}

export const useChatStore = create((set, get) => ({
  rooms: [],
  activeRoomId: null,
  isChatViewOpen: false,
  messagesByRoom: {},
  unreadByRoom: {}, // Track unread count per room
  loadingRooms: false,
  loadingMessages: false,

  setChatViewOpen: (isOpen) => {
    set({ isChatViewOpen: Boolean(isOpen) })
  },

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId ? String(roomId) : null })
    // Mark room as read when switching to it
    if (roomId) {
      const roomIdStr = String(roomId)
      set((state) => ({
        unreadByRoom: {
          ...state.unreadByRoom,
          [roomIdStr]: 0,
        },
      }))
    }
  },

  markAllAsRead: () => {
    set((state) => {
      const nextUnreadByRoom = Object.keys(state.unreadByRoom || {}).reduce((acc, roomId) => {
        acc[roomId] = 0
        return acc
      }, {})

      return {
        unreadByRoom: nextUnreadByRoom,
      }
    })
  },

  fetchRooms: async (currentUserId) => {
    set({ loadingRooms: true })
    try {
      const rooms = await chatAPI.getRooms()
      const normalizedRooms = (rooms || []).map((room) => normalizeRoom(room, currentUserId))

      set((state) => ({
        rooms: normalizedRooms,
        activeRoomId: state.activeRoomId || normalizedRooms[0]?.id || null,
        loadingRooms: false,
      }))
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
      set({ loadingRooms: false })
    }
  },

  fetchMessages: async (roomId) => {
    if (!roomId) {
      return
    }

    set({ loadingMessages: true })
    try {
      const result = await chatAPI.getMessages(roomId)
      const messages = (result?.messages || []).map(normalizeMessage)

      set((state) => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [String(roomId)]: messages,
        },
        loadingMessages: false,
      }))
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      set({ loadingMessages: false })
    }
  },

  clearRoomMessages: async (roomId) => {
    if (!roomId) {
      return
    }

    try {
      await chatAPI.clearRoomMessages(roomId)
      get().clearRoomLocally(roomId)
    } catch (error) {
      console.error('Failed to clear chat messages:', error)
      throw error
    }
  },

  clearRoomLocally: (roomId) => {
    if (!roomId) {
      return
    }

    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [String(roomId)]: [],
      },
      rooms: state.rooms.map((room) =>
        room.id === String(roomId)
          ? {
              ...room,
              lastMessage: 'No messages yet',
              lastMessageAt: null,
            }
          : room
      ),
    }))
  },

  removeMessageLocally: (roomId, messageId) => {
    if (!roomId || !messageId) {
      return
    }

    set((state) => {
      const roomIdStr = String(roomId)
      const existingMessages = state.messagesByRoom[roomIdStr] || []
      const nextMessages = existingMessages.filter((msg) => msg.id !== String(messageId))
      const preview = buildRoomPreviewFromMessages(nextMessages)

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomIdStr]: nextMessages,
        },
        rooms: state.rooms.map((room) =>
          room.id === roomIdStr
            ? {
                ...room,
                ...preview,
              }
            : room
        ),
      }
    })
  },

  deleteMessageForMe: async (roomId, messageId) => {
    if (!roomId || !messageId) {
      return
    }

    try {
      await chatAPI.deleteMessageForMe(messageId)
      get().removeMessageLocally(roomId, messageId)
    } catch (error) {
      console.error('Failed to delete message for current user:', error)
      throw error
    }
  },

  deleteMessageForEveryone: async (roomId, messageId) => {
    if (!roomId || !messageId) {
      return
    }

    try {
      await chatAPI.deleteMessageForEveryone(messageId)
      get().removeMessageLocally(roomId, messageId)
    } catch (error) {
      console.error('Failed to delete message for everyone:', error)
      throw error
    }
  },

  addIncomingMessage: (message) => {
    const normalizedMessage = normalizeMessage(message)
    const roomId = normalizedMessage.roomId

    if (!roomId) {
      return
    }

    set((state) => {
      const existingMessages = state.messagesByRoom[roomId] || []
      const isDuplicate = existingMessages.some((item) => item.id === normalizedMessage.id)

      if (isDuplicate) {
        return state
      }

      const currentUserId = String(
        useAuthStore.getState()?.user?._id || useAuthStore.getState()?.user?.id || ''
      )
      const isOwnMessage = String(normalizedMessage.senderId || '') === currentUserId

      // Only increment unread if chat page is not currently open for this room.
      const isActiveRoom = state.activeRoomId === roomId
      const isViewingRoom = state.isChatViewOpen && isActiveRoom
      const currentUnread = state.unreadByRoom[roomId] || 0

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...existingMessages, normalizedMessage],
        },
        unreadByRoom: {
          ...state.unreadByRoom,
          [roomId]: isViewingRoom || isOwnMessage ? 0 : currentUnread + 1,
        },
        rooms: state.rooms
          .map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage: normalizedMessage.content,
                  lastMessageAt: normalizedMessage.createdAt,
                }
              : room
          )
          .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()),
      }
    })
  },

  resetChat: () => {
    set({
      rooms: [],
      activeRoomId: null,
      isChatViewOpen: false,
      messagesByRoom: {},
      unreadByRoom: {},
      loadingRooms: false,
      loadingMessages: false,
    })
  },

  getActiveMessages: () => {
    const state = get()
    return state.activeRoomId ? state.messagesByRoom[state.activeRoomId] || [] : []
  },

  getTotalUnreadCount: () => {
    const state = get()
    return Object.values(state.unreadByRoom || {}).reduce((sum, count) => sum + (count || 0), 0)
  },
}))
