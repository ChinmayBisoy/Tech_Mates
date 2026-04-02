import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import MessageThread from '@/components/social/MessageThread'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { useChatStore } from '@/store/chatStore'
import { useNotificationStore } from '@/store/notificationStore'

export const Messages_Phase9 = () => {
  const { roomId: routeRoomId } = useParams()
  const location = useLocation()
  const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search])
  const queryRoomId = queryParams.get('roomId')

  const { user } = useAuth()
  const { emit, on } = useSocket()
  const markTypeAsRead = useNotificationStore((state) => state.markTypeAsRead)
  const [isClearingChat, setIsClearingChat] = React.useState(false)
  const [deletingMessageId, setDeletingMessageId] = React.useState(null)

  const {
    rooms,
    activeRoomId,
    messagesByRoom,
    loadingRooms,
    loadingMessages,
    setActiveRoom,
    fetchRooms,
    fetchMessages,
    clearRoomMessages,
    clearRoomLocally,
    removeMessageLocally,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useChatStore()

  const effectiveRoomId = routeRoomId || queryRoomId || null

  React.useEffect(() => {
    if (!user?._id && !user?.id) {
      return
    }

    fetchRooms(user?._id || user?.id)
  }, [fetchRooms, user?._id, user?.id])

  React.useEffect(() => {
    if (effectiveRoomId) {
      setActiveRoom(effectiveRoomId)
    }
  }, [effectiveRoomId, setActiveRoom])

  React.useEffect(() => {
    // Opening the messages page means message notifications are now seen.
    markTypeAsRead('new_message')
  }, [markTypeAsRead])

  React.useEffect(() => {
    if (!activeRoomId) {
      return
    }

    fetchMessages(activeRoomId)
    emit('chat:join', activeRoomId)

    return () => {
      emit('chat:leave', activeRoomId)
    }
  }, [activeRoomId, emit, fetchMessages])

  React.useEffect(() => {
    const unsubscribeCleared = on('chat:cleared', ({ roomId }) => {
      if (!roomId) {
        return
      }

      clearRoomLocally(roomId)
    })

    return () => {
      unsubscribeCleared?.()
    }
  }, [on, clearRoomLocally])

  React.useEffect(() => {
    const unsubscribeDeleted = on('chat:message_deleted', ({ roomId, messageId }) => {
      if (!roomId || !messageId) {
        return
      }

      removeMessageLocally(roomId, messageId)
    })

    return () => {
      unsubscribeDeleted?.()
    }
  }, [on, removeMessageLocally])

  const activeConversation = React.useMemo(
    () => rooms.find((room) => room.id === activeRoomId),
    [rooms, activeRoomId]
  )

  const activeMessages = messagesByRoom[activeRoomId] || []

  const handleSendMessage = (content) => {
    if (!activeRoomId || !String(content).trim()) {
      return
    }

    emit('chat:message', {
      roomId: activeRoomId,
      content: String(content).trim(),
      type: 'text',
    })
  }

  const handleClearChat = async () => {
    if (!activeRoomId || isClearingChat) {
      return
    }

    setIsClearingChat(true)
    try {
      await clearRoomMessages(activeRoomId)
    } catch (error) {
      console.error('Failed to clear chat:', error)
    } finally {
      setIsClearingChat(false)
    }
  }

  const handleDeleteForMe = async (message) => {
    if (!activeRoomId || !message?.id || deletingMessageId) {
      return
    }

    setDeletingMessageId(message.id)
    try {
      await deleteMessageForMe(activeRoomId, message.id)
    } catch (error) {
      console.error('Failed to delete message for me:', error)
    } finally {
      setDeletingMessageId(null)
    }
  }

  const handleDeleteForEveryone = async (message) => {
    if (!activeRoomId || !message?.id || deletingMessageId) {
      return
    }

    if (!isOwnMessage(message)) {
      return
    }

    const confirmed = window.confirm('Delete this message for everyone?')
    if (!confirmed) {
      return
    }

    setDeletingMessageId(message.id)
    try {
      await deleteMessageForEveryone(activeRoomId, message.id)
    } catch (error) {
      console.error('Failed to delete message for everyone:', error)
    } finally {
      setDeletingMessageId(null)
    }
  }

  const isOwnMessage = (message) => {
    const currentUserId = String(user?._id || user?.id || '')
    return String(message?.senderId || '') === currentUserId
  }

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 px-4 py-3 sm:px-6 lg:px-8 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900 overflow-hidden flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-4 rounded-3xl border border-white/60 bg-white/70 px-6 py-4 shadow-[0_16px_45px_-30px_rgba(14,116,255,0.6)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/60 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 text-white shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Messages</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Direct messaging in real time with instant updates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Conversations List */}
          <div className="lg:col-span-1 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/85 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.75)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/85">
            <div className="p-4 border-b border-gray-200/90 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Conversations</h3>
            </div>
            <div className="overflow-y-auto h-full pb-16">
              {loadingRooms && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
              )}

              {!loadingRooms && rooms.length === 0 && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  No conversations yet. Open a chat from contracts/proposals.
                </p>
              )}

              {rooms.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveRoom(conversation.id)}
                  className={`w-full p-4 border-b border-gray-200/80 dark:border-gray-700 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-gray-800 ${
                    activeRoomId === conversation.id
                      ? 'bg-gradient-to-r from-blue-50 via-cyan-50 to-transparent dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-transparent'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conversation.participantAvatar}
                      alt={conversation.participantName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.participantName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-3">
            {activeRoomId ? (
              <MessageThread
                conversation={activeConversation}
                messages={activeMessages}
                isOwnMessage={isOwnMessage}
                onSendMessage={handleSendMessage}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
                deletingMessageId={deletingMessageId}
                onClearChat={handleClearChat}
                isClearing={isClearingChat}
                isLoading={loadingMessages}
              />
            ) : (
              <div className="h-full rounded-2xl border border-gray-200/80 bg-white/85 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.75)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/85 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages_Phase9
