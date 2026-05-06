import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@homeease_theme';
const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => { loadTheme(); }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) setIsDarkMode(stored === 'dark');
    } catch (_) {}
  };

  const toggleTheme = async () => {
    try {
      const next = !isDarkMode;
      setIsDarkMode(next);
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch (_) {}
  };

  return (
    <ThemeContext.Provider value={{ colors: { ...(isDarkMode ? dark : light), isDarkMode }, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Light palette ────────────────────────────────────────────────────────────
const light = {
  // Backgrounds
  background:          '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary:  '#F9F9F9',

  // Cards
  card:       '#FFFFFF',
  cardBorder: '#E0E0E0',

  // Text
  text:          '#1A1A1A',
  textSecondary: '#666666',
  textTertiary:  '#999999',

  // Brand
  primary:      '#88C791',
  primaryLight: '#F0F9F5',
  primaryDark:  '#6BA872',

  // Semantic
  success: '#4CAF50',
  error:   '#FF4444',
  warning: '#FFA726',
  info:    '#2196F3',

  // UI chrome
  border:  '#E0E0E0',
  divider: '#F0F0F0',
  shadow:  '#000000',

  // Inputs
  inputBackground: '#F9F9F9',
  inputBorder:     '#E0E0E0',
  placeholder:     '#999999',

  // Misc
  white:      '#FFFFFF',
  black:      '#000000',
  overlay:    'rgba(0,0,0,0.4)',
  statusBar:  'dark-content',

  // Navigation bar (bottom tabs / drawer)
  navBackground: '#FFFFFF',
  navBorder:     '#E0E0E0',
  navActive:     '#88C791',
  navInactive:   '#999999',

  // Header
  headerBackground: '#FFFFFF',
  headerBorder:     '#E0E0E0',
  headerText:       '#1A1A1A',
};

// ─── Dark palette ─────────────────────────────────────────────────────────────
const dark = {
  // Backgrounds
  background:          '#0F0F0F',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary:  '#242424',

  // Cards
  card:       '#1E1E1E',
  cardBorder: '#2E2E2E',

  // Text
  text:          '#F0F0F0',
  textSecondary: '#A0A0A0',
  textTertiary:  '#606060',

  // Brand
  primary:      '#88C791',
  primaryLight: '#1A2E1C',
  primaryDark:  '#6BA872',

  // Semantic
  success: '#4CAF50',
  error:   '#FF5555',
  warning: '#FFA726',
  info:    '#42A5F5',

  // UI chrome
  border:  '#2E2E2E',
  divider: '#242424',
  shadow:  '#000000',

  // Inputs
  inputBackground: '#242424',
  inputBorder:     '#2E2E2E',
  placeholder:     '#606060',

  // Misc
  white:      '#1E1E1E',   // "white" surfaces become dark cards in dark mode
  black:      '#F0F0F0',
  overlay:    'rgba(0,0,0,0.65)',
  statusBar:  'light-content',

  // Navigation bar
  navBackground: '#1A1A1A',
  navBorder:     '#2E2E2E',
  navActive:     '#88C791',
  navInactive:   '#606060',

  // Header
  headerBackground: '#1A1A1A',
  headerBorder:     '#2E2E2E',
  headerText:       '#F0F0F0',
};
