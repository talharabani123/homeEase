/**
 * Real-Time Location Service
 * Handles Firebase Realtime Database operations for provider locations
 */

import { database } from '../config/firebase';
import { ref, set, onValue, off, remove, update } from 'firebase/database';

/**
 * Update provider location in Firebase
 * @param {string} providerId - Provider unique ID
 * @param {object} locationData - Location data object
 */
export const updateProviderLocation = async (providerId, locationData) => {
  try {
    const providerRef = ref(database, `providers/${providerId}`);
    
    await set(providerRef, {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      isAvailable: locationData.isAvailable || true,
      serviceType: locationData.serviceType || 'general',
      providerName: locationData.providerName || 'Provider',
      phoneNumber: locationData.phoneNumber || '',
      rating: locationData.rating || 0,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating provider location:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to all available providers
 * @param {function} callback - Callback function to receive provider updates
 * @returns {function} Unsubscribe function
 */
export const listenToProviders = (callback) => {
  const providersRef = ref(database, 'providers');
  
  const unsubscribe = onValue(providersRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      const providers = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).filter(provider => provider.isAvailable === true);
      
      callback(providers);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error listening to providers:', error);
    callback([]);
  });
  
  // Return cleanup function
  return () => off(providersRef);
};

/**
 * Set provider availability status
 * @param {string} providerId - Provider unique ID
 * @param {boolean} isAvailable - Availability status
 */
export const setProviderAvailability = async (providerId, isAvailable) => {
  try {
    const providerRef = ref(database, `providers/${providerId}`);
    
    await update(providerRef, {
      isAvailable,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting provider availability:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove provider from real-time tracking
 * @param {string} providerId - Provider unique ID
 */
export const removeProviderLocation = async (providerId) => {
  try {
    const providerRef = ref(database, `providers/${providerId}`);
    await remove(providerRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing provider location:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get single provider location
 * @param {string} providerId - Provider unique ID
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToProviderLocation = (providerId, callback) => {
  const providerRef = ref(database, `providers/${providerId}`);
  
  const unsubscribe = onValue(providerRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  }, (error) => {
    console.error('Error listening to provider:', error);
    callback(null);
  });
  
  return () => off(providerRef);
};
