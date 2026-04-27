import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const ONBOARDING_KEY = '@homeease_onboarding_complete';

const SplashScreen = ({ navigation }) => {
  const { user, currentMode } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    checkNavigationDestination();
  }, []);

  const startAnimations = () => {
    // Logo fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tagline appears after logo
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // Animated dots loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const checkNavigationDestination = async () => {
    try {
      // Wait for animations (2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Check if onboarding is complete
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (!onboardingComplete) {
        // First time user → Onboarding
        navigation.replace('Onboarding1');
        return;
      }

      // Check if user is logged in
      if (user) {
        // Logged in user
        if (currentMode === 'provider' || user.role === 'provider') {
          // Provider → Provider Dashboard
          navigation.replace('ProviderDashboard');
        } else {
          // Customer → Customer Home
          navigation.replace('CustomerDashboard');
        }
      } else {
        // Not logged in → Role Selection
        navigation.replace('RoleSelection');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to onboarding
      navigation.replace('Onboarding1');
    }
  };

  // Glow effect interpolation
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#1A3A2E', '#2D5F4C', '#4A8B6F']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Soft Glow Behind Logo */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <View style={styles.glow} />
      </Animated.View>

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Use your existing logo */}
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: taglineAnim,
            transform: [
              {
                translateY: taglineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.tagline}>Instant Home Services</Text>
        <Text style={styles.tagline}>at Your Doorstep</Text>
      </Animated.View>

      {/* Minimal Loading Dots */}
      <Animated.View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => {
          const dotOpacity = dotsAnim.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: index === 0 
              ? [0.3, 1, 0.3, 0.3]
              : index === 1
              ? [0.3, 0.3, 1, 0.3]
              : [0.3, 0.3, 0.3, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Version/Brand Text */}
      <View style={styles.footer}>
        <Text style={styles.brandText}>HomeEase</Text>
        <Text style={styles.versionText}>Real-Time Home Services</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#88C791',
    shadowColor: '#88C791',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
