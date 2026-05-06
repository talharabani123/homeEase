/**
 * Real-Time Marketplace Service
 * InDrive-style on-demand home services marketplace
 * Handles complete workflow: Request → Match → Accept → Track → Complete → Rate
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  getServiceRequests as getUserRequests,
  saveServiceRequests,
  addServiceHistory,
} from './userDataService';

// Storage Keys (global fallback)
const SERVICE_REQUESTS_KEY = '@marketplace_service_requests';
const PROVIDERS_KEY = '@marketplace_providers';
const ACTIVE_JOBS_KEY = '@marketplace_active_jobs';

// Configuration
const RATE_PER_KM = 50; // PKR per kilometer
const DEFAULT_RADIUS_KM = 10; // Default search radius
const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate travel fee based on distance
 */
export const calculateTravelFee = (distanceKm) => {
  return Math.round(distanceKm * RATE_PER_KM);
};

/**
 * STEP 1: Customer Creates Service Request
 */
export const createServiceRequest = async (requestData) => {
  try {
    const requestId = `req_${Date.now()}`;
    
    // Get customer's current location
    let customerLocation = requestData.location;
    if (!customerLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        customerLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: requestData.address || 'Current Location'
        };
      }
    }

    const serviceRequest = {
      id: requestId,
      customerId: requestData.customerId,
      customerName: requestData.customerName,
      customerPhone: requestData.customerPhone,
      
      // Service Details
      serviceType: requestData.serviceType, // 'plumber', 'electrician', etc.
      serviceName: requestData.serviceName,
      description: requestData.description,
      
      // Location
      latitude: customerLocation.latitude,
      longitude: customerLocation.longitude,
      address: customerLocation.address,
      
      // Status
      status: 'searching', // searching → accepted → in_progress → completed → cancelled
      
      // Provider Info (filled when accepted)
      selectedProviderId: null,
      providerName: null,
      providerPhone: null,
      providerLocation: null,
      
      // Pricing (calculated when provider accepts)
      travelDistance: null,
      travelFee: null,
      serviceFee: null,
      totalAmount: null,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      startedAt: null,
      completedAt: null,
      
      // Rating
      rating: null,
      review: null,
    };

    // Save request — user-scoped
    const requests = await getAllServiceRequests(requestData.customerId);
    requests.push(serviceRequest);
    await setAllServiceRequests(requests, requestData.customerId);

    console.log('✅ Service request created:', requestId);

    // STEP 2: Trigger provider matching
    await matchNearbyProviders(serviceRequest);

    return {
      success: true,
      requestId,
      request: serviceRequest
    };
  } catch (error) {
    console.error('❌ Create service request error:', error);
    return {
      success: false,
      error: 'Failed to create service request'
    };
  }
};

/**
 * STEP 2: Match Nearby Providers
 * Find online, verified providers within radius
 */
export const matchNearbyProviders = async (serviceRequest) => {
  try {
    const providers = await getAllProviders();
    
    const matchedProviders = providers.filter(provider => {
      // Check if provider is online
      if (!provider.isOnline) return false;
      
      // Check if provider is verified
      if (provider.verificationStatus !== 'approved') return false;
      
      // Check if provider offers this service
      const hasService = provider.services?.some(s => 
        s.id === serviceRequest.serviceType || 
        s.name?.toLowerCase().includes(serviceRequest.serviceType.toLowerCase())
      );
      if (!hasService) return false;
      
      // Check if provider is within radius
      if (provider.currentLocation) {
        const distance = calculateDistance(
          serviceRequest.latitude,
          serviceRequest.longitude,
          provider.currentLocation.latitude,
          provider.currentLocation.longitude
        );
        return distance <= (serviceRequest.radius || DEFAULT_RADIUS_KM);
      }
      
      return false;
    });

    console.log(`📍 Found ${matchedProviders.length} matching providers`);

    // Send notifications to matched providers (mock)
    matchedProviders.forEach(provider => {
      sendProviderNotification(provider.id, serviceRequest);
    });

    return {
      success: true,
      matchedProviders: matchedProviders.length
    };
  } catch (error) {
    console.error('❌ Match providers error:', error);
    return {
      success: false,
      error: 'Failed to match providers'
    };
  }
};

/**
 * Send notification to provider (mock - replace with FCM)
 */
const sendProviderNotification = (providerId, request) => {
  console.log(`🔔 Notification sent to provider ${providerId}:`, {
    title: 'New Job Request!',
    body: `${request.serviceName} - ${request.address}`,
    data: { requestId: request.id }
  });
};

