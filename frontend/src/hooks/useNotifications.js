import { useNotificationStore } from '@/store/notificationStore'

export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const markRead = useNotificationStore((state) => state.markRead)
  const markAllRead = useNotificationStore((state) => state.markAllRead)
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const clearNotifications = useNotificationStore(
    (state) => state.clearNotifications
  )

  return {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    setNotifications,
    clearNotifications,
  }
}
