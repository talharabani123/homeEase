import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { saveUserRole, setOnboardingComplete } from '../services/roleManagementService';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleCustomer = useRef(new Animated.Value(1)).current;
  const scaleProvider = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleCardPress = (role) => {
    if (loading) return;
    setSelectedRole(role);
    
    // Animate card press
    const scale = role === 'customer' ? scaleCustomer : scaleProvider;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!selectedRole || loading) return;

    try {
      setLoading(true);

      // Save the selected role
      const result = await saveUserRole(selectedRole);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save role');
      }

      // Mark onboarding as complete
      await setOnboardingComplete();

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate based on role
      if (selectedRole === 'customer') {
        navigation.replace('CustomerLogin');
      } else if (selectedRole === 'provider') {
        navigation.replace('ServiceSelection');
      }
    } catch (error) {
      console.error('Role selection error:', error);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper variant="default">
      <View style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
        
        {/* Background - Now handled by ScreenWrapper */}

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section - At Very Top */}
            <Animated.View style={[styles.logoSection, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.logoGlow}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.taglineContainer}>
                <Ionicons name="home" size={14} color={colors.primary} />
                <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                  Your Home Service Partner
                </Text>
              </View>
            </Animated.View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Choose Your Role</Text>
              <View style={styles.subtitleContainer}>
                <View style={[styles.decorativeLine, { backgroundColor: colors.primary }]} />
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Select how you want to continue
                </Text>
                <View style={[styles.decorativeLine, { backgroundColor: colors.primary }]} />
              </View>
            </View>

            {/* Role Cards */}
            <View style={styles.cardsContainer}>
              {/* Customer Card */}
              <Animated.View style={{ transform: [{ scale: scaleCustomer }] }}>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => handleCardPress('customer')}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      selectedRole === 'customer'
                        ? ['#E8F5E9', '#C8E6C9']
                        : [colors.card, colors.card]
                    }
                    style={[
                      styles.card,
                      selectedRole === 'customer' && styles.cardSelected,
                    ]}
                  >
                    {/* Decorative Corner */}
                    <View style={[styles.cardCorner, { backgroundColor: selectedRole === 'customer' ? '#4CAF50' : colors.primary }]} />
                    
                    {/* Card Image/Icon */}
                    <View style={[
                      styles.cardImageContainer,
                      { backgroundColor: selectedRole === 'customer' ? '#4CAF50' : colors.primary }
                    ]}>
                      <Ionicons 
                        name="person" 
                        size={64} 
                        color="#FFFFFF" 
                      />
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>Customer</Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                        Find trusted professionals for your home services
                      </Text>
                      
                      {/* Features */}
                      <View style={styles.features}>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={16} color={selectedRole === 'customer' ? '#4CAF50' : colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>Real-time tracking</Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={16} color={selectedRole === 'customer' ? '#4CAF50' : colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>Verified providers</Text>
                        </View>
                      </View>
                    </View>

                    {/* Check Icon */}
                    {selectedRole === 'customer' && (
                      <Animated.View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                      </Animated.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* OR Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Service Provider Card */}
              <Animated.View style={{ transform: [{ scale: scaleProvider }] }}>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => handleCardPress('provider')}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      selectedRole === 'provider'
                        ? ['#FFF3E0', '#FFE0B2']
                        : [colors.card, colors.card]
                    }
                    style={[
                      styles.card,
                      selectedRole === 'provider' && styles.cardSelected,
                    ]}
                  >
                    {/* Decorative Corner */}
                    <View style={[styles.cardCorner, { backgroundColor: selectedRole === 'provider' ? '#FF9800' : colors.primary }]} />
                    
                    {/* Card Image/Icon */}
                    <View style={[
                      styles.cardImageContainer,
                      { backgroundColor: selectedRole === 'provider' ? '#FF9800' : colors.primary }
                    ]}>
                      <Ionicons 
                        name="briefcase" 
                        size={64} 
                        color="#FFFFFF" 
                      />
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>Service Provider</Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                        Earn money by offering your professional services
                      </Text>
                      
                      {/* Features */}
                      <View style={styles.features}>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={16} color={selectedRole === 'provider' ? '#FF9800' : colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>Flexible schedule</Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={16} color={selectedRole === 'provider' ? '#FF9800' : colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>Instant payments</Text>
                        </View>
                      </View>
                    </View>

                    {/* Check Icon */}
                    {selectedRole === 'provider' && (
                      <Animated.View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={32} color="#FF9800" />
                      </Animated.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selectedRole && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selectedRole || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedRole
                      ? selectedRole === 'customer'
                        ? ['#4CAF50', '#45A049']
                        : ['#FF9800', '#F57C00']
                      : ['#BDBDBD', '#9E9E9E']
                  }
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                You can switch roles anytime in settings
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 5 : 10,
    paddingBottom: 10,
  },
  logoGlow: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  decorativeLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#4CAF50',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderBottomLeftRadius: 60,
    opacity: 0.1,
  },
  cardImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 12,
  },
  features: {
    gap: 8,
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
  },
  checkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 10 : 15,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RoleSelectionScreen;
