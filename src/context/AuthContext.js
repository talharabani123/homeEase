import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChange,
  getCurrentUser,
  getUserProfile,
  signOut as supabaseSignOut,
} from '../services/supabaseAuthService';
import { getCurrentMode, switchUserMode } from '../services/roleManagementService';

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
    // Listen to Supabase auth state changes
    const subscription = onAuthStateChange(async (session, event) => {
      if (session?.user) {
        // User is signed in
        setUser(session.user);
        
        // Fetch user profile from Supabase
        const profileResult = await getUserProfile(session.user.id);
        if (profileResult.success) {
          setUserData(profileResult.data);
          
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
    return () => {
      subscription?.unsubscribe();
    };
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

  const signIn = async (supabaseUser, supabaseUserData) => {
    try {
      setUser(supabaseUser);
      setUserData(supabaseUserData);
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      setUserData(null);
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
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const profileResult = await getUserProfile(currentUser.id);
        if (profileResult.success) {
          setUserData(profileResult.data);
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
    user, // Supabase user object
    userData, // Supabase user profile
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
