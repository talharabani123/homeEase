import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { setOnboardingComplete } from '../../services/roleManagementService';

const { width, height } = Dimensions.get('window');

// Custom Illustration - Verified Professionals
const VerifiedIllustration = () => (
  <Svg width={width * 0.8} height={height * 0.4} viewBox="0 0 300 300">
    <Defs>
      <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#66BB6A" stopOpacity="1" />
        <Stop offset="100%" stopColor="#43A047" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFD54F" stopOpacity="1" />
        <Stop offset="100%" stopColor="#FFC107" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    
    {/* Background Circles */}
    <Circle cx="150" cy="150" r="110" fill="#E8F5E9" opacity="0.5" />
    <Circle cx="150" cy="150" r="80" fill="#C8E6C9" opacity="0.3" />
    
    {/* Main Shield */}
    <Path
      d="M150 60 L190 80 L190 140 C190 170 170 190 150 200 C130 190 110 170 110 140 L110 80 Z"
      fill="url(#shieldGrad)"
    />
    
    {/* Checkmark */}
    <Path
      d="M135 130 L145 145 L170 115"
      stroke="#FFFFFF"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Professional Cards */}
    <G opacity="0.95">
      {/* Card 1 - Left */}
      <G transform="translate(50, 180)">
        <Rect x="0" y="0" width="60" height="70" rx="8" fill="#FFFFFF" />
        <Circle cx="30" cy="25" r="15" fill="#E3F2FD" />
        <Path d="M20 20 L40 20 M20 30 L40 30" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" />
        <Rect x="10" y="45" width="40" height="4" rx="2" fill="#E0E0E0" />
        <Rect x="10" y="53" width="30" height="4" rx="2" fill="#E0E0E0" />
        {/* Star Rating */}
        <Path d="M15 62 L17 67 L22 67 L18 70 L20 75 L15 72 L10 75 L12 70 L8 67 L13 67 Z" fill="#FFB74D" />
        <Path d="M35 62 L37 67 L42 67 L38 70 L40 75 L35 72 L30 75 L32 70 L28 67 L33 67 Z" fill="#FFB74D" />
      </G>
      
      {/* Card 2 - Right */}
      <G transform="translate(190, 180)">
        <Rect x="0" y="0" width="60" height="70" rx="8" fill="#FFFFFF" />
        <Circle cx="30" cy="25" r="15" fill="#FFF3E0" />
        <Path d="M20 20 L40 20 M20 30 L40 30" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" />
        <Rect x="10" y="45" width="40" height="4" rx="2" fill="#E0E0E0" />
        <Rect x="10" y="53" width="35" height="4" rx="2" fill="#E0E0E0" />
        {/* Star Rating */}
        <Path d="M15 62 L17 67 L22 67 L18 70 L20 75 L15 72 L10 75 L12 70 L8 67 L13 67 Z" fill="#FFB74D" />
        <Path d="M35 62 L37 67 L42 67 L38 70 L40 75 L35 72 L30 75 L32 70 L28 67 L33 67 Z" fill="#FFB74D" />
      </G>
    </G>
    
    {/* Verified Badge */}
    <G transform="translate(170, 50)">
      <Circle cx="0" cy="0" r="22" fill="url(#badgeGrad)" />
      <Path
        d="M-8 0 L-3 6 L8 -6"
        stroke="#FFFFFF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    
    {/* Trust Icons */}
    <G opacity="0.8">
      {/* ID Card */}
      <G transform="translate(40, 120)">
        <Rect x="0" y="0" width="30" height="20" rx="3" fill="#FFFFFF" />
        <Rect x="3" y="3" width="10" height="10" rx="1" fill="#E3F2FD" />
        <Rect x="15" y="4" width="12" height="2" rx="1" fill="#E0E0E0" />
        <Rect x="15" y="8" width="8" height="2" rx="1" fill="#E0E0E0" />
      </G>
      
      {/* Certificate */}
      <G transform="translate(230, 120)">
        <Rect x="0" y="0" width="30" height="20" rx="3" fill="#FFFFFF" />
        <Circle cx="15" cy="10" r="6" fill="none" stroke="#FFB74D" strokeWidth="2" />
        <Path d="M12 10 L14 12 L18 8" stroke="#FFB74D" strokeWidth="2" fill="none" strokeLinecap="round" />
      </G>
    </G>
  </Svg>
);

const OnboardingScreen3 = ({ navigation }) => {
  const handleGetStarted = async () => {
    try {
      // Mark onboarding as complete
      await setOnboardingComplete();
      // Navigate to role selection
      navigation.replace('RoleSelection');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Navigate anyway
      navigation.replace('RoleSelection');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <VerifiedIllustration />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Verified & Trusted{'\n'}Experts</Text>
        <Text style={styles.subtitle}>
          All providers are verified for your safety and trust.
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* Get Started Button */}
      <TouchableOpacity 
        style={styles.getStartedButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.getStartedButtonText}>Get Started</Text>
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
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
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
    backgroundColor: '#66BB6A',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66BB6A',
    marginHorizontal: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#66BB6A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen3;
