import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Polyline } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Custom Illustration - Real-Time Tracking
const TrackingIllustration = () => (
  <Svg width={width * 0.8} height={height * 0.4} viewBox="0 0 300 300">
    <Defs>
      <LinearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#E3F2FD" stopOpacity="1" />
        <Stop offset="100%" stopColor="#BBDEFB" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#42A5F5" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1E88E5" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    
    {/* Phone Frame */}
    <Rect x="75" y="50" width="150" height="200" rx="15" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="3" />
    
    {/* Map Background */}
    <Rect x="85" y="70" width="130" height="160" rx="8" fill="url(#mapGrad)" />
    
    {/* Map Grid Lines */}
    <G opacity="0.3">
      <Path d="M85 110 L215 110" stroke="#90CAF9" strokeWidth="1" />
      <Path d="M85 150 L215 150" stroke="#90CAF9" strokeWidth="1" />
      <Path d="M85 190 L215 190" stroke="#90CAF9" strokeWidth="1" />
      <Path d="M125 70 L125 230" stroke="#90CAF9" strokeWidth="1" />
      <Path d="M165 70 L165 230" stroke="#90CAF9" strokeWidth="1" />
    </G>
    
    {/* Route Path */}
    <Polyline
      points="110,200 130,180 150,160 170,140 190,120"
      stroke="#88C791"
      strokeWidth="3"
      strokeDasharray="5,5"
      fill="none"
      strokeLinecap="round"
    />
    
    {/* Provider Location (Moving Car) */}
    <G transform="translate(110, 200)">
      <Circle cx="0" cy="0" r="20" fill="url(#carGrad)" />
      <Path d="M-8 -5 L8 -5 L10 5 L-10 5 Z" fill="#FFFFFF" />
      <Circle cx="-5" cy="8" r="3" fill="#333" />
      <Circle cx="5" cy="8" r="3" fill="#333" />
      <Rect x="-6" y="-8" width="12" height="6" rx="1" fill="#90CAF9" />
    </G>
    
    {/* Customer Location Pin */}
    <G transform="translate(175, 110)">
      <Path
        d="M15 0 C6.7 0 0 6.7 0 15 C0 26.25 15 40 15 40 C15 40 30 26.25 30 15 C30 6.7 23.3 0 15 0 Z"
        fill="#FF5252"
      />
      <Circle cx="15" cy="15" r="6" fill="#FFFFFF" />
    </G>
    
    {/* ETA Badge */}
    <G transform="translate(140, 90)">
      <Rect x="0" y="0" width="60" height="28" rx="14" fill="#FFFFFF" />
      <Text x="30" y="18" fontSize="12" fontWeight="600" fill="#88C791" textAnchor="middle">12 min</Text>
    </G>
    
    {/* Pulse Rings */}
    <G opacity="0.4">
      <Circle cx="125" cy="215" r="25" fill="none" stroke="#42A5F5" strokeWidth="2" />
      <Circle cx="125" cy="215" r="35" fill="none" stroke="#42A5F5" strokeWidth="1" opacity="0.5" />
    </G>
    
    {/* Distance Indicator */}
    <G transform="translate(100, 260)">
      <Rect x="0" y="0" width="100" height="30" rx="15" fill="#88C791" />
      <Text x="50" y="20" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">2.5 km away</Text>
    </G>
  </Svg>
);

const OnboardingScreen2 = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.replace('RoleSelection')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <TrackingIllustration />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Track Your Service{'\n'}Live</Text>
        <Text style={styles.subtitle}>
          See your provider's location and arrival time in real-time.
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => navigation.navigate('Onboarding3')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <Svg width="20" height="20" viewBox="0 0 20 20">
          <Path d="M7 4 L13 10 L7 16" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#42A5F5',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    marginHorizontal: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen2;