/**
 * STEP 3: Provider Accepts Request
 * Lock request to provider and calculate travel fee
 */
export const acceptServiceRequest = async (requestId, providerId, providerData) => {
  try {
    const requests = await getAllServiceRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }

    const request = requests[requestIndex];

    // Check if already accepted by another provider
    if (request.status !== 'searching') {
      return { success: false, error: 'Request already accepted by another provider' };
    }

    // Get provider's current location
    let providerLocation = providerData.currentLocation;
    if (!providerLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        providerLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      }
    }

    // STEP 4: Calculate Travel Fee
    const distance = calculateDistance(
      providerLocation.latitude,
      providerLocation.longitude,
      request.latitude,
      request.longitude
    );
    const travelFee = calculateTravelFee(distance);

    console.log(`💰 Travel calculation: ${distance.toFixed(2)} km × ${RATE_PER_KM} PKR = ${travelFee} PKR`);

    // Update request
    request.status = 'accepted';
    request.selectedProviderId = providerId;
    request.providerName = providerData.name;
    request.providerPhone = providerData.phone;
    request.providerLocation = providerLocation;
    request.travelDistance = parseFloat(distance.toFixed(2));
    request.travelFee = travelFee;
    request.acceptedAt = new Date().toISOString();

    requests[requestIndex] = request;
    await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));

    // Mark provider as busy
    await updateProviderStatus(providerId, { isBusy: true });

    // STEP 5: Start real-time tracking
    startLocationTracking(requestId, providerId);

    // Notify customer
    console.log('✅ Customer notified: Provider accepted and is on the way!');

    return {
      success: true,
      request,
      travelDistance: distance.toFixed(2),
      travelFee
    };
  } catch (error) {
    console.error('❌ Accept request error:', error);
    return {
      success: false,
      error: 'Failed to accept request'
    };
  }
};

/**
 * STEP 5: Real-Time Location Tracking
 * Update provider location every 5 seconds
 */
let trackingIntervals = {};

export const startLocationTracking = (requestId, providerId) => {
  // Clear existing interval if any
  if (trackingIntervals[requestId]) {
    clearInterval(trackingIntervals[requestId]);
  }

  console.log(`📍 Started location tracking for request ${requestId}`);

  trackingIntervals[requestId] = setInterval(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      
      // Update provider location in request
      const requests = await getAllServiceRequests();
      const request = requests.find(r => r.id === requestId);
      
      if (!request || request.status === 'completed' || request.status === 'cancelled') {
        stopLocationTracking(requestId);
        return;
      }

      // Calculate remaining distance and ETA
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        request.latitude,
        request.longitude
      );
      const eta = Math.ceil(distance * 3); // Rough estimate: 3 min per km

      // Update location
      request.providerLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString()
      };
      request.currentDistance = parseFloat(distance.toFixed(2));
      request.eta = eta;

      const requestIndex = requests.findIndex(r => r.id === requestId);
      requests[requestIndex] = request;
      await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));

      console.log(`📍 Location updated: ${distance.toFixed(2)} km away, ETA: ${eta} min`);

      // Notify when provider is nearby
      if (distance < 0.5 && !request.nearbyNotified) {
        request.nearbyNotified = true;
        console.log('🔔 Provider is nearby! Less than 500m away');
      }
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  }, LOCATION_UPDATE_INTERVAL);
};

export const stopLocationTracking = (requestId) => {
  if (trackingIntervals[requestId]) {
    clearInterval(trackingIntervals[requestId]);
    delete trackingIntervals[requestId];
    console.log(`⏹️ Stopped location tracking for request ${requestId}`);
  }
};

/**
 * STEP 7: Start Job
 * Provider clicks "Start Job" when reaching customer
 */
export const startJob = async (requestId) => {
  try {
    const requests = await getAllServiceRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }

    requests[requestIndex].status = 'in_progress';
    requests[requestIndex].startedAt = new Date().toISOString();

    await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));

    // Stop location tracking
    stopLocationTracking(requestId);

    console.log('✅ Job started');

    return { success: true, request: requests[requestIndex] };
  } catch (error) {
    console.error('❌ Start job error:', error);
    return { success: false, error: 'Failed to start job' };
  }
};

/**
 * STEP 7: Complete Job
 * Provider clicks "Complete Job" and enters service fee
 */
