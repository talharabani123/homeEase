import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Alert, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import SlideToOnline from '../../components/SlideToOnline';
import { useTheme } from '../../context/ThemeContext';
import { getProviderProfile, updateOnlineStatus } from '../../services/providerRegistrationService';
import notificationSoundService from '../../services/notificationSoundService';

const ProviderDashboardScreenImproved = ({ navigation }) => {
  const { colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRequests, setNewRequests] = useState([]);
  const [showNewRequestBanner, setShowNewRequestBanner] = useState(false);
  
  const bannerAnim = useRef(new Animated.Value(-100)).current;
  const requestCheckInterval = useRef(null);

  useEffect(() => {
    loadProfile();
    initializeNotifications();
    
    return () => {
      if (requestCheckInterval.current) {
        clearInterval(requestCheckInterval.current);
      }
      notificationSoundService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      startRequestMonitoring();
    } else {
      stopRequestMonitoring();
    }
  }, [isOnline]);

  const initializeNotifications = async () => {
    await notificationSoundService.initialize();
  };

  const loadProfile = async () => {
    const result = await getProviderProfile();
    if (result.success) {
      setProfile(result.data);
      setIsOnline(result.data.isOnline);
    }
    setLoading(false);
  };

  const startRequestMonitoring = () => {
    // Check for new requests every 5 seconds when online
    requestCheckInterval.current = setInterval(() => {
      checkForNewRequests();
    }, 5000);
  };

  const stopRequestMonitoring = () => {
    if (requestCheckInterval.current) {
      clearInterval(requestCheckInterval.current);
      requestCheckInterval.current = null;
    }
  };

  const checkForNewRequests = async () => {
    // Simulate checking for new requests
    // In production, this would call a real API
    const hasNewRequest = Math.random() > 0.95; // 5% chance for demo
    
    if (hasNewRequest) {
      const newRequest = {
        id: Date.now(),
        service: 'Plumbing',
        location: 'DHA Phase 5',
        distance: '2.3 km',
        price: 'Rs. 1,500',
        urgent: Math.random() > 0.7,
      };
      
      handleNewRequest(newRequest);
    }
  };

  const handleNewRequest = async (request) => {
    // Play notification sound
    if (request.urgent) {
      await notificationSoundService.playUrgentRequestSound();
    } else {
      await notificationSoundService.playNewRequestSound();
    }
    
    // Add to requests list
    setNewRequests(prev => [request, ...prev]);
    
    // Show banner
    setShowNewRequestBanner(true);
    Animated.spring(bannerAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideBanner();
    }, 5000);
  };

  const hideBanner = () => {
    Animated.timing(bannerAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowNewRequestBanner(false);
    });
  };

  const handleToggleOnline = async (value) => {
    const result = await updateOnlineStatus(value);
    if (result.success) {
      setIsOnline(value);
      setProfile(result.data);
      
      if (value) {
        Alert.alert(
          '🟢 You\'re Online!',
          'You will now receive job requests in your area.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚫ You\'re Offline',
          'You will not receive any job requests.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const viewNewRequests = () => {
    hideBanner();
    navigation.navigate('AvailableRequests', { requests: newRequests });
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

        {/* New Request Banner */}
        {showNewRequestBanner && (
          <Animated.View
            style={[
              styles.newRequestBanner,
              {
                transform: [{ translateY: bannerAnim }],
              },
            ]}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
                    fill="#FFFFFF"
                  />
                </Svg>
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>🔔 New Service Request!</Text>
                <Text style={styles.bannerSubtitle}>
                  {newRequests[0]?.service} • {newRequests[0]?.distance} away
                </Text>
              </View>
              <TouchableOpacity style={styles.bannerButton} onPress={viewNewRequests}>
                <Text style={styles.bannerButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('More')} style={styles.menuButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={colors.text} />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill={colors.text}
              />
            </Svg>
            {newRequests.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{newRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Slide to Online */}
          <SlideToOnline isOnline={isOnline} onToggle={handleToggleOnline} />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.statValue}>{profile?.rating || '0.0'}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
              <Text style={styles.statIcon}>⭐</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.statValue}>{profile?.totalJobs || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Jobs</Text>
              <Text style={styles.statIcon}>📋</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={styles.statValue}>Rs. {profile?.earnings || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earnings</Text>
              <Text style={styles.statIcon}>💰</Text>
            </View>
          </View>

          {/* Active Requests Card */}
          {isOnline && newRequests.length > 0 && (
            <TouchableOpacity
              style={[styles.activeRequestsCard, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}
              onPress={viewNewRequests}
            >
              <View style={styles.activeRequestsContent}>
                <View style={styles.activeRequestsIcon}>
                  <Svg width="32" height="32" viewBox="0 0 24 24">
                    <Path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="#F59E0B"
                    />
                  </Svg>
                </View>
                <View style={styles.activeRequestsText}>
                  <Text style={styles.activeRequestsTitle}>
                    {newRequests.length} New Request{newRequests.length > 1 ? 's' : ''}!
                  </Text>
                  <Text style={styles.activeRequestsSubtitle}>Tap to view and respond</Text>
                </View>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M7 4 L13 10 L7 16" stroke="#92400E" strokeWidth="2" fill="none" />
                </Svg>
              </View>
            </TouchableOpacity>
          )}

          {/* Services */}
          <View style={[styles.servicesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Services</Text>
            <View style={styles.servicesList}>
              {profile?.services.map((service, index) => (
                <View key={index} style={[styles.serviceChip, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.serviceChipText}>
                    {service.icon} {service.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

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
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill={colors.primary} />
              <Path d="M12 8 L12 12 M12 16 L12 16.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {isOnline
                ? 'You\'re online! Keep your phone nearby to receive instant notifications for new requests.'
                : 'Slide to go online and start receiving job requests in your area.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  newRequestBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  activeRequestsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  activeRequestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeRequestsIcon: {
    marginRight: 12,
  },
  activeRequestsText: {
    flex: 1,
  },
  activeRequestsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  activeRequestsSubtitle: {
    fontSize: 13,
    color: '#92400E',
    opacity: 0.8,
  },
  servicesCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
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
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  infoBanner: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default ProviderDashboardScreenImproved;
