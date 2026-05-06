import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import navigationService from '../services/navigationService';

const CustomerLocationCard = ({ location, customerName, showNavigateButton = true }) => {
  const { colors } = useTheme();

  if (!location || !location.latitude || !location.longitude) {
    return null;
  }

  const handleNavigate = async () => {
    const destination = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || location.formattedAddress,
      label: `${customerName}'s Location`,
    };

    const result = await navigationService.navigateToLocation(destination);
    
    if (result.success) {
      console.log(`Opened ${result.app} for navigation`);
    }
  };

  const handleShowOnMap = async () => {
    await navigationService.openLocationInMap({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || location.formattedAddress,
    });
  };

  const handleMoreOptions = () => {
    navigationService.showNavigationOptions({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || location.formattedAddress,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill={colors.primary}
            />
          </Svg>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Customer Location</Text>
          {location.distance && (
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              📍 {location.distance} away
            </Text>
          )}
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Text style={[styles.address, { color: colors.text }]}>
          {location.address || location.formattedAddress || 'Address not available'}
        </Text>
        {location.landmark && (
          <Text style={[styles.landmark, { color: colors.textSecondary }]}>
            Near: {location.landmark}
          </Text>
        )}
      </View>

      {/* Coordinates */}
      <View style={styles.coordinatesContainer}>
        <Text style={[styles.coordinates, { color: colors.textSecondary }]}>
          📌 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Action Buttons */}
      {showNavigateButton && (
        <View style={styles.actionsContainer}>
          {/* Navigate Button (Primary) */}
          <TouchableOpacity
            style={[styles.navigateButton, { backgroundColor: colors.primary }]}
            onPress={handleNavigate}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24">
              <Path
                d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"
                fill="#FFFFFF"
              />
            </Svg>
            <Text style={styles.navigateButtonText}>Navigate with Google Maps</Text>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleShowOnMap}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24">
                <Path
                  d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"
                  fill={colors.text}
                />
              </Svg>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>View on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleMoreOptions}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24">
                <Circle cx="12" cy="5" r="2" fill={colors.text} />
                <Circle cx="12" cy="12" r="2" fill={colors.text} />
                <Circle cx="12" cy="19" r="2" fill={colors.text} />
              </Svg>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>More</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  distance: {
    fontSize: 13,
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 12,
  },
  address: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  landmark: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  coordinatesContainer: {
    marginBottom: 16,
  },
  coordinates: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsContainer: {
    gap: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CustomerLocationCard;
