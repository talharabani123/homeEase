import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import LeafletMap from '../../components/LeafletMap';
import { useTheme } from '../../context/ThemeContext';
import { getJobById, getJobLocation, updateJobStatus } from '../../services/realtimeJobFlowService';
import * as Location from 'expo-location';

const JobTrackingScreenEnhanced = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { jobId, requestId, request } = route.params;
  const actualId = jobId || requestId;

  const [job, setJob]                   = useState(request || null);
  const [providerLoc, setProviderLoc]   = useState(null);
  const [customerLoc, setCustomerLoc]   = useState(null);
  const [distance, setDistance]         = useState(null);
  const [eta, setEta]                   = useState(null);
  const [mapReady, setMapReady]         = useState(false);
  const [loading, setLoading]           = useState(!request);
  const intervalRef = useRef(null);

  // ── Get customer's real device location ────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCustomerLoc({
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } else {
        // Fallback: use location stored in request
        if (request?.latitude) {
          setCustomerLoc({ latitude: request.latitude, longitude: request.longitude });
        } else {
          setCustomerLoc({ latitude: 24.8607, longitude: 67.0011 });
        }
      }
    })();
  }, []);

  // ── Poll job data + provider location every 4 s ────────────────────────────
  useEffect(() => {
    loadJobData();
    intervalRef.current = setInterval(loadJobData, 4000);
    return () => clearInterval(intervalRef.current);
  }, [actualId]);

  const loadJobData = async () => {
    if (!actualId) { setLoading(false); return; }

    const jobResult = await getJobById(actualId);
    if (jobResult.success) setJob(jobResult.job);

    const loc = await getJobLocation(actualId);
    if (loc) {
      setProviderLoc({ latitude: loc.latitude, longitude: loc.longitude });
      setDistance(loc.distance);
      setEta(loc.eta);
    }
    setLoading(false);
  };

  const handleOpenChat = () =>
    navigation.navigate('JobChat', { jobId: actualId, userType: 'customer' });

  const handleCancel = () =>
    Alert.alert('Cancel Request', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          await updateJobStatus(actualId, 'cancelled');
          navigation.goBack();
        },
      },
    ]);

  const handleBack = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('CustomerDashboard');

  // ── Status config ──────────────────────────────────────────────────────────
  const STATUS = {
    searching:   { text: 'Searching for provider…', color: '#F59E0B', icon: '🔍' },
    accepted:    { text: 'Provider on the way',      color: '#10B981', icon: '🚗' },
    in_progress: { text: 'Service in progress',      color: '#3B82F6', icon: '🔧' },
    completed:   { text: 'Completed',                color: '#6B7280', icon: '✅' },
  };
  const status = STATUS[job?.status] || STATUS.searching;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenWrapper variant="default">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#88C791" />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading tracking…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Full-screen map ── */}
      <View style={styles.mapWrap}>
        <LeafletMap
          customerLocation={customerLoc}
          providerLocation={providerLoc}
          mode="customer"
          customerName="You"
          providerName={job?.providerName || 'Provider'}
          onReady={() => setMapReady(true)}
          onRouteUpdate={(info) => {
            if (info.distance) setDistance(info.distance);
            if (info.duration) setEta(info.duration);
          }}
          style={styles.map}
        />

        {/* Loading overlay until map tiles load */}
        {!mapReady && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color="#88C791" />
            <Text style={styles.mapLoadingText}>Loading map…</Text>
          </View>
        )}
      </View>

      {/* ── Floating back button ── */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity onPress={handleBack} style={styles.backCircle}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#333" strokeWidth="2.5" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* ETA badge */}
        {eta != null && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaNum}>{eta}</Text>
            <Text style={styles.etaUnit}>ETA</Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── Bottom sheet ── */}
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>

        {/* Status row */}
        <View style={[styles.statusRow, { backgroundColor: status.color + '18' }]}>
          <Text style={styles.statusIcon}>{status.icon}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        </View>

        {/* Provider info */}
        <View style={styles.providerRow}>
          <View style={[styles.avatar, { backgroundColor: '#88C791' }]}>
            <Text style={styles.avatarText}>
              {(job?.providerName || job?.providerInitials || 'P').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.text }]}>
              {job?.providerName || 'Service Provider'}
            </Text>
            <Text style={[styles.providerSub, { color: colors.textSecondary }]}>
              {job?.serviceName || 'Home Service'}
              {job?.providerRating ? `  ⭐ ${job.providerRating}` : ''}
            </Text>
          </View>
          {distance != null && (
            <View style={styles.distBadge}>
              <Text style={styles.distNum}>{distance}</Text>
              <Text style={styles.distUnit}>km</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#E8F5E9', borderColor: '#88C791' }]}
            onPress={handleOpenChat}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#88C791" />
            </Svg>
            <Text style={[styles.actionText, { color: '#88C791' }]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}
            onPress={() => Alert.alert('Call', `Calling ${job?.providerName || 'provider'}…`)}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#2196F3" />
            </Svg>
            <Text style={[styles.actionText, { color: '#2196F3' }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}
            onPress={handleCancel}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#EF5350" />
            </Svg>
            <Text style={[styles.actionText, { color: '#EF5350' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Safety note */}
        <View style={styles.safetyRow}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
            Your safety is our priority. Share trip details with family.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15 },

  mapWrap: { flex: 1 },
  map: { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  mapLoadingText: { fontSize: 14, color: '#555' },

  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8,
    zIndex: 10,
  },
  backCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  etaBadge: {
    backgroundColor: '#88C791', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 8, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  etaNum:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  etaUnit: { fontSize: 11, fontWeight: '600', color: '#fff' },

  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },

  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, gap: 8,
  },
  statusIcon: { fontSize: 18 },
  statusText: { flex: 1, fontSize: 14, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 17, fontWeight: '700', marginBottom: 3 },
  providerSub:  { fontSize: 13 },
  distBadge: { alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  distNum:  { fontSize: 18, fontWeight: '800', color: '#2E7D32' },
  distUnit: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  actionText: { fontSize: 14, fontWeight: '700' },

  safetyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  safetyIcon: { fontSize: 18 },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 17 },
});

export default JobTrackingScreenEnhanced;
