import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from './AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

/**
 * ScreenWrapper
 * Wraps every screen with the animated background + safe area.
 * Automatically adapts to light / dark mode via ThemeContext.
 *
 * Props:
 *   variant      'default' | 'light' | 'soft'
 *   useSafeArea  boolean (default true)
 *   edges        SafeAreaView edges (default ['top','bottom'])
 */
const ScreenWrapper = ({
  children,
  variant = 'default',
  useSafeArea = true,
  edges = ['top', 'bottom'],
}) => {
  const { colors } = useTheme();

  const safeAreaStyle = [styles.safeArea, { backgroundColor: 'transparent' }];

  if (useSafeArea) {
    return (
      <AnimatedBackground variant={variant}>
        <SafeAreaView style={safeAreaStyle} edges={edges}>
          {children}
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant={variant}>
      {children}
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});

export default ScreenWrapper;
