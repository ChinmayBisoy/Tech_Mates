import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useNotifications } from './useNotifications'
import { useChatStore } from '@/store/chatStore'

let socketInstance = null

const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
  return String(apiUrl).replace(/\/api\/?$/, '')
}

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuth()
  const { addNotification } = useNotifications()
  const addIncomingMessage = useChatStore((state) => state.addIncomingMessage)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketInstance?.connected) {
        socketInstance.disconnect()
      }
      socketInstance = null
      socketRef.current = null
      return
    }

    if (socketInstance) {
      socketRef.current = socketInstance
      return
    }

    const initializeSocket = async () => {
      try {
        const { io } = await import('socket.io-client')

        socketInstance = io(getSocketServerUrl(), {
          auth: {
            token: accessToken,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        socketRef.current = socketInstance

        socketInstance.on('connect', () => {
          console.log('Socket connected')
        })

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected')
        })

        socketInstance.on('notification:new', (notification) => {
          addNotification(notification)
        })

        socketInstance.on('chat:message', (incomingMessage) => {
          addIncomingMessage(incomingMessage)
        })

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
        })
      } catch (error) {
        console.error('Failed to initialize socket:', error)
      }
    }

    initializeSocket()

    return () => {
      socketRef.current = socketInstance
    }
  }, [isAuthenticated, accessToken, addNotification, addIncomingMessage])

  const emit = useCallback((event, data) => {
    if (socketInstance) {
      socketInstance.emit(event, data)
    }
  }, [])

  const on = useCallback((event, callback) => {
    if (socketInstance) {
      socketInstance.on(event, callback)
    }

    return () => {
      if (socketInstance) {
        socketInstance.off(event, callback)
      }
    }
  }, [])

  return {
    socket: socketInstance,
    emit,
    on,
    isConnected: socketInstance?.connected || false,
  }
}
