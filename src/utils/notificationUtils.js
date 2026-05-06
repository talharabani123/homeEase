import { 
  notifyServiceCompleted,
  notifyProviderArriving,
  notifyPaymentSuccess,
  notifyPromoOffer,
  notifyServiceRequest,
  addNotification,
  createGeneralNotification,
  createUrgentNotification
} from '../services/notificationService';

// Utility function to add sample notifications for testing
export const addSampleNotifications = async (userId) => {
  try {
    // Add some sample notifications
    await notifyServiceCompleted(userId, 'Plumbing', 'provider123');
    
    await notifyProviderArriving(userId, 'Ahmed Khan', 5);
    
    await notifyPaymentSuccess(userId, 580);
    
    await notifyPromoOffer(
      userId, 
      'Special Discount!', 
      'Get 20% off on your next electrician service. Valid till tomorrow!',
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
    
    await notifyServiceRequest(userId, 'Cleaning Service', 'req456');
    
    // Add a general notification
    const generalNotification = createGeneralNotification(
      'Welcome to HomeEase!',
      'Thank you for joining HomeEase. Explore our services and book your first appointment.',
      { type: 'welcome' }
    );
    await addNotification(userId, generalNotification);
    
    // Add an urgent notification
    const urgentNotification = createUrgentNotification(
      'Service Update Required',
      'Please update your service preferences to continue receiving the best matches.',
      { type: 'update_required' }
    );
    await addNotification(userId, urgentNotification);
    
    console.log('Sample notifications added successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to add sample notifications:', error);
    return { success: false, error: error.message };
  }
};

// Function to clear all notifications (for testing)
export const clearAllNotifications = async (userId) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const notificationsKey = `notifications_${userId}`;
    const unreadCountKey = `unread_count_${userId}`;
    
    await AsyncStorage.removeItem(notificationsKey);
    await AsyncStorage.removeItem(unreadCountKey);
    
    console.log('All notifications cleared');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    return { success: false, error: error.message };
  }
};

// Function to simulate real-time notifications (for testing)
export const simulateRealTimeNotification = async (userId, type = 'random') => {
  const notifications = [
    () => notifyProviderArriving(userId, 'Sarah Ahmed', Math.floor(Math.random() * 10) + 1),
    () => notifyPaymentSuccess(userId, Math.floor(Math.random() * 1000) + 200),
    () => notifyServiceCompleted(userId, 'Cleaning', 'provider' + Math.floor(Math.random() * 100)),
    () => {
      const generalNotification = createGeneralNotification(
        'New Message',
        'You have received a new message from your service provider.',
        { type: 'message' }
      );
      return addNotification(userId, generalNotification);
    },
  ];
  
  if (type === 'random') {
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    return await randomNotification();
  }
  
  // Add specific notification based on type
  switch (type) {
    case 'arriving':
      return await notifyProviderArriving(userId, 'John Doe', 3);
    case 'payment':
      return await notifyPaymentSuccess(userId, 750);
    case 'completed':
      return await notifyServiceCompleted(userId, 'Electrical Work', 'provider789');
    case 'promo':
      return await notifyPromoOffer(
        userId,
        'Flash Sale!',
        'Limited time offer: 30% off on all home cleaning services!',
        new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      );
    default:
      return await notifications[0]();
  }
};

export default {
  addSampleNotifications,
  clearAllNotifications,
  simulateRealTimeNotification,
};