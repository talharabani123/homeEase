/**
 * Reusable Map Component with OpenStreetMap
 * Compatible with Expo Go
 */

import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Platform } from 'react-native';

const MapComponent = ({
  region,
  onRegionChangeComplete,
  children,
  style,
  mapRef,
  showsUserLocation = false,
  followsUserLocation = false,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={showsUserLocation}
      followsUserLocation={followsUserLocation}
      showsMyLocationButton={true}
      showsCompass={true}
      loadingEnabled={true}
      zoomEnabled={true}
      scrollEnabled={true}
      pitchEnabled={false}
      rotateEnabled={false}
      mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
    >
      {children}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapComponent;
