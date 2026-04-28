/**
 * Custom Alert Component
 * Beautiful themed alerts to replace default Alert.alert()
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  buttons = [],
  onDismiss,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconContainer, styles.successIcon]}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              <Circle cx="20" cy="20" r="18" fill={COLORS.primaryGreen} opacity="0.2" />
              <Path
                d="M12 20L17 25L28 14"
                stroke={COLORS.primaryGreen}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconContainer, styles.errorIcon]}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              <Circle cx="20" cy="20" r="18" fill="#FF4444" opacity="0.2" />
              <Path
                d="M14 14L26 26M26 14L14 26"
                stroke="#FF4444"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconContainer, styles.warningIcon]}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              <Circle cx="20" cy="20" r="18" fill="#FFA500" opacity="0.2" />
              <Path
                d="M20 12V22M20 26V28"
                stroke="#FFA500"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, styles.infoIcon]}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              <Circle cx="20" cy="20" r="18" fill={COLORS.lightBlue} opacity="0.2" />
              <Path
                d="M20 18V28M20 12V14"
                stroke={COLORS.lightBlue}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        );
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {getIcon()}

          <Text style={styles.title}>{title}</Text>
          
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.length === 0 ? (
              <TouchableOpacity
                style={[styles.button, styles.singleButton]}
                onPress={onDismiss}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            ) : buttons.length === 1 ? (
              <TouchableOpacity
                style={[styles.button, styles.singleButton]}
                onPress={() => {
                  buttons[0].onPress?.();
                  onDismiss?.();
                }}
              >
                <Text style={styles.buttonText}>{buttons[0].text}</Text>
              </TouchableOpacity>
            ) : (
              <>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      styles.multiButton,
                      button.style === 'cancel' && styles.cancelButton,
                    ]}
                    onPress={() => {
                      button.onPress?.();
                      onDismiss?.();
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
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
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: width - 80,
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
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
  title: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreen,
  },
  singleButton: {
    flex: 1,
  },
  multiButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.textGrey,
  },
});

export default CustomAlert;
