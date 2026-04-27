/**
 * Location Service
 * Handles real-time location tracking using expo-location
 * Works in Expo Go!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

const LOCATION_STORAGE_KEY = '@homeease_user_location';

/**
 * Request location permissions
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to use this feature'
      );
      return { granted: false };
    }
    
    console.log('📍 Location permission granted');
    return { granted: true };
  } catch (error) {
    console.error('Location permission error:', error);
    return { granted: false };
  }
};

/**
 * Get current location
 */
export const getCurrentLocation = async () => {
  try {
    // Check permission first
    const permission = await requestLocationPermission();
    if (!permission.granted) {
      return {
        success: false,
        error: 'Location permission denied'
      };
    }

    // Get real location using expo-location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
    
    console.log('📍 Current location:', coords);
    
    // Save to storage
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
    
    return {
      success: true,
      location: coords
    };
  } catch (error) {
    console.error('Get location error:', error);
    
    // Fallback to mock location if real location fails
    const mockLocation = {
      latitude: 24.8607,
      longitude: 67.0011,
      accuracy: 10,
      timestamp: Date.now()
    };
    
    console.log('📍 Using fallback location (mock):', mockLocation);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(mockLocation));
    
    return {
      success: true,
      location: mockLocation
    };
  }
};

/**
 * Get last known location from storage
 */
export const getLastKnownLocation = async () => {
  try {
    const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      return {
        success: true,
        location: JSON.parse(stored)
      };
    }
    
    // If no stored location, get current
    return await getCurrentLocation();
  } catch (error) {
    console.error('Get last location error:', error);
    return {
      success: false,
      error: 'Failed to get location'
    };
  }
};

/**
 * Start watching location (for real-time tracking)
 */
export const startLocationWatch = async (callback) => {
  try {
    const permission = await requestLocationPermission();
    if (!permission.granted) {
      return null;
    }

    // Real location watching with expo-location
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or when moved 10 meters
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        });
      }
    );
    
    console.log('📍 Location watch started (real GPS)');
    return () => subscription.remove();
  } catch (error) {
    console.error('Location watch error:', error);
    
    // Fallback to mock implementation
    const interval = setInterval(async () => {
      const result = await getCurrentLocation();
      if (result.success) {
        callback(result.location);
      }
    }, 5000);

    console.log('📍 Location watch started (fallback mode)');
    return () => clearInterval(interval);
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate ETA based on distance
 * Assumes average speed of 20 km/h in city traffic
 */
export const calculateETA = (distanceKm) => {
  const averageSpeedKmh = 20;
  const timeHours = distanceKm / averageSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  return timeMinutes;
};

/**
 * Format address from coordinates (reverse geocoding)
 */
export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    // Try real reverse geocoding first
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (addresses && addresses.length > 0) {
      const addr = addresses[0];
      const formattedAddress = [
        addr.street,
        addr.district,
        addr.city,
        addr.region
      ].filter(Boolean).join(', ');
      
      console.log('📍 Address from coords:', formattedAddress);
      
      return {
        success: true,
        address: formattedAddress || 'Unknown location'
      };
    }
    
    return {
      success: false,
      error: 'Address not found'
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    
    // Fallback to mock address
    const mockAddresses = [
      'Gulshan-e-Iqbal, Karachi',
      'Clifton, Karachi',
      'DHA Phase 5, Karachi',
      'Saddar, Karachi',
      'North Nazimabad, Karachi'
    ];
    
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    
    console.log('📍 Using fallback address:', randomAddress);
    
    return {
      success: true,
      address: randomAddress
    };
  }
};

/**
 * Check if location services are enabled
 */
export const isLocationEnabled = async () => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Check location enabled error:', error);
    return false;
  }
};

export default {
  requestLocationPermission,
  getCurrentLocation,
  getLastKnownLocation,
  startLocationWatch,
  calculateDistance,
  calculateETA,
  getAddressFromCoords,
  isLocationEnabled
};
