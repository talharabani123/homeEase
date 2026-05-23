/**
 * Real-Time Job Flow Service
 * Manages complete job lifecycle with notifications, chat, and tracking
 * Mock implementation for Expo Go - Replace with Firebase in production
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const ACTIVE_JOBS_KEY = '@homeease_active_jobs';
const SERVICE_REQUESTS_KEY = '@marketplace_service_requests'; // Must match marketplaceService.js
const JOB_MESSAGES_KEY = '@homeease_job_messages_';
const JOB_LOCATIONS_KEY = '@homeease_job_locations_';

// Mock notification function (replace with FCM in production)
export const sendMockNotification = (title, body, data = {}) => {
  console.log('📱 Notification:', title, body, data);
  // In production: use expo-notifications or FCM
  Alert.alert(title, body);
};

/**
 * Create new job request from customer
 */
export const createJobRequest = async (jobData) => {
  try {
    const jobId = `job_${Date.now()}`;
    const job = {
      id: jobId,
      ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customerLocation: jobData.location || {
        latitude: 24.8607,
        longitude: 67.0011,
        address: jobData.address || 'Karachi, Pakistan'
      }
    };

    // Save job
    const jobs = await getActiveJobs();
    jobs.push(job);
    await AsyncStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(jobs));

    // Notify matching online providers (mock)
    setTimeout(() => {
      sendMockNotification(
        'New Job Request! 🔔',
        `${job.serviceName} - Rs. ${job.price}\n${job.customerLocation.address}`,
        { jobId, type: 'new_job' }
      );
    }, 1000);

    return { success: true, jobId, job };
  } catch (error) {
    console.error('Create job request error:', error);
    return { success: false, error: 'Failed to create job request' };
  }
};

/**
 * Provider accepts job
 */
export const acceptJobRequest = async (jobId, providerId) => {
  try {
    if (jobId && jobId.startsWith('req_')) {
      const { getProviderProfile } = require('./supabaseProviderService');
      const profileResult = await getProviderProfile();
      const providerData = {
        name: profileResult.success && profileResult.data ? (profileResult.data.fullName || profileResult.data.name || 'Provider') : 'Provider',
        phone: profileResult.success && profileResult.data ? (profileResult.data.phone || '+92 300 0000000') : '+92 300 0000000',
        currentLocation: null
      };

      const { acceptServiceRequest } = require('./marketplaceService');
      const result = await acceptServiceRequest(jobId, providerId, providerData);
      
      if (result.success) {
        // Start mock location tracking simulation
        startLocationTracking(jobId);
        return { success: true, job: result.request };
      } else {
        return { success: false, error: result.error || 'Failed to accept request' };
      }
    }

    let jobs = await getActiveJobs();
    let jobIndex = jobs.findIndex(j => j.id === jobId);
    let isMarketplace = false;
    
    if (jobIndex === -1) {
      const marketplaceData = await AsyncStorage.getItem(SERVICE_REQUESTS_KEY);
      jobs = marketplaceData ? JSON.parse(marketplaceData) : [];
      jobIndex = jobs.findIndex(j => j.id === jobId);
      isMarketplace = true;
    }
    
    if (jobIndex === -1) {
      return { success: false, error: 'Job not found' };
    }

    jobs[jobIndex].status = 'accepted';
    jobs[jobIndex].providerId = providerId;
    jobs[jobIndex].selectedProviderId = providerId;
    jobs[jobIndex].acceptedAt = new Date().toISOString();
    jobs[jobIndex].providerLocation = {
      latitude: 24.8615,
      longitude: 67.0025,
      address: 'Provider Location'
    };

    // Fetch provider name/phone to populate request
    const { getProviderProfile } = require('./supabaseProviderService');
    const profileResult = await getProviderProfile();
    if (profileResult.success && profileResult.data) {
      jobs[jobIndex].providerName = profileResult.data.fullName || profileResult.data.name || 'Provider';
      jobs[jobIndex].providerPhone = profileResult.data.phone || '+92 300 0000000';
    }

    // Calculate distance and travel fee Yango-style
    const distance = calculateDistance(
      jobs[jobIndex].providerLocation.latitude,
      jobs[jobIndex].providerLocation.longitude,
      jobs[jobIndex].latitude || jobs[jobIndex].customerLocation?.latitude || 24.8607,
      jobs[jobIndex].longitude || jobs[jobIndex].customerLocation?.longitude || 67.0011
    );
    jobs[jobIndex].travelDistance = parseFloat(distance.toFixed(2));
    jobs[jobIndex].travelFee = Math.round(150 + distance * 50); // Yango PK: 150 base + 50/km
    jobs[jobIndex].serviceFee = jobs[jobIndex].serviceFee || 500;
    jobs[jobIndex].totalAmount = jobs[jobIndex].travelFee + jobs[jobIndex].serviceFee;

    const storageKey = isMarketplace ? SERVICE_REQUESTS_KEY : ACTIVE_JOBS_KEY;
    await AsyncStorage.setItem(storageKey, JSON.stringify(jobs));

    // Notify customer
    sendMockNotification(
      'Provider Accepted! ✅',
      'Your service provider is on the way!',
      { jobId, type: 'job_accepted' }
    );

    // Start location tracking simulation
    startLocationTracking(jobId);

    return { success: true, job: jobs[jobIndex] };
  } catch (error) {
    console.error('Accept job error:', error);
    return { success: false, error: 'Failed to accept job' };
  }
};

