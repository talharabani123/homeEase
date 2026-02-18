import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Linking, Animated, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const { width, height } = Dimensions.get('window');

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const ChatIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill="#FF4444"
    />
  </Svg>
);

const LiveTrackingScreen = ({ navigation, route }) => {
  const { provider, requestData } = route.params || {};
  
  // Mock provider data
  const providerData = provider || {
    name: 'Ahmed Khan',
    phoneNumber: '+92 300 1234567',
    serviceType: 'Plumber',
    rating: 4.8,
    vehicleNumber: 'ABC-123',
  };

  const [eta, setEta] = useState(15); // minutes
  const [distance, setDistance] = useState(2.5); // km
  const [providerLocation, setProviderLocation] = useState({
    latitude: 33.7294,
    longitude: 73.0931,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulate ETA countdown
    const etaInterval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000); // Every minute

    // Simulate provider movement
    const locationInterval = setInterval(() => {
      setProviderLocation(prev => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
      setDistance(prev => Math.max(0, prev - 0.1));
    }, 5000); // Every 5 seconds

    // Pulse animation for provider marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(etaInterval);
      clearInterval(locationInterval);
    };
  }, []);

  const handleCall = () => {
    if (!providerData.phoneNumber) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }
    const phoneNumber = providerData.phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleChat = () => {
    // Navigate to chat screen with request and provider info
    navigation.navigate('Chat', {
      requestId: requestData?.requestId || 'mock-request-123',
      providerId: providerData.id || 'provider1',
      providerName: providerData.name,
      customerName: 'You', // In production, get from auth context
    });
  };

  const handleCancelRequest = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        {/* Map Background */}
        <View style={styles.mapBackground}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapText}>Google Maps View</Text>
          <Text style={styles.mapSubtext}>
            Provider location will be shown here
          </Text>
        </View>

        {/* Provider Marker (Animated) */}
        <Animated.View
          style={[
            styles.providerMarker,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.markerInner}>
            <Text style={styles.markerText}>🚗</Text>
          </View>
        </Animated.View>

        {/* Customer Marker */}
        <View style={styles.customerMarker}>
          <LocationIcon />
        </View>

        {/* Route Line Indicator */}
        <View style={styles.routeIndicator}>
          <View style={styles.routeLine} />
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>

        {/* ETA Badge */}
        <View style={styles.etaBadge}>
          <Text style={styles.etaTime}>{eta} min</Text>
          <Text style={styles.etaLabel}>ETA</Text>
        </View>
      </View>

      {/* Bottom Info Panel */}
      <View style={styles.infoPanel}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Provider Info */}
        <View style={styles.providerSection}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitial}>
              {providerData.name.charAt(0)}
            </Text>
          </View>
          
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{providerData.name}</Text>
            <Text style={styles.providerService}>{providerData.serviceType}</Text>
            <View style={styles.ratingRow}>
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Path
                  d="M7 1l1.5 4h4l-3 2.5 1.5 4-4-2.5-4 2.5 1.5-4-3-2.5h4z"
                  fill="#FFA726"
                />
              </Svg>
              <Text style={styles.ratingText}>{providerData.rating}</Text>
              {providerData.vehicleNumber && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.vehicleNumber}>{providerData.vehicleNumber}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>On the way</Text>
          </View>
        </View>

        {/* Distance & ETA Info */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{eta} mins</Text>
            <Text style={styles.statLabel}>Arrival Time</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <View style={styles.contactIconContainer}>
              <PhoneIcon />
            </View>
            <Text style={styles.contactButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleChat}>
            <View style={styles.contactIconContainer}>
              <ChatIcon />
            </View>
            <Text style={styles.contactButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>

        {/* Safety Info */}
        <Text style={styles.safetyText}>
          🛡️ Your safety is our priority. Share trip details with family.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Map Container
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  mapText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: COLORS.textGrey,
    textAlign: 'center',
  },

  // Provider Marker
  providerMarker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  markerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markerText: {
    fontSize: 28,
  },

  // Customer Marker
  customerMarker: {
    position: 'absolute',
    top: '60%',
    left: '30%',
    marginLeft: -12,
    marginTop: -24,
  },

  // Route Indicator
  routeIndicator: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: '20%',
    height: 100,
  },
  routeLine: {
    width: 3,
    height: '100%',
    backgroundColor: COLORS.primaryGreen,
    opacity: 0.5,
    transform: [{ rotate: '45deg' }],
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ETA Badge
  etaBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  etaTime: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  etaLabel: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Info Panel
  infoPanel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },

  // Drag Handle
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Provider Section
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  providerInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.white,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 2,
  },
  providerService: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginLeft: 4,
  },
  separator: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginHorizontal: 6,
  },
  vehicleNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
  },
  contactIconContainer: {
    marginRight: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Cancel Button
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF4444',
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
    textAlign: 'center',
  },

  // Safety Text
  safetyText: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LiveTrackingScreen;
