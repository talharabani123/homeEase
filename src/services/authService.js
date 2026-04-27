/**
 * Authentication Service
 * Handles user registration and login with email/phone + password
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@homeease_users';
const CURRENT_USER_KEY = '@homeease_current_user';

/**
 * Register a new user
 * @param {object} userData - { email, phone, password, fullName, cnic, role, ...otherData }
 * @returns {Promise<object>} - { success, user, error }
 */
export const registerUser = async (userData) => {
  try {
    const { email, phone, password, fullName, cnic, role = 'customer' } = userData;

    // Validate required fields
    if (!email || !phone || !password || !fullName) {
      return {
        success: false,
        error: 'Email, phone, password, and full name are required'
      };
    }

    // Get existing users
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];

    // Check if email already exists
    const emailExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return {
        success: false,
        error: 'Email already registered'
      };
    }

    // Check if phone already exists
    const phoneExists = users.find(u => u.phone === phone);
    if (phoneExists) {
      return {
        success: false,
        error: 'Phone number already registered'
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      phone,
      password, // In production, this should be hashed
      fullName,
      cnic: cnic || '',
      role,
      ...userData, // Include any additional data (address, services, etc.)
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Remove password from user object that will be returned
    const { password: _, ...userWithoutPassword } = newUser;

    // Save to storage
    users.push(newUser);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    console.log('User registered successfully:', userWithoutPassword.email);

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Failed to register user'
    };
  }
};

/**
 * Login with email or phone + password
 * @param {string} identifier - Email or phone number
 * @param {string} password - User password
 * @returns {Promise<object>} - { success, user, error }
 */
export const loginUser = async (identifier, password) => {
  try {
    if (!identifier || !password) {
      return {
        success: false,
        error: 'Email/phone and password are required'
      };
    }

    // Get all users
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];

    // Find user by email or phone
    const user = users.find(u => 
      u.email.toLowerCase() === identifier.toLowerCase() || 
      u.phone === identifier
    );

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email or phone number'
      };
    }

    // Check password
    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password'
      };
    }

    // Check if account is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is disabled. Please contact support'
      };
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Save current user
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    console.log('User logged in successfully:', userWithoutPassword.email);

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Failed to login'
    };
  }
};

/**
 * Get current logged in user
 * @returns {Promise<object>} - { success, user, error }
 */
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (userData) {
      return {
        success: true,
        user: JSON.parse(userData)
      };
    }
    return {
      success: false,
      error: 'No user logged in'
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: 'Failed to get current user'
    };
  }
};

/**
 * Logout current user
 * @returns {Promise<object>} - { success, error }
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    console.log('User logged out successfully');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout'
    };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - { success, user, error }
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    // Get all users
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];

    // Find user index
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save to storage
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Update current user if it's the same user
    const currentUserData = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === userId) {
        const { password: _, ...userWithoutPassword } = users[userIndex];
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      }
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} - { success, error }
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Get all users
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];

    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify old password
    if (users[userIndex].password !== oldPassword) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }

    // Update password
    users[userIndex].password = newPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    // Save to storage
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: 'Failed to change password'
    };
  }
};

/**
 * Reset password (for forgot password flow)
 * @param {string} identifier - Email or phone
 * @param {string} newPassword - New password
 * @returns {Promise<object>} - { success, error }
 */
export const resetPassword = async (identifier, newPassword) => {
  try {
    // Get all users
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];

    // Find user
    const userIndex = users.findIndex(u => 
      u.email.toLowerCase() === identifier.toLowerCase() || 
      u.phone === identifier
    );

    if (userIndex === -1) {
      return {
        success: false,
        error: 'No account found with this email or phone'
      };
    }

    // Update password
    users[userIndex].password = newPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    // Save to storage
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'Failed to reset password'
    };
  }
};

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise<object>} - { exists }
 */
export const checkEmailExists = async (email) => {
  try {
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    return { exists };
  } catch (error) {
    console.error('Check email error:', error);
    return { exists: false };
  }
};

/**
 * Check if phone exists
 * @param {string} phone - Phone to check
 * @returns {Promise<object>} - { exists }
 */
export const checkPhoneExists = async (phone) => {
  try {
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users = usersData ? JSON.parse(usersData) : [];
    const exists = users.some(u => u.phone === phone);
    return { exists };
  } catch (error) {
    console.error('Check phone error:', error);
    return { exists: false };
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  changePassword,
  resetPassword,
  checkEmailExists,
  checkPhoneExists
};
