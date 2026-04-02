import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationAPI } from '@/api/notification.api';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const clearAllNotifications = useNotificationStore((state) => state.clearAllNotifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await notificationAPI.getNotifications();
        setNotifications(result?.notifications || [], result?.unreadCount || 0);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [setNotifications]);

  const handleMarkAsRead = async (notification) => {
    if (!notification || notification.read) {
      return;
    }

    try {
      await notificationAPI.markAsRead(notification.id);
      markRead(notification.id);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) {
      toast.info('No notifications to clear');
      return;
    }

    try {
      await notificationAPI.deleteAllNotifications();
      clearAllNotifications();
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error(error?.response?.data?.message || 'Failed to clear notifications');
    }
  };

  const handleOpenNotification = async (notification) => {
    await handleMarkAsRead(notification);

    if (notification?.link) {
      navigate(notification.link);
      return;
    }

    if (notification?.data?.requirementId) {
      navigate(`/se-market/requirement/${notification.data.requirementId}`);
      return;
    }

    if (notification?.data?.contractId) {
      navigate(`/contracts/${notification.data.contractId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-md px-2 py-1 text-base font-bold text-gray-900 transition-colors hover:bg-gray-100 hover:text-black dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 dark:border-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            You have no notifications yet. We'll notify you when something important happens!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleOpenNotification(notification)}
              className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
