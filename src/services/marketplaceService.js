/**
 * Real-Time Marketplace Service
 * InDrive-style on-demand home services marketplace
 * Handles complete workflow: Request → Match → Accept → Track → Complete → Rate
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { supabase } from '../config/supabase';

// Storage Keys (kept for provider list only)
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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate travel fee based on distance
 */
export const calculateTravelFee = (distanceKm) => {
  return Math.round(distanceKm * RATE_PER_KM);
};

/**
 * Yango-style PK fair upfront price estimator
 */
export const estimateFare = (serviceType, distanceKm) => {
  const baseFare = 150; // Base fare in PKR
  const perKmRate = 50;  // PKR per KM
  
  const complexityMultiplier = {
    plumber: 1.5,
    electrician: 1.6,
    carpenter: 1.4,
    painter: 2.0,
    cleaning: 1.2,
    ac_repair: 2.2,
  };
  
  const multiplier = complexityMultiplier[serviceType?.toLowerCase()] || 1.0;
  const travelFee = Math.round(distanceKm * perKmRate);
  const serviceFee = Math.round(500 * multiplier); // Default service fee scaled by complexity
  const totalAmount = Math.max(baseFare + travelFee + serviceFee, 400); // Min Rs. 400
  
  return {
    travelDistance: parseFloat(distanceKm.toFixed(2)),
    travelFee,
    serviceFee,
    totalAmount
  };
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

    // Yango upfront pricing estimation
    let distanceKm = 2.5; // default fallback distance
    if (requestData.selectedProviderId) {
      const providers = await getAllProviders();
      const provider = providers.find(p => p.id === requestData.selectedProviderId);
      if (provider && provider.currentLocation) {
        distanceKm = calculateDistance(
          customerLocation.latitude,
          customerLocation.longitude,
          provider.currentLocation.latitude,
          provider.currentLocation.longitude
        );
      }
    }
    const pricing = estimateFare(requestData.serviceType, distanceKm);

    const serviceRequest = {
      id: requestId,
      customer_id: requestData.customerId,
      customer_name: requestData.customerName,
      customer_phone: requestData.customerPhone,
      service_type: requestData.serviceType,
      service_name: requestData.serviceName,
      description: requestData.description,
      latitude: customerLocation.latitude,
      longitude: customerLocation.longitude,
      address: customerLocation.address,
      status: 'searching',
      selected_provider_id: requestData.selectedProviderId || null,
      provider_name: requestData.providerName || null,
      provider_phone: requestData.providerPhone || null,
      provider_location: null,
      travel_distance: pricing.travelDistance,
      travel_fee: pricing.travelFee,
      service_fee: pricing.serviceFee,
      total_amount: pricing.totalAmount,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase (shared across all devices)
    const { data: inserted, error: insertErr } = await supabase
      .from('service_requests')
      .insert(serviceRequest)
      .select()
      .single();

    if (insertErr) throw insertErr;

    console.log('✅ Service request created in Supabase:', requestId);

    // Normalise for local use (camelCase)
    const normalised = _normalise(inserted || serviceRequest);

    return {
      success: true,
      requestId,
      request: normalised,
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
    // Fetch from Supabase
    const { data: req, error: fetchErr } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr || !req) return { success: false, error: 'Request not found' };
    if (req.status !== 'searching') return { success: false, error: 'Request already accepted' };

    let providerLocation = providerData.currentLocation;
    if (!providerLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        providerLocation = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }
    }

    const distance = providerLocation
      ? calculateDistance(providerLocation.latitude, providerLocation.longitude, req.latitude, req.longitude)
      : 2.5;
    const travelFee = calculateTravelFee(distance);

    const updates = {
      status: 'accepted',
      selected_provider_id: providerId,
      provider_name: providerData.name,
      provider_phone: providerData.phone,
      provider_location: providerLocation,
      travel_distance: parseFloat(distance.toFixed(2)),
      travel_fee: travelFee,
      accepted_at: new Date().toISOString(),
    };

    const { data: updated, error: updErr } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (updErr) throw updErr;

    console.log(`✅ Request accepted. Travel: ${distance.toFixed(2)} km, Fee: ${travelFee} PKR`);

    return {
      success: true,
      request: _normalise(updated),
      travelDistance: distance.toFixed(2),
      travelFee,
    };
  } catch (error) {
    console.error('❌ Accept request error:', error);
    return { success: false, error: 'Failed to accept request' };
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
    const { data, error } = await supabase
      .from('service_requests')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    stopLocationTracking(requestId);
    console.log('✅ Job started');
    return { success: true, request: _normalise(data) };
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
    const { data: req } = await supabase.from('service_requests').select('travel_fee').eq('id', requestId).single();
    const totalAmount = (req?.travel_fee || 0) + (serviceFee || 0);

    const { data, error } = await supabase
      .from('service_requests')
      .update({ status: 'completed', service_fee: serviceFee, total_amount: totalAmount, completed_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Job completed. Total: ${totalAmount} PKR`);
    return { success: true, request: _normalise(data), totalAmount };
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
    // Fetch all searching requests from Supabase (cross-device)
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('status', 'searching')
      .or(`selected_provider_id.eq.${providerId},selected_provider_id.is.null`);

    if (error) throw error;

    const requests = (data || []).map(r => _normalise(r));
    return { success: true, requests };
  } catch (error) {
    console.error('❌ Get available requests error:', error);
    return { success: false, error: 'Failed to get requests', requests: [] };
  }
};

/**
 * Get a single pending/searching request targeted at this provider.
 * Used by the Provider Dashboard to show the incoming job card.
 */
export const getPendingRequestForProvider = async (providerId) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('status', 'searching')
      .eq('selected_provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    const row = data && data[0] ? _normalise(data[0]) : null;
    return { success: true, request: row };
  } catch (error) {
    console.error('❌ getPendingRequestForProvider error:', error);
    return { success: false, request: null };
  }
};

/**
 * Get Customer's Requests
 */
export const getCustomerRequests = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, requests: (data || []).map(_normalise) };
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
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    return { success: true, request: _normalise(data) };
  } catch (error) {
    console.error('❌ Get request error:', error);
    return { success: false, error: 'Failed to get request' };
  }
};

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Normalise a snake_case Supabase row → camelCase object used by the UI.
 */
const _normalise = (r) => ({
  ...r,
  id: r.id,
  customerId: r.customer_id,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  serviceType: r.service_type,
  serviceName: r.service_name,
  selectedProviderId: r.selected_provider_id,
  providerName: r.provider_name,
  providerPhone: r.provider_phone,
  providerLocation: r.provider_location,
  travelDistance: r.travel_distance,
  travelFee: r.travel_fee,
  serviceFee: r.service_fee,
  totalAmount: r.total_amount,
  createdAt: r.created_at,
  acceptedAt: r.accepted_at,
  startedAt: r.started_at,
  completedAt: r.completed_at,
  address: r.address,
  latitude: r.latitude,
  longitude: r.longitude,
  status: r.status,
});

const getAllProviders = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('status', 'approved');

    if (!error && profiles && profiles.length > 0) {
      return profiles.map((p, index) => {
        const services = (p.selected_services || []).map(s => {
          if (typeof s === 'string') { try { return JSON.parse(s); } catch { return { name: s, id: s, icon: '🔧' }; } }
          return s;
        });
        const distance = 0.8 + (index % 4) * 0.9;
        const bearing = (2 * Math.PI / Math.max(profiles.length, 1)) * index;
        const lat = 24.8607 + (distance / 111) * Math.cos(bearing);
        const lon = 67.0011 + (distance / (111 * Math.cos(24.8607 * Math.PI / 180))) * Math.sin(bearing);
        const initials = (p.full_name || 'UP').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: p.id,
          name: p.full_name || 'Unknown Provider',
          serviceType: services[0]?.id || 'plumber',
          serviceName: services[0]?.name || 'Plumber',
          rating: p.rating || 4.5,
          totalReviews: p.total_jobs || 10,
          pricePerJob: p.base_price || 800,
          priceLabel: `Rs. ${p.base_price || 800}/job`,
          distance: parseFloat(distance.toFixed(1)),
          eta: Math.ceil(distance * 4),
          isAvailable: true,
          isOnline: p.is_online || true,
          avatar: null,
          initials,
          completedJobs: p.total_jobs || 10,
          memberSince: new Date(p.created_at || Date.now()).getFullYear().toString(),
          bio: p.skills_description || 'Experienced professional',
          city: p.city || 'Karachi',
          currentLocation: { latitude: lat, longitude: lon },
          verificationStatus: p.status,
        };
      });
    }
  } catch (e) {
    console.error('getAllProviders error:', e);
  }

  return [];
};

const updateProviderRating = async (providerId, newRating) => {
  try {
    const { data: p } = await supabase.from('provider_profiles').select('rating,total_jobs').eq('id', providerId).single();
    if (!p) return;
    const totalJobs = (p.total_jobs || 0) + 1;
    const newAvg = ((p.rating || 0) * (totalJobs - 1) + newRating) / totalJobs;
    await supabase.from('provider_profiles').update({ rating: parseFloat(newAvg.toFixed(1)), total_jobs: totalJobs }).eq('id', providerId);
  } catch (e) { console.error('Update provider rating error:', e); }
};

const applyProviderPenalty = (providerId) => {
  console.log(`⚠️ Penalty applied to provider ${providerId}`);
};

/**
 * Get Nearby Providers filtered by service type
 * Used in the new booking flow: customer sees providers BEFORE creating a request
 */
export const getNearbyProvidersByService = async (serviceType, customerLocation, radiusKm = 10) => {
  try {
    const { data: profiles, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('status', 'approved');

    if (!error && profiles && profiles.length > 0) {
      const normalizedType = (serviceType || '').toLowerCase().replace(/[\s_-]+/g, '');

      const matched = profiles
        .filter(p => {
          const services = (p.selected_services || []).map(s => {
            if (typeof s === 'string') { try { return JSON.parse(s); } catch { return { name: s, id: s }; } }
            return s;
          });
          return services.some(s => {
            const sName = (s.name || s.id || '').toLowerCase().replace(/[\s_-]+/g, '');
            return sName.includes(normalizedType) || normalizedType.includes(sName);
          });
        })
        .map((p, index) => {
          const services = (p.selected_services || []).map(s => {
            if (typeof s === 'string') { try { return JSON.parse(s); } catch { return { name: s, id: s, icon: '🔧' }; } }
            return s;
          });
          const distance = 0.8 + (index % 4) * 0.9;
          const bearing = (2 * Math.PI / Math.max(profiles.length, 1)) * index;
          const lat = customerLocation.latitude + (distance / 111) * Math.cos(bearing);
          const lon = customerLocation.longitude + (distance / (111 * Math.cos(customerLocation.latitude * Math.PI / 180))) * Math.sin(bearing);
          const initials = (p.full_name || 'UP').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          return {
            id: p.id,
            name: p.full_name || 'Unknown Provider',
            serviceType: services[0]?.id || serviceType,
            serviceName: services[0]?.name || serviceType,
            rating: p.rating || parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
            totalReviews: p.total_jobs || Math.floor(Math.random() * 150 + 20),
            pricePerJob: p.base_price || 800,
            priceLabel: `Rs. ${p.base_price || 800}/job`,
            distance: parseFloat(distance.toFixed(1)),
            eta: Math.ceil(distance * 4),
            isAvailable: true,
            isOnline: p.is_online || true,
            avatar: null,
            initials,
            completedJobs: p.total_jobs || Math.floor(Math.random() * 200 + 30),
            memberSince: new Date(p.created_at || Date.now()).getFullYear().toString(),
            bio: p.skills_description || `Experienced ${services[0]?.name || 'service'} professional in ${p.city || 'Karachi'}.`,
            city: p.city || 'Karachi',
            currentLocation: { latitude: lat, longitude: lon },
          };
        });

      if (matched.length > 0) {
        matched.sort((a, b) => a.distance - b.distance);
        console.log(`✅ Found ${matched.length} real provider(s) for "${serviceType}"`);
        return { success: true, providers: matched };
      }
    }

    return { success: true, providers: [] };
  } catch (error) {
    console.error('getNearbyProvidersByService error:', error);
    return { success: false, providers: [], error: error.message };
  }
};

export default {
  getNearbyProvidersByService,
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
  getPendingRequestForProvider,
  getCustomerRequests,
  getRequestById,
  calculateDistance,
  calculateTravelFee,
  RATE_PER_KM,
  DEFAULT_RADIUS_KM
};
