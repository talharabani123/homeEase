import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { STANDARD_EMERGENCY_TYPES, calculateEmergencyPrice, getPriceBreakdown, createStandardEmergencyRequest } from '../../services/emergencyService';

const StandardEmergencyScreen = ({ route, navigation }) => {
  const { colors } = useTheme();

  // ── Safe param extraction ──────────────────────────────────────────────────
  const safeParams = route?.params || {};
  const initLocation = safeParams.location || null;
  const initAddress  = safeParams.address  || '';
  
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(initLocation);
  const [currentAddress, setCurrentAddress] = useState(initAddress || 'Fetching location…');

  // Get location if not provided
  React.useEffect(() => {
    if (!initLocation) fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { getCurrentLocation, getAddressFromCoords } = require('../../services/locationService');
      const result = await getCurrentLocation();
      if (result.success) {
        setCurrentLocation(result.location);
        const addrResult = await getAddressFromCoords(result.location.latitude, result.location.longitude);
        setCurrentAddress(addrResult.success ? addrResult.address : 'Current Location');
      } else {
        setCurrentLocation({ latitude: 24.8607, longitude: 67.0011 });
        setCurrentAddress('Default location — tap 📍 to pick manually');
      }
    } catch {
      setCurrentLocation({ latitude: 24.8607, longitude: 67.0011 });
      setCurrentAddress('Location unavailable');
    }
  };

  // ── Map picker ─────────────────────────────────────────────────────────────
  const openMapPicker = useCallback(() => {
    navigation.navigate('LocationPicker', {
      initialLat: currentLocation?.latitude,
      initialLng: currentLocation?.longitude,
      onConfirm: (picked) => {
        setCurrentLocation({ latitude: picked.latitude, longitude: picked.longitude });
        setCurrentAddress(picked.address || `${picked.latitude.toFixed(4)}, ${picked.longitude.toFixed(4)}`);
      },
    });
  }, [currentLocation]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleConfirm = async () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select an emergency service type');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Location Required', 'Please wait while we fetch your location');
      return;
    }

    setLoading(true);

    try {
      const result = await createStandardEmergencyRequest(
        selectedService.id,
        { ...currentLocation, address: currentAddress },
        description
      );

      setLoading(false);

      if (result.success) {
        navigation.navigate('EmergencySearching', {
          request: result.data,
          category: 'standard'
        });
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create emergency request');
    }
  };

  const estimatedPrice = selectedService 
    ? calculateEmergencyPrice(selectedService.basePrice, selectedService.surgeMultiplier)
    : 0;

  const priceBreakdown = selectedService
    ? getPriceBreakdown(selectedService.basePrice, selectedService.surgeMultiplier)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="#DC2626" />

      {/* Header */}
      <View style={styles.emergencyHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.emergencyTitle}>Standard Emergency</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Display */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path d="M10 2C6.5 2 4 4.5 4 8C4 12 10 18 10 18C10 18 16 12 16 8C16 4.5 13.5 2 10 2ZM10 10A2 2 0 1 1 10 6A2 2 0 1 1 10 10Z" fill="#DC2626" />
          </Svg>
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
            {currentAddress}
          </Text>
          <TouchableOpacity
            style={[styles.mapPinBtn, { backgroundColor: '#DC2626' }]}
            onPress={openMapPicker}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Service Types Grid */}
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Emergency Type</Text>
          
          <View style={styles.servicesGrid}>
            {STANDARD_EMERGENCY_TYPES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  selectedService?.id === service.id && styles.serviceCardSelected
                ]}
                onPress={() => handleServiceSelect(service)}
                activeOpacity={0.7}
              >
                {service.critical && (
                  <View style={styles.criticalBadge}>
                    <Text style={styles.criticalText}>CRITICAL</Text>
                  </View>
                )}
                
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                  {service.name}
                </Text>
                
                <View style={styles.priceContainer}>
                  <Text style={[styles.basePrice, { color: colors.textSecondary }]}>
                    Rs. {service.basePrice}
                  </Text>
                  <Text style={styles.surgePrice}>
                    Rs. {calculateEmergencyPrice(service.basePrice, service.surgeMultiplier)}
                  </Text>
                </View>

                <View style={styles.examplesContainer}>
                  {service.examples.slice(0, 2).map((example, index) => (
                    <Text key={index} style={[styles.exampleText, { color: colors.textSecondary }]} numberOfLines={1}>
                      • {example}
                    </Text>
                  ))}
                </View>

                {selectedService?.id === service.id && (
                  <View style={styles.selectedIndicator}>
                    <Svg width="20" height="20" viewBox="0 0 20 20">
                      <Path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM8 15L3 10L4.4 8.6L8 12.2L15.6 4.6L17 6L8 15Z" fill="#DC2626" />
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description (Optional) */}
        {selectedService && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Brief Description (Optional)
            </Text>
            <TextInput
              style={[styles.descriptionInput, { 
                backgroundColor: colors.inputBackground, 
                borderColor: colors.inputBorder,
                color: colors.text 
              }]}
              placeholder="E.g., Bathroom pipe burst, water everywhere..."
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
              {description.length}/200
            </Text>
          </View>
        )}

        {/* Price Breakdown */}
        {selectedService && priceBreakdown && (
          <View style={[styles.priceCard, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Text style={styles.priceCardTitle}>Emergency Pricing</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Price</Text>
              <Text style={styles.priceValue}>Rs. {priceBreakdown.base}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Emergency Surge ({selectedService.surgeMultiplier}x)</Text>
              <Text style={styles.priceValue}>Rs. {priceBreakdown.surge}</Text>
            </View>
            
            {priceBreakdown.nightSurcharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Night Surcharge (20%)</Text>
                <Text style={styles.priceValue}>Rs. {priceBreakdown.nightSurcharge}</Text>
              </View>
            )}
            
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>Rs. {priceBreakdown.total}</Text>
            </View>

            <Text style={styles.priceNote}>
              * Final price may vary based on provider distance and actual work required
            </Text>
          </View>
        )}

        {/* Info Banner */}
        {selectedService && (
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 15C9.4 15 9 14.6 9 14C9 13.4 9.4 13 10 13C10.6 13 11 13.4 11 14C11 14.6 10.6 15 10 15ZM11 11H9V5H11V11Z" fill="#DC2626" />
            </Svg>
            <Text style={styles.infoText}>
              Providers will be notified instantly. First to accept gets the job.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      {selectedService && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerInfo}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Estimated Price</Text>
            <Text style={styles.footerPrice}>Rs. {estimatedPrice}</Text>
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? 'Creating...' : 'Confirm Emergency Request'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  mapPinBtn: {
    width: 30, height: 30, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  serviceCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  serviceCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  criticalBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 36,
  },
  priceContainer: {
    marginBottom: 8,
  },
  basePrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  surgePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  examplesContainer: {
    marginTop: 4,
  },
  exampleText: {
    fontSize: 11,
    marginBottom: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  descriptionInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  priceCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#7F1D1D',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F1D1D',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7F1D1D',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  priceNote: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#7F1D1D',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  footerInfo: {
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
  },
  confirmButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StandardEmergencyScreen;
