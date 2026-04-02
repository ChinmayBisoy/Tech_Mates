import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Settings, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

// Notification Bell Component - Shows unread count and quick preview
export default function NotificationBell() {
  const { notifications, stats, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        <Bell className="w-6 h-6" />
        {stats.unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {Math.min(stats.unreadCount, 9)}+
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
            <div className="flex gap-2">
              {stats.unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>All caught up! ✨</p>
              </div>
            ) : (
              unreadNotifications.map(notif => (
                <div
                  key={notif.id}
                  className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">{notif.icon === 'check-circle' ? '✅' : notif.icon === 'gavel' ? '⚖️' : notif.icon === 'message-square' ? '💬' : '🔔'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <a
                href="/notifications"
                className="block text-center text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
