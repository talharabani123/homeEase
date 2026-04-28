import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = ({ children, variant = 'default' }) => {
  const { isDarkMode } = useTheme();

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const a1 = Animated.loop(Animated.sequence([
      Animated.timing(float1, { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(float1, { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ]));
    const a2 = Animated.loop(Animated.sequence([
      Animated.timing(float2, { toValue: 1, duration: 11000, useNativeDriver: true }),
      Animated.timing(float2, { toValue: 0, duration: 11000, useNativeDriver: true }),
    ]));
    const aR = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 22000, useNativeDriver: true })
    );
    const aP = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 2500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 2500, useNativeDriver: true }),
    ]));

    a1.start(); a2.start(); aR.start(); aP.start();
    return () => { a1.stop(); a2.stop(); aR.stop(); aP.stop(); };
  }, []);

  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -45] });
  const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0,  35] });
  const rotateZ = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ── Theme-aware gradient colours ──────────────────────────────────────────
  const gradients = isDarkMode
    ? {
        default: ['#0D1F0F', '#121212', '#1A1A1A'],
        light:   ['#121212', '#1A1A1A', '#1E1E1E'],
        soft:    ['#0D1F0F', '#121212', '#1E2A1F'],
      }
    : {
        default: ['#E8F5E9', '#F0F9F5', '#FFFFFF'],
        light:   ['#FFFFFF', '#F9FAFB', '#F3F4F6'],
        soft:    ['#F0F9F5', '#E8F5E9', '#C8E6C9'],
      };

  const circleColor1 = isDarkMode ? 'rgba(136,199,145,0.08)' : 'rgba(136,199,145,0.15)';
  const circleColor2 = isDarkMode ? 'rgba(76,175,80,0.06)'   : 'rgba(76,175,80,0.12)';
  const svgOpacity1  = isDarkMode ? '0.08' : '0.15';
  const svgOpacity2  = isDarkMode ? '0.06' : '0.10';

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={gradients[variant] || gradients.default}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Circle 1 — top-right, floats + pulses */}
      <Animated.View
        style={[
          styles.circle1,
          { transform: [{ translateY: float1Y }, { scale: pulse }] },
        ]}
      >
        <View style={[styles.circleGlow, { backgroundColor: circleColor1, borderRadius: 150 }]} />
      </Animated.View>

      {/* Circle 2 — top-left area, floats + rotates
          Kept fully off-screen (top: -120, left: -80) so it NEVER bleeds
          into the visible viewport at the bottom-left corner. */}
      <Animated.View
        style={[
          styles.circle2,
          { transform: [{ translateY: float2Y }, { rotate: rotateZ }] },
        ]}
      >
        <View style={[styles.circleGlow, { backgroundColor: circleColor2, borderRadius: 125 }]} />
      </Animated.View>

      {/* SVG decorative radial gradients */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height={height} width={width}>
          <Defs>
            <RadialGradient id="rg1" cx="50%" cy="50%">
              <Stop offset="0%"   stopColor="#88C791" stopOpacity={svgOpacity1} />
              <Stop offset="100%" stopColor="#88C791" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="rg2" cx="50%" cy="50%">
              <Stop offset="0%"   stopColor="#4CAF50" stopOpacity={svgOpacity2} />
              <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.15} cy={height * 0.12} r="90"  fill="url(#rg1)" />
          <Circle cx={width * 0.85} cy={height * 0.28} r="130" fill="url(#rg2)" />
          <Circle cx={width * 0.5}  cy={height * 0.65} r="110" fill="url(#rg1)" />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1, zIndex: 10 },

  // Circle 1: top-right corner — partially off-screen, safe
  circle1: {
    position: 'absolute',
    top: -110,
    right: -55,
    width: 300,
    height: 300,
  },

  // Circle 2: top-left corner — fully off-screen, never bleeds into viewport
  circle2: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 250,
    height: 250,
  },

  circleGlow: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedBackground;
