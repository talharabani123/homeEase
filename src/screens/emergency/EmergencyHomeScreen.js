import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import * as Location from 'expo-location';
import { getAddressFromCoords } from '../../services/locationService';

const EmergencyHomeScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [locationText, setLocationText]   = useState('Getting location…');
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // ── Fetch GPS on mount ─────────────────────────────────────────────────────
  useEffect(() => { fetchLocation(); }, []);

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location permission denied — tap 📍 to pick manually');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocationCoords(coords);

      const addrResult = await getAddressFromCoords(coords.latitude, coords.longitude);
      setLocationText(addrResult.success ? addrResult.address : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (e) {
      setLocationText('Could not get location — tap 📍 to pick manually');
    }
    setLocationLoading(false);
  };

  // ── Open map picker ────────────────────────────────────────────────────────
  const openMapPicker = useCallback(() => {
    navigation.navigate('LocationPicker', {
      initialLat: locationCoords?.latitude,
      initialLng: locationCoords?.longitude,
      onConfirm: (picked) => {
        setLocationCoords({ latitude: picked.latitude, longitude: picked.longitude });
        setLocationText(picked.address || `${picked.latitude.toFixed(4)}, ${picked.longitude.toFixed(4)}`);
      },
    });
  }, [locationCoords]);

  // ── Navigate to sub-screens with safe params ───────────────────────────────
  const goToStandard = () => {
    navigation.navigate('StandardEmergency', {
      location: locationCoords || { latitude: 24.8607, longitude: 67.0011 },
      address:  locationText,
    });
  };

  const goToNonStandard = () => {
    navigation.navigate('NonStandardEmergency', {
      location: locationCoords || { latitude: 24.8607, longitude: 67.0011 },
      address:  locationText,
    });
  };

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Services</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Emergency banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Svg width="32" height="32" viewBox="0 0 32 32">
                <Circle cx="16" cy="16" r="14" fill="#DC2626"/>
                <Path d="M16 10v8M16 22v.01" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>24/7 Emergency Support</Text>
              <Text style={styles.bannerSub}>Fast response • Verified providers • Real-time tracking</Text>
            </View>
          </View>

          {/* Location row */}
          <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {locationLoading
              ? <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              : (
                <Svg width="18" height="18" viewBox="0 0 20 20" style={{ marginRight: 8 }}>
                  <Path d="M10 2C6.69 2 4 4.69 4 8c0 4.38 6 10 6 10s6-5.62 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill={colors.primary}/>
                </Svg>
              )
            }
            <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>
              {locationText}
            </Text>
            {/* Map pin button */}
            <TouchableOpacity style={[styles.mapPinBtn, { backgroundColor: colors.primary }]} onPress={openMapPicker}>
              <Svg width="16" height="16" viewBox="0 0 24 24">
                <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/>
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchLocation} style={styles.refreshBtn}>
              <Text style={{ fontSize: 18, color: colors.primary }}>↻</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Emergency Type</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Select the type of emergency service you need
          </Text>

          {/* Standard card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={goToStandard}
            activeOpacity={0.75}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={{ fontSize: 32 }}>🚨</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Standard Emergency</Text>
                <View style={styles.fastBadge}><Text style={styles.fastBadgeText}>Fast</Text></View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Pre-defined services with instant provider matching and fixed pricing
              </Text>
              <View style={styles.chips}>
                {['🔧 Plumber','⚡ Electrician','❄️ AC','🔥 Gas','🔑 Locksmith'].map(s => (
                  <View key={s} style={[styles.chip, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M9 6l6 6-6 6" stroke={colors.textSecondary} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>

          {/* Non-standard card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={goToNonStandard}
            activeOpacity={0.75}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#FCE7F3' }]}>
              <Text style={{ fontSize: 32 }}>📝</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Custom / Non-Standard</Text>
                <View style={[styles.fastBadge, { backgroundColor: '#FCE7F3' }]}>
                  <Text style={[styles.fastBadgeText, { color: '#BE185D' }]}>Custom</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Describe your unique problem. Multiple providers send competitive offers.
              </Text>
              <View style={styles.chips}>
                {['💬 Describe issue','📸 Add photos','💰 Compare offers'].map(s => (
                  <View key={s} style={[styles.chip, { backgroundColor: '#FCE7F3' }]}>
                    <Text style={[styles.chipText, { color: '#BE185D' }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path d="M9 6l6 6-6 6" stroke={colors.textSecondary} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>

          {/* How it works */}
          <View style={[styles.infoCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Svg width="22" height="22" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill={colors.primary}/>
              <Path d="M12 8v4M12 16v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                1. Select emergency type{'\n'}
                2. Provider gets dispatched{'\n'}
                3. Track in real-time{'\n'}
                4. Pay after service completion
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderRadius: 12,
    padding: 16, marginTop: 20, marginBottom: 16, gap: 12,
  },
  bannerIcon: { marginRight: 4 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 3 },
  bannerSub:   { fontSize: 12, color: '#7F1D1D' },

  locationCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 24, gap: 4,
  },
  locationText: { flex: 1, fontSize: 13, fontWeight: '500' },
  mapPinBtn: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginLeft: 4,
  },
  refreshBtn: { padding: 4, marginLeft: 2 },

  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sectionSub:   { fontSize: 13, marginBottom: 20, lineHeight: 18 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 18, borderRadius: 16, borderWidth: 1,
    marginBottom: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardIcon: { width: 60, height: 60, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  fastBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  fastBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '600' },

  infoCard: {
    flexDirection: 'row', padding: 16,
    borderRadius: 12, borderWidth: 1, marginTop: 4,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  infoText:  { fontSize: 12, lineHeight: 18 },
});

export default EmergencyHomeScreen;
