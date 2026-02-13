import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Service Categories Data
const serviceCategories = [
  { id: 1, name: 'Plumber', icon: 'plumber', color: '#4A90E2' },
  { id: 2, name: 'Electrician', icon: 'electrician', color: '#F5A623' },
  { id: 3, name: 'Carpenter', icon: 'carpenter', color: '#8B572A' },
  { id: 4, name: 'AC Technician', icon: 'ac', color: '#50E3C2' },
  { id: 5, name: 'Mechanic', icon: 'mechanic', color: '#D0021B' },
  { id: 6, name: 'Painter', icon: 'painter', color: '#7ED321' },
  { id: 7, name: 'Cleaner', icon: 'cleaner', color: '#BD10E0' },
  { id: 8, name: 'Gardener', icon: 'gardener', color: '#417505' },
];

// Location Icon
const LocationIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

// Search Icon
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M14.5 13h-.79l-.28-.27A6.471 6.471 0 0016 8.5 6.5 6.5 0 109.5 15c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 18l-4.99-5zm-6 0C6.01 13 4 10.99 4 8.5S6.01 4 8.5 4 13 6.01 13 8.5 10.99 13 8.5 13z"
      fill={COLORS.textGrey}
    />
  </Svg>
);

// Service Category Icons
const ServiceIcon = ({ type, color }) => {
  const icons = {
    plumber: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M8 4L6 6l4 4-2 2 4 4 2-2 4 4 2-2-4-4 2-2-4-4-2 2-4-4z" fill={color} />
        <Path d="M20 16l-2 2 4 4 2-2-4-4z" fill={color} opacity="0.7" />
      </Svg>
    ),
    electrician: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M18 2l-8 12h6l-4 16 12-16h-6l6-12z" fill={color} />
      </Svg>
    ),
    carpenter: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M4 4v8l8 8 8-8V4H4zm12 8l-4 4-4-4V6h8v6z" fill={color} />
        <Path d="M20 20l8 8v-8h-8z" fill={color} opacity="0.7" />
      </Svg>
    ),
    ac: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Rect x="4" y="8" width="24" height="8" rx="2" fill={color} />
        <Path d="M8 16v8M16 16v8M24 16v8" stroke={color} strokeWidth="2" opacity="0.7" />
      </Svg>
    ),
    mechanic: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M22 8l-4 4 4 4 4-4-4-4zM10 12l-4 4 12 12 4-4-12-12z" fill={color} />
        <Circle cx="8" cy="8" r="3" fill={color} opacity="0.7" />
      </Svg>
    ),
    painter: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M12 4l-8 8 4 4 8-8-4-4z" fill={color} />
        <Path d="M16 16l-4 4v8h8v-8l-4-4z" fill={color} opacity="0.7" />
      </Svg>
    ),
    cleaner: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M16 4l-4 8h8l-4-8z" fill={color} />
        <Rect x="12" y="12" width="8" height="16" rx="1" fill={color} opacity="0.7" />
      </Svg>
    ),
    gardener: (
      <Svg width="32" height="32" viewBox="0 0 32 32">
        <Path d="M16 4c-4 0-8 4-8 8 0 2 1 4 2 5l6 11 6-11c1-1 2-3 2-5 0-4-4-8-8-8z" fill={color} />
        <Circle cx="16" cy="12" r="3" fill="#FFF" opacity="0.5" />
      </Svg>
    ),
  };
  return icons[type] || icons.plumber;
};

const CustomerDashboardScreen = ({ navigation }) => {
  const [location, setLocation] = useState('F-7, Islamabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasOngoingRequest, setHasOngoingRequest] = useState(true); // Mock data

  // Mock ongoing request data
  const ongoingRequest = {
    providerName: 'Ahmed Khan',
    serviceType: 'Plumber',
    eta: '15 mins',
    status: 'On the way',
  };

  const handleLocationPress = () => {
    // TODO: Open location picker
    console.log('Open location picker');
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    // TODO: Filter categories
  };

  const handleCategoryPress = (category) => {
    console.log('Selected category:', category.name);
    navigation.navigate('ServiceRequest', { category });
  };

  const handleEmergencyPress = () => {
    console.log('Emergency request');
    // Navigate to service request with urgent flag
    navigation.navigate('ServiceRequest', {
      category: { name: 'Emergency', color: '#FF4444' },
      isEmergency: true,
    });
  };

  const handleTrackPress = () => {
    console.log('Track provider');
    // TODO: Navigate to tracking screen
  };

  const filteredCategories = searchQuery
    ? serviceCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : serviceCategories;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Location and Profile */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress}>
            <LocationIcon />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Path d="M4 6l4 4 4-4" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>J</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Hello, John! 👋</Text>
          <Text style={styles.welcomeSubtext}>What service do you need today?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <SearchIcon />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="What service do you need?"
            placeholderTextColor={COLORS.textGrey}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyPress}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              fill="#FF4444"
            />
            <Text x="12" y="16" fontSize="14" fill="#FFF" textAnchor="middle" fontWeight="bold">!</Text>
          </Svg>
          <Text style={styles.emergencyText}>Emergency Service</Text>
        </TouchableOpacity>

        {/* Ongoing Request Card */}
        {hasOngoingRequest && (
          <View style={styles.ongoingCard}>
            <View style={styles.ongoingHeader}>
              <Text style={styles.ongoingTitle}>Ongoing Request</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{ongoingRequest.status}</Text>
              </View>
            </View>

            <View style={styles.ongoingContent}>
              <View style={styles.providerInfo}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>
                    {ongoingRequest.providerName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{ongoingRequest.providerName}</Text>
                  <Text style={styles.serviceType}>{ongoingRequest.serviceType}</Text>
                </View>
              </View>

              <View style={styles.etaContainer}>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Circle cx="10" cy="10" r="8" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
                  <Path d="M10 6v4l3 3" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
                </Svg>
                <Text style={styles.etaText}>ETA: {ongoingRequest.eta}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.trackButton} onPress={handleTrackPress}>
              <Text style={styles.trackButtonText}>Track Provider</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                  <ServiceIcon type={category.icon} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab navigation
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    fontWeight: '400',
  },
  locationText: {
    fontSize: 15,
    color: COLORS.textBlack,
    fontWeight: '600',
  },
  profileButton: {
    marginLeft: 12,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Welcome
  welcomeContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: COLORS.textGrey,
    fontWeight: '400',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textBlack,
  },

  // Emergency Button
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 8,
  },

  // Ongoing Request Card
  ongoingCard: {
    backgroundColor: '#F0F9F5',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  ongoingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ongoingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  ongoingContent: {
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginLeft: 8,
  },
  trackButton: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Categories
  categoriesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  categoryIconContainer: {
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default CustomerDashboardScreen;
