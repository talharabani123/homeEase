import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Animated } from 'react-native';
import { Video } from 'expo-av';
import { useTheme } from '../context/ThemeContext';

const SuccessAnimation = ({ visible, onComplete }) => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after video duration
      const timer = setTimeout(() => {
        handleComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleComplete = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor: colors.background,
            }
          ]}
        >
          <Video
            source={require('../../assets/vedios/tick.mp4')}
            style={styles.video}
            shouldPlay
            isLooping={false}
            resizeMode="contain"
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                handleComplete();
              }
            }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 250,
    height: 250,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  video: {
    width: 200,
    height: 200,
  },
});

export default SuccessAnimation;