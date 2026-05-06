import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSettings } from './userDataService';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.listeners = new Set();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize notification service without audio for now
      // In a real app, you would set up push notifications here
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Storage keys
  getNotificationsKey(userId) {
    return `notifications_${userId}`;
  }

  getUnreadCountKey(userId) {
    return `unread_count_${userId}`;
  }

  // Notification CRUD operations
  async getNotifications(userId) {
    try {
      const key = this.getNotificationsKey(userId);
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async addNotification(userId, notification) {
    try {
      const notifications = await this.getNotifications(userId);
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false,
        createdAt: Date.now(),
      };

      notifications.unshift(newNotification); // Add to beginning
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      const key = this.getNotificationsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(notifications));
      
      // Update unread count
      await this.updateUnreadCount(userId);
      
      // Notify listeners
      this.notifyListeners('notification_added', newNotification);
      
      // Play sound if enabled
      await this.playNotificationSound(userId, notification.soundType);

      return { success: true, notification: newNotification };
    } catch (error) {
      console.error('Failed to add notification:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteNotification(userId, notificationId) {
    try {
      const notifications = await this.getNotifications(userId);
      const filteredNotifications = notifications.filter(n => n.id !== notificationId);
      
      const key = this.getNotificationsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(filteredNotifications));
      
      // Update unread count
      await this.updateUnreadCount(userId);
      
      // Notify listeners
      this.notifyListeners('notification_deleted', notificationId);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, error: error.message };
    }
  }

  async markAsRead(userId, notificationId) {
    try {
      const notifications = await this.getNotifications(userId);
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      const key = this.getNotificationsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
      
      // Update unread count
      await this.updateUnreadCount(userId);
      
      // Notify listeners
      this.notifyListeners('notification_read', notificationId);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  async markAllAsRead(userId) {
    try {
      const notifications = await this.getNotifications(userId);
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      const key = this.getNotificationsKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
      
      // Update unread count
      await this.updateUnreadCount(userId);
      
      // Notify listeners
      this.notifyListeners('all_notifications_read');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  async getUnreadCount(userId) {
    try {
      const notifications = await this.getNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async updateUnreadCount(userId) {
    try {
      const count = await this.getUnreadCount(userId);
      const key = this.getUnreadCountKey(userId);
      await AsyncStorage.setItem(key, count.toString());
      
      // Notify listeners about count change
      this.notifyListeners('unread_count_changed', count);
      
      return count;
    } catch (error) {
      console.error('Failed to update unread count:', error);
      return 0;
    }
  }

  // Listener management
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  async playNotificationSound(userId, soundType = 'default') {
    try {
      // Check user settings first
      if (userId) {
        const settings = await getUserSettings(userId);
        if (!settings.notifications) {
          return; // Notifications disabled
        }
      }

      await this.initialize();

      // For now, we'll log the sound play
      // In a real app, you would play actual sound files or use system notifications
      console.log(`Playing ${soundType} notification sound for user ${userId}`);
      
      return { success: true };

    } catch (error) {
      console.error('Failed to play notification sound:', error);
      return { success: false, error: error.message };
    }
  }

  async playServiceRequestSound(userId) {
    try {
      // Check both notifications and service voice settings
      if (userId) {
        const settings = await getUserSettings(userId);
        if (!settings.notifications || !settings.serviceVoice) {
          return; // Service voice disabled
        }
      }

      await this.playNotificationSound(userId, 'service');
    } catch (error) {
      console.error('Failed to play service request sound:', error);
    }
  }

  // Notification factory methods
  createServiceNotification(title, message, data = {}) {
    return {
      title,
      message,
      soundType: 'service',
      type: 'service',
      data,
      icon: 'service',
    };
  }

  createGeneralNotification(title, message, data = {}) {
    return {
      title,
      message,
      soundType: 'default',
      type: 'general',
      data,
      icon: 'info',
    };
  }

  createUrgentNotification(title, message, data = {}) {
    return {
      title,
      message,
      soundType: 'urgent',
      type: 'urgent',
      data,
      icon: 'warning',
    };
  }

  createSuccessNotification(title, message, data = {}) {
    return {
      title,
      message,
      soundType: 'success',
      type: 'success',
      data,
      icon: 'success',
    };
  }

  createPromoNotification(title, message, data = {}) {
    return {
      title,
      message,
      soundType: 'promo',
      type: 'promo',
      data,
      icon: 'promo',
    };
  }

  async cleanup() {
    try {
      this.listeners.clear();
    } catch (error) {
      console.error('Failed to cleanup notification service:', error);
    }
  }

  // Utility methods for common notification scenarios
  async notifyServiceCompleted(userId, serviceName, providerId) {
    const notification = this.createSuccessNotification(
      'Service Completed',
      `Your ${serviceName} service has been completed. Please rate your experience.`,
      { type: 'service_completed', serviceName, providerId }
    );
    return await this.addNotification(userId, notification);
  }

  async notifyProviderArriving(userId, providerName, eta) {
    const notification = this.createGeneralNotification(
      'Provider Arriving Soon',
      `${providerName} is ${eta} minutes away from your location.`,
      { type: 'provider_arriving', providerName, eta }
    );
    return await this.addNotification(userId, notification);
  }

  async notifyPaymentSuccess(userId, amount) {
    const notification = this.createSuccessNotification(
      'Payment Successful',
      `Your payment of Rs. ${amount} has been processed successfully.`,
      { type: 'payment_success', amount }
    );
    return await this.addNotification(userId, notification);
  }

  async notifyPromoOffer(userId, title, message, validUntil) {
    const notification = this.createPromoNotification(
      title,
      message,
      { type: 'promo_offer', validUntil }
    );
    return await this.addNotification(userId, notification);
  }

  async notifyServiceRequest(userId, serviceName, requestId) {
    const notification = this.createGeneralNotification(
      'Service Request Received',
      `Your request for ${serviceName} has been received and is being processed.`,
      { type: 'service_request', serviceName, requestId }
    );
    return await this.addNotification(userId, notification);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Convenience functions
export const getNotifications = (userId) => notificationService.getNotifications(userId);
export const addNotification = (userId, notification) => notificationService.addNotification(userId, notification);
export const deleteNotification = (userId, notificationId) => notificationService.deleteNotification(userId, notificationId);
export const markAsRead = (userId, notificationId) => notificationService.markAsRead(userId, notificationId);
export const markAllAsRead = (userId) => notificationService.markAllAsRead(userId);
export const getUnreadCount = (userId) => notificationService.getUnreadCount(userId);
export const addNotificationListener = (callback) => notificationService.addListener(callback);

// Factory functions
export const createServiceNotification = (title, message, data) => 
  notificationService.createServiceNotification(title, message, data);
export const createGeneralNotification = (title, message, data) => 
  notificationService.createGeneralNotification(title, message, data);
export const createUrgentNotification = (title, message, data) => 
  notificationService.createUrgentNotification(title, message, data);
export const createSuccessNotification = (title, message, data) => 
  notificationService.createSuccessNotification(title, message, data);
export const createPromoNotification = (title, message, data) => 
  notificationService.createPromoNotification(title, message, data);

// Utility functions
export const notifyServiceCompleted = (userId, serviceName, providerId) => 
  notificationService.notifyServiceCompleted(userId, serviceName, providerId);
export const notifyProviderArriving = (userId, providerName, eta) => 
  notificationService.notifyProviderArriving(userId, providerName, eta);
export const notifyPaymentSuccess = (userId, amount) => 
  notificationService.notifyPaymentSuccess(userId, amount);
export const notifyPromoOffer = (userId, title, message, validUntil) => 
  notificationService.notifyPromoOffer(userId, title, message, validUntil);
export const notifyServiceRequest = (userId, serviceName, requestId) => 
  notificationService.notifyServiceRequest(userId, serviceName, requestId);

export default notificationService;