import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = '@homeease_user_data';
const AUTH_TOKEN_KEY = '@homeease_auth_token';

/**
 * User Storage Service
 * Handles persistent storage of user data using AsyncStorage
 * Data persists across app restarts
 */

// Save user data after signup/login
export const saveUserData = async (userData) => {
  try {
    const dataToSave = {
      ...userData,
      // Never save plain password
      password: undefined,
      confirmPassword: undefined,
      savedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToSave));
    return { success: true };
  } catch (error) {
    console.error('Error saving user data:', error);
    return { success: false, error: error.message };
  }
};

// Get user data
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    if (data) {
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const result = await getUserData();
    if (result.success && result.data) {
      const updatedData = {
        ...result.data,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
      return { success: true, data: updatedData };
    }
    return { success: false, error: 'No user data found' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Update profile image
export const updateProfileImage = async (imageUri) => {
  try {
    const result = await getUserData();
    if (result.success && result.data) {
      const updatedData = {
        ...result.data,
        profileImage: imageUri,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
      return { success: true, data: updatedData };
    }
    return { success: false, error: 'No user data found' };
  } catch (error) {
    console.error('Error updating profile image:', error);
    return { success: false, error: error.message };
  }
};

// Save auth token
export const saveAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return { success: true };
  } catch (error) {
    console.error('Error saving auth token:', error);
    return { success: false, error: error.message };
  }
};

// Get auth token
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return { success: true, token };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { success: false, error: error.message, token: null };
  }
};

// Clear all user data (logout)
export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove([USER_DATA_KEY, AUTH_TOKEN_KEY]);
    return { success: true };
  } catch (error) {
    console.error('Error clearing user data:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const result = await getUserData();
    return result.success && result.data !== null;
  } catch (error) {
    return false;
  }
};
