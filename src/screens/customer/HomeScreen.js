import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';
import { getTopRatedProviders, getRecentServices, saveRecentService } from '../../services/homeDataService';
import { SERVICE_CATEGORIES } from '../../services/mockDataService';

// Get device dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing helper functions
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const responsiveFontSize = (size) => {
  const scale = SCREEN_WIDTH / 375; // Base width (iPhone X)
  return Math.round(size * scale);
};

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [topProviders, setTopProviders] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    
    // Load top providers
    const providersResult = await getTopRatedProviders(3);
    if (providersResult.success) {
      setTopProviders(providersResult.data);
    }
    
    // Load recent services
    const recentResult = await getRecentServices();
    if (recentResult.success) {
      setRecentServices(recentResult.data);
    }
    
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleServicePress = async (service) => {
    // Save to recent services
    await saveRecentService({
      id: service.id,
      name: service.name,
      icon: service.icon,
    });
    
    // Navigate to service request
    navigation.navigate('RequestServiceForm', { 
      service: {
        id: service.id,
        name: service.name,
        icon: service.icon,
        priceRange: service.priceRange,
        description: service.description
      }
    });
  };

  const handleRecentServicePress = async (service) => {
    // Find the full service details from SERVICE_CATEGORIES
    const fullService = SERVICE_CATEGORIES.find(cat => cat.id === service.id);
    if (fullService) {
      await handleServicePress(fullService);
    } else {
      // Fallback if service not found in categories
      await handleServicePress({
        ...service,
        priceRange: service.priceRange || 'Rs. 500',
        description: service.description || 'Professional service at your doorstep'
      });
    }
  };

  const handleSeeAllProviders = () => {
    navigation.navigate('TopRatedProviders');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appName, { color: colors.text }]}>HomeEase</Text>
          <Text style={styles.tagline}>Your Home Service Partner</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.logoContainer}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              {/* Wrench */}
              <Path
                d="M8 18L12 14L14 16L10 20L8 18Z"
                fill={COLORS.primaryGreen}
              />
              <Path
                d="M13 13L15 11C16 10 18 10 19 11C20 12 20 14 19 15L17 17L13 13Z"
                fill={COLORS.primaryGreen}
              />
              {/* Hammer */}
              <Path
                d="M22 18L26 14L28 16L24 20L22 18Z"
                fill="#FF9800"
              />
              <Path
                d="M27 13L29 11L31 13L29 15L27 13Z"
                fill="#FF9800"
              />
              {/* Screwdriver */}
              <Path
                d="M16 22L18 24L14 28L12 26L16 22Z"
                fill="#2196F3"
              />
              <Path
                d="M19 19L21 21L19 23L17 21L19 19Z"
                fill="#2196F3"
              />
              {/* House outline */}
              <Path
                d="M20 6L8 14V16L20 8L32 16V14L20 6Z"
                fill={COLORS.textGrey}
                opacity="0.3"
              />
            </Svg>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primaryGreen]}
            tintColor={COLORS.primaryGreen}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello! 👋</Text>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>What service do you need today?</Text>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('EmergencyService')}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIconContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill="white" />
              <Path d="M12 6v6M12 16h.01" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyButtonTitle}>🚨 Emergency Service</Text>
            <Text style={styles.emergencyButtonSubtitle}>24/7 • Priority Response • 15-20 min</Text>
          </View>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M7 4 L13 10 L7 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="8" cy="8" r="6" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            <Path d="M13 13 L18 18" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search for services...</Text>
        </TouchableOpacity>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Services</Text>
          <View style={styles.categoriesGrid}>
            {SERVICE_CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryCard}
                onPress={() => handleServicePress(category)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Rated Providers</Text>
            <TouchableOpacity onPress={handleSeeAllProviders}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primaryGreen} />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providersScroll}>
              {topProviders.map((provider) => {
                const initials = provider.name.split(' ').map(n => n[0]).join('').toUpperCase();
                return (
                  <TouchableOpacity 
                    key={provider.id} 
                    style={[styles.providerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.navigate('ProviderDetails', { 
                      provider: {
                        id: provider.id,
                        name: provider.name,
                        rating: provider.rating,
                        totalReviews: provider.reviews,
                        experienceYears: provider.experience.replace(' years', ''),
                        distance: '2.5 km',
                        estimatedArrival: '15 mins',
                        phoneNumber: provider.phone,
                        profileImage: null,
                        serviceType: provider.service,
                        completedJobs: provider.completedJobs,
                        skills: ['Professional Service', 'Quality Work', 'On Time', 'Affordable'],
                        verified: true,
                        status: 'Available',
                      }
                    })}
                  >
                    <View style={styles.providerAvatar}>
                      <Text style={styles.providerInitial}>{initials}</Text>
                    </View>
                    <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                    <Text style={[styles.providerService, { color: colors.textSecondary }]}>{provider.service}</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={[styles.ratingText, { color: colors.text }]}>⭐ {provider.rating}</Text>
                      <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({provider.reviews})</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Recent Services */}
        {recentServices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Services</Text>
            <View style={styles.recentServices}>
              {recentServices.map((service) => (
                <TouchableOpacity 
                  key={service.id} 
                  style={[styles.recentServiceCard, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => handleRecentServicePress(service)}
                >
                  <View style={[styles.recentServiceIcon, { backgroundColor: colors.card }]}>
                    <Text style={styles.recentServiceEmoji}>{service.icon}</Text>
                  </View>
                  <View style={styles.recentServiceInfo}>
                    <Text style={[styles.recentServiceName, { color: colors.text }]}>{service.name}</Text>
                    <Text style={[styles.recentServiceDate, { color: colors.textSecondary }]}>
                      Last used {new Date(service.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Svg width="20" height="20" viewBox="0 0 20 20">
                    <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primaryGreen,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  emergencyButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  providersScroll: {
    paddingLeft: 20,
  },
  providerCard: {
    width: 140,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  providerService: {
    fontSize: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 11,
  },
  recentServices: {
    paddingHorizontal: 20,
  },
  recentServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recentServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentServiceEmoji: {
    fontSize: 24,
  },
  recentServiceInfo: {
    flex: 1,
  },
  recentServiceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentServiceDate: {
    fontSize: 13,
  },
});

export default HomeScreen;
