import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@homeease_theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) {
        setIsDarkMode(stored === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F9F9F9',
  
  // Cards
  card: '#FFFFFF',
  cardBorder: '#E0E0E0',
  
  // Text
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Primary
  primary: '#88C791',
  primaryLight: '#F0F9F5',
  primaryDark: '#6BA872',
  
  // Status
  success: '#4CAF50',
  error: '#FF4444',
  warning: '#FFA726',
  info: '#2196F3',
  
  // UI Elements
  border: '#E0E0E0',
  divider: '#F0F0F0',
  shadow: '#000000',
  
  // Input
  inputBackground: '#F9F9F9',
  inputBorder: '#E0E0E0',
  placeholder: '#999999',
  
  // Status bar
  statusBar: 'dark-content',
};

const darkColors = {
  // Backgrounds
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2C2C2C',
  
  // Cards
  card: '#1E1E1E',
  cardBorder: '#333333',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  
  // Primary
  primary: '#88C791',
  primaryLight: '#2C3E2F',
  primaryDark: '#6BA872',
  
  // Status
  success: '#4CAF50',
  error: '#FF4444',
  warning: '#FFA726',
  info: '#2196F3',
  
  // UI Elements
  border: '#333333',
  divider: '#2C2C2C',
  shadow: '#000000',
  
  // Input
  inputBackground: '#2C2C2C',
  inputBorder: '#333333',
  placeholder: '#808080',
  
  // Status bar
  statusBar: 'light-content',
};
