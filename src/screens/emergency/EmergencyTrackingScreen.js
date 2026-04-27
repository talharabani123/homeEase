import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, SafeAreaView, Linking } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getProviderLocation } from '../../services/emergencyService';

// Mock Map Component for Expo Go (replace with MapView in production build)
const MockMapView = ({ children, style }) => {
  return (
    <View style={[style, { backgroundColor: '#E5E7EB' }]}>
      <View style={styles.mockMapContent}>
        <Svg width="100%" height="100%" viewBox="0 0 400 400">
          {/* Grid lines */}
          <Line x1="0" y1="100" x2="400" y2="100" stroke="#D1D5DB" strokeWidth="1" />
          <Line x1="0" y1="200" x2="400" y2="200" stroke="#D1D5DB" strokeWidth="1" />
          <Line x1="0" y1="300" x2="400" y2="300" stroke="#D1D5DB" strokeWidth="1" />
          <Line x1="100" y1="0" x2="100" y2="400" stroke="#D1D5DB" strokeWidth="1" />
          <Line x1="200" y1="0" x2="200" y2="400" stroke="#D1D5DB" strokeWidth="1" />
          <Line x1="300" y1="0" x2="300" y2="400" stroke="#D1D5DB" strokeWidth="1" />
          
          {/* Roads */}
          <Path d="M 0 150 Q 100 140 200 150 T 400 150" stroke="#9CA3AF" strokeWidth="8" fill="none" />
          <Path d="M 200 0 Q 190 100 200 200 T 200 400" stroke="#9CA3AF" strokeWidth="8" fill="none" />
          
          {/* Buildings */}
          <Path d="M 50 50 L 50 120 L 120 120 L 120 50 Z" fill="#6B7280" opacity="0.3" />
          <Path d="M 280 80 L 280 140 L 340 140 L 340 80 Z" fill="#6B7280" opacity="0.3" />
          <Path d="M 60 250 L 60 320 L 130 320 L 130 250 Z" fill="#6B7280" opacity="0.3" />
          
          {/* Customer marker (red pin) */}
          <Circle cx="200" cy="200" r="8" fill="#DC2626" />
          <Path d="M 200 200 L 200 220" stroke="#DC2626" strokeWidth="3" />
          
          {/* Provider marker (green) */}
          <Circle cx="250" cy="180" r="12" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          <Path d="M 250 175 L 250 185" stroke="#FFFFFF" strokeWidth="2" />
          <Path d="M 245 180 L 255 180" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
        <View style={styles.mockMapLabel}>
          <Text style={styles.mockMapLabelText}>📍 Live Tracking Map</Text>
          <Text style={styles.mockMapSubtext}>(Mock view for Expo Go)</Text>
        </View>
      </View>
      {children}
    </View>
  );
};

const EmergencyTrackingScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { request, provider, category, acceptedPrice } = route.params;
  
  const [providerLocation, setProviderLocation] = useState(null);
  const [eta, setEta] = useState(provider.eta || 15);
  const [distance, setDistance] = useState(provider.distance || 2.5);

  useEffect(() => {
    // Simulate real-time location updates
    const interval = setInterval(() => {
      const locationData = getProviderLocation(provider.id, request.location);
      setProviderLocation(locationData.provider);
      setDistance(locationData.distance);
      setEta(locationData.eta);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    const phoneNumber = provider.phone || '+92 300 1234567';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.name,
      requestId: request.id
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel? Provider is already on the way.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cancelled', 'Emergency request cancelled. Cancellation fee may apply.');
            navigation.navigate('CustomerDashboard');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MockMapView style={styles.map}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke="#000000" strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
        </MockMapView>
      </View>

      {/* Provider Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        {/* ETA Banner */}
        <View style={styles.etaBanner}>
          <View style={styles.etaContent}>
            <Text style={styles.etaLabel}>Arriving in</Text>
            <Text style={styles.etaValue}>{eta} mins</Text>
          </View>
          <View style={styles.distanceContent}>
            <Text style={styles.distanceLabel}>{distance} km away</Text>
          </View>
        </View>

        {/* Provider Details */}
        <View style={styles.providerSection}>
          <View style={styles.providerHeader}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitial}>{provider.name.charAt(0)}</Text>
            </View>
            
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
              <View style={styles.providerMeta}>
                <Text style={styles.providerRating}>⭐ {provider.rating}</Text>
                <Text style={[styles.providerJobs, { color: colors.textSecondary }]}>
                  • {provider.totalJobs} jobs
                </Text>
                {provider.emergencyBadge && (
                  <Text style={styles.emergencyBadge}>• 🚨</Text>
                )}
              </View>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>On the way</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={handleCall}
            >
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M18 15.5C16.75 15.5 15.55 15.3 14.43 14.93C14.08 14.82 13.69 14.9 13.41 15.17L11.21 17.37C8.38 15.93 4.06 11.62 2.62 8.79L4.82 6.58C5.1 6.31 5.18 5.92 5.07 5.57C4.7 4.45 4.5 3.25 4.5 2C4.5 1.45 4.05 1 3.5 1H1C0.45 1 0 1.45 0 2C0 11.39 7.61 19 17 19C17.55 19 18 18.55 18 18V15.5C18 14.95 17.55 14.5 17 14.5Z" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={handleMessage}
            >
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H16L20 20V2C20 0.9 19.1 0 18 0ZM16 12H4V10H16V12ZM16 9H4V7H16V9ZM16 6H4V4H16V6Z" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Request Details */}
        <View style={[styles.detailsSection, { borderTopColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Request ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.requestNumber}</Text>
          </View>

          {category === 'standard' && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Service</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {request.serviceType.icon} {request.serviceType.name}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Price</Text>
            <Text style={[styles.detailValue, { color: '#DC2626', fontWeight: '700' }]}>
              Rs. {acceptedPrice || request.estimatedPrice}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
              {request.location.address}
            </Text>
          </View>
        </View>

        {/* Safety Info */}
        <View style={[styles.safetyInfo, { backgroundColor: colors.primaryLight }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M10 0L2 4V9C2 13.55 5.84 17.74 10 19C14.16 17.74 18 13.55 18 9V4L10 0Z" fill="#DC2626" />
          </Svg>
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Share live tracking with family for safety
          </Text>
          <TouchableOpacity>
            <Text style={styles.shareLink}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: '40%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mockMapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockMapLabel: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mockMapLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  mockMapSubtext: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  etaBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  etaContent: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  etaValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  distanceContent: {
    alignItems: 'flex-end',
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  providerSection: {
    padding: 20,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  providerJobs: {
    fontSize: 14,
    marginLeft: 4,
  },
  emergencyBadge: {
    fontSize: 14,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  safetyText: {
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  shareLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default EmergencyTrackingScreen;
