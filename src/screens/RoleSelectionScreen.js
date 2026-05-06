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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
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
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>HomeEase</Text>
              <View style={styles.taglineContainer}>
                <View style={[styles.taglineDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                  Your Home Service Partner
                </Text>
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Choose Your Role</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Select how you want to use HomeEase
              </Text>
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
                  <View
                    style={[
                      styles.card,
                      { 
                        backgroundColor: colors.card,
                        borderColor: selectedRole === 'customer' ? colors.primary : colors.cardBorder,
                      },
                      selectedRole === 'customer' && styles.cardSelected,
                    ]}
                  >
                    {/* Card Icon */}
                    <View style={[
                      styles.cardIconContainer,
                      { backgroundColor: colors.primary + '15' }
                    ]}>
                      <Ionicons 
                        name="person-outline" 
                        size={40} 
                        color={colors.primary} 
                      />
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        I'm a Customer
                      </Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                        Find trusted professionals for your home services
                      </Text>
                      
                      {/* Features */}
                      <View style={styles.features}>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Book services instantly
                          </Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Track service in real-time
                          </Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Verified professionals
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Check Icon */}
                    {selectedRole === 'customer' && (
                      <View style={styles.checkIconContainer}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* OR Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
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
                  <View
                    style={[
                      styles.card,
                      { 
                        backgroundColor: colors.card,
                        borderColor: selectedRole === 'provider' ? colors.primary : colors.cardBorder,
                      },
                      selectedRole === 'provider' && styles.cardSelected,
                    ]}
                  >
                    {/* Card Icon */}
                    <View style={[
                      styles.cardIconContainer,
                      { backgroundColor: colors.primary + '15' }
                    ]}>
                      <Ionicons 
                        name="briefcase-outline" 
                        size={40} 
                        color={colors.primary} 
                      />
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        I'm a Service Provider
                      </Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                        Earn money by offering your professional services
                      </Text>
                      
                      {/* Features */}
                      <View style={styles.features}>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Flexible working hours
                          </Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Instant payment processing
                          </Text>
                        </View>
                        <View style={styles.feature}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                            Grow your business
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Check Icon */}
                    {selectedRole === 'provider' && (
                      <View style={styles.checkIconContainer}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: selectedRole ? colors.primary : colors.border },
                  !selectedRole && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selectedRole || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                You can switch roles anytime in settings
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 15,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 13,
  },
  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  cardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  features: {
    alignSelf: 'stretch',
    gap: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RoleSelectionScreen;
