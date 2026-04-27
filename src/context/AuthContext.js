import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentMode, switchUserMode } from '../services/roleManagementService';

const AUTH_KEY = '@homeease_auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState('customer'); // 'customer' or 'provider'

  useEffect(() => {
    loadUser();
    loadCurrentMode();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored !== null) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMode = async () => {
    try {
      const result = await getCurrentMode();
      if (result.success && result.mode) {
        setCurrentMode(result.mode);
      }
    } catch (error) {
      console.error('Error loading current mode:', error);
    }
  };

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

  const signIn = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const value = {
    user,
    loading,
    currentMode,
    signIn,
    signOut,
    updateUser,
    switchMode,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