export const completeJob = async (requestId, serviceFee) => {
  try {
    const requests = await getAllServiceRequests(null);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }

    const request = requests[requestIndex];
    const totalAmount = (request.travelFee || 0) + (serviceFee || 0);

    request.status = 'completed';
    request.serviceFee = serviceFee;
    request.totalAmount = totalAmount;
    request.completedAt = new Date().toISOString();

    requests[requestIndex] = request;
    await setAllServiceRequests(requests, request.customerId);

    // Write to user's service history
    if (request.customerId) {
      await addServiceHistory(request.customerId, {
        serviceType: request.serviceName,
        providerName: request.providerName || 'Provider',
        date: request.completedAt,
        amount: totalAmount,
        status: 'completed',
        rating: 0,
        requestId,
      });
    }

    await updateProviderStatus(request.selectedProviderId, { isBusy: false });

    return { success: true, request, totalAmount };
  } catch (error) {
    console.error('❌ Complete job error:', error);
    return { success: false, error: 'Failed to complete job' };
  }
};

/**
 * STEP 9: Rate Service
 * Customer rates provider after completion
 */
export const rateService = async (requestId, rating, review = '') => {
  try {
    const requests = await getAllServiceRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }

    requests[requestIndex].rating = rating;
    requests[requestIndex].review = review;
    requests[requestIndex].ratedAt = new Date().toISOString();

    await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));

    // Update provider rating
    await updateProviderRating(requests[requestIndex].selectedProviderId, rating);

    console.log(`⭐ Service rated: ${rating} stars`);

    return { success: true };
  } catch (error) {
    console.error('❌ Rate service error:', error);
    return { success: false, error: 'Failed to rate service' };
  }
};

/**
 * Cancel Service Request
 * Apply cancellation rules
 */
