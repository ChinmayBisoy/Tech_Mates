import io from 'socket.io-client'

let socket = null

export const initSocket = (serverUrl = import.meta.env.VITE_API_URL) => {
  if (socket) return socket

  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    auth: {
      token: localStorage.getItem('token'),
    },
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event constants
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Chat
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  // User Status
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  GET_ONLINE_USERS: 'get_online_users',
  ONLINE_USERS: 'online_users',

  // Room
  CREATE_ROOM: 'create_room',
  ROOM_CREATED: 'room_created',
  GET_ROOMS: 'get_rooms',
  ROOMS_LIST: 'rooms_list',

  // Delete/Edit
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_DELETED: 'message_deleted',
  EDIT_MESSAGE: 'edit_message',
  MESSAGE_EDITED: 'message_edited',

  // Read status
  MARK_AS_READ: 'mark_as_read',
  MESSAGE_READ: 'message_read',
}
