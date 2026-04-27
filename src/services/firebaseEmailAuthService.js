/**
 * Firebase Email Authentication Service
 * Handles Email Link (Passwordless) Authentication
 */

import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_STORAGE_KEY = '@homeease_email_for_signin';
const USER_ROLE_KEY = '@homeease_user_role';

/**
 * Send OTP (Email Link) to user's email
 * @param {string} email - User's email address
 * @param {string} role - 'customer' or 'provider'
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendOTPEmail = async (email, role = 'customer') => {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Action code settings for email link
    const actionCodeSettings = {
      // URL you want to redirect back to after email link is clicked
      url: 'https://homeease-97b9d.firebaseapp.com/finishSignUp',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.homeease.app'
      },
      android: {
        packageName: 'com.homeease.app',
        installApp: true,
        minimumVersion: '12'
      },
      dynamicLinkDomain: 'homeease97b9d.page.link'
    };

    // Send email link
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Save email and role to AsyncStorage for verification
    await AsyncStorage.setItem(EMAIL_STORAGE_KEY, email);
    await AsyncStorage.setItem(USER_ROLE_KEY, role);

    return {
      success: true,
      message: 'Verification link sent! Please check your email.'
    };
  } catch (error) {
    console.error('Send OTP Email Error:', error);
    
    let errorMessage = 'Failed to send verification email';
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/missing-email') {
      errorMessage = 'Email address is required';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Too many requests. Please try again later';
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Verify if current URL is a sign-in email link
 * @param {string} emailLink - The email link URL
 * @returns {boolean}
 */
export const isValidEmailLink = (emailLink) => {
  return isSignInWithEmailLink(auth, emailLink);
};

/**
 * Complete sign-in with email link
 * @param {string} emailLink - The email link from the email
 * @returns {Promise<{success: boolean, user?: object, role?: string, error?: string}>}
 */
export const verifyEmailLink = async (emailLink) => {
  try {
    // Get email from storage
    const email = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);

    if (!email) {
      return { 
        success: false, 
        error: 'Email not found. Please start the sign-in process again.' 
      };
    }

    // Verify the email link
    if (!isSignInWithEmailLink(auth, emailLink)) {
      return { 
        success: false, 
        error: 'Invalid or expired link. Please request a new one.' 
      };
    }

    // Sign in with email link
    const result = await signInWithEmailLink(auth, email, emailLink);
    const user = result.user;

    // Clear email from storage
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
      },
      role: role || 'customer'
    };
  } catch (error) {
    console.error('Verify Email Link Error:', error);
    
    let errorMessage = 'Failed to verify email link';
    
    if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'Invalid or expired link. Please request a new one.';
    } else if (error.code === 'auth/expired-action-code') {
      errorMessage = 'Link has expired. Please request a new one.';
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Get stored email for sign-in
 * @returns {Promise<string|null>}
 */
export const getStoredEmail = async () => {
  try {
    return await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    console.error('Get Stored Email Error:', error);
    return null;
  }
};

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_ROLE_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
};

/**
 * Get current authenticated user
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};
