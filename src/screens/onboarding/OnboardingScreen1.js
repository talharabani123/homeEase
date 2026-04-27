import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Custom Illustration - Home Services
const WelcomeIllustration = () => (
  <Svg width={width * 0.8} height={height * 0.4} viewBox="0 0 300 300">
    <Defs>
      <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#88C791" stopOpacity="1" />
        <Stop offset="100%" stopColor="#5FA868" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#E8F5E9" stopOpacity="1" />
        <Stop offset="100%" stopColor="#C8E6C9" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    
    {/* Background Circle */}
    <Circle cx="150" cy="150" r="120" fill="url(#grad2)" opacity="0.3" />
    
    {/* House */}
    <Path
      d="M150 80 L220 130 L220 220 L80 220 L80 130 Z"
      fill="url(#grad1)"
    />
    <Path
      d="M150 80 L220 130 L220 140 L150 90 L80 140 L80 130 Z"
      fill="#5FA868"
    />
    
    {/* Door */}
    <Rect x="130" y="170" width="40" height="50" rx="5" fill="#FFFFFF" />
    <Circle cx="160" cy="195" r="3" fill="#88C791" />
    
    {/* Windows */}
    <Rect x="100" y="150" width="25" height="25" rx="3" fill="#FFFFFF" />
    <Rect x="175" y="150" width="25" height="25" rx="3" fill="#FFFFFF" />
    
    {/* Service Icons Floating */}
    <G opacity="0.9">
      {/* Wrench */}
      <Circle cx="70" cy="100" r="20" fill="#FFFFFF" />
      <Path d="M65 95 L75 105 M70 90 L70 110" stroke="#88C791" strokeWidth="3" strokeLinecap="round" />
      
      {/* Hammer */}
      <Circle cx="230" cy="100" r="20" fill="#FFFFFF" />
      <Path d="M225 95 L235 105 M230 90 L230 100" stroke="#88C791" strokeWidth="3" strokeLinecap="round" />
      
      {/* Lightning */}
      <Circle cx="60" cy="180" r="18" fill="#FFFFFF" />
      <Path d="M60 170 L55 180 L60 180 L55 190" stroke="#FFB74D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Droplet */}
      <Circle cx="240" cy="180" r="18" fill="#FFFFFF" />
      <Path d="M240 170 C235 175 235 180 240 185 C245 180 245 175 240 170 Z" fill="#42A5F5" />
    </G>
    
    {/* Location Pin */}
    <G transform="translate(135, 240)">
      <Path
        d="M15 0 C6.7 0 0 6.7 0 15 C0 26.25 15 40 15 40 C15 40 30 26.25 30 15 C30 6.7 23.3 0 15 0 Z"
        fill="#FF5252"
      />
      <Circle cx="15" cy="15" r="6" fill="#FFFFFF" />
    </G>
  </Svg>
);

const OnboardingScreen1 = ({ navigation }) => {
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
        <WelcomeIllustration />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Instant Home Services{'\n'}at Your Doorstep</Text>
        <Text style={styles.subtitle}>
          Book trusted professionals in seconds and track them live.
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => navigation.navigate('Onboarding2')}
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
    backgroundColor: '#88C791',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#88C791',
    marginHorizontal: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#88C791',
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

export default OnboardingScreen1;
