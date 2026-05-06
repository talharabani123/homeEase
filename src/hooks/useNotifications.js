import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getNotifications, 
  getUnreadCount, 
  addNotificationListener,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const [userNotifications, count] = await Promise.all([
        getNotifications(user.uid),
        getUnreadCount(user.uid)
      ]);
      
      setNotifications(userNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!user?.uid) return;
    
    try {
      await markAsRead(user.uid, notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [user?.uid, loadNotifications]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await markAllAsRead(user.uid);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user?.uid, loadNotifications]);

  // Delete notification
  const removeNotification = useCallback(async (notificationId) => {
    if (!user?.uid) return;
    
    try {
      await deleteNotification(user.uid, notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [user?.uid, loadNotifications]);

  // Setup notification listener
  useEffect(() => {
    const unsubscribe = addNotificationListener((event, data) => {
      switch (event) {
        case 'notification_added':
        case 'notification_deleted':
        case 'notification_read':
        case 'all_notifications_read':
          loadNotifications();
          break;
        case 'unread_count_changed':
          setUnreadCount(data);
          break;
      }
    });

    return unsubscribe;
  }, [loadNotifications]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
  };
};

export default useNotifications;