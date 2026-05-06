import { Linking, Platform, Alert } from 'react-native';

/**
 * Navigation Service
 * Handles opening external navigation apps (Google Maps, Apple Maps, etc.)
 */
class NavigationService {
  /**
   * Open navigation to a specific location using Google Maps
   * Simplified method that works cross-platform
   */
  async openGoogleMaps(latitude, longitude, label = 'Destination') {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Invalid location coordinates');
      return { success: false, error: 'Invalid coordinates' };
    }

    try {
      // Try platform-specific Google Maps URL first
      let googleMapsUrl;
      if (Platform.OS === 'ios') {
        googleMapsUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
      } else {
        googleMapsUrl = `google.navigation:q=${latitude},${longitude}&mode=d`;
      }

      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
      
      if (canOpenGoogleMaps) {
        await Linking.openURL(googleMapsUrl);
        return { success: true, app: 'Google Maps' };
      }

      // Fallback to web Google Maps
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      await Linking.openURL(webUrl);
      return { success: true, app: 'Google Maps (Web)' };

    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to open navigation');
      return { success: false, error: error.message };
    }
  }

  /**
   * Open navigation to a specific location
   * @param {Object} destination - Destination coordinates and address
   * @param {number} destination.latitude - Destination latitude
   * @param {number} destination.longitude - Destination longitude
   * @param {string} destination.address - Destination address (optional)
   * @param {string} destination.label - Location label (optional)
   */
  async navigateToLocation(destination) {
    const { latitude, longitude, address, label } = destination;

    if (!latitude || !longitude) {
      Alert.alert('Error', 'Invalid location coordinates');
      return { success: false, error: 'Invalid coordinates' };
    }

    // Create location label
    const locationLabel = label || address || 'Customer Location';
    const encodedLabel = encodeURIComponent(locationLabel);

    // Build URLs for different platforms
    const googleMapsUrl = Platform.OS === 'ios' 
      ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
      : `google.navigation:q=${latitude},${longitude}&mode=d`;

    const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
    
    const webGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    try {
      // Try Google Maps first (preferred)
      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
      
      if (canOpenGoogleMaps) {
        await Linking.openURL(googleMapsUrl);
        return { success: true, app: 'Google Maps' };
      }

      // Try Apple Maps (iOS only)
      if (Platform.OS === 'ios') {
        const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
        if (canOpenAppleMaps) {
          await Linking.openURL(appleMapsUrl);
          return { success: true, app: 'Apple Maps' };
        }
      }

      // Fallback to web Google Maps
      const canOpenWeb = await Linking.canOpenURL(webGoogleMapsUrl);
      if (canOpenWeb) {
        await Linking.openURL(webGoogleMapsUrl);
        return { success: true, app: 'Google Maps (Web)' };
      }

      // No navigation app available
      Alert.alert(
        'Navigation App Not Found',
        'Please install Google Maps or another navigation app to get directions.'
      );
      return { success: false, error: 'No navigation app available' };

    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to open navigation app');
      return { success: false, error: error.message };
    }
  }

  /**
   * Show navigation options dialog
   * Allows user to choose between available navigation apps
   */
  async showNavigationOptions(destination) {
    const { latitude, longitude, address } = destination;

    const options = [];
    const handlers = [];

    // Check Google Maps
    const googleMapsUrl = Platform.OS === 'ios'
      ? `comgooglemaps://?daddr=${latitude},${longitude}`
      : `google.navigation:q=${latitude},${longitude}`;

    const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
    if (canOpenGoogleMaps) {
      options.push('Google Maps');
      handlers.push(() => this.navigateToLocation(destination));
    }

    // Check Apple Maps (iOS only)
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}`;
      const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
      if (canOpenAppleMaps) {
        options.push('Apple Maps');
        handlers.push(() => Linking.openURL(appleMapsUrl));
      }
    }

    // Add web option
    options.push('Google Maps (Browser)');
    handlers.push(() => {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    });

    // Add cancel option
    options.push('Cancel');

    // Show action sheet
    Alert.alert(
      'Choose Navigation App',
      address || `Navigate to ${latitude}, ${longitude}`,
      options.map((option, index) => ({
        text: option,
        onPress: option === 'Cancel' ? undefined : handlers[index],
        style: option === 'Cancel' ? 'cancel' : 'default',
      }))
    );
  }

  /**
   * Calculate distance between two coordinates
   * @param {Object} from - Starting coordinates
   * @param {Object} to - Destination coordinates
   * @returns {number} Distance in kilometers
   */
  calculateDistance(from, to) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.latitude)) *
      Math.cos(this.toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  /**
   * Get estimated travel time
   * @param {number} distanceKm - Distance in kilometers
   * @param {string} mode - Travel mode ('driving', 'walking', 'bicycling')
   * @returns {string} Estimated time string
   */
  getEstimatedTime(distanceKm, mode = 'driving') {
    let speedKmh;
    
    switch (mode) {
      case 'walking':
        speedKmh = 5;
        break;
      case 'bicycling':
        speedKmh = 15;
        break;
      case 'driving':
      default:
        speedKmh = 40; // Average city driving speed
        break;
    }
    
    const timeHours = distanceKm / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    
    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    }
    
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  /**
   * Open location in map view (for display, not navigation)
   * @param {Object} location - Location to display
   */
  async openLocationInMap(location) {
    const { latitude, longitude, address } = location;
    
    const url = Platform.OS === 'ios'
      ? `maps://?q=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(address || 'Location')})`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      }
      
      // Fallback to web
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      await Linking.openURL(webUrl);
      return { success: true };
      
    } catch (error) {
      console.error('Error opening map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Share location via messaging apps
   * @param {Object} location - Location to share
   */
  async shareLocation(location) {
    const { latitude, longitude, address } = location;
    const locationUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const message = `${address || 'Location'}\n${locationUrl}`;
    
    try {
      const url = `sms:?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      }
      
      return { success: false, error: 'Cannot open messaging app' };
    } catch (error) {
      console.error('Error sharing location:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new NavigationService();
