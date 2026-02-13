import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert, Linking } from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
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

const PhoneIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={COLORS.white}
    />
  </Svg>
);

const ChatIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
      fill={COLORS.white}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="8" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
    <Path d="M10 6v4l3 3" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="9" fill={COLORS.primaryGreen} />
    <Path d="M6 10l3 3 5-5" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
);

const ProviderDetailsScreen = ({ navigation, route }) => {
  const { provider, requestData } = route.params || {};
  
  // Mock provider data
  const providerData = provider || {
    id: 1,
    name: 'Ahmed Khan',
    rating: 4.8,
    totalReviews: 156,
    experienceYears: 8,
    distance: '2.5 km',
    estimatedArrival: '15 mins',
    phoneNumber: '+92 300 1234567',
    profileImage: null,
    serviceType: 'Plumber',
    completedJobs: 342,
    skills: ['Pipe Repair', 'Leak Fixing', 'Installation', 'Maintenance'],
    verified: true,
    status: 'On the way',
  };

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCall = () => {
    const phoneNumber = providerData.phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleChat = () => {
    // TODO: Navigate to chat screen
    navigation.navigate('Chat', { providerId: providerData.id });
  };

  const handleTrack = () => {
    navigation.navigate('LiveTracking', {
      provider: providerData,
      requestData: requestData,
    });
  };

  const handleCancelRequest = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    Alert.alert(
      'Request Cancelled',
      'Your service request has been cancelled',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('CustomerDashboard'),
        },
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<StarIcon key={i} filled={i <= Math.floor(rating)} />);
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Details</Text>
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
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {providerData.name.charAt(0)}
                </Text>
              </View>
              {providerData.verified && (
                <View style={styles.verifiedBadge}>
                  <CheckIcon />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.providerName}>{providerData.name}</Text>
              <Text style={styles.serviceType}>{providerData.serviceType}</Text>
              
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(providerData.rating)}
                </View>
                <Text style={styles.ratingText}>
                  {providerData.rating} ({providerData.totalReviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{providerData.experienceYears}</Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{providerData.completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{providerData.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* Arrival Info */}
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalIconContainer}>
            <ClockIcon />
          </View>
          <View style={styles.arrivalInfo}>
            <Text style={styles.arrivalLabel}>Estimated Arrival</Text>
            <Text style={styles.arrivalTime}>{providerData.estimatedArrival}</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {providerData.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Service Details */}
        {requestData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Request</Text>
            <View style={styles.requestCard}>
              <View style={styles.requestRow}>
                <Text style={styles.requestLabel}>Category:</Text>
                <Text style={styles.requestValue}>{requestData.category}</Text>
              </View>
              <View style={styles.requestRow}>
                <Text style={styles.requestLabel}>Urgency:</Text>
                <Text style={[
                  styles.requestValue,
                  requestData.urgency === 'urgent' && styles.urgentText
                ]}>
                  {requestData.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                </Text>
              </View>
              {requestData.problemDescription && (
                <View style={styles.requestDescription}>
                  <Text style={styles.requestLabel}>Problem:</Text>
                  <Text style={styles.requestDescriptionText}>
                    {requestData.problemDescription}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <PhoneIcon />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <ChatIcon />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Track Button */}
        <TouchableOpacity style={styles.trackButton} onPress={handleTrack}>
          <LocationIcon />
          <Text style={styles.trackButtonText}>Track Live Location</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>Cancel Request?</Text>
            <Text style={styles.dialogMessage}>
              Are you sure you want to cancel this service request?
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogButtonSecondary}
                onPress={() => setShowCancelDialog(false)}
              >
                <Text style={styles.dialogButtonSecondaryText}>No, Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogButtonPrimary}
                onPress={confirmCancel}
              >
                <Text style={styles.dialogButtonPrimaryText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    color: COLORS.textBlack,
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: COLORS.white,
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
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: COLORS.textGrey,
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
    color: COLORS.textGrey,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },

  // Arrival Card
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  arrivalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  arrivalInfo: {
    flex: 1,
  },
  arrivalLabel: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginBottom: 2,
  },
  arrivalTime: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
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

  // Request Card
  requestCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestLabel: {
    fontSize: 14,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  requestValue: {
    fontSize: 14,
    color: COLORS.textBlack,
    fontWeight: '600',
  },
  urgentText: {
    color: '#FF4444',
  },
  requestDescription: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  requestDescriptionText: {
    fontSize: 14,
    color: COLORS.textBlack,
    lineHeight: 20,
    marginTop: 6,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },

  // Track Button
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    marginBottom: 12,
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginLeft: 8,
  },

  // Cancel Button
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
    textAlign: 'center',
  },

  // Dialog
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dialogContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 15,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  dialogButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
  },
  dialogButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF4444',
  },
  dialogButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ProviderDetailsScreen;
