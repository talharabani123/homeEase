import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { getJobById, getJobLocation, updateJobStatus } from '../../services/realtimeJobFlowService';

const { width } = Dimensions.get('window');

const JobTrackingScreenEnhanced = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { jobId, requestId, request } = route.params;
  const actualId = jobId || requestId;
  const [job, setJob] = useState(request || null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(!request);

  useEffect(() => {
    if (!request) {
      loadJobData();
    }
    const interval = setInterval(loadJobData, 5000);
    return () => clearInterval(interval);
  }, [actualId]);

  const loadJobData = async () => {
    if (!actualId) {
      setLoading(false);
      return;
    }

    const jobResult = await getJobById(actualId);
    if (jobResult.success) {
      setJob(jobResult.job);
    }
    
    const locationData = await getJobLocation(actualId);
    setLocation(locationData);
    setLoading(false);
  };

  const handleOpenChat = () => {
    navigation.navigate('JobChat', { jobId: actualId, userType: 'customer' });
  };

  const handleCancelRequest = async () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this service request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await updateJobStatus(actualId, 'cancelled');
            if (result.success) {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const handleCallProvider = () => {
    Alert.alert('Call Provider', `Call ${job?.providerName || 'Provider'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling...') }
    ]);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerDashboard');
    }
  };

  if (loading || !job) {
    return (
      <ScreenWrapper variant="default">
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </SafeAreaView>
      </ScreenWrapper>
    );
  }

  const statusConfig = {
    'accepted': { text: 'On the way', color: '#10B981' },
    'in_progress': { text: 'Service In Progress', color: '#3B82F6' },
    'completed': { text: 'Completed', color: '#6B7280' }
  };

  const status = statusConfig[job.status] || statusConfig['accepted'];

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        {/* Header with ETA Badge */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke="#333" strokeWidth="2" fill="none" />
            </Svg>
          </View>
        </TouchableOpacity>

        {location && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaTime}>{location.eta} min</Text>
            <Text style={styles.etaLabel}>ETA</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            {/* Map Icon */}
            <View style={styles.mapIconContainer}>
              <Svg width="120" height="120" viewBox="0 0 120 120">
                {/* Map background */}
                <Path d="M10 10 H110 V110 H10 Z" fill="#E8F5E9" />
                {/* Grid lines */}
                <Path d="M30 10 V110 M50 10 V110 M70 10 V110 M90 10 V110" stroke="#C8E6C9" strokeWidth="1" />
                <Path d="M10 30 H110 M10 50 H110 M10 70 H110 M10 90 H110" stroke="#C8E6C9" strokeWidth="1" />
              </Svg>
              
              {/* Provider car icon */}
              <View style={styles.carIcon}>
                <View style={styles.carCircle}>
                  <Text style={styles.carEmoji}>🚗</Text>
                </View>
              </View>
              
              {/* Customer location pin */}
              <View style={styles.locationPin}>
                <Text style={styles.pinEmoji}>📍</Text>
              </View>
            </View>
            
            <Text style={styles.mapTitle}>Google Maps View</Text>
            <Text style={styles.mapSubtitle}>Provider location will be shown here</Text>
          </View>
        </View>

        {/* Provider Info Card */}
        <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
          <View style={styles.providerHeader}>
            <View style={[styles.providerAvatar, { backgroundColor: '#88C791' }]}>
              <Text style={styles.providerInitial}>
                {job.providerName?.charAt(0) || 'A'}
              </Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>
                {job.providerName || 'Ahmed Khan'}
              </Text>
              <Text style={[styles.providerService, { color: colors.textSecondary }]}>
                {job.serviceName}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>⭐ 4.8</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Distance & Time Cards */}
        {location && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statValue}>{location.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statValue}>{location.eta} mins</Text>
              <Text style={styles.statLabel}>Arrival Time</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: '#E0E0E0' }]}
            onPress={handleCallProvider}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#88C791" />
            </Svg>
            <Text style={[styles.actionButtonText, { color: '#88C791' }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: '#E0E0E0' }]}
            onPress={handleOpenChat}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#88C791" />
            </Svg>
            <Text style={[styles.actionButtonText, { color: '#88C791' }]}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelRequest}
        >
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>

        {/* Safety Message */}
        <View style={styles.safetyMessage}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <Text style={styles.safetyText}>
            Your safety is our priority. Share trip details with family.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  backButton: { },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  etaBadge: {
    backgroundColor: '#88C791',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  etaTime: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  etaLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', marginTop: 2 },
  scrollView: { flex: 1 },
  mapContainer: { 
    height: 400, 
    backgroundColor: '#E8F5E9',
    marginBottom: 20
  },
  mapPlaceholder: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 60
  },
  mapIconContainer: {
    position: 'relative',
    marginBottom: 20
  },
  carIcon: {
    position: 'absolute',
    top: 30,
    left: 60
  },
  carCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#88C791',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  carEmoji: { fontSize: 32 },
  locationPin: {
    position: 'absolute',
    bottom: 20,
    left: 20
  },
  pinEmoji: { fontSize: 32 },
  mapTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  mapSubtitle: { fontSize: 14, color: '#666' },
  providerCard: { 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center' },
  providerAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  providerInitial: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  providerService: { fontSize: 14, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600' },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12,
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  statsContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    gap: 12, 
    marginBottom: 16 
  },
  statCard: { 
    flex: 1, 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#2E7D32', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  actionsContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    gap: 12, 
    marginBottom: 16 
  },
  actionButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    gap: 8 
  },
  actionButtonText: { fontSize: 16, fontWeight: '600' },
  cancelButton: { 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginBottom: 16
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#D32F2F' },
  safetyMessage: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    padding: 16, 
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginBottom: 20,
    gap: 12
  },
  safetyIcon: { fontSize: 24 },
  safetyText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 18 },
});

export default JobTrackingScreenEnhanced;
