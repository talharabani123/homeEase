/**
 * Firebase Authentication Service
 * Email/Password and Phone OTP authentication
 */

import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, FieldValue } from '@react-native-firebase/firestore';

const auth = getAuth();
const firestore = getFirestore();

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

/**
 * Sign up with email and password
 * @param {object} userData - { email, password, fullName, phone, address, role }
 * @returns {Promise<object>} - { success, user, error }
 */
export const signUpWithEmail = async (userData) => {
  try {
    const { email, password, fullName, phone, address, role = 'customer' } = userData;
    
    // Create Firebase auth account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update display name
    await user.updateProfile({
      displayName: fullName,
    });
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email,
      fullName: fullName,
      phone: phone || '',
      address: address || '',
      role: role,
      isEmailVerified: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await firestore
      .collection('users')
      .doc(user.uid)
      .set(userProfile);
    
    // Send email verification
    await user.sendEmailVerification();
    
    console.log('User signed up successfully');
    
    return {
      success: true,
      user: user,
      message: 'Account created successfully. Please verify your email.',
    };
  } catch (error) {
    console.error('Sign Up Error:', error);
    
    let errorMessage = 'Failed to create account';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password accounts are not enabled. Please contact support.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Check your connection and try again.';
    } else if (error.code === 'firestore/permission-denied') {
      errorMessage = 'Database permission denied. Please contact support.';
    } else if (error.code === 'firestore/unavailable') {
      errorMessage = 'Database is temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - { success, user, error }
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('User signed in successfully');
    
    return {
      success: true,
      user: user,
      message: 'Signed in successfully',
    };
  } catch (error) {
    console.error('Sign In Error:', error);
    
    let errorMessage = 'Failed to sign in';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Check your connection';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<object>} - { success, error }
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
    
    console.log('Password reset email sent');
    
    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    };
  } catch (error) {
    console.error('Password Reset Error:', error);
    
    let errorMessage = 'Failed to send reset email';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

// ============================================
// PHONE OTP AUTHENTICATION
// ============================================

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number (+923001234567)
 */
export const formatPhoneForFirebase = (phone) => {
  if (!phone) return '';
  
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // If starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    cleaned = '+92' + cleaned.substring(1);
  }
  
  // If starts with 92, add +
  if (cleaned.startsWith('92') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // If doesn't start with +, add +92
  if (!cleaned.startsWith('+')) {
    cleaned = '+92' + cleaned;
  }
  
  return cleaned;
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<object>} - { success, confirmation, error }
 */
export const sendOTP = async (phoneNumber) => {
  try {
    const formattedPhone = formatPhoneForFirebase(phoneNumber);
    
    console.log('Sending OTP to:', formattedPhone);
    
    // Send OTP via Firebase
    const confirmation = await auth.signInWithPhoneNumber(formattedPhone);
    
    console.log('OTP sent successfully');
    
    return {
      success: true,
      confirmation,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Send OTP Error:', error);
    
    let errorMessage = 'Failed to send OTP';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Check your connection';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Try again later';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code
    };
  }
};

/**
 * Verify OTP code
 * @param {object} confirmation - Confirmation object from sendOTP
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<object>} - { success, user, error }
 */
export const verifyOTP = async (confirmation, otpCode) => {
  try {
    if (!confirmation) {
      return {
        success: false,
        error: 'No confirmation object. Please resend OTP'
      };
    }
    
    if (!otpCode || otpCode.length !== 6) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit OTP'
      };
    }
    
    console.log('Verifying OTP...');
    
    // Verify OTP
    const userCredential = await confirmation.confirm(otpCode);
    
    console.log('OTP verified successfully');
    
    return {
      success: true,
      user: userCredential.user,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    
    let errorMessage = 'Invalid OTP code';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid OTP code. Please try again';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'OTP code expired. Please request a new one';
    } else if (error.code === 'auth/session-expired') {
      errorMessage = 'Session expired. Please resend OTP';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code
    };
  }
};

/**
 * Create user profile in Firestore after OTP verification
 * @param {object} userData - User data (name, email, phone, etc.)
 * @param {string} uid - Firebase user UID
 * @returns {Promise<object>} - { success, error }
 */
export const createUserProfile = async (userData, uid) => {
  try {
    const userProfile = {
      uid,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'customer',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isPhoneVerified: true,
      isActive: true,
    };
    
    // Save to Firestore
    await firestore
      .collection('users')
      .doc(uid)
      .set(userProfile);
    
    console.log('User profile created successfully');
    
    return {
      success: true,
      message: 'Profile created successfully'
    };
  } catch (error) {
    console.error('Create Profile Error:', error);
    
    return {
      success: false,
      error: 'Failed to create user profile'
    };
  }
};

/**
 * Get user profile from Firestore
 * @param {string} uid - Firebase user UID
 * @returns {Promise<object>} - { success, userData, error }
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await firestore
      .collection('users')
      .doc(uid)
      .get();
    
    if (userDoc.exists) {
      return {
        success: true,
        userData: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: 'User profile not found'
      };
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    
    return {
      success: false,
      error: 'Failed to fetch user profile'
    };
  }
};

/**
 * Update user profile
 * @param {string} uid - Firebase user UID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - { success, error }
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    await firestore
      .collection('users')
      .doc(uid)
      .update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      });
    
    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Update Profile Error:', error);
    
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
};

/**
 * Sign out user
 * @returns {Promise<object>} - { success, error }
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    
    console.log('User signed out successfully');
    
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('Sign Out Error:', error);
    
    return {
      success: false,
      error: 'Failed to sign out'
    };
  }
};

/**
 * Get current user
 * @returns {object|null} - Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Listen to auth state changes
 * @param {function} callback - Callback function (user) => {}
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};

/**
 * Delete user account
 * @returns {Promise<object>} - { success, error }
 */
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: 'No user logged in'
      };
    }
    
    // Delete Firestore profile
    await firestore
      .collection('users')
      .doc(user.uid)
      .delete();
    
    // Delete Firebase auth account
    await user.delete();
    
    console.log('Account deleted successfully');
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('Delete Account Error:', error);
    
    return {
      success: false,
      error: 'Failed to delete account'
    };
  }
};

export default {
  formatPhoneForFirebase,
  sendOTP,
  verifyOTP,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  signOut,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChanged,
  deleteAccount,
};
