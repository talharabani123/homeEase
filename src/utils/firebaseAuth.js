/**
 * Firebase Authentication Utilities
 * Helper functions for phone authentication with Firebase
 */

import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

/**
 * Format phone number to international format
 * @param {string} phone - Phone number (e.g., "03001234567" or "300 1234 567")
 * @returns {string} - Formatted phone number (e.g., "+923001234567")
 */
export const formatPhoneNumber = (phone) => {
  // Safety check
  if (!phone) return '';
  
  // Remove all spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  
  // If starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    cleaned = '+92' + cleaned.substring(1);
  }
  
  // If doesn't start with +, add +92
  if (!cleaned.startsWith('+')) {
    cleaned = '+92' + cleaned;
  }
  
  return cleaned;
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number in international format
 * @returns {Promise<object>} - Confirmation object
 */
export const sendOTP = async (phoneNumber) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    return { success: true, confirmation };
  } catch (error) {
    console.error('Send OTP Error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send OTP' 
    };
  }
};

/**
 * Verify OTP code
 * @param {object} confirmation - Confirmation object from sendOTP
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<object>} - Verification result
 */
export const verifyOTP = async (confirmation, code) => {
  try {
    const result = await confirmation.confirm(code);
    return { 
      success: true, 
      user: result.user,
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber
    };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    
    let errorMessage = 'Invalid OTP code';
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'The code you entered is incorrect';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'The code has expired. Please request a new one';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

/**
 * Resend OTP to phone number
 * @param {string} phoneNumber - Phone number in international format
 * @returns {Promise<object>} - New confirmation object
 */
export const resendOTP = async (phoneNumber) => {
  return await sendOTP(phoneNumber);
};

/**
 * Sign out current user
 * @returns {Promise<boolean>} - Success status
 */
export const signOut = async () => {
  try {
    await auth().signOut();
    return true;
  } catch (error) {
    console.error('Sign Out Error:', error);
    return false;
  }
};

/**
 * Get current authenticated user
 * @returns {object|null} - Current user or null
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return auth().currentUser !== null;
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function with user parameter
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Link phone number to existing account
 * @param {string} phoneNumber - Phone number to link
 * @returns {Promise<object>} - Link result
 */
export const linkPhoneNumber = async (phoneNumber) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const confirmation = await auth().currentUser.linkWithPhoneNumber(formattedPhone);
    return { success: true, confirmation };
  } catch (error) {
    console.error('Link Phone Error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to link phone number' 
    };
  }
};

/**
 * Update phone number for current user
 * @param {string} newPhoneNumber - New phone number
 * @returns {Promise<object>} - Update result
 */
export const updatePhoneNumber = async (newPhoneNumber) => {
  try {
    const formattedPhone = formatPhoneNumber(newPhoneNumber);
    const confirmation = await auth().currentUser.updatePhoneNumber(formattedPhone);
    return { success: true, confirmation };
  } catch (error) {
    console.error('Update Phone Error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update phone number' 
    };
  }
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it's a valid Pakistani number
  const pakistaniRegex = /^(\+92|0)?3[0-9]{9}$/;
  
  if (!pakistaniRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Please enter a valid Pakistani mobile number'
    };
  }
  
  return { valid: true };
};

/**
 * Get Firebase error message in user-friendly format
 * @param {object} error - Firebase error object
 * @returns {string} - User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format';
    case 'auth/missing-phone-number':
      return 'Please enter a phone number';
    case 'auth/quota-exceeded':
      return 'Too many requests. Please try again later';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/operation-not-allowed':
      return 'Phone authentication is not enabled';
    case 'auth/invalid-verification-code':
      return 'Invalid verification code';
    case 'auth/invalid-verification-id':
      return 'Verification session expired. Please try again';
    case 'auth/code-expired':
      return 'Verification code has expired';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return error.message || 'An error occurred. Please try again';
  }
};

/**
 * Test phone numbers for development (Firebase Console)
 * These numbers bypass actual SMS sending
 */
export const TEST_PHONE_NUMBERS = {
  '+923000000000': '123456',
  '+923001111111': '654321',
  '+923002222222': '111111',
};

/**
 * Check if phone number is a test number
 * @param {string} phoneNumber - Phone number to check
 * @returns {boolean} - True if test number
 */
export const isTestPhoneNumber = (phoneNumber) => {
  const formatted = formatPhoneNumber(phoneNumber);
  return TEST_PHONE_NUMBERS.hasOwnProperty(formatted);
};

/**
 * Get test OTP for test phone number
 * @param {string} phoneNumber - Phone number
 * @returns {string|null} - Test OTP or null
 */
export const getTestOTP = (phoneNumber) => {
  const formatted = formatPhoneNumber(phoneNumber);
  return TEST_PHONE_NUMBERS[formatted] || null;
};

export default {
  formatPhoneNumber,
  sendOTP,
  verifyOTP,
  resendOTP,
  signOut,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChanged,
  linkPhoneNumber,
  updatePhoneNumber,
  validatePhoneNumber,
  getFirebaseErrorMessage,
  isTestPhoneNumber,
  getTestOTP,
};
