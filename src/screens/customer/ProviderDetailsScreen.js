import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

// Icons
const BackIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" fill="none" />
  </Svg>
);

const StarIcon = ({ filled }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path
      d="M8 1l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z"
      fill={filled ? '#FFA726' : '#E0E0E0'}
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path d="M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2 Z" fill={COLORS.primaryGreen} />
    <Path d="M6 10l3 3 5-5" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
);

const ProviderDetailsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { provider } = route.params || {};
  
  // Mock provider data
  const providerData = provider || {
    id: 1,
    name: 'Ahmed Khan',
    rating: 4.8,
    totalReviews: 156,
    experienceYears: 8,
    phoneNumber: '+92 300 1234567',
    profileImage: null,
    serviceType: 'Plumber',
    completedJobs: 342,
    skills: ['Pipe Repair', 'Leak Fixing', 'Installation', 'Maintenance'],
    verified: true,
    status: 'Available',
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<StarIcon key={i} filled={i <= Math.floor(rating)} />);
    }
    return stars;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Provider Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{providerData.status}</Text>
        </View>

        {/* Provider Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {providerData.name.charAt(0)}
                </Text>
              </View>
              {providerData.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.background }]}>
                  <CheckIcon />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>{providerData.name}</Text>
              <Text style={[styles.serviceType, { color: colors.textSecondary }]}>{providerData.serviceType}</Text>
              
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(providerData.rating)}
                </View>
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {providerData.rating} ({providerData.totalReviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{providerData.experienceYears}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Years Exp.</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{providerData.completedJobs}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Done</Text>
            </View>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {(providerData.skills || []).map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },

  // Profile Card
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 13,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    marginBottom: 12,
  },

  // Skills
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ProviderDetailsScreen;
