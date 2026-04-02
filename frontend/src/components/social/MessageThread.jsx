import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Trash2, MoreVertical } from 'lucide-react'

const formatTime = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageThread({
  conversation,
  messages,
  isOwnMessage,
  onSendMessage,
  onDeleteForMe,
  onDeleteForEveryone,
  deletingMessageId,
  onClearChat,
  isClearing,
  isLoading,
}) {
  const [messageText, setMessageText] = useState('')
  const [menuMessageId, setMenuMessageId] = useState(null)
  const endOfMessagesRef = useRef(null)

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText)
      setMessageText('')
    }
  }

  const filteredMessages = useMemo(() => messages || [], [messages])

  const handleClearChat = () => {
    if (!onClearChat) {
      return
    }

    const confirmed = window.confirm('Clear this chat? This will remove all messages in this conversation.')
    if (!confirmed) {
      return
    }

    onClearChat()
  }

  const openMessageMenu = (event, message) => {
    event.preventDefault()
    event.stopPropagation()

    setMenuMessageId((current) => (current === message.id ? null : message.id))
  }

  const closeMessageMenu = () => {
    setMenuMessageId(null)
  }

  const menuMessage = useMemo(
    () => filteredMessages.find((item) => item.id === menuMessageId) || null,
    [filteredMessages, menuMessageId]
  )

  const handleDeleteForMe = () => {
    const messageId = menuMessage?.id
    if (!messageId || !onDeleteForMe) {
      return
    }

    onDeleteForMe(menuMessage)
    closeMessageMenu()
  }

  const handleDeleteForEveryone = () => {
    const message = menuMessage
    if (!message || !onDeleteForEveryone) {
      return
    }

    if (!isOwnMessage(message)) {
      return
    }

    onDeleteForEveryone(message)
    closeMessageMenu()
  }

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMessageMenu()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/85 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.75)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/85 flex flex-col h-full">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_55%)]" />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={conversation.participantAvatar}
            alt={conversation.participantName}
            className="w-10 h-10 rounded-full ring-2 ring-white/40"
          />
          <div>
            <p className="font-semibold leading-tight">{conversation.participantName}</p>
            <p className="text-xs text-blue-100 mt-0.5">Real-time chat</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearChat}
          disabled={Boolean(isClearing)}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isClearing ? 'Clearing...' : 'Clear chat'}
        </button>
      </div>

      {/* Messages area */}
      <div
        className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-slate-50/70 via-white/50 to-slate-50/70 dark:from-gray-900/50 dark:via-gray-900/20 dark:to-gray-900/50"
        onClick={closeMessageMenu}
      >
        {isLoading && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative flex items-start gap-2">
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isOwnMessage(message)
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:border-gray-700 dark:text-white'
                  }`}
                >
                  <p className="leading-relaxed break-words pr-1">{message.content}</p>
                  <p className={`text-xs mt-1.5 ${isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => openMessageMenu(event, message)}
                  className="mt-1 rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                  title="Message options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuMessageId === message.id && (
                  <div
                    className="absolute right-full top-1/2 z-[120] mr-2 min-w-[170px] -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleDeleteForMe}
                      disabled={deletingMessageId === message.id}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 disabled:opacity-60 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Delete for me
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteForEveryone}
                      disabled={!isOwnMessage(message) || deletingMessageId === message.id}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 disabled:opacity-60 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Delete for everyone
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input area */}
      <div className="relative z-10 border-t border-gray-200/90 dark:border-gray-700 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/85 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-1.5 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!messageText.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
