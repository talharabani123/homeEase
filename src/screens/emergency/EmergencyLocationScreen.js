import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { getAddressFromCoords } from '../../services/locationService';
import { createStandardEmergencyRequest, createNonStandardEmergencyRequest } from '../../services/emergencyService';

const EmergencyLocationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { type, service, description } = route?.params || {};

  const [locationCoords, setLocationCoords] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchGPS(); }, []);

  const fetchGPS = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocationCoords(coords);
        const addrResult = await getAddressFromCoords(coords.latitude, coords.longitude);
        setLocationText(addrResult.success ? addrResult.address : `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
      } else {
        setLocationCoords({ latitude: 24.8607, longitude: 67.0011 });
        setLocationText('Default location — tap Map to pick on map');
      }
    } catch {
      setLocationCoords({ latitude: 24.8607, longitude: 67.0011 });
      setLocationText('Could not get location — tap Map to pick on map');
    }
    setLocationLoading(false);
  };

  const openMapPicker = useCallback(() => {
    navigation.navigate('LocationPicker', {
      initialLat: locationCoords?.latitude,
      initialLng: locationCoords?.longitude,
      onConfirm: (picked) => {
        setLocationCoords({ latitude: picked.latitude, longitude: picked.longitude });
        setLocationText(picked.address || `${picked.latitude.toFixed(5)}, ${picked.longitude.toFixed(5)}`);
      },
    });
  }, [locationCoords]);

  const handleConfirm = async () => {
    if (!locationCoords) { Alert.alert('Location Required', 'Please allow GPS or pick location on map.'); return; }
    if (!locationText.trim()) { Alert.alert('Location Required', 'Please confirm your location.'); return; }

    setSubmitting(true);
    try {
      const loc = { ...locationCoords, address: locationText };
      const result = type === 'standard'
        ? await createStandardEmergencyRequest(service.id, loc, '')
        : await createNonStandardEmergencyRequest(loc, description || 'Emergency help needed', []);

      setSubmitting(false);
      if (result.success) {
        navigation.replace('EmergencySearching', {
          request: result.data,
          category: type === 'standard' ? 'standard' : 'non_standard',
        });
      } else {
        Alert.alert('Error', result.error || 'Service currently unavailable. Please try again.');
      }
    } catch {
      setSubmitting(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Location</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Step 2 of 2 — Where do you need help?</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        {/* Service summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.summaryIcon}>{type === 'standard' && service ? service.icon : '📝'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {type === 'standard' && service ? service.name : 'Custom Emergency'}
            </Text>
            {type === 'standard' && service ? (
              <Text style={[styles.summaryPrice, { color: colors.primary }]}>
                Rate: Rs. {Math.round(service.basePrice * service.surgeMultiplier)}+
              </Text>
            ) : (
              <Text style={[styles.summaryDesc, { color: colors.textSecondary }]} numberOfLines={2}>{description}</Text>
            )}
          </View>
        </View>

        <Text style={[styles.locLabel, { color: colors.text }]}>Your Emergency Location</Text>
        <Text style={[styles.locSub, { color: colors.textSecondary }]}>Provider will come to this exact location</Text>

        {/* Location input row */}
        <View style={[styles.locRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {locationLoading
            ? <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
            : <Svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={colors.primary}/>
              </Svg>
          }
          <TextInput
            style={[styles.locInput, { color: colors.text }]}
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Your location…"
            placeholderTextColor={colors.placeholder}
            multiline
          />
          <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.primary }]} onPress={openMapPicker}>
            <Svg width="16" height="16" viewBox="0 0 24 24">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/>
            </Svg>
            <Text style={styles.mapBtnText}>Map</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.refreshRow} onPress={fetchGPS} disabled={locationLoading}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            {locationLoading ? 'Getting GPS…' : '↻ Use my current GPS location'}
          </Text>
        </TouchableOpacity>

        {locationCoords && (
          <View style={[styles.coordsCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.coordsText, { color: colors.textSecondary }]}>
              📡 {locationCoords.latitude.toFixed(5)}, {locationCoords.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Svg width="18" height="18" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.primary}/>
            <Path d="M12 8v4M12 16v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Tap "Map" to drop a pin at your exact location for best results.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }, (submitting || locationLoading) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={submitting || locationLoading}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Send Emergency Request</Text>
          }
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  body: { flex: 1, padding: 20 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24, gap: 12 },
  summaryIcon: { fontSize: 32 },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  summaryPrice: { fontSize: 13, fontWeight: '700' },
  summaryDesc: { fontSize: 13, lineHeight: 18 },
  locLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  locSub: { fontSize: 13, marginBottom: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 12, marginBottom: 8 },
  locInput: { flex: 1, fontSize: 14, lineHeight: 20 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 8, gap: 4 },
  mapBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  refreshRow: { marginBottom: 12 },
  refreshText: { fontSize: 13, fontWeight: '600' },
  coordsCard: { padding: 10, borderRadius: 8, marginBottom: 16 },
  coordsText: { fontSize: 12 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1 },
  confirmBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default EmergencyLocationScreen;
