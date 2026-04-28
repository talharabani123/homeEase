import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { createNonStandardEmergencyRequest } from '../../services/emergencyService';
import { getAddressFromCoords } from '../../services/locationService';

const NonStandardEmergencyScreen = ({ route, navigation }) => {
  const { colors } = useTheme();

  // ── Safe param extraction — never crash if params are undefined ────────────
  const safeParams   = route?.params || {};
  const initLocation = safeParams.location || null;
  const initAddress  = safeParams.address  || '';

  const [description, setDescription]   = useState('');
  const [mediaFiles, setMediaFiles]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [locationCoords, setLocationCoords] = useState(initLocation);
  const [locationText, setLocationText] = useState(initAddress || 'Getting location…');
  const [locationLoading, setLocationLoading] = useState(!initLocation);

  // ── Fetch GPS if no location passed ───────────────────────────────────────
  useEffect(() => {
    if (!initLocation) fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocationCoords(coords);
        const addrResult = await getAddressFromCoords(coords.latitude, coords.longitude);
        setLocationText(addrResult.success ? addrResult.address : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } else {
        setLocationCoords({ latitude: 24.8607, longitude: 67.0011 });
        setLocationText('Default location — tap 📍 to pick manually');
      }
    } catch {
      setLocationCoords({ latitude: 24.8607, longitude: 67.0011 });
      setLocationText('Location unavailable — tap 📍 to pick manually');
    }
    setLocationLoading(false);
  };

  // ── Map picker ─────────────────────────────────────────────────────────────
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

  // ── Media helpers ──────────────────────────────────────────────────────────
  const pickImage = async () => {
    if (mediaFiles.length >= 3) { Alert.alert('Limit Reached', 'Maximum 3 images'); return; }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Gallery permission required'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
      if (!result.canceled) setMediaFiles(prev => [...prev, result.assets[0]]);
    } catch { Alert.alert('Error', 'Could not open gallery'); }
  };

  const takePhoto = async () => {
    if (mediaFiles.length >= 3) { Alert.alert('Limit Reached', 'Maximum 3 images'); return; }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera permission required'); return; }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
      if (!result.canceled) setMediaFiles(prev => [...prev, result.assets[0]]);
    } catch { Alert.alert('Error', 'Could not open camera'); }
  };

  const removeMedia = (index) => setMediaFiles(prev => prev.filter((_, i) => i !== index));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!description || description.trim().length < 10) {
      Alert.alert('Description Required', 'Please describe your problem (minimum 10 characters)');
      return;
    }
    if (!locationCoords) {
      Alert.alert('Location Required', 'Please allow location access or pick on map');
      return;
    }

    setLoading(true);
    try {
      const result = await createNonStandardEmergencyRequest(
        { ...locationCoords, address: locationText },
        description.trim(),
        mediaFiles.map(f => f.uri)
      );

      setLoading(false);

      if (result.success) {
        navigation.navigate('EmergencySearching', { request: result.data, category: 'non_standard' });
      } else {
        Alert.alert('Error', result.error || 'This service is currently unavailable. Please try another option.');
      }
    } catch (error) {
      setLoading(false);
      console.error('NonStandard submit error:', error);
      Alert.alert('Error', 'This service is currently unavailable. Please try another option.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#fff" strokeWidth="2" fill="none"/>
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Emergency Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Location row */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {locationLoading
            ? <ActivityIndicator size="small" color="#F59E0B" style={{ marginRight: 8 }} />
            : <Svg width="18" height="18" viewBox="0 0 20 20" style={{ marginRight: 8 }}>
                <Path d="M10 2C6.69 2 4 4.69 4 8c0 4.38 6 10 6 10s6-5.62 6-10c0-3.31-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#F59E0B"/>
              </Svg>
          }
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>{locationText}</Text>
          <TouchableOpacity style={styles.mapPinBtn} onPress={openMapPicker}>
            <Svg width="16" height="16" viewBox="0 0 24 24">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>📋 How it works</Text>
          <Text style={styles.infoText}>
            Describe your problem and optionally add photos. Multiple providers will send you custom offers — compare and choose the best one!
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Describe Your Problem <Text style={{ color: '#DC2626' }}>*</Text>
          </Text>
          <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
            Be specific: location in house, urgency, what you've tried
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="E.g., Water coming from ceiling in bedroom, not sure if it's from AC or pipe. Need urgent help…"
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>{description.length}/500 (min 10)</Text>
        </View>

        {/* Media */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Add Photos (Optional)</Text>
          <Text style={[styles.sublabel, { color: colors.textSecondary }]}>Photos help providers understand the problem (max 3)</Text>
          <View style={styles.uploadRow}>
            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={takePhoto}>
              <Text style={{ fontSize: 20 }}>📷</Text>
              <Text style={[styles.uploadBtnText, { color: colors.text }]}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickImage}>
              <Text style={{ fontSize: 20 }}>🖼️</Text>
              <Text style={[styles.uploadBtnText, { color: colors.text }]}>Gallery</Text>
            </TouchableOpacity>
          </View>
          {mediaFiles.length > 0 && (
            <View style={styles.mediaRow}>
              {mediaFiles.map((file, i) => (
                <View key={i} style={styles.mediaItem}>
                  <Image source={{ uri: file.uri }} style={styles.mediaImg} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(i)}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Pricing info */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>💰 How Pricing Works</Text>
          {[
            'Multiple providers send you custom offers',
            'Compare prices, ratings, and ETAs',
            'Choose the best offer for your budget',
            'No obligation until you accept an offer',
          ].map((t, i) => (
            <Text key={i} style={styles.pricingItem}>• {t}</Text>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>📡 Broadcast to Providers</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },

  locationCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: 20, padding: 12, borderRadius: 10, borderWidth: 1, gap: 4,
  },
  locationText: { flex: 1, fontSize: 13, fontWeight: '500' },
  mapPinBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center',
  },

  infoBanner: {
    backgroundColor: '#FEF3C7', marginHorizontal: 20,
    padding: 16, borderRadius: 12, marginBottom: 20,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  infoText:  { fontSize: 13, color: '#92400E', lineHeight: 18 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  label:    { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sublabel: { fontSize: 13, marginBottom: 10 },
  textArea: { borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, minHeight: 120 },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },

  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '600' },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 },
  mediaItem: { width: 90, height: 90, borderRadius: 10, position: 'relative' },
  mediaImg:  { width: '100%', height: '100%', borderRadius: 10 },
  removeBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center',
  },

  pricingCard: {
    marginHorizontal: 20, backgroundColor: '#FEF3C7',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FCD34D',
  },
  pricingTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginBottom: 10 },
  pricingItem:  { fontSize: 13, color: '#92400E', marginBottom: 6, lineHeight: 18 },

  footer: { padding: 20, borderTopWidth: 1 },
  submitBtn: {
    backgroundColor: '#F59E0B', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default NonStandardEmergencyScreen;
