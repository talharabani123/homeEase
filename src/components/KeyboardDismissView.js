/**
 * KeyboardDismissView Component
 * Reusable wrapper for screens with keyboard inputs
 * Handles keyboard dismissal and avoids keyboard overlap
 */

import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
} from 'react-native';

/**
 * Wrapper component that dismisses keyboard on tap and avoids keyboard overlap
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.style - Additional styles
 * @param {string} props.behavior - KeyboardAvoidingView behavior (default: 'padding' for iOS, 'height' for Android)
 * @param {boolean} props.enabled - Enable/disable keyboard avoiding (default: true)
 */
export const KeyboardDismissView = ({ 
  children, 
  style, 
  behavior,
  enabled = true 
}) => {
  const defaultBehavior = behavior || (Platform.OS === 'ios' ? 'padding' : 'height');

  return (
    <KeyboardAvoidingView
      behavior={defaultBehavior}
      enabled={enabled}
      style={[styles.container, style]}
    >
      <TouchableWithoutFeedback 
        onPress={Keyboard.dismiss} 
        accessible={false}
      >
        <View style={styles.inner}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

/**
 * Simple wrapper that only dismisses keyboard on tap
 * Use when you don't need KeyboardAvoidingView
 */
export const DismissKeyboardView = ({ children, style }) => {
  return (
    <TouchableWithoutFeedback 
      onPress={Keyboard.dismiss} 
      accessible={false}
    >
      <View style={[styles.container, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default KeyboardDismissView;
