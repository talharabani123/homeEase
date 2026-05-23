import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import LeafletMap from '../../components/LeafletMap';
import { getJobById, updateJobStatus, getJobLocation } from '../../services/realtimeJobFlowService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOB_LOCATIONS_KEY = '@homeease_job_locations_';

const ActiveJobScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { jobId, requestId, request } = route.params;
  const actualId = jobId || requestId;

  const [job, setJob]               = useState(request || null);
  const [providerLoc, setProviderLoc] = useState(null);
  const [customerLoc, setCustomerLoc] = useState(null);
  const [distance, setDistance]     = useState(null);
  const [eta, setEta]               = useState(null);
  const [mapReady, setMapReady]     = useState(false);
  const [loading, setLoading]       = useState(!request);
  const [navigating, setNavigating] = useState(false);
  const intervalRef = useRef(null);
  const locationSub = useRef(null);

  // ── Load job data ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadJobData();
    intervalRef.current = setInterval(loadJobData, 5000);
    return () => {
      clearInterval(intervalRef.current);
      stopNavigation();
    };
  }, [actualId]);

  const loadJobData = async () => {
    if (!actualId) { setLoading(false); return; }
    const result = await getJobById(actualId);
    if (result.success) {
      setJob(result.job);
      // Set customer location from job data
      const cLoc = result.job.customerLocation || result.job.location;
      if (cLoc) {
        setCustomerLoc({ latitude: cLoc.latitude, longitude: cLoc.longitude });
      }
    }
    const loc = await getJobLocation(actualId);
    if (loc) {
      setProviderLoc({ latitude: loc.latitude, longitude: loc.longitude });
      setDistance(loc.distance);
      setEta(loc.eta);
    }
    setLoading(false);
  };

  // ── Start live GPS navigation ──────────────────────────────────────────────
  const startNavigation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is needed for navigation.');
      return;
    }
    setNavigating(true);

    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      async (loc) => {
        const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setProviderLoc(newLoc);

        // Persist to AsyncStorage so customer tracking screen picks it up
        if (actualId) {
          const cLat = customerLoc?.latitude  ?? 24.8607;
          const cLng = customerLoc?.longitude ?? 67.0011;
          const R = 6371;
          const dLat = (cLat - newLoc.latitude) * Math.PI / 180;
          const dLon = (cLng - newLoc.longitude) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 +
            Math.cos(newLoc.latitude * Math.PI/180) * Math.cos(cLat * Math.PI/180) *
            Math.sin(dLon/2)**2;
          const dist = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2));
          const etaMin = Math.ceil(dist * 3);

          setDistance(dist);
          setEta(etaMin);

          if (actualId.startsWith('req_')) {
            const { supabase } = require('../../config/supabase');
            await supabase
              .from('service_requests')
              .update({
                provider_location: { latitude: newLoc.latitude, longitude: newLoc.longitude },
                travel_distance: dist,
              })
              .eq('id', actualId);
          } else {
            await AsyncStorage.setItem(`${JOB_LOCATIONS_KEY}${actualId}`, JSON.stringify({
              latitude:  newLoc.latitude,
              longitude: newLoc.longitude,
              distance:  dist,
              eta:       etaMin,
              timestamp: new Date().toISOString(),
            }));
          }
        }
      }
    );
  };

  const stopNavigation = () => {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
    setNavigating(false);
  };

  // ── Job actions ────────────────────────────────────────────────────────────
  const handleStartJob = () =>
    Alert.alert('Start Job', 'Have you arrived at the customer location?', [
      { text: 'Not Yet', style: 'cancel' },
      {
        text: 'Yes, Start',
        onPress: async () => {
          stopNavigation();
          const result = await updateJobStatus(actualId, 'in_progress');
          if (result.success) { Alert.alert('Job Started!', 'Good luck!'); loadJobData(); }
        },
      },
    ]);

  const handleCompleteJob = () =>
    Alert.alert('Complete Job', 'Have you finished the service?', [
      { text: 'Not Yet', style: 'cancel' },
      {
        text: 'Yes, Complete',
        onPress: async () => {
          const result = await updateJobStatus(actualId, 'completed');
          if (result.success) {
            Alert.alert('Job Completed!', 'Waiting for customer confirmation.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        },
      },
    ]);

  const handleBack = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ProviderDashboard');

  // ── Status config ──────────────────────────────────────────────────────────
  const STATUS = {
    accepted:    { text: 'Navigate to Customer', color: '#10B981', icon: '🚗' },
    in_progress: { text: 'Service In Progress',  color: '#3B82F6', icon: '🔧' },
    completed:   { text: 'Awaiting Confirmation', color: '#6B7280', icon: '✅' },
  };
  const status = STATUS[job?.status] || STATUS.accepted;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary || '#88C791'} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading job…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* ── Full-screen map ── */}
      <View style={styles.mapWrap}>
        <LeafletMap
          customerLocation={customerLoc}
          providerLocation={providerLoc}
          mode="provider"
          customerName={job?.customerName || 'Customer'}
          providerName="You"
          onReady={() => setMapReady(true)}
          onRouteUpdate={(info) => {
            if (info.distance) setDistance(info.distance);
            if (info.duration) setEta(info.duration);
          }}
          style={styles.map}
        />
        {!mapReady && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color="#88C791" />
            <Text style={styles.mapLoadingText}>Loading map…</Text>
          </View>
        )}
      </View>

      {/* ── Floating header ── */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity onPress={handleBack} style={styles.backCircle}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#333" strokeWidth="2.5" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* Distance badge */}
        {distance != null && (
          <View style={styles.distBadge}>
            <Text style={styles.distNum}>{distance} km</Text>
            {eta != null && <Text style={styles.distEta}>{eta}</Text>}
          </View>
        )}
      </SafeAreaView>

      {/* ── Bottom sheet ── */}
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>

        {/* Status */}
        <View style={[styles.statusRow, { backgroundColor: status.color + '18' }]}>
          <Text style={styles.statusIcon}>{status.icon}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>

        {/* Customer info */}
        <View style={styles.customerRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary || '#88C791' }]}>
            <Text style={styles.avatarText}>
              {(job?.customerName || 'C').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: colors.text }]}>
              {job?.customerName || 'Customer'}
            </Text>
            <Text style={[styles.customerSub, { color: colors.textSecondary }]} numberOfLines={1}>
              📍 {job?.customerLocation?.address || job?.address || 'Customer Location'}
            </Text>
          </View>
        </View>

        {/* Action buttons row */}
        <View style={styles.actions}>
          {/* Start Navigation / Stop Navigation */}
          {job?.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: navigating ? '#EF5350' : '#10B981' }]}
              onPress={navigating ? stopNavigation : startNavigation}
            >
              <Text style={styles.navBtnText}>
                {navigating ? '⏹ Stop Navigation' : '▶ Start Navigation'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.secBtn, { backgroundColor: '#E8F5E9', borderColor: '#88C791' }]}
              onPress={() => navigation.navigate('JobChat', { jobId: actualId, userType: 'provider' })}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24">
                <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#88C791" />
              </Svg>
              <Text style={[styles.secBtnText, { color: '#88C791' }]}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secBtn, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}
              onPress={() => Alert.alert('Call', `Calling ${job?.customerName || 'customer'}…`)}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24">
                <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#2196F3" />
              </Svg>
              <Text style={[styles.secBtnText, { color: '#2196F3' }]}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary action */}
        {job?.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary || '#88C791' }]}
            onPress={handleStartJob}
          >
            <Text style={styles.primaryBtnText}>I've Arrived — Start Job</Text>
          </TouchableOpacity>
        )}
        {job?.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#3B82F6' }]}
            onPress={handleCompleteJob}
          >
            <Text style={styles.primaryBtnText}>Mark as Completed ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    paddingHorizontal: 16, paddingTop: 8, zIndex: 10,
  },
  backCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  distBadge: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  distNum:  { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  distEta:  { fontSize: 11, color: '#4CAF50', fontWeight: '600' },

  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },

  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14, gap: 8,
  },
  statusIcon: { fontSize: 18 },
  statusText: { fontSize: 14, fontWeight: '700' },

  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  customerSub:  { fontSize: 12 },

  actions: { marginBottom: 12, gap: 10 },
  navBtn: {
    paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  secondaryActions: { flexDirection: 'row', gap: 10 },
  secBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  secBtnText: { fontSize: 14, fontWeight: '700' },

  primaryBtn: {
    paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default ActiveJobScreen;
