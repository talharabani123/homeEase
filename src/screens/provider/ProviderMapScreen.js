/**
 * Provider Map Screen
 * Shows provider's own location and updates Firebase in real-time
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapComponent from '../../components/MapComponent';
import { updateProviderLocation, removeProviderLocation } from '../../services/realtimeLocationService';
import { getUserData } from '../../services/userStorageService';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const ProviderMapScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [location, setLocation] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState(null);
  const [providerData, setProviderData] = useState(null);
  
  const locationSubscription = useRef(null);
  const updateInterval = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeProvider();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isAvailable && location) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isAvailable]);

  const initializeProvider = async () => {
    try {
      // Get provider data
      const userData = await getUserData();
      if (userData.success && userData.data) {
        setProviderId(userData.data.userId || `provider_${Date.now()}`);
        setProviderData(userData.data);
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to share your location with customers.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // Get initial location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(locationData);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing provider:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      // Watch position with high accuracy
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Update every 3 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (newLocation) => {
          const locationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setLocation(locationData);
          
          // Update Firebase
          if (providerId && isAvailable) {
            updateProviderLocation(providerId, {
              ...locationData,
              isAvailable: true,
              serviceType: providerData?.serviceType || 'general',
              providerName: providerData?.fullName || 'Provider',
              phoneNumber: providerData?.phoneNumber || '',
              rating: providerData?.rating || 0,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking.');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    // Remove from Firebase when going offline
    if (providerId) {
      removeProviderLocation(providerId);
    }
  };

  const cleanup = () => {
    stopLocationTracking();
    if (providerId) {
      removeProviderLocation(providerId);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    if (newStatus) {
      Alert.alert('You are now Online', 'Customers can see your location and send requests.');
    } else {
      Alert.alert('You are now Offline', 'Customers cannot see your location.');
    }
  };

  const centerOnMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Getting your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.text }]}>Unable to get location</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeProvider}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      <MapComponent
        mapRef={mapRef}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Provider Marker */}
        <Marker
          coordinate={location}
          title="You"
          description="Your current location"
          pinColor={COLORS.primaryGreen}
        >
          <View style={styles.providerMarker}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
        </Marker>
      </MapComponent>

      {/* Center Button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnMyLocation}>
        <Ionicons name="locate" size={24} color={COLORS.primaryGreen} />
      </TouchableOpacity>

      {/* Status Card */}
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {isAvailable ? 'You are Online' : 'You are Offline'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              {isAvailable 
                ? 'Customers can see your location' 
                : 'Turn on to receive requests'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#ccc', true: COLORS.primaryGreen }}
            thumbColor={COLORS.white}
          />
        </View>

        {isAvailable && (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={COLORS.primaryGreen} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Location updating every 3 seconds
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  providerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    top: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  locationText: {
    fontSize: 13,
    marginLeft: 8,
  },
});

export default ProviderMapScreen;
