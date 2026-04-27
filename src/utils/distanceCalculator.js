/**
 * Distance Calculator Utility
 * Uses Haversine formula to calculate distance between two coordinates
 */

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
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

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Filter providers within specified radius
 * @param {object} customerLocation - {latitude, longitude}
 * @param {array} providers - Array of provider objects
 * @param {number} radiusKm - Radius in kilometers (default: 10)
 * @returns {array} Filtered providers with distance property
 */
export const filterNearbyProviders = (customerLocation, providers, radiusKm = 10) => {
  if (!customerLocation || !providers) return [];
  
  return providers
    .map(provider => {
      const distance = calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        provider.latitude,
        provider.longitude
      );
      
      return {
        ...provider,
        distance: parseFloat(distance.toFixed(2))
      };
    })
    .filter(provider => provider.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