/**
 * Get active jobs
 */
export const getActiveJobs = async () => {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_JOBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get active jobs error:', error);
    return [];
  }
};

/**
 * Get job by ID - checks both active jobs and marketplace requests
 */
export const getJobById = async (jobId) => {
  try {
    if (jobId && jobId.startsWith('req_')) {
      const { getRequestById } = require('./marketplaceService');
      const result = await getRequestById(jobId);
      if (result.success) {
        return { success: true, job: result.request };
      }
      return { success: false, error: 'Job not found' };
    }

    // Check active jobs first
    const jobs = await getActiveJobs();
    let job = jobs.find(j => j.id === jobId);
    
    // If not found, check marketplace requests
    if (!job) {
      const marketplaceData = await AsyncStorage.getItem(SERVICE_REQUESTS_KEY);
      const requests = marketplaceData ? JSON.parse(marketplaceData) : [];
      job = requests.find(r => r.id === jobId);
    }
    
    return { success: !!job, job };
  } catch (error) {
    console.error('Get job by ID error:', error);
    return { success: false, error: 'Job not found' };
  }
};

/**
 * Update job status - works with both active jobs and marketplace requests
 */
export const updateJobStatus = async (jobId, status) => {
  try {
    if (jobId && jobId.startsWith('req_')) {
      const { startJob, completeJob } = require('./marketplaceService');
      if (status === 'in_progress') {
        const res = await startJob(jobId);
        if (res.success) {
          return { success: true, job: res.request };
        }
      } else if (status === 'completed') {
        const res = await completeJob(jobId);
        if (res.success) {
          return { success: true, job: res.request };
        }
      }
      return { success: false, error: 'Failed to update status' };
    }

    // Try active jobs first
    let jobs = await getActiveJobs();
    let jobIndex = jobs.findIndex(j => j.id === jobId);
    let isMarketplace = false;
    
    // If not found, try marketplace requests
    if (jobIndex === -1) {
      const marketplaceData = await AsyncStorage.getItem(SERVICE_REQUESTS_KEY);
      jobs = marketplaceData ? JSON.parse(marketplaceData) : [];
      jobIndex = jobs.findIndex(j => j.id === jobId);
      isMarketplace = true;
    }
    
    if (jobIndex === -1) {
      return { success: false, error: 'Job not found' };
    }

    jobs[jobIndex].status = status;
    jobs[jobIndex][`${status}At`] = new Date().toISOString();

    // Save to appropriate storage
    const storageKey = isMarketplace ? SERVICE_REQUESTS_KEY : ACTIVE_JOBS_KEY;
    await AsyncStorage.setItem(storageKey, JSON.stringify(jobs));

    // Send notification based on status
    const notifications = {
      'in_progress': { title: 'Job Started', body: 'Provider has started working' },
      'completed': { title: 'Job Completed', body: 'Please confirm and rate the service' },
      'cancelled': { title: 'Job Cancelled', body: 'This job has been cancelled' }
    };

    if (notifications[status]) {
      sendMockNotification(notifications[status].title, notifications[status].body, { jobId });
    }

    return { success: true, job: jobs[jobIndex] };
  } catch (error) {
    console.error('Update job status error:', error);
    return { success: false, error: 'Failed to update status' };
  }
};

/**
 * Start mock location tracking
 */
let locationInterval = null;
export const startLocationTracking = (jobId) => {
  if (locationInterval) clearInterval(locationInterval);

  // Simulate provider moving towards customer
  locationInterval = setInterval(async () => {
    try {
      const result = await getJobById(jobId);
      if (!result.success || result.job.status === 'completed') {
        stopLocationTracking();
        return;
      }

      const job = result.job;
      const providerLat = job.providerLocation?.latitude || 24.8615;
      const providerLng = job.providerLocation?.longitude || 67.0025;
      const customerLat = job.customerLocation?.latitude || job.latitude || 24.8607;
      const customerLng = job.customerLocation?.longitude || job.longitude || 67.0011;

      // Move provider slightly towards customer
      const newLat = providerLat + (customerLat - providerLat) * 0.1;
      const newLng = providerLng + (customerLng - providerLng) * 0.1;

      // Calculate distance and ETA
      const distance = calculateDistance(newLat, newLng, customerLat, customerLng);
      const eta = Math.ceil(distance * 3); // Rough estimate: 3 min per km

      // Update location
      const location = {
        latitude: newLat,
        longitude: newLng,
        distance: distance.toFixed(2),
        eta,
        timestamp: new Date().toISOString()
      };

      if (jobId && jobId.startsWith('req_')) {
        const { supabase } = require('../config/supabase');
        await supabase
          .from('service_requests')
          .update({
            provider_location: { latitude: newLat, longitude: newLng },
            travel_distance: parseFloat(distance.toFixed(2)),
          })
          .eq('id', jobId);
      } else {
        await AsyncStorage.setItem(`${JOB_LOCATIONS_KEY}${jobId}`, JSON.stringify(location));
      }

      // Notify when provider is close
      if (distance < 0.5 && !job.arrivedNotified) {
        sendMockNotification('Provider Nearby! 📍', 'Your provider is less than 500m away', { jobId });
        if (jobId && jobId.startsWith('req_')) {
          // If in database, we can update an arrived field if we want, or just trigger notification once
        } else {
          const jobs = await getActiveJobs();
          const idx = jobs.findIndex(j => j.id === jobId);
          if (idx !== -1) {
            jobs[idx].arrivedNotified = true;
            await AsyncStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(jobs));
          }
        }
      }
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  }, 10000); // Update every 10 seconds
};

