import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import SlideToOnline from '../../components/SlideToOnline';
import IncomingRequestBottomSheet from '../../components/IncomingRequestBottomSheet';
import ActiveJobFloatingButton from '../../components/ActiveJobFloatingButton';
import { useTheme } from '../../context/ThemeContext';
import { useProvider } from '../../context/ProviderContext';
import { useUserRegistration } from '../../context/UserRegistrationContext';
import { acceptServiceRequest } from '../../services/marketplaceService';
import navigationService from '../../services/navigationService';

const ProviderDashboardScreenEnhanced = ({ navigation }) => {
  const { colors } = useTheme();
  const { getDisplayName } = useUserRegistration();
  const {
    profile,
    isOnline,
    currentJob,
    incomingRequests,
    stats,
    loading,
    toggleOnlineStatus,
    acceptRequest,
    rejectRequest,
    updateJobStatus,
    refreshProfile,
    refreshRequests,
  } = useProvider();

  const [showRequestSheet, setShowRequestSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationScale] = useState(new Animated.Value(1));
  const [profileScale] = useState(new Animated.Value(1));

  // Auto-show bottom sheet for new requests
  useEffect(() => {
    if (incomingRequests.length > 0 && !currentJob && !showRequestSheet) {
      setSelectedRequest(incomingRequests[0]);
      setShowRequestSheet(true);
    }
  }, [incomingRequests, currentJob]);

  const handleToggleOnline = async (value) => {
    const result = await toggleOnlineStatus(value);
    if (result.success) {
      Alert.alert(
        value ? '🟢 You\'re Online!' : '⚫ You\'re Offline',
        value
          ? 'You will now receive job requests in your area.'
          : 'You will not receive any job requests.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to update status');
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest || !profile) return;

    const providerData = {
      name: profile.fullName,
      phone: profile.phoneNumber,
      currentLocation: profile.gpsLocation,
    };

    const result = await acceptServiceRequest(selectedRequest.id, profile.id, providerData);

    if (result.success) {
      acceptRequest(result.request);
      setShowRequestSheet(false);
      setSelectedRequest(null);

      Alert.alert(
        'Job Accepted! ✅',
        'Navigate to customer location now.',
        [
          {
            text: 'Navigate',
            onPress: () => {
              navigationService.openGoogleMaps(
                result.request.location.latitude,
                result.request.location.longitude
              );
            },
          },
          { text: 'Later', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = () => {
    if (selectedRequest) {
      rejectRequest(selectedRequest.id);
      setShowRequestSheet(false);
      
      // Show next request if available
      const nextRequest = incomingRequests.find(r => r.id !== selectedRequest.id);
      if (nextRequest) {
        setTimeout(() => {
          setSelectedRequest(nextRequest);
          setShowRequestSheet(true);
        }, 300);
      } else {
        setSelectedRequest(null);
      }
    }
  };

  const handleViewRequestDetails = () => {
    setShowRequestSheet(false);
    navigation.navigate('RequestDetail', { request: selectedRequest });
  };

  const handleUpdateJobStatus = (status) => {
    updateJobStatus(status);
    
    if (status === 'completed') {
      Alert.alert(
        'Job Completed! 🎉',
        'Great work! The payment will be processed shortly.',
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('ProviderJobHistory'),
          },
          { text: 'OK' },
        ]
      );
    } else {
      Alert.alert('Status Updated', `Job status changed to: ${status.replace('_', ' ')}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshRequests()]);
    setRefreshing(false);
  };

  const animateIconPress = (scaleValue) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNotificationPress = () => {
    animateIconPress(notificationScale);
    navigation.navigate('ProviderNotifications');
  };

  const handleProfilePress = () => {
    animateIconPress(profileScale);
    navigation.navigate('ProviderProfile');
  };

  if (loading) {
    return (
      <ScreenWrapper variant="default">
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

        {/* Modern Header with Notification and Profile Icons */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Notification Icon */}
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={[styles.headerIconButton, styles.notificationButton]}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: notificationScale }] }}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                    fill={colors.text}
                  />
                </Svg>
                {incomingRequests.length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{incomingRequests.length}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Profile Icon */}
            <TouchableOpacity
              onPress={handleProfilePress}
              style={[styles.headerIconButton, styles.profileButton]}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: profileScale }] }}>
                <View style={styles.profileIconContainer}>
                  {/* Profile Image or Initials */}
                  <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.profileInitials}>
                      {getDisplayName().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  
                  {/* Online Status Dot */}
                  <View style={[
                    styles.onlineStatusDot,
                    { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
                  ]} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {/* Slide to Online */}
          <SlideToOnline isOnline={isOnline} onToggle={handleToggleOnline} />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.statValue}>⭐ {stats.rating.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.statValue}>{stats.totalJobs}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Jobs</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>Rs. {stats.todayEarnings}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
            </View>
          </View>

          {/* Pending Requests Alert */}
          {isOnline && incomingRequests.length > 0 && !currentJob && (
            <TouchableOpacity
              style={[styles.alertCard, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}
              onPress={() => {
                setSelectedRequest(incomingRequests[0]);
                setShowRequestSheet(true);
              }}
            >
              <View style={styles.alertContent}>
                <View style={styles.alertIcon}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <Path
                      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                      fill="#F59E0B"
                    />
                  </Svg>
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>
                    {incomingRequests.length} New Request{incomingRequests.length > 1 ? 's' : ''}!
                  </Text>
                  <Text style={styles.alertSubtitle}>Tap to view and respond</Text>
                </View>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M7 4 L13 10 L7 16" stroke="#92400E" strokeWidth="2" fill="none" />
                </Svg>
              </View>
            </TouchableOpacity>
          )}

          {/* Services */}
          {profile?.services && profile.services.length > 0 && (
            <View style={[styles.servicesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Services</Text>
              <View style={styles.servicesList}>
                {profile.services.map((service, index) => (
                  <View key={index} style={[styles.serviceChip, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.serviceChipText, { color: colors.primary }]}>
                      {service.icon} {service.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('AvailableRequests')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                    fill={colors.primary}
                  />
                </Svg>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Available Requests</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  View and respond to service requests
                </Text>
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('ProviderJobHistory')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"
                    fill={colors.primary}
                  />
                </Svg>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Job History</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  View completed and cancelled jobs
                </Text>
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('ProviderWallet')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                    fill={colors.primary}
                  />
                </Svg>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Wallet</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  View earnings and balance
                </Text>
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path
                d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {isOnline
                ? 'You\'re online! Keep your phone nearby to receive instant notifications.'
                : 'Slide to go online and start receiving job requests in your area.'}
            </Text>
          </View>
        </ScrollView>

        {/* Incoming Request Bottom Sheet */}
        <IncomingRequestBottomSheet
          visible={showRequestSheet}
          request={selectedRequest}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onViewDetails={handleViewRequestDetails}
        />

        {/* Active Job Floating Button */}
        {currentJob && (
          <ActiveJobFloatingButton
            job={currentJob}
            onPress={() => navigation.navigate('ActiveJob', { requestId: currentJob.id, request: currentJob })}
            onUpdateStatus={handleUpdateJobStatus}
          />
        )}
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 36,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileButton: {
    padding: 0,
  },
  profileIconContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  scrollView: { flex: 1 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  alertCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  alertContent: { flexDirection: 'row', alignItems: 'center' },
  alertIcon: { marginRight: 12 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  alertSubtitle: { fontSize: 13, color: '#92400E', opacity: 0.8 },
  servicesCard: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  servicesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  serviceChipText: { fontSize: 13, fontWeight: '600' },
  actionsSection: { paddingHorizontal: 20, marginTop: 20 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  actionSubtitle: { fontSize: 13 },
  infoBanner: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
});

export default ProviderDashboardScreenEnhanced;
