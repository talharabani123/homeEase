/**
 * Supabase Authentication Service
 * Replaces firebaseAuthService.js
 * 
 * Features:
 * - Email/Password authentication
 * - User profile management
 * - Session management
 */

import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// DEMO ACCOUNTS (for presentation bypass)
// ============================================
const DEMO_SESSION_KEY = '@homeease_demo_session';

const DEMO_ACCOUNTS = {
  'customer@demo.com': {
    id: 'demo_customer_user_id',
    email: 'customer@demo.com',
    email_confirmed_at: new Date().toISOString(),
    user_metadata: { full_name: 'Demo Customer', user_type: 'customer', phone_number: '03001234567' },
    app_metadata: {},
    created_at: new Date().toISOString(),
  },
  'provider@demo.com': {
    id: 'demo_provider_user_id',
    email: 'provider@demo.com',
    email_confirmed_at: new Date().toISOString(),
    user_metadata: { full_name: 'Demo Provider', user_type: 'provider', phone_number: '03009876543' },
    app_metadata: {},
    created_at: new Date().toISOString(),
  },
};

const DEMO_USER_PROFILES = {
  'demo_customer_user_id': {
    id: 'demo_customer_user_id',
    email: 'customer@demo.com',
    full_name: 'Demo Customer',
    user_type: 'customer',
    phone_number: '03001234567',
    is_active: true,
    is_email_verified: true,
    created_at: new Date().toISOString(),
  },
  'demo_provider_user_id': {
    id: 'demo_provider_user_id',
    email: 'provider@demo.com',
    full_name: 'Demo Provider',
    user_type: 'provider',
    phone_number: '03009876543',
    is_active: true,
    is_email_verified: true,
    created_at: new Date().toISOString(),
  },
};

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Sign up with email and password
 * Uses Supabase's built-in email confirmation
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @param {string} userType - 'customer' or 'provider'
 * @param {string} phoneNumber - Optional phone number
 * @returns {Promise<object>} - { success, user, error }
 */
// In-memory store for development OTPs (mapped by email)
const devOTPs = new Map();

