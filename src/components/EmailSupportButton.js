/**
 * Email Support Button Component
 * Reusable button for opening support email across the app
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { openSupportEmail } from '../services/emailSupportService';

const EmailSupportButton = ({ 
  title = 'Email Support', 
  subject = 'Support Request',
  body = '',
  style,
  textStyle,
  variant = 'primary' // 'primary', 'secondary', 'minimal'
}) => {
  const { colors } = useTheme();

  const handlePress = async () => {
    await openSupportEmail(subject, body);
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.button,
          styles.secondaryButton,
          { borderColor: colors.primary },
          style
        ];
      case 'minimal':
        return [
          styles.button,
          styles.minimalButton,
          style
        ];
      default:
        return [
          styles.button,
          styles.primaryButton,
          { backgroundColor: colors.primary },
          style
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.buttonText,
          styles.secondaryText,
          { color: colors.primary },
          textStyle
        ];
      case 'minimal':
        return [
          styles.buttonText,
          styles.minimalText,
          { color: colors.primary },
          textStyle
        ];
      default:
        return [
          styles.buttonText,
          styles.primaryText,
          textStyle
        ];
    }
  };

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={handlePress}>
      <Svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
        <Path
          d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          fill={variant === 'primary' ? '#FFFFFF' : colors.primary}
        />
      </Svg>
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  minimalButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    // color set dynamically
  },
  minimalText: {
    // color set dynamically
  },
});

export default EmailSupportButton;