export const cancelServiceRequest = async (requestId, cancelledBy, reason = '') => {
  try {
    const requests = await getAllServiceRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found' };
    }

    const request = requests[requestIndex];

    // Apply penalty logic if provider cancels after accepting
    if (cancelledBy === 'provider' && request.status === 'accepted') {
      await applyProviderPenalty(request.selectedProviderId);
    }

    request.status = 'cancelled';
    request.cancelledBy = cancelledBy;
    request.cancellationReason = reason;
    request.cancelledAt = new Date().toISOString();

    requests[requestIndex] = request;
    await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));

    // Stop tracking
    stopLocationTracking(requestId);

    // Mark provider as available if they were assigned
    if (request.selectedProviderId) {
      await updateProviderStatus(request.selectedProviderId, { isBusy: false });
    }

    console.log(`❌ Request cancelled by ${cancelledBy}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Cancel request error:', error);
    return { success: false, error: 'Failed to cancel request' };
  }
};

/**
 * Get Available Requests for Provider
 * Only show requests that are searching and match provider's services
 */
export const getAvailableRequests = async (providerId) => {
  try {
    const requests = await getAllServiceRequests();
    const provider = await getProviderById(providerId);
    
    if (!provider) {
      return { success: false, error: 'Provider not found', requests: [] };
    }

    // Filter requests
    const available = requests.filter(request => {
      // Only searching requests
      if (request.status !== 'searching') return false;
      
      // Check if provider offers this service
      const hasService = provider.services?.some(s => 
        s.id === request.serviceType || 
        s.name?.toLowerCase().includes(request.serviceType.toLowerCase())
      );
      if (!hasService) return false;
      
      // Check distance
      if (provider.currentLocation) {
        const distance = calculateDistance(
          provider.currentLocation.latitude,
          provider.currentLocation.longitude,
          request.latitude,
          request.longitude
        );
        
        // Add distance to request for display
        request.distanceFromProvider = parseFloat(distance.toFixed(2));
        
        return distance <= DEFAULT_RADIUS_KM;
      }
      
      return false;
    });

    // Sort by distance
    available.sort((a, b) => a.distanceFromProvider - b.distanceFromProvider);

    return {
      success: true,
      requests: available
    };
  } catch (error) {
    console.error('❌ Get available requests error:', error);
    return { success: false, error: 'Failed to get requests', requests: [] };
  }
};

/**
 * Get Customer's Requests
 */
export const getCustomerRequests = async (customerId) => {
  try {
    // Use user-scoped storage directly
    const requests = await getAllServiceRequests(customerId);
    const customerRequests = requests.filter(r => r.customerId === customerId);
    customerRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, requests: customerRequests };
  } catch (error) {
    console.error('❌ Get customer requests error:', error);
    return { success: false, error: 'Failed to get requests', requests: [] };
  }
};

/**
 * Get Request by ID
 */
export const getRequestById = async (requestId) => {
  try {
    const requests = await getAllServiceRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    return { success: true, request };
  } catch (error) {
    console.error('❌ Get request error:', error);
    return { success: false, error: 'Failed to get request' };
  }
};

// Helper Functions

/**
 * Get all service requests — user-scoped when customerId provided
 */
const getAllServiceRequests = async (customerId) => {
  try {
    if (customerId) {
      return await getUserRequests(customerId);
    }
    const stored = await AsyncStorage.getItem(SERVICE_REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Save service requests — user-scoped when customerId provided
 */
const setAllServiceRequests = async (requests, customerId) => {
  try {
    if (customerId) {
      await saveServiceRequests(customerId, requests);
    } else {
      await AsyncStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error('setAllServiceRequests error:', error);
  }
};

const getAllProviders = async () => {
  try {
    const stored = await AsyncStorage.getItem(PROVIDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const getProviderById = async (providerId) => {
  const providers = await getAllProviders();
  return providers.find(p => p.id === providerId);
};

const updateProviderStatus = async (providerId, updates) => {
  try {
    const providers = await getAllProviders();
    const index = providers.findIndex(p => p.id === providerId);
    if (index !== -1) {
      providers[index] = { ...providers[index], ...updates };
      await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
    }
  } catch (error) {
    console.error('Update provider status error:', error);
  }
};

const updateProviderRating = async (providerId, newRating) => {
  try {
    const providers = await getAllProviders();
    const index = providers.findIndex(p => p.id === providerId);
    if (index !== -1) {
      const provider = providers[index];
      const totalJobs = (provider.totalJobs || 0) + 1;
      const currentRating = provider.rating || 0;
      const newAvgRating = ((currentRating * (totalJobs - 1)) + newRating) / totalJobs;
      
      provider.rating = parseFloat(newAvgRating.toFixed(1));
      provider.totalJobs = totalJobs;
      
      await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
    }
  } catch (error) {
    console.error('Update provider rating error:', error);
  }
};

const applyProviderPenalty = async (providerId) => {
  // Implement penalty logic
  console.log(`⚠️ Penalty applied to provider ${providerId}`);
};

/**
 * Get Nearby Providers filtered by service type
 * Used in the new booking flow: customer sees providers BEFORE creating a request
 */
export const getNearbyProvidersByService = async (serviceType, customerLocation, radiusKm = 10) => {
  try {
    // Mock providers for Expo Go - replace with Firestore query in production
    const MOCK_PROVIDERS = [
      {
        id: 'p1', name: 'Ahmed Khan', serviceType: 'plumber', serviceName: 'Plumber',
        rating: 4.8, totalReviews: 124, pricePerJob: 800, priceLabel: 'Rs. 800/job',
        distance: 1.2, eta: 8, isAvailable: true, isOnline: true,
        avatar: null, initials: 'AK',
        completedJobs: 312, memberSince: '2022',
        bio: 'Expert in pipe fitting, leakage repair, and bathroom installations.',
        currentLocation: { latitude: customerLocation.latitude + 0.01, longitude: customerLocation.longitude + 0.01 },
      },
      {
        id: 'p2', name: 'Bilal Raza', serviceType: 'plumber', serviceName: 'Plumber',
        rating: 4.5, totalReviews: 87, pricePerJob: 650, priceLabel: 'Rs. 650/job',
        distance: 2.4, eta: 14, isAvailable: true, isOnline: true,
        avatar: null, initials: 'BR',
        completedJobs: 198, memberSince: '2023',
        bio: 'Specializes in water heater repair and drainage systems.',
        currentLocation: { latitude: customerLocation.latitude + 0.02, longitude: customerLocation.longitude - 0.01 },
      },
      {
        id: 'p3', name: 'Hassan Ali', serviceType: 'electrician', serviceName: 'Electrician',
        rating: 4.9, totalReviews: 203, pricePerJob: 900, priceLabel: 'Rs. 900/job',
        distance: 0.8, eta: 5, isAvailable: true, isOnline: true,
        avatar: null, initials: 'HA',
        completedJobs: 445, memberSince: '2021',
        bio: 'Certified electrician. Wiring, panel upgrades, and appliance repair.',
        currentLocation: { latitude: customerLocation.latitude - 0.005, longitude: customerLocation.longitude + 0.008 },
      },
      {
        id: 'p4', name: 'Usman Sheikh', serviceType: 'electrician', serviceName: 'Electrician',
        rating: 4.3, totalReviews: 56, pricePerJob: 700, priceLabel: 'Rs. 700/job',
        distance: 3.1, eta: 18, isAvailable: false, isOnline: true,
        avatar: null, initials: 'US',
        completedJobs: 89, memberSince: '2023',
        bio: 'Handles all electrical faults, fan installation, and AC wiring.',
        currentLocation: { latitude: customerLocation.latitude + 0.03, longitude: customerLocation.longitude + 0.02 },
      },
      {
        id: 'p5', name: 'Tariq Mehmood', serviceType: 'carpenter', serviceName: 'Carpenter',
        rating: 4.7, totalReviews: 91, pricePerJob: 1200, priceLabel: 'Rs. 1200/job',
        distance: 1.8, eta: 11, isAvailable: true, isOnline: true,
        avatar: null, initials: 'TM',
        completedJobs: 167, memberSince: '2022',
        bio: 'Custom furniture, door/window repair, and wood polishing.',
        currentLocation: { latitude: customerLocation.latitude - 0.015, longitude: customerLocation.longitude - 0.01 },
      },
      {
        id: 'p6', name: 'Imran Butt', serviceType: 'painter', serviceName: 'Painter',
        rating: 4.6, totalReviews: 73, pricePerJob: 1500, priceLabel: 'Rs. 1500/job',
        distance: 2.9, eta: 17, isAvailable: true, isOnline: true,
        avatar: null, initials: 'IB',
        completedJobs: 134, memberSince: '2022',
        bio: 'Interior and exterior painting. Wall texture and waterproofing.',
        currentLocation: { latitude: customerLocation.latitude + 0.025, longitude: customerLocation.longitude - 0.02 },
      },
      {
        id: 'p7', name: 'Zubair Malik', serviceType: 'ac_repair', serviceName: 'AC Repair',
        rating: 4.4, totalReviews: 112, pricePerJob: 1000, priceLabel: 'Rs. 1000/job',
        distance: 4.2, eta: 22, isAvailable: true, isOnline: false,
        avatar: null, initials: 'ZM',
        completedJobs: 278, memberSince: '2021',
        bio: 'AC installation, gas refilling, and cooling system maintenance.',
        currentLocation: { latitude: customerLocation.latitude - 0.04, longitude: customerLocation.longitude + 0.03 },
      },
      {
        id: 'p8', name: 'Faisal Qureshi', serviceType: 'cleaning', serviceName: 'Cleaning',
        rating: 4.2, totalReviews: 45, pricePerJob: 500, priceLabel: 'Rs. 500/job',
        distance: 1.5, eta: 9, isAvailable: true, isOnline: true,
        avatar: null, initials: 'FQ',
        completedJobs: 67, memberSince: '2023',
        bio: 'Deep cleaning, sofa cleaning, and carpet washing services.',
        currentLocation: { latitude: customerLocation.latitude + 0.012, longitude: customerLocation.longitude + 0.015 },
      },
    ];

    // Normalize service type for matching
    const normalizedType = serviceType?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

    // Filter by service type
    const filtered = MOCK_PROVIDERS.filter(p => {
      const pType = p.serviceType.toLowerCase();
      return (
        pType === normalizedType ||
        pType.includes(normalizedType) ||
        normalizedType.includes(pType) ||
        p.serviceName.toLowerCase().includes(serviceType?.toLowerCase() || '')
      );
    });

    // Filter by radius
    const nearby = filtered.filter(p => p.distance <= radiusKm);

    // Sort by distance (nearest first)
    nearby.sort((a, b) => a.distance - b.distance);

    return { success: true, providers: nearby };
  } catch (error) {
    console.error('getNearbyProvidersByService error:', error);
    return { success: false, providers: [], error: error.message };
  }
};

export default {
  createServiceRequest,
  matchNearbyProviders,
  acceptServiceRequest,
  startLocationTracking,
  stopLocationTracking,
  startJob,
  completeJob,
  rateService,
  cancelServiceRequest,
  getAvailableRequests,
  getCustomerRequests,
  getRequestById,
  calculateDistance,
  calculateTravelFee,
  RATE_PER_KM,
  DEFAULT_RADIUS_KM
};
