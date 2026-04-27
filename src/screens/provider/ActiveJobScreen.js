import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getJobById, updateJobStatus, getJobLocation } from '../../services/realtimeJobFlowService';

const ActiveJobScreen = ({ route, navigation }) => {
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

  const handleStartJob = async () => {
    Alert.alert(
      'Start Job',
      'Have you arrived at the customer location?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Start',
          onPress: async () => {
            const result = await updateJobStatus(actualId, 'in_progress');
            if (result.success) {
              Alert.alert('Success', 'Job started! Good luck!');
              loadJobData();
            }
          }
        }
      ]
    );
  };

  const handleCompleteJob = async () => {
    Alert.alert(
      'Complete Job',
      'Have you finished the service?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            const result = await updateJobStatus(actualId, 'completed');
            if (result.success) {
              Alert.alert('Job Completed!', 'Waiting for customer confirmation', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            }
          }
        }
      ]
    );
  };

  const handleOpenChat = () => {
    navigation.navigate('JobChat', { jobId: actualId, userType: 'provider' });
  };

  const handleCallCustomer = () => {
    Alert.alert('Call Customer', `Call ${job?.customerName || 'Customer'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling...') }
    ]);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProviderDashboard');
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
    'accepted': { icon: '🚗', text: 'Navigate to Customer', color: '#10B981' },
    'in_progress': { icon: '🔧', text: 'Service In Progress', color: '#3B82F6' },
    'completed': { icon: '✅', text: 'Waiting for Confirmation', color: '#6B7280' }
  };

  const status = statusConfig[job.status] || statusConfig['accepted'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Active Job</Text>
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
              Navigation Map (Mock)
            </Text>
            {location && (
              <View style={styles.locationInfo}>
                <Text style={[styles.locationText, { color: colors.text }]}>
                  📍 Your Location
                </Text>
                <Text style={[styles.coordText, { color: colors.textSecondary }]}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
                <Text style={[styles.distanceText, { color: colors.primary }]}>
                  {location.distance} km to customer
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Distance & ETA Card */}
        {location && job.status === 'accepted' && (
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

        {/* Customer Info Card */}
        <View style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.customerAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.customerInitial}>
              {job.customerName?.charAt(0) || 'C'}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: colors.text }]}>
              {job.customerName || 'Customer'}
            </Text>
            <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
              {job.customerPhone || '+92 300 1234567'}
            </Text>
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
              {job.customerLocation?.address || 'Customer Location'}
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

          {job.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>
                Description:
              </Text>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {job.description}
              </Text>
            </View>
          )}
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
            onPress={handleCallCustomer}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={colors.primary} />
            </Svg>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* Status Action Button */}
        {job.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartJob}
          >
            <Text style={styles.primaryButtonText}>I've Arrived - Start Job</Text>
          </TouchableOpacity>
        )}

        {job.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleCompleteJob}
          >
            <Text style={styles.primaryButtonText}>Mark as Completed</Text>
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
  coordText: { fontSize: 12, marginBottom: 8 },
  distanceText: { fontSize: 16, fontWeight: '700' },
  etaCard: { flexDirection: 'row', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  etaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaIcon: { fontSize: 32 },
  etaLabel: { fontSize: 12, marginBottom: 4 },
  etaValue: { fontSize: 20, fontWeight: '700' },
  etaDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  customerCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  customerAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  customerInitial: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  customerInfo: { flex: 1, justifyContent: 'center' },
  customerName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  customerPhone: { fontSize: 14 },
  detailsCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  detailsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailText: { fontSize: 14, flex: 1 },
  descriptionContainer: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  descriptionLabel: { fontSize: 12, marginBottom: 4, fontWeight: '600' },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  actionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600' },
  primaryButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default ActiveJobScreen;
