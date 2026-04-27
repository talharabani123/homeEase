import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = ({ children, variant = 'default' }) => {
  // Animation values for floating circles
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation for circles
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(float3, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(float3, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation1.start();
    floatAnimation2.start();
    floatAnimation3.start();
    rotateAnimation.start();
    pulseAnimation.start();

    return () => {
      floatAnimation1.stop();
      floatAnimation2.stop();
      floatAnimation3.stop();
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  // Interpolate animations
  const float1Y = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const float2Y = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const float3Y = float3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const rotateZ = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Gradient colors based on variant
  const gradientColors = {
    default: ['#E8F5E9', '#F0F9F5', '#FFFFFF'],
    light: ['#FFFFFF', '#F9FAFB', '#F3F4F6'],
    soft: ['#F0F9F5', '#E8F5E9', '#C8E6C9'],
  };

  return (
    <View style={styles.container}>
      {/* Base Gradient */}
      <LinearGradient
        colors={gradientColors[variant] || gradientColors.default}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Floating Circles */}
      <Animated.View
        style={[
          styles.circle1,
          {
            transform: [
              { translateY: float1Y },
              { scale: pulse },
            ],
          },
        ]}
      >
        <View style={styles.circleGlow1} />
      </Animated.View>

      <Animated.View
        style={[
          styles.circle2,
          {
            transform: [
              { translateY: float2Y },
              { rotate: rotateZ },
            ],
          },
        ]}
      >
        <View style={styles.circleGlow2} />
      </Animated.View>

      <Animated.View
        style={[
          styles.circle3,
          {
            transform: [
              { translateY: float3Y },
              { scale: pulse },
            ],
          },
        ]}
      >
        <View style={styles.circleGlow3} />
      </Animated.View>

      {/* Decorative Pattern Overlay */}
      <View style={styles.patternOverlay}>
        <Svg height={height} width={width} style={styles.svg}>
          <Defs>
            <RadialGradient id="grad1" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#88C791" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#88C791" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="grad2" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#4CAF50" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {/* Decorative circles */}
          <Circle cx={width * 0.2} cy={height * 0.15} r="80" fill="url(#grad1)" />
          <Circle cx={width * 0.8} cy={height * 0.3} r="120" fill="url(#grad2)" />
          <Circle cx={width * 0.5} cy={height * 0.7} r="100" fill="url(#grad1)" />
          <Circle cx={width * 0.9} cy={height * 0.85} r="90" fill="url(#grad2)" />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
  },
  circleGlow1: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    backgroundColor: 'rgba(136, 199, 145, 0.15)',
    shadowColor: '#88C791',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 5,
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 250,
    height: 250,
  },
  circleGlow2: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 4,
  },
  circle3: {
    position: 'absolute',
    top: height * 0.4,
    left: -40,
    width: 200,
    height: 200,
  },
  circleGlow3: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: 'rgba(136, 199, 145, 0.1)',
    shadowColor: '#88C791',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 3,
  },
  patternOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default AnimatedBackground;