export const stopLocationTracking = () => {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
};

/**
 * Get real-time location for job - checks both storage systems
 */
export const getJobLocation = async (jobId) => {
  try {
    if (jobId && jobId.startsWith('req_')) {
      const { getRequestById } = require('./marketplaceService');
      const res = await getRequestById(jobId);
      if (res.success && res.request && res.request.providerLocation) {
        return {
          latitude: res.request.providerLocation.latitude,
          longitude: res.request.providerLocation.longitude,
          distance: res.request.travelDistance || 0,
          eta: Math.ceil((res.request.travelDistance || 0) * 3),
          timestamp: res.request.acceptedAt || new Date().toISOString()
        };
      }
      return null;
    }

    // First check dedicated location storage
    const stored = await AsyncStorage.getItem(`${JOB_LOCATIONS_KEY}${jobId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If not found, check if it's a marketplace request with embedded location
    const marketplaceData = await AsyncStorage.getItem(SERVICE_REQUESTS_KEY);
    if (marketplaceData) {
      const requests = JSON.parse(marketplaceData);
      const request = requests.find(r => r.id === jobId);
      
      if (request && request.providerLocation) {
        // Return location in the expected format
        return {
          latitude: request.providerLocation.latitude,
          longitude: request.providerLocation.longitude,
          distance: request.currentDistance || request.travelDistance || 0,
          eta: request.eta || Math.ceil((request.currentDistance || request.travelDistance || 0) * 3),
          timestamp: request.providerLocation.timestamp || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get job location error:', error);
    return null;
  }
};

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
 * Send chat message
 */
export const sendChatMessage = async (jobId, senderId, senderType, text) => {
  try {
    const messageId = `msg_${Date.now()}`;
    const message = {
      id: messageId,
      senderId,
      senderType, // 'customer' or 'provider'
      text,
      timestamp: new Date().toISOString(),
      read: false
    };

    const messages = await getChatMessages(jobId);
    messages.push(message);
    await AsyncStorage.setItem(`${JOB_MESSAGES_KEY}${jobId}`, JSON.stringify(messages));

    // Notify recipient
    const recipientType = senderType === 'customer' ? 'Provider' : 'Customer';
    sendMockNotification(`New Message from ${recipientType}`, text, { jobId, type: 'chat_message' });

    return { success: true, message };
  } catch (error) {
    console.error('Send chat message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
};

/**
 * Get chat messages for job
 */
export const getChatMessages = async (jobId) => {
  try {
    const stored = await AsyncStorage.getItem(`${JOB_MESSAGES_KEY}${jobId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get chat messages error:', error);
    return [];
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (jobId, userId) => {
  try {
    const messages = await getChatMessages(jobId);
    const updated = messages.map(msg => {
      if (msg.senderId !== userId) {
        msg.read = true;
      }
      return msg;
    });
    await AsyncStorage.setItem(`${JOB_MESSAGES_KEY}${jobId}`, JSON.stringify(updated));
    return { success: true };
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return { success: false };
  }
};

/**
 * Complete job
 */
export const completeJob = async (jobId) => {
  try {
    const result = await updateJobStatus(jobId, 'completed');
    if (result.success) {
      stopLocationTracking();
    }
    return result;
  } catch (error) {
    console.error('Complete job error:', error);
    return { success: false, error: 'Failed to complete job' };
  }
};

/**
 * Clear all active jobs (for testing)
 */
export const clearAllJobs = async () => {
  try {
    await AsyncStorage.removeItem(ACTIVE_JOBS_KEY);
    stopLocationTracking();
    return { success: true };
  } catch (error) {
    console.error('Clear jobs error:', error);
    return { success: false };
  }
};

export default {
  createJobRequest,
  acceptJobRequest,
  getActiveJobs,
  getJobById,
  updateJobStatus,
  startLocationTracking,
  stopLocationTracking,
  getJobLocation,
  calculateDistance,
  sendChatMessage,
  getChatMessages,
  markMessagesAsRead,
  completeJob,
  clearAllJobs,
  sendMockNotification
};
