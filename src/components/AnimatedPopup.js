import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedPopup = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [], 
  onClose 
}) => {
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          icon: (
            <Circle cx="12" cy="12" r="10" fill="#10B981" />
          ),
          iconPath: 'M8 12 L11 15 L16 9'
        };
      case 'error':
        return {
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          icon: (
            <Circle cx="12" cy="12" r="10" fill="#EF4444" />
          ),
          iconPath: 'M8 8 L16 16 M16 8 L8 16'
        };
      case 'warning':
        return {
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          icon: (
            <Path d="M1 21h22L12 2 1 21z" fill="#F59E0B" />
          ),
          iconPath: 'M12 8 L12 12 M12 16 L12 16.01'
        };
      default:
        return {
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          icon: (
            <Circle cx="12" cy="12" r="10" fill="#3B82F6" />
          ),
          iconPath: 'M12 8 L12 12 M12 16 L12 16.01'
        };
    }
  };

  const config = getTypeConfig();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.popup,
            {
              backgroundColor: colors.background,
              borderColor: config.borderColor,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header with Icon */}
          <View style={[styles.header, { backgroundColor: config.backgroundColor }]}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              {config.icon}
              <Path 
                d={config.iconPath} 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeLinecap="round" 
                fill="none" 
              />
            </Svg>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'primary' 
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (onClose) onClose();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    { color: button.style === 'primary' ? '#FFFFFF' : colors.text }
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    width: screenWidth - 40,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AnimatedPopup;