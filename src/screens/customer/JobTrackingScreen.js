import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getJobById, getJobLocation, updateJobStatus } from '../../services/realtimeJobFlowService';

const JobTrackingScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobData();
    const interval = setInterval(loadJobData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [jobId]);

  const loadJobData = async () => {
    const jobResult = await getJobById(jobId);
    if (jobResult.success) {
      setJob(jobResult.job);
    }
    
    const locationData = await getJobLocation(jobId);
    setLocation(locationData);
    setLoading(false);
  };

  const handleOpenChat = () => {
    navigation.navigate('JobChat', { jobId, userType: 'customer' });
  };

  const handleConfirmCompletion = async () => {
    Alert.alert(
      'Confirm Completion',
      'Has the service been completed to your satisfaction?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            const result = await updateJobStatus(jobId, 'completed');
            if (result.success) {
              navigation.navigate('Rating', { jobId });
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const statusConfig = {
    'accepted': { icon: '✅', text: 'Provider Accepted', color: '#10B981' },
    'in_progress': { icon: '🔧', text: 'Service In Progress', color: '#3B82F6' },
    'completed': { icon: '✨', text: 'Service Completed', color: '#6B7280' }
  };

  const status = statusConfig[job.status] || statusConfig['accepted'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Track Provider</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: status.color + '20', borderColor: status.color }]}>
          <Text style={styles.statusIcon}>{status.icon}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>

        {/* Mock Map View */}
        <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={[styles.mapText, { color: colors.textSecondary }]}>
              Map View (Mock)
            </Text>
            {location && (
              <View style={styles.locationInfo}>
                <Text style={[styles.locationText, { color: colors.text }]}>
                  📍 Provider Location
                </Text>
                <Text style={[styles.coordText, { color: colors.textSecondary }]}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Distance & ETA Card */}
        {location && (
          <View style={[styles.etaCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.etaItem}>
              <Text style={styles.etaIcon}>📏</Text>
              <View>
                <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>Distance</Text>
                <Text style={[styles.etaValue, { color: colors.text }]}>{location.distance} km</Text>
              </View>
            </View>
            <View style={styles.etaDivider} />
            <View style={styles.etaItem}>
              <Text style={styles.etaIcon}>⏱️</Text>
              <View>
                <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>ETA</Text>
                <Text style={[styles.etaValue, { color: colors.text }]}>{location.eta} min</Text>
              </View>
            </View>
          </View>
        )}

        {/* Provider Info Card */}
        <View style={[styles.providerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.providerAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.providerInitial}>
              {job.providerName?.charAt(0) || 'P'}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.text }]}>
              {job.providerName || 'Service Provider'}
            </Text>
            <Text style={[styles.providerService, { color: colors.textSecondary }]}>
              {job.serviceName}
            </Text>
            <View style={styles.providerRating}>
              <Text style={styles.ratingText}>⭐ 4.8</Text>
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>(120 reviews)</Text>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Job Details</Text>
          
          <View style={styles.detailRow}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M10 0C6.5 0 3.75 2.75 3.75 6.25c0 4.38 6.25 13.75 6.25 13.75s6.25-9.37 6.25-13.75C16.25 2.75 13.5 0 10 0zm0 8.75c-1.38 0-2.5-1.12-2.5-2.5S8.62 3.75 10 3.75s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={colors.primary} />
            </Svg>
            <Text style={[styles.detailText, { color: colors.text }]}>
              {job.customerLocation?.address || 'Your Location'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" stroke={colors.primary} strokeWidth="2" fill="none" />
              <Path d="M10 5 L10 10 L14 10" stroke={colors.primary} strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.detailText, { color: colors.text }]}>
              {job.scheduledTime || 'ASAP'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M18 4H2C0.9 4 0 4.9 0 6v8c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2zm0 10H2V8h16v6z" fill={colors.primary} />
            </Svg>
            <Text style={[styles.detailText, { color: colors.text }]}>
              Rs. {job.price}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleOpenChat}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={colors.primary} />
            </Svg>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleCallProvider}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={colors.primary} />
            </Svg>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>
        </View>

        {job.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleConfirmCompletion}
          >
            <Text style={styles.completeButtonText}>Confirm Completion</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  statusCard: { padding: 20, borderRadius: 12, borderWidth: 2, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  statusIcon: { fontSize: 48, marginBottom: 12 },
  statusText: { fontSize: 18, fontWeight: '700' },
  mapContainer: { height: 250, borderRadius: 12, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapIcon: { fontSize: 64, marginBottom: 12 },
  mapText: { fontSize: 16, fontWeight: '600' },
  locationInfo: { marginTop: 16, alignItems: 'center' },
  locationText: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  coordText: { fontSize: 12 },
  etaCard: { flexDirection: 'row', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  etaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaIcon: { fontSize: 32 },
  etaLabel: { fontSize: 12, marginBottom: 4 },
  etaValue: { fontSize: 20, fontWeight: '700' },
  etaDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  providerCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  providerAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  providerInitial: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  providerService: { fontSize: 14, marginBottom: 8 },
  providerRating: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  ratingCount: { fontSize: 12 },
  detailsCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  detailsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailText: { fontSize: 14, flex: 1 },
  actionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600' },
  completeButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  completeButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default JobTrackingScreen;
