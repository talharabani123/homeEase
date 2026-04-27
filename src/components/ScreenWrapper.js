import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from './AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

/**
 * ScreenWrapper - Wraps all screens with beautiful animated background
 * Usage: <ScreenWrapper variant="default|light|soft">{content}</ScreenWrapper>
 */
const ScreenWrapper = ({ 
  children, 
  variant = 'default',
  useSafeArea = true,
  edges = ['top', 'bottom']
}) => {
  const { colors } = useTheme();

  if (useSafeArea) {
    return (
      <AnimatedBackground variant={variant}>
        <SafeAreaView style={styles.safeArea} edges={edges}>
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
  safeArea: {
    flex: 1,
  },
});

export default ScreenWrapper;
