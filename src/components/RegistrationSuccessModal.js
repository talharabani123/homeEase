import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const { width, height } = Dimensions.get('window');

// Confetti Piece Component
const ConfettiPiece = ({ delay, color, left, type }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 3000 + Math.random() * 2000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: (Math.random() - 0.5) * 200,
        duration: 3000 + Math.random() * 2000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: Math.random() * 720,
        duration: 3000 + Math.random() * 2000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 3000,
        delay: delay + 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: left,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotateInterpolate },
          ],
          opacity,
        },
      ]}
    >
      <View style={[styles.confettiShape, { backgroundColor: color }]} />
    </Animated.View>
  );
};

// Success Icon Component
const SuccessIcon = () => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
      <Svg width="80" height="80" viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="38" fill={COLORS.primaryGreen} opacity="0.1" />
        <Circle cx="40" cy="40" r="30" fill={COLORS.primaryGreen} />
        <Path
          d="M25 40 L35 50 L55 30"
          stroke={COLORS.white}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};

const RegistrationSuccessModal = ({ visible, onClose, userRole, userName }) => {
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  const confettiCount = 30;

  const isProvider = userRole === 'service_provider';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti Animation */}
        {visible && Array.from({ length: confettiCount }).map((_, index) => (
          <ConfettiPiece
            key={index}
            delay={index * 50}
            color={confettiColors[index % confettiColors.length]}
            left={Math.random() * width}
            type={index % 3}
          />
        ))}

        {/* Success Card */}
        <View style={styles.card}>
          <SuccessIcon />

          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Registration Successful!</Text>
          
          {userName && (
            <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
          )}

          <Text style={styles.message}>
            {isProvider
              ? 'Your account has been created successfully. Your profile is under verification. You will be notified once approved.'
              : 'Your account has been created successfully. Welcome to HomeEase Platform!'}
          </Text>

          {isProvider && (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>⏳</Text>
              <Text style={styles.infoText}>
                Verification typically takes 24-48 hours
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {!isProvider && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => onClose('dashboard')}
              >
                <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={isProvider ? styles.primaryButton : styles.secondaryButton}
              onPress={() => onClose('login')}
            >
              <Text style={isProvider ? styles.primaryButtonText : styles.secondaryButtonText}>
                {isProvider ? 'Go to Login' : 'Go to Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
  },
  confettiShape: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  secondaryButton: {
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
});

export default RegistrationSuccessModal;
