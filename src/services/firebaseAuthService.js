/**
 * Firebase Authentication Service
 * Complete authentication system with Email/Password and Google Sign-In
 * 
 * Features:
 * - Email/Password Sign Up with OTP verification
 * - Email/Password Sign In with verification check
 * - Google Sign-In
 * - Password Reset
 * - Session Management
 * - User Profile Management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

/**
 * Sign up with email and password
 * Creates Firebase Auth account and Firestore profile
 * User must verify email via OTP before they can sign in
 * 
 * @param {object} userData - { email, password, fullName, phone, address, role, profileImage }
 * @returns {Promise<object>} - { success, user, uid, error }
 */
export const signUpWithEmail = async (userData) => {
  try {
    const { email, password, fullName, phone, address, role = 'customer', profileImage } = userData;
    
    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: fullName,
      photoURL: profileImage || null,
    });
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      phone: phone || '',
      address: address || '',
      role: role,
      profileImage: profileImage || null,
      isEmailVerified: false, // Will be set to true after OTP verification
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(firestore, 'users', user.uid), userProfile);
    
    console.log('✅ User account created successfully');
    
    return {
      success: true,
      user: user,
      uid: user.uid,
      message: 'Account created successfully',
    };
  } catch (error) {
    console.error('❌ Sign Up Error:', error);
    
    let errorMessage = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Please sign in instead.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Use at least 6 characters.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Check your connection and try again.';
        break;
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
 * Checks if user's email is verified before allowing access
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - { success, user, userData, isVerified, error }
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.toLowerCase().trim(),
      password
    );
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // User profile not found - this shouldn't happen
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact support.',
      };
    }
    
    const userData = userDoc.data();
    
    // Check if email is verified
    if (!userData.isEmailVerified) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Email not verified. Please verify your email first.',
        isVerified: false,
        email: email,
      };
    }
    
    // Check if account is active
    if (!userData.isActive) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
      };
    }
    
    console.log('✅ User signed in successfully');
    
    return {
      success: true,
      user: user,
      userData: userData,
      isVerified: true,
      message: 'Signed in successfully',
    };
  } catch (error) {
    console.error('❌ Sign In Error:', error);
    
    let errorMessage = 'Failed to sign in';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection and try again.';
        break;
      default:
        errorMessage = 'Unable to sign in. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

/**
 * Mark user's email as verified in Firestore
 * Called after successful OTP verification
 * 
 * @param {string} uid - User ID
 * @returns {Promise<object>} - { success, error }
 */
export const markEmailAsVerified = async (uid) => {
  try {
    await updateDoc(doc(firestore, 'users', uid), {
      isEmailVerified: true,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Email marked as verified');
    
    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('❌ Mark Email Verified Error:', error);
    
    return {
      success: false,
      error: 'Failed to update verification status',
    };
  }
};

/**
 * Send password reset email
 * 
 * @param {string} email - User email
 * @returns {Promise<object>} - { success, error }
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email.toLowerCase().trim());
    
    console.log('✅ Password reset email sent');
    
    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    };
  } catch (error) {
    console.error('❌ Password Reset Error:', error);
    
    let errorMessage = 'Failed to send reset email';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later.';
        break;
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

// ============================================
// GOOGLE SIGN-IN
// ============================================

/**
 * Sign in with Google
 * Creates user profile if new user, otherwise just signs in
 * 
 * @param {string} idToken - Google ID token from Google Sign-In
 * @returns {Promise<object>} - { success, user, userData, isNewUser, error }
 */
export const signInWithGoogle = async (idToken) => {
  try {
    // Create Google credential
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in with credential
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    const isNewUser = userCredential.additionalUserInfo?.isNewUser || false;
    
    // Check if user profile exists
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    
    if (!userDoc.exists() || isNewUser) {
      // Create new user profile
      const userProfile = {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || '',
        phone: user.phoneNumber || '',
        address: '',
        role: 'customer',
        profileImage: user.photoURL || null,
        isEmailVerified: true, // Google accounts are pre-verified
        isActive: true,
        authProvider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      console.log('✅ New Google user created');
      
      return {
        success: true,
        user: user,
        userData: userProfile,
        isNewUser: true,
        message: 'Account created successfully with Google',
      };
    } else {
      // Existing user
      const userData = userDoc.data();
      
      // Check if account is active
      if (!userData.isActive) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: 'Your account has been deactivated. Please contact support.',
        };
      }
      
      console.log('✅ Existing Google user signed in');
      
      return {
        success: true,
        user: user,
        userData: userData,
        isNewUser: false,
        message: 'Signed in successfully with Google',
      };
    }
  } catch (error) {
    console.error('❌ Google Sign-In Error:', error);
    
    let errorMessage = 'Failed to sign in with Google';
    
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with this email using a different sign-in method.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid Google credentials. Please try again.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Check your connection.';
        break;
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

/**
 * Get user profile from Firestore
 * 
 * @param {string} uid - User ID
 * @returns {Promise<object>} - { success, userData, error }
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    
    if (userDoc.exists()) {
      return {
        success: true,
        userData: userDoc.data(),
      };
    } else {
      return {
        success: false,
        error: 'User profile not found',
      };
    }
  } catch (error) {
    console.error('❌ Get Profile Error:', error);
    
    return {
      success: false,
      error: 'Failed to fetch user profile',
    };
  }
};

/**
 * Update user profile
 * 
 * @param {string} uid - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - { success, error }
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    await updateDoc(doc(firestore, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Also update Firebase Auth profile if name or photo changed
    if (updates.fullName || updates.profileImage) {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: updates.fullName || user.displayName,
          photoURL: updates.profileImage || user.photoURL,
        });
      }
    }
    
    console.log('✅ Profile updated successfully');
    
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Sign out user
 * 
 * @returns {Promise<object>} - { success, error }
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    
    console.log('✅ User signed out successfully');
    
    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    console.error('❌ Sign Out Error:', error);
    
    return {
      success: false,
      error: 'Failed to sign out',
    };
  }
};

/**
 * Get current user
 * 
 * @returns {object|null} - Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Listen to auth state changes
 * 
 * @param {function} callback - Callback function (user) => {}
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Delete user account
 * Deletes both Firebase Auth account and Firestore profile
 * 
 * @returns {Promise<object>} - { success, error }
 */
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }
    
    // Delete Firestore profile
    await deleteDoc(doc(firestore, 'users', user.uid));
    
    // Delete Firebase auth account
    await deleteUser(user);
    
    console.log('✅ Account deleted successfully');
    
    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    console.error('❌ Delete Account Error:', error);
    
    let errorMessage = 'Failed to delete account';
    
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Please sign in again before deleting your account.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

export default {
  signUpWithEmail,
  signInWithEmail,
  markEmailAsVerified,
  sendPasswordResetEmail,
  signInWithGoogle,
  getUserProfile,
  updateUserProfile,
  signOut,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChanged,
  deleteAccount,
};
