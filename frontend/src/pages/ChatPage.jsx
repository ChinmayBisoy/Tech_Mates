import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Send, Paperclip, MoreVertical, Phone, Video, Plus,
  Search, ChevronLeft, Smile, Clock, Check, CheckCheck,
} from 'lucide-react'
import axios from '@/api/axios'
import { getSocket, SOCKET_EVENTS } from '@/lib/socketClient'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/lib/toast'
import { cn } from '@/utils/cn'
import { CardSkeleton } from '@/components/shared/Skeletons'

// Chat API
const chatAPI = {
  getRooms: async () => {
    try {
      const response = await axios.get('/api/chat/rooms')
      return response.data.data || []
    } catch (error) {
      return [] // Fallback to mock rooms below
    }
  },
  getMessages: async (roomId) => {
    try {
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`)
      return response.data.data || []
    } catch (error) {
      return getMockMessages(roomId)
    }
  },
  createRoom: async (participantId) => {
    try {
      const response = await axios.post('/api/chat/rooms', { participantId })
      return response.data.data
    } catch (error) {
      throw new Error('Failed to create room')
    }
  },
  sendMessage: async (roomId, message) => {
    try {
      const response = await axios.post(`/api/chat/rooms/${roomId}/messages`, {
        content: message,
      })
      return response.data.data
    } catch (error) {
      throw new Error('Failed to send message')
    }
  },
}

// Mock data for development
function getMockRooms() {
  return [
    {
      _id: '1',
      participantId: 'user2',
      participantName: 'Alex Johnson',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      lastMessage: 'That sounds great! Let me review it.',
      lastMessageTime: new Date(Date.now() - 2 * 60000),
      unreadCount: 2,
      isOnline: true,
    },
    {
      _id: '2',
      participantId: 'user3',
      participantName: 'Sarah Smith',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastMessage: 'Can you help with the project?',
      lastMessageTime: new Date(Date.now() - 1 * 3600000),
      unreadCount: 0,
      isOnline: false,
    },
    {
      _id: '3',
      participantId: 'user4',
      participantName: 'Mike Chen',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      lastMessage: 'Meeting at 3 PM?',
      lastMessageTime: new Date(Date.now() - 5 * 3600000),
      unreadCount: 0,
      isOnline: true,
    },
  ]
}

function getMockMessages(roomId) {
  return [
    {
      _id: 'msg1',
      roomId,
      senderId: 'user2',
      senderName: 'Alex Johnson',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      _id: 'msg2',
      roomId,
      senderId: 'currentuser',
      senderName: 'You',
      content: 'Hi Alex! Doing good, working on the new feature.',
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
    },
    {
      _id: 'msg3',
      roomId,
      senderId: 'user2',
      senderName: 'Alex Johnson',
      content: 'Awesome! That sounds great! Let me review it.',
      timestamp: new Date(Date.now() - 3400000),
      isRead: true,
    },
  ]
}

// Individual chat room
function ChatRoom({ room, isSelected, onClick, isOnline }) {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return new Date(date).toLocaleDateString()
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left hover:bg-gray-100 dark:hover:bg-gray-700',
        isSelected && 'bg-primary-100 dark:bg-gray-700 border-l-4 border-primary-500'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={room.participantAvatar}
          alt={room.participantName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {room.participantName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
            {timeAgo(room.lastMessageTime)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-1">
          {room.lastMessage}
        </p>
      </div>

      {/* Unread Badge */}
      {room.unreadCount > 0 && (
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-white font-bold">
            {room.unreadCount > 9 ? '9+' : room.unreadCount}
          </span>
        </div>
      )}
    </button>
  )
}

// Message bubble
function MessageBubble({ message, isOwn, onDelete }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-md px-4 py-2 rounded-lg',
          isOwn
            ? 'bg-primary-500 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        )}
      >
        <p className="text-sm break-words">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
        style={{ animationDelay: '0.2s' }}
      />
      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  )
}

// Main Chat Page
export default function ChatPage() {
  const { user } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: chatAPI.getRooms,
    staleTime: 1 * 60 * 1000,
  })

  // Fetch messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom?._id],
    queryFn: () => chatAPI.getMessages(selectedRoom?._id),
    enabled: !!selectedRoom,
    staleTime: 0,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return chatAPI.sendMessage(selectedRoom._id, content)
    },
    onSuccess: () => {
      setMessageInput('')
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    },
    onError: () => {
      showToast.error('Failed to send message')
    },
  })

  // Socket.io setup
  useEffect(() => {
    socketRef.current = getSocket()

    if (selectedRoom) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId: selectedRoom._id,
      })
    }

    // Listen for new messages
    socketRef.current.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
      // Update message list in real-time
      console.log('New message received:', message)
    })

    // Listen for typing
    socketRef.current.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      setTypingUsers((prev) => new Set([...prev, data.userId]))
    })

    socketRef.current.on(SOCKET_EVENTS.USER_STOPPED_TYPING, (data) => {
      setTypingUsers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    })

    // Listen for online users
    socketRef.current.on(SOCKET_EVENTS.ONLINE_USERS, (users) => {
      setOnlineUsers(new Set(users))
    })

    return () => {
      if (selectedRoom) {
        socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, {
          roomId: selectedRoom._id,
        })
      }
    }
  }, [selectedRoom])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedRoom) return

    sendMessageMutation.mutate(messageInput)
  }

  const handleTyping = () => {
    if (selectedRoom) {
      socketRef.current.emit(SOCKET_EVENTS.TYPING, {
        roomId: selectedRoom._id,
      })
    }
  }

  // Use mock rooms if no data
  const displayRooms = rooms.length > 0 ? rooms : getMockRooms()
  const displayMessages = messages.length > 0 ? messages : (selectedRoom ? getMockMessages(selectedRoom._id) : [])

  return (
    <div className="h-screen flex bg-white dark:bg-base">
      {/* Chat List - Left Sidebar */}
      <div className={cn(
        'w-full md:w-80 bg-white dark:bg-surface border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex',
        selectedRoom && 'md:flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2">
          {roomsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : displayRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            displayRooms.map((room) => (
              <ChatRoom
                key={room._id}
                room={room}
                isSelected={selectedRoom?._id === room._id}
                onClick={() => setSelectedRoom(room)}
                isOnline={onlineUsers.has(room.participantId)}
              />
            ))
          )}
        </div>

        {/* New chat button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors">
            <Plus className="w-5 h-5" />
            New Message
          </button>
        </div>
      </div>

      {/* Chat Window - Right Side */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-base">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white dark:bg-surface border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedRoom.participantName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {onlineUsers.has(selectedRoom.participantId) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {displayMessages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.senderId === 'currentuser' || message.senderId === user?._id}
                    />
                  ))}
                  {typingUsers.size > 0 && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <TypingIndicator />
                      <span className="text-sm">typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="h-20 bg-white dark:bg-surface border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onInput={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending || !messageInput.trim()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5 text-primary-500" />
                </button>
              </form>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageBubble className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a conversation or start a new one
              </p>
              <button className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors">
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
