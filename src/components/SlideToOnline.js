// ANIMATION FIX APPLIED - Hot reload trigger
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const THUMB_SIZE = 60;
const TRACK_HEIGHT = 70;
const SLIDE_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 10;

const SlideToOnline = ({ isOnline, onToggle, disabled = false }) => {
  const [isSliding, setIsSliding] = useState(false);
  const slideAnim = useRef(new Animated.Value(isOnline ? SLIDE_THRESHOLD : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation when offline - DISABLED TO FIX ANIMATION CONFLICT
  React.useEffect(() => {
    // Temporarily disabled to prevent animation conflicts
    // if (!isOnline && !isSliding) {
    //   Animated.loop(
    //     Animated.sequence([
    //       Animated.timing(pulseAnim, {
    //         toValue: 1.1,
    //         duration: 1000,
    //         useNativeDriver: true,
    //       }),
    //       Animated.timing(pulseAnim, {
    //         toValue: 1,
    //         duration: 1000,
    //         useNativeDriver: true,
    //       }),
    //     ])
    //   ).start();
    // } else {
    //   pulseAnim.setValue(1);
    // }
    pulseAnim.setValue(1); // Keep static for now
  }, [isOnline, isSliding]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setIsSliding(true);
        Vibration.vibrate(10);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;

        let newValue = gestureState.dx;
        
        if (isOnline) {
          // Sliding from right to left (going offline)
          newValue = SLIDE_THRESHOLD + gestureState.dx;
          if (newValue < 0) newValue = 0;
          if (newValue > SLIDE_THRESHOLD) newValue = SLIDE_THRESHOLD;
        } else {
          // Sliding from left to right (going online)
          if (newValue < 0) newValue = 0;
          if (newValue > SLIDE_THRESHOLD) newValue = SLIDE_THRESHOLD;
        }

        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSliding(false);
        
        if (disabled) return;

        const currentValue = slideAnim._value;
        
        if (isOnline) {
          // Check if slid far enough to go offline
          if (currentValue < SLIDE_THRESHOLD * 0.3) {
            // Go offline
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }).start();
            Vibration.vibrate([0, 50, 50, 50]);
            setTimeout(() => onToggle(false), 200);
          } else {
            // Snap back to online position
            Animated.spring(slideAnim, {
              toValue: SLIDE_THRESHOLD,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }).start();
          }
        } else {
          // Check if slid far enough to go online
          if (currentValue > SLIDE_THRESHOLD * 0.7) {
            // Go online
            Animated.spring(slideAnim, {
              toValue: SLIDE_THRESHOLD,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }).start();
            Vibration.vibrate([0, 50, 50, 100]);
            setTimeout(() => onToggle(true), 200);
          } else {
            // Snap back to offline position
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }).start();
          }
        }
      },
    })
  ).current;

  // Update slider position when isOnline changes externally
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOnline ? SLIDE_THRESHOLD : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [isOnline]);

  const backgroundColor = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD],
    outputRange: ['#EF4444', '#10B981'], // Red to Green
  });

  const textOpacity = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD / 2, SLIDE_THRESHOLD],
    outputRange: [1, 0, 0],
  });

  const onlineTextOpacity = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD / 2, SLIDE_THRESHOLD],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        {/* Offline Text */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.trackText}>
            {isOnline ? '← Slide to go Offline' : 'Slide to go Online →'}
          </Text>
        </Animated.View>

        {/* Online Text */}
        <Animated.View style={[styles.textContainerRight, { opacity: onlineTextOpacity }]}>
          <Text style={styles.trackText}>You're Online! ←</Text>
        </Animated.View>

        {/* Slider Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.thumbInner,
              { 
                backgroundColor: isOnline ? '#10B981' : '#EF4444',
                // Simplified transform to avoid conflicts
                transform: [{ scale: isSliding ? 1.1 : 1 }],
              }
            ]}
          >
            {isOnline ? (
              <Svg width="32" height="32" viewBox="0 0 24 24">
                <Path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  fill="#FFFFFF"
                />
              </Svg>
            ) : (
              <Svg width="32" height="32" viewBox="0 0 24 24">
                <Path
                  d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                  fill="#FFFFFF"
                />
              </Svg>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.statusText, { color: isOnline ? '#10B981' : '#EF4444' }]}>
          {isOnline ? 'You are receiving job requests' : 'You are not receiving requests'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  track: {
    width: SLIDER_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainerRight: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  thumb: {
    position: 'absolute',
    left: 5,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SlideToOnline;
