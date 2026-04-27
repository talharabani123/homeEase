/**
 * Role Management Service
 * Handles user role selection, switching, and persistence
 * Mock implementation for Expo Go - Replace with Firebase in production
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProviderProfile } from './providerRegistrationService';

// Storage Keys
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@homeease_onboarding_complete',
  USER_ROLE: '@homeease_user_role',
  CURRENT_MODE: '@homeease_current_mode',
};

/**
 * Save user role after selection
 * @param {string} role - 'customer' | 'provider' | 'both'
 * @returns {Promise<object>} - { success, error }
 */
export const saveUserRole = async (role) => {
  try {
    if (!['customer', 'provider', 'both'].includes(role)) {
      return { success: false, error: 'Invalid role' };
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MODE, role === 'both' ? 'customer' : role);
    
    console.log('User role saved:', role);
    return { success: true, role };
  } catch (error) {
    console.error('Save user role error:', error);
    return { success: false, error: 'Failed to save role' };
  }
};

/**
 * Get user role
 * @returns {Promise<object>} - { success, role, error }
 */
export const getUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return { success: true, role: role || 'customer' };
  } catch (error) {
    console.error('Get user role error:', error);
    return { success: false, role: 'customer', error: 'Failed to get role' };
  }
};

/**
 * Get current mode (customer or provider)
 * @returns {Promise<object>} - { success, mode, error }
 */
export const getCurrentMode = async () => {
  try {
    const mode = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MODE);
    return { success: true, mode: mode || 'customer' };
  } catch (error) {
    console.error('Get current mode error:', error);
    return { success: false, mode: 'customer', error: 'Failed to get mode' };
  }
};

/**
 * Check if user can switch to provider mode
 * @returns {Promise<boolean>}
 */
export const canSwitchToProvider = async () => {
  try {
    const roleResult = await getUserRole();
    const providerResult = await getProviderProfile();
    
    const hasProviderRole = roleResult.role === 'provider' || roleResult.role === 'both';
    const isVerified = providerResult.success && providerResult.data && providerResult.data.isVerified;
    
    return hasProviderRole && isVerified;
  } catch (error) {
    console.error('Can switch to provider error:', error);
    return false;
  }
};

/**
 * Switch user mode
 * @param {string} newMode - 'customer' | 'provider'
 * @returns {Promise<object>} - { success, mode, error }
 */
export const switchUserMode = async (newMode) => {
  try {
    if (!['customer', 'provider'].includes(newMode)) {
      return { success: false, error: 'Invalid mode' };
    }
    
    // Check if user can switch to provider mode
    if (newMode === 'provider') {
      const canSwitch = await canSwitchToProvider();
      if (!canSwitch) {
        return { 
          success: false, 
          error: 'Not authorized for provider mode. Please complete provider registration first.' 
        };
      }
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode);
    console.log('Mode switched to:', newMode);
    
    return { success: true, mode: newMode };
  } catch (error) {
    console.error('Switch user mode error:', error);
    return { success: false, error: 'Failed to switch mode' };
  }
};

/**
 * Update user role (when provider gets approved or customer becomes provider)
 * @param {string} newRole - 'customer' | 'provider' | 'both'
 * @returns {Promise<object>} - { success, role, error }
 */
export const updateUserRole = async (newRole) => {
  try {
    const currentRoleResult = await getUserRole();
    const currentRole = currentRoleResult.role;
    
    // If user was customer and becomes provider, set to 'both'
    if (currentRole === 'customer' && newRole === 'provider') {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, 'both');
      console.log('User role updated to: both');
      return { success: true, role: 'both' };
    }
    
    // If user was provider and becomes customer, set to 'both'
    if (currentRole === 'provider' && newRole === 'customer') {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, 'both');
      console.log('User role updated to: both');
      return { success: true, role: 'both' };
    }
    
    // Otherwise, set to the new role
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, newRole);
    console.log('User role updated to:', newRole);
    return { success: true, role: newRole };
  } catch (error) {
    console.error('Update user role error:', error);
    return { success: false, error: 'Failed to update role' };
  }
};

/**
 * Check if onboarding is complete
 * @returns {Promise<boolean>}
 */
export const isOnboardingComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    console.error('Check onboarding complete error:', error);
    return false;
  }
};

/**
 * Set onboarding as complete
 * @returns {Promise<object>} - { success, error }
 */
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    console.log('Onboarding marked as complete');
    return { success: true };
  } catch (error) {
    console.error('Set onboarding complete error:', error);
    return { success: false, error: 'Failed to set onboarding complete' };
  }
};

/**
 * Get initial route based on onboarding and role status
 * @returns {Promise<object>} - { route, params }
 */
export const getInitialRoute = async () => {
  try {
    const onboardingComplete = await isOnboardingComplete();
    
    if (!onboardingComplete) {
      return { route: 'Onboarding', params: {} };
    }
    
    const roleResult = await getUserRole();
    const modeResult = await getCurrentMode();
    
    // If user has a role, go to appropriate dashboard
    if (roleResult.role === 'customer') {
      return { route: 'CustomerDashboard', params: {} };
    }
    
    if (roleResult.role === 'provider') {
      const providerResult = await getProviderProfile();
      if (providerResult.success && providerResult.data.isVerified) {
        return { route: 'ProviderDashboard', params: {} };
      } else {
        // Provider not verified yet, show submission status
        return { route: 'SubmissionStatus', params: {} };
      }
    }
    
    if (roleResult.role === 'both') {
      // Go to dashboard based on current mode
      if (modeResult.mode === 'provider') {
        return { route: 'ProviderDashboard', params: {} };
      } else {
        return { route: 'CustomerDashboard', params: {} };
      }
    }
    
    // Default to onboarding if no role found
    return { route: 'Onboarding', params: {} };
  } catch (error) {
    console.error('Get initial route error:', error);
    return { route: 'Onboarding', params: {} };
  }
};

/**
 * Clear all role data (for testing/logout)
 * @returns {Promise<object>} - { success, error }
 */
export const clearRoleData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.CURRENT_MODE,
    ]);
    console.log('Role data cleared');
    return { success: true };
  } catch (error) {
    console.error('Clear role data error:', error);
    return { success: false, error: 'Failed to clear role data' };
  }
};

export default {
  saveUserRole,
  getUserRole,
  getCurrentMode,
  canSwitchToProvider,
  switchUserMode,
  updateUserRole,
  isOnboardingComplete,
  setOnboardingComplete,
  getInitialRoute,
  clearRoleData,
  STORAGE_KEYS,
};
