/**
 * Customer Map Screen
 * Shows customer location and nearby available providers in real-time
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
  Animated,
  ScrollView,
} from 'react-native';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapComponent from '../../components/MapComponent';
import { listenToProviders } from '../../services/realtimeLocationService';
import { filterNearbyProviders, formatDistance } from '../../utils/distanceCalculator';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const CustomerMapScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [customerLocation, setCustomerLocation] = useState(null);
  const [providers, setProviders] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const unsubscribeProviders = useRef(null);
  const locationSubscription = useRef(null);
  const providerMarkerRefs = useRef({});
  
  // Animated values for provider markers
  const markerAnimations = useRef({});

  useEffect(() => {
    initializeCustomer();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (customerLocation && providers.length > 0) {
      const nearby = filterNearbyProviders(customerLocation, providers, 10);
      setNearbyProviders(nearby);
      
      // Auto-fit map to show customer and nearest provider
      if (nearby.length > 0 && mapRef.current) {
        fitMapToMarkers();
      }
    }
  }, [customerLocation, providers]);

  const initializeCustomer = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby service providers.',
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

      setCustomerLocation(locationData);
      
      // Watch customer location
      startLocationTracking();
      
      // Listen to providers
      startListeningToProviders();
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing customer:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 50,
        },
        (newLocation) => {
          setCustomerLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Error tracking location:', error);
    }
  };

  const startListeningToProviders = () => {
    unsubscribeProviders.current = listenToProviders((updatedProviders) => {
      // Animate marker movements
      updatedProviders.forEach(provider => {
        if (markerAnimations.current[provider.id]) {
          // Animate existing marker
          Animated.timing(markerAnimations.current[provider.id], {
            toValue: {
              latitude: provider.latitude,
              longitude: provider.longitude,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();
        } else {
          // Create new animated value
          markerAnimations.current[provider.id] = new Animated.ValueXY({
            x: provider.latitude,
            y: provider.longitude,
          });
        }
      });
      
      setProviders(updatedProviders);
    });
  };

  const cleanup = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    
    if (unsubscribeProviders.current) {
      unsubscribeProviders.current();
    }
  };

  const fitMapToMarkers = () => {
    if (!customerLocation || nearbyProviders.length === 0) return;
    
    const coordinates = [
      customerLocation,
      ...nearbyProviders.map(p => ({ latitude: p.latitude, longitude: p.longitude }))
    ];
    
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
      animated: true,
    });
  };

  const centerOnMyLocation = () => {
    if (customerLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const handleProviderPress = (provider) => {
    setSelectedProvider(provider);
    
    // Center map on provider
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: provider.latitude,
        longitude: provider.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleAcceptProvider = () => {
    if (selectedProvider) {
      Alert.alert(
        'Send Request',
        `Send service request to ${selectedProvider.providerName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: () => {
              // Navigate to request form or send request
              navigation.navigate('RequestServiceForm', {
                providerId: selectedProvider.id,
                providerName: selectedProvider.providerName,
                providerLocation: {
                  latitude: selectedProvider.latitude,
                  longitude: selectedProvider.longitude,
                },
              });
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Finding nearby providers...</Text>
      </View>
    );
  }

  if (!customerLocation) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.text }]}>Unable to get location</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeCustomer}>
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
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Nearby Providers</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {nearbyProviders.length} available
          </Text>
        </View>
        <TouchableOpacity onPress={fitMapToMarkers} style={styles.fitButton}>
          <Ionicons name="expand-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapComponent
        mapRef={mapRef}
        region={{
          latitude: customerLocation.latitude,
          longitude: customerLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Customer Marker */}
        <Marker
          coordinate={customerLocation}
          title="You"
          description="Your current location"
        >
          <View style={styles.customerMarker}>
            <View style={styles.customerMarkerInner}>
              <Ionicons name="person" size={16} color={COLORS.white} />
            </View>
            <View style={styles.customerMarkerPulse} />
          </View>
        </Marker>

        {/* Provider Markers */}
        {nearbyProviders.map((provider) => (
          <Marker
            key={provider.id}
            coordinate={{
              latitude: provider.latitude,
              longitude: provider.longitude,
            }}
            onPress={() => handleProviderPress(provider)}
          >
            <View style={[
              styles.providerMarker,
              selectedProvider?.id === provider.id && styles.providerMarkerSelected
            ]}>
              <Ionicons 
                name="briefcase" 
                size={18} 
                color={selectedProvider?.id === provider.id ? COLORS.white : COLORS.primaryGreen} 
              />
            </View>
          </Marker>
        ))}
      </MapComponent>

      {/* Center Button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnMyLocation}>
        <Ionicons name="locate" size={24} color={COLORS.primaryGreen} />
      </TouchableOpacity>

      {/* Provider List / Selected Provider Card */}
      {selectedProvider ? (
        <View style={[styles.selectedCard, { backgroundColor: colors.card }]}>
          <View style={styles.selectedHeader}>
            <View style={styles.providerAvatar}>
              <Ionicons name="person" size={24} color={COLORS.white} />
            </View>
            <View style={styles.selectedInfo}>
              <Text style={[styles.selectedName, { color: colors.text }]}>
                {selectedProvider.providerName}
              </Text>
              <View style={styles.selectedMeta}>
                <Ionicons name="location" size={14} color={COLORS.primaryGreen} />
                <Text style={[styles.selectedDistance, { color: colors.textSecondary }]}>
                  {formatDistance(selectedProvider.distance)} away
                </Text>
              </View>
              <View style={styles.selectedMeta}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={[styles.selectedRating, { color: colors.textSecondary }]}>
                  {selectedProvider.rating || 'New'} • {selectedProvider.serviceType}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedProvider(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedActions}>
            <TouchableOpacity 
              style={[styles.callButton, { borderColor: colors.border }]}
              onPress={() => Alert.alert('Call', `Call ${selectedProvider.providerName}?`)}
            >
              <Ionicons name="call" size={20} color={COLORS.primaryGreen} />
              <Text style={[styles.callButtonText, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptProvider}>
              <Text style={styles.acceptButtonText}>Send Request</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.providerListCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Available Providers ({nearbyProviders.length})
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.providerList}
          >
            {nearbyProviders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No providers nearby
                </Text>
              </View>
            ) : (
              nearbyProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[styles.providerCard, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => handleProviderPress(provider)}
                >
                  <View style={styles.providerCardAvatar}>
                    <Ionicons name="person" size={20} color={COLORS.white} />
                  </View>
                  <Text style={[styles.providerCardName, { color: colors.text }]} numberOfLines={1}>
                    {provider.providerName}
                  </Text>
                  <Text style={[styles.providerCardDistance, { color: colors.textSecondary }]}>
                    {formatDistance(provider.distance)}
                  </Text>
                  <View style={styles.providerCardRating}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.providerCardRatingText, { color: colors.textSecondary }]}>
                      {provider.rating || 'New'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  fitButton: {
    padding: 8,
  },
  customerMarker: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    zIndex: 2,
  },
  customerMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    opacity: 0.2,
  },
  providerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  providerMarkerSelected: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.white,
    borderWidth: 3,
    width: 44,
    height: 44,
    borderRadius: 22,
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
  providerListCard: {
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
    maxHeight: 200,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  providerList: {
    flexGrow: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: 300,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  providerCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  providerCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  providerCardDistance: {
    fontSize: 12,
    marginBottom: 4,
  },
  providerCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerCardRatingText: {
    fontSize: 11,
    marginLeft: 4,
  },
  selectedCard: {
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
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedDistance: {
    fontSize: 13,
    marginLeft: 4,
  },
  selectedRating: {
    fontSize: 13,
    marginLeft: 4,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    gap: 8,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomerMapScreen;
