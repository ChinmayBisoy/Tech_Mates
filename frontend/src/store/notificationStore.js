import { create } from 'zustand';

const deriveNotificationLink = (notification = {}) => {
  const data = notification?.data || {};

  if (data.roomId) {
    return `/messages?roomId=${data.roomId}`;
  }

  if (data.contractId) {
    return `/contracts/${data.contractId}`;
  }

  if (data.requirementId) {
    return `/se-market/requirement/${data.requirementId}`;
  }

  if (data.listingId) {
    return '/projects';
  }

  return notification?.link;
};

export const useNotificationStore = create((set) => ({
  // Notifications list
  notifications: [],

  // Notification preferences
  preferences: {
    email: {
      auctions: true,
      messages: true,
      transactions: true,
      disputes: true,
      promotions: false,
      digest: 'weekly',
    },
    push: {
      auctions: true,
      messages: true,
      transactions: true,
      disputes: true,
      promotions: false,
    },
    inApp: {
      auctions: true,
      messages: true,
      transactions: true,
      disputes: true,
      promotions: true,
    },
    sms: {
      enabled: false,
      events: ['disputes', 'transactions'],
    },
  },

  // Notification channels status
  channels: {
    email: { enabled: true, verified: true, address: 'john@example.com' },
    push: { enabled: true, verified: true, tokens: ['token_123'] },
    inApp: { enabled: true, verified: true },
    sms: { enabled: false, verified: false, number: null },
  },

  // Alert settings
  alertSettings: {
    auctionEnding: { enabled: true, minutesBefore: [60, 15, 5] },
    priceDrops: { enabled: true, threshold: 10 },
    newMatches: { enabled: true, frequency: 'daily' },
    sellerMessages: { enabled: true, delay: 'immediate' },
    bidNotifications: { enabled: true, notifyOnEverything: false },
  },

  // Notification statistics
  stats: {
    totalNotifications: 0,
    unreadCount: 0,
    last24hCount: 0,
    last7dCount: 0,
  },

  unreadCount: 0,

  // Notification queue (pending)
  queue: [],

  // Actions
  addNotification: (notification) => {
    const normalizedNotification = {
      id: String(notification?.id || notification?._id || `notif_${Date.now()}`),
      type: notification?.type || 'info',
      title: notification?.title || 'Notification',
      message: notification?.message || '',
      createdAt: notification?.createdAt ? new Date(notification.createdAt) : new Date(),
      read: Boolean(notification?.read ?? notification?.isRead ?? false),
      data: notification?.data || {},
      link: deriveNotificationLink(notification),
    }

    set((state) => ({
      notifications: [
        normalizedNotification,
        ...state.notifications,
      ].slice(0, 100),
      stats: {
        ...state.stats,
        totalNotifications: state.stats.totalNotifications + 1,
        unreadCount: normalizedNotification.read ? state.stats.unreadCount : state.stats.unreadCount + 1,
        last24hCount: state.stats.last24hCount + 1,
      },
      unreadCount: normalizedNotification.read ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      stats: {
        ...state.stats,
        unreadCount: Math.max(0, state.stats.unreadCount - 1),
      },
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      stats: {
        ...state.stats,
        unreadCount: 0,
      },
      unreadCount: 0,
    }));
  },

  deleteNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== notificationId),
    }));
  },

  clearAllNotifications: () => {
    set({
      notifications: [],
      stats: {
        totalNotifications: 0,
        unreadCount: 0,
        last24hCount: 0,
        last7dCount: 0,
      },
      unreadCount: 0,
    });
  },

  markRead: (notificationId) => {
    set((state) => {
      const target = state.notifications.find((item) => item.id === notificationId)
      if (!target || target.read) {
        return state
      }

      return {
        notifications: state.notifications.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        ),
        stats: {
          ...state.stats,
          unreadCount: Math.max(0, state.stats.unreadCount - 1),
        },
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    })
  },

  markTypeAsRead: (type) => {
    set((state) => {
      const unreadOfType = state.notifications.filter(
        (item) => !item.read && item.type === type
      ).length

      if (unreadOfType === 0) {
        return state
      }

      return {
        notifications: state.notifications.map((item) =>
          item.type === type ? { ...item, read: true } : item
        ),
        stats: {
          ...state.stats,
          unreadCount: Math.max(0, state.stats.unreadCount - unreadOfType),
        },
        unreadCount: Math.max(0, state.unreadCount - unreadOfType),
      }
    })
  },

  setNotifications: (notifications = [], unreadCount = null) => {
    const normalizedNotifications = notifications.map((notification) => ({
      ...notification,
      id: String(notification?.id || notification?._id || `notif_${Date.now()}`),
      createdAt: notification?.createdAt ? new Date(notification.createdAt) : new Date(),
      read: Boolean(notification?.read ?? notification?.isRead ?? false),
      link: deriveNotificationLink(notification),
    }))

    const computedUnreadCount =
      typeof unreadCount === 'number'
        ? unreadCount
        : normalizedNotifications.filter((item) => !item.read).length

    set((state) => ({
      notifications: normalizedNotifications,
      stats: {
        ...state.stats,
        totalNotifications: normalizedNotifications.length,
        unreadCount: computedUnreadCount,
      },
      unreadCount: computedUnreadCount,
    }))
  },

  clearNotifications: () => {
    set((state) => ({
      ...state,
      notifications: [],
      stats: {
        ...state.stats,
        totalNotifications: 0,
        unreadCount: 0,
      },
      unreadCount: 0,
    }))
  },

  updatePreferences: (newPreferences) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...newPreferences,
      },
    }));
  },

  updateAlertSettings: (settings) => {
    set((state) => ({
      alertSettings: {
        ...state.alertSettings,
        ...settings,
      },
    }));
  },

  enableChannel: (channel) => {
    set((state) => ({
      channels: {
        ...state.channels,
        [channel]: {
          ...state.channels[channel],
          enabled: true,
        },
      },
    }));
  },

  disableChannel: (channel) => {
    set((state) => ({
      channels: {
        ...state.channels,
        [channel]: {
          ...state.channels[channel],
          enabled: false,
        },
      },
    }));
  },

  getUnreadNotifications: () => {
    return (state) => state.notifications.filter(n => !n.read);
  },

  getNotificationsByType: (type) => {
    return (state) => state.notifications.filter(n => n.type === type);
  },

  getRecentNotifications: (hours = 24) => {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return (state) =>
      state.notifications.filter(n => n.createdAt.getTime() > cutoffTime);
  },

  queueNotification: (notification) => {
    set((state) => ({
      queue: [
        ...state.queue,
        {
          id: `queued_${Date.now()}`,
          scheduled: true,
          ...notification,
        },
      ],
    }));
  },

  processQueue: () => {
    set((state) => ({
      notifications: [
        ...state.queue.map(q => ({
          ...q,
          scheduled: false,
          createdAt: new Date(),
          read: false,
        })),
        ...state.notifications,
      ],
      queue: [],
    }));
  },

  getNotificationStats: () => {
    return (state) => state.stats;
  },
}));
