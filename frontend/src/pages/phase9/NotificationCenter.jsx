import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export const NotificationCenter_Phase9 = () => {
  const { notifications, preferences, updatePreferences, markAsRead, deleteNotification, stats } = useNotificationStore();
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadNotifications = filteredNotifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Settings
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {stats.unreadCount} unread notification{stats.unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Notification Preferences</h2>
            
            <div className="space-y-4">
              {/* Email Settings */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Email Notifications</h3>
                <div className="space-y-2">
                  {['auctions', 'messages', 'transactions', 'disputes'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.email[type]}
                        onChange={(e) =>
                          updatePreferences({
                            email: { ...preferences.email, [type]: e.target.checked },
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Push Settings */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Push Notifications</h3>
                <div className="space-y-2">
                  {['auctions', 'messages', 'transactions', 'disputes'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.push[type]}
                        onChange={(e) =>
                          updatePreferences({
                            push: { ...preferences.push, [type]: e.target.checked },
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'auction', 'payment', 'message', 'dispute'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">No {filter !== 'all' ? filter : ''} notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition ${
                  notif.read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{notif.icon === 'check-circle' ? '✅' : notif.icon === 'gavel' ? '⚖️' : notif.icon === 'message-square' ? '💬' : '🔔'}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 ml-11">{notif.message}</p>
                    {notif.link && (
                      <a
                        href={notif.link}
                        className="text-sm text-blue-500 hover:text-blue-600 mt-2 inline-block ml-11"
                      >
                        {notif.actionLabel}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter_Phase9;