export const signUpWithEmail = async (email, password, fullName, userType, phoneNumber = '') => {
  try {
    console.log('📝 Signing up user:', email, 'as', userType);

    // Sign up the user with Supabase's built-in email confirmation
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          phone_number: phoneNumber,
        },
        // Supabase will send OTP email automatically
      },
    });

    if (signUpError) {
      console.error('❌ Sign up error:', signUpError);
      return {
        success: false,
        error: getErrorMessage(signUpError),
        errorCode: signUpError.code,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    // Note: User profile is automatically created by database trigger
    // No need to manually insert into users table

    console.log('✅ User signed up successfully. Email confirmation sent.');

    // Generate a development OTP if in dev mode
    let devOTP = null;
    if (__DEV__) {
      devOTP = Math.floor(100000 + Math.random() * 900000).toString();
      devOTPs.set(email.trim().toLowerCase(), devOTP);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 DEVELOPMENT SIGNUP OTP GENERATED`);
      console.log(`✉️ Email: ${email}`);
      console.log(`🔢 Code: ${devOTP}`);
      console.log(`⏰ Use this code to verify instantly!`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Account created. Please check your email for the confirmation code.',
      needsEmailConfirmation: true,
      devOTP: devOTP,
    };
  } catch (error) {
    console.error('❌ Sign Up Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign up',
    };
  }
};

/**
 * Sign in with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - { success, user, userData, error }
 */
export const signInWithEmail = async (email, password) => {
  try {
    console.log('🔐 Signing in user:', email);

    // ── DEMO BYPASS ──────────────────────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    if (DEMO_ACCOUNTS[normalizedEmail]) {
      const demoUser = DEMO_ACCOUNTS[normalizedEmail];
      const demoProfile = DEMO_USER_PROFILES[demoUser.id];
      // Persist demo session so getCurrentUser works after restart
      await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      console.log('✅ Demo account signed in:', normalizedEmail);
      return {
        success: true,
        user: demoUser,
        session: { user: demoUser },
        userData: demoProfile,
        isVerified: true,
        isDemo: true,
        message: 'Signed in successfully (demo)',
      };
    }
    // ── END DEMO BYPASS ──────────────────────────────────────────────────────

    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('❌ Sign in error:', signInError);
      return {
        success: false,
        error: getErrorMessage(signInError),
        errorCode: signInError.code,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }

    // Get user profile data
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      // User is authenticated but profile fetch failed
      // We'll return success but with limited data
    }

    // Check if email is verified (for email/password signups)
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Email not verified. Please verify your email first.',
        isVerified: false,
        email: email,
      };
    }

    // Check if account is active
    if (userData && !userData.is_active) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
      };
    }

    console.log('✅ User signed in successfully');

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      userData: userData,
      isVerified: true,
      message: 'Signed in successfully',
    };
  } catch (error) {
    console.error('❌ Sign In Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in',
    };
  }
};

/**
 * Sign out current user
 * 
 * @returns {Promise<object>} - { success, error }
 */
export const signOut = async () => {
  try {
    console.log('👋 Signing out user');

    // Clear demo session if exists
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);

    const { error } = await supabase.auth.signOut();

    if (error) {
      // Ignore session not found errors during sign out
      if (!error.message.includes('session')) {
        console.error('❌ Sign out error:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    }

    console.log('✅ User signed out successfully');

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    console.error('❌ Sign Out Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign out',
    };
  }
};

/**
 * Get current authenticated user
 * 
 * @returns {Promise<object|null>} - User object or null
 */
export const getCurrentUser = async () => {
  try {
    // Check demo session first
    const demoSessionStr = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    if (demoSessionStr) {
      const demoSession = JSON.parse(demoSessionStr);
      return demoSession.user;
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      // Don't log "Auth session missing" as an error - it's expected when not logged in
      if (error.message !== 'Auth session missing!') {
        console.error('❌ Get user error:', error);
      }
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Get Current User Error:', error);
    return null;
  }
};

/**
 * Get current session
 * 
 * @returns {Promise<object|null>} - Session object or null
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Get session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('❌ Get Current Session Error:', error);
    return null;
  }
};

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

/**
 * Get user profile from database
 * Creates profile if it doesn't exist (fallback for trigger failure)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} - { success, data, error }
 */
export const getUserProfile = async (userId) => {
  try {
    console.log('👤 Fetching user profile:', userId);

    // Return demo profile instantly if demo user
    if (DEMO_USER_PROFILES[userId]) {
      return { success: true, data: DEMO_USER_PROFILES[userId] };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = no rows found
      if (error.code === 'PGRST116') {
        console.warn('⚠️ User profile not found, creating one...');
        
        // Get user data from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Create profile
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              user_type: user.user_metadata?.user_type || 'customer',
              phone_number: user.user_metadata?.phone_number || '',
              is_active: true,
              is_email_verified: user.email_confirmed_at ? true : false,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ Failed to create profile:', createError);
            return {
              success: false,
              error: 'Profile not found and could not be created',
            };
          }
          
          console.log('✅ User profile created successfully');
          return {
            success: true,
            data: newProfile,
          };
        }
      }
      
      console.error('❌ Get profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ User profile fetched successfully');

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Get User Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
    };
  }
};

/**
 * Update user profile
 * 
 * @param {string} userId - User ID
 * @param {object} updates - Profile updates
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('✏️ Updating user profile:', userId);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ User profile updated successfully');

    return {
      success: true,
      data: data,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('❌ Update User Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
};

/**
 * Verify email with OTP code sent by Supabase
 * 
 * @param {string} email - User email
 * @param {string} token - 6-digit OTP code from email
 * @returns {Promise<object>} - { success, user, session, error }
 */
export const verifyEmailOTP = async (email, token) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log('✅ Verifying email OTP for:', normalizedEmail);

    // Development bypass check
    if (__DEV__ && devOTPs.has(normalizedEmail) && devOTPs.get(normalizedEmail) === token) {
      console.log('✨ Development OTP matched! Bypassing Supabase OTP verification...');
      
      // Get the user and session from current Auth state
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Update user profile to mark email as verified
      const targetUserId = user?.id || (await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single()
      ).data?.id;

      if (targetUserId) {
        await supabase
          .from('users')
          .update({ is_email_verified: true })
          .eq('id', targetUserId);
      }

      console.log('✅ Email verified successfully (dev bypass)');

      return {
        success: true,
        user: user || { id: targetUserId, email: normalizedEmail },
        session: session || { user: { id: targetUserId, email: normalizedEmail } },
        message: 'Email verified successfully (dev bypass)',
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup', // or 'email' for email change
    });

    if (error) {
      console.error('❌ Verify OTP error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }

    // Update user profile to mark email as verified
    if (data.user) {
      await supabase
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', data.user.id);
    }

    console.log('✅ Email verified successfully');

    return {
      success: true,
      user: data.user,
      session: data.session,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('❌ Verify Email OTP Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify OTP',
    };
  }
};

/**
 * Resend OTP email
 * 
 * @param {string} email - User email
 * @returns {Promise<object>} - { success, error }
 */
export const resendOTP = async (email) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log('📧 Resending OTP to:', normalizedEmail);

    let devOTP = null;
    if (__DEV__) {
      devOTP = Math.floor(100000 + Math.random() * 900000).toString();
      devOTPs.set(normalizedEmail, devOTP);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 DEVELOPMENT OTP RESENT`);
      console.log(`✉️ Email: ${normalizedEmail}`);
      console.log(`🔢 Code: ${devOTP}`);
      console.log(`⏰ Use this code to verify instantly!`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('❌ Resend OTP error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }

    console.log('✅ OTP resent successfully');

    return {
      success: true,
      message: 'OTP sent to your email',
      devOTP: devOTP,
    };
  } catch (error) {
    console.error('❌ Resend OTP Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend OTP',
    };
  }
};

/**
 * Mark user's email as verified
 * Called after successful OTP verification
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} - { success, error }
 */
export const markEmailAsVerified = async (userId) => {
  try {
    console.log('✅ Marking email as verified:', userId);

    const { error } = await supabase
      .from('users')
      .update({ is_email_verified: true })
      .eq('id', userId);

    if (error) {
      console.error('❌ Mark verified error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Email marked as verified');

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('❌ Mark Email Verified Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark email as verified',
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
    console.log('📧 Sending password reset email to:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://localhost:8081', // Update with your app's deep link
    });

    if (error) {
      console.error('❌ Password reset error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }

    console.log('✅ Password reset email sent');

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('❌ Send Password Reset Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send password reset email',
    };
  }
};

/**
 * Update user password
 * 
 * @param {string} newPassword - New password
 * @returns {Promise<object>} - { success, error }
 */
export const updatePassword = async (newPassword) => {
  try {
    console.log('🔒 Updating password');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('❌ Update password error:', error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }

    console.log('✅ Password updated successfully');

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('❌ Update Password Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update password',
    };
  }
};

/**
 * Delete user account
 * Note: This requires admin privileges in Supabase
 * For now, we'll just mark the account as inactive
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} - { success, error }
 */
export const deleteUserAccount = async (userId) => {
  try {
    console.log('🗑️ Deactivating user account:', userId);

    // Mark account as inactive instead of deleting
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      console.error('❌ Deactivate account error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Sign out the user
    await supabase.auth.signOut();

    console.log('✅ User account deactivated');

    return {
      success: true,
      message: 'Account deactivated successfully',
    };
  } catch (error) {
    console.error('❌ Delete User Account Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account',
    };
  }
};

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Listen to auth state changes
 * 
 * @param {function} callback - Callback function (session, event) => {}
 * @returns {object} - Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event);
    callback(session, event);
  });

  return subscription;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Supabase error to user-friendly message
 * 
 * @param {object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (error) => {
  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Email not confirmed': 'Please verify your email before signing in.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    'Unable to validate email address: invalid format': 'Invalid email address format.',
    'User not found': 'No account found with this email address.',
    'Email rate limit exceeded': 'Too many requests. Please try again later.',
    'Invalid email or password': 'Invalid email or password. Please check your credentials and try again.',
  };

  // Check if error message matches any known patterns
  const errorMessage = error.message || error.error_description || '';
  
  for (const [key, value] of Object.entries(errorMessages)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Default error messages based on status code
  if (error.status === 400) {
    return 'Invalid request. Please check your input and try again.';
  } else if (error.status === 422) {
    return 'Invalid email or password format.';
  } else if (error.status === 429) {
    return 'Too many attempts. Please try again later.';
  }

  return errorMessage || 'An error occurred. Please try again.';
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  updateUserProfile,
  verifyEmailOTP,
  resendOTP,
  markEmailAsVerified,
  sendPasswordResetEmail,
  updatePassword,
  deleteUserAccount,
  onAuthStateChange,
};
