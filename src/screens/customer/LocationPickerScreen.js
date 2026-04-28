/**
 * LocationPickerScreen
 * Full-screen map modal for pin-drop location selection.
 * Navigated to from RequestServiceFormScreen.
 *
 * Route params:
 *   initialLat?   number
 *   initialLng?   number
 *   onConfirm     (location) => void   — callback passed via navigation
 *
 * On confirm, calls route.params.onConfirm({ latitude, longitude, address, components })
 * then navigates back.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Location from 'expo-location';
import LocationPickerMap from '../../components/LocationPickerMap';
import { COLORS } from '../../constants/colors';

const LocationPickerScreen = ({ navigation, route }) => {
  const { initialLat, initialLng, onConfirm } = route.params || {};

  const [mapLat, setMapLat] = useState(initialLat || null);
  const [mapLng, setMapLng] = useState(initialLng || null);
  const [gpsLoading, setGpsLoading] = useState(!initialLat);

  // ── Get GPS on mount if no initial coords ──────────────────────────────────
  useEffect(() => {
    if (initialLat && initialLng) return;

    (async () => {
      setGpsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setMapLat(loc.coords.latitude);
          setMapLng(loc.coords.longitude);
        } else {
          // Fallback to Karachi
          setMapLat(24.8607);
          setMapLng(67.0011);
          Alert.alert(
            'Location Permission',
            'GPS access denied. Map centred on default city. Drag to your exact location.',
          );
        }
      } catch {
        setMapLat(24.8607);
        setMapLng(67.0011);
      }
      setGpsLoading(false);
    })();
  }, []);

  // ── Handle confirm from map ────────────────────────────────────────────────
  const handleLocationPick = (location) => {
    if (onConfirm) onConfirm(location);
    navigation.goBack();
  };

  // ── Loading state while getting GPS ───────────────────────────────────────
  if (gpsLoading || mapLat === null) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating close button */}
      <SafeAreaView style={styles.closeWrap} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="#333"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>📍 Pick Your Location</Text>
        </View>
      </SafeAreaView>

      {/* Map — takes full screen, confirm button is inside the WebView */}
      <LocationPickerMap
        initialLat={mapLat}
        initialLng={mapLng}
        onLocationPick={handleLocationPick}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e8f4f8' },

  loadingScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', gap: 16,
  },
  loadingText: { fontSize: 15, color: '#555', fontWeight: '600' },

  closeWrap: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8,
    zIndex: 10, gap: 10,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
  },
  titleBadge: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  titleText: { fontSize: 14, fontWeight: '700', color: '#111' },

  map: { flex: 1 },
});

export default LocationPickerScreen;
