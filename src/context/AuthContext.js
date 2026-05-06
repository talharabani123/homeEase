import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  getCurrentUser,
  getUserProfile,
  signOut as firebaseSignOut,
} from '../services/firebaseAuthService';
import { getCurrentMode, switchUserMode } from '../services/roleManagementService';
import { clearAllUserData } from '../services/userDataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user object
  const [userData, setUserData] = useState(null); // Firestore user profile
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState('customer'); // 'customer' or 'provider'

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Fetch user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          setUserData(profileResult.userData);
          
          // Load user mode
          const modeResult = await getCurrentMode();
          if (modeResult.success && modeResult.mode) {
            setCurrentMode(modeResult.mode);
          }
        }
      } else {
        // User is signed out
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const switchMode = async (newMode) => {
    try {
      const result = await switchUserMode(newMode);
      if (result.success) {
        setCurrentMode(result.mode);
        return { success: true, mode: result.mode };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error switching mode:', error);
      return { success: false, error: 'Failed to switch mode' };
    }
  };

  const signIn = async (firebaseUser, firestoreUserData) => {
    try {
      setUser(firebaseUser);
      setUserData(firestoreUserData);
      
      // Set current mode based on user role
      if (firestoreUserData?.role === 'provider') {
        setCurrentMode('provider');
      } else {
        setCurrentMode('customer');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      const currentUser = getCurrentUser();
      const uid = currentUser?.uid;
      await firebaseSignOut();
      // Clear in-memory state immediately
      setUser(null);
      setUserData(null);
      setCurrentMode('customer');
      // Clear all user-specific AsyncStorage data
      if (uid) await clearAllUserData(uid);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUserData = { ...userData, ...updates };
      setUserData(updatedUserData);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const refreshUserData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const profileResult = await getUserProfile(currentUser.uid);
        if (profileResult.success) {
          setUserData(profileResult.userData);
          return { success: true };
        }
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  const value = {
    user, // Firebase user object
    userData, // Firestore user profile
    loading,
    currentMode,
    signIn,
    signOut,
    updateUser,
    refreshUserData,
    switchMode,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
