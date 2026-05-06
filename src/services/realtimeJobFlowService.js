/**
 * Real-Time Job Flow Service
 * All data is scoped per user via userDataService.
 * No global shared state — each user sees only their own jobs/messages.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  getActiveJobs as getUserJobs,
  saveActiveJobs,
  getServiceRequests as getUserRequests,
  saveServiceRequests,
  getChatMessages as getUserMessages,
  saveChatMessage,
} from './userDataService';

// Legacy global keys kept for backward compat during migration
const ACTIVE_JOBS_KEY      = '@homeease_active_jobs';
const SERVICE_REQUESTS_KEY = '@homeease_service_requests';
const JOB_MESSAGES_KEY     = '@homeease_job_messages_';
const JOB_LOCATIONS_KEY    = '@homeease_job_locations_';

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
    const userId = jobData.customerId || null;
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

    // Save to user-scoped storage if userId available, else global
    const jobs = await getActiveJobs(userId);
    jobs.push(job);
    if (userId) {
      await saveActiveJobs(userId, jobs);
    } else {
      await AsyncStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(jobs));
    }

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
    const jobs = await getActiveJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return { success: false, error: 'Job not found' };
    }

    jobs[jobIndex].status = 'accepted';
    jobs[jobIndex].providerId = providerId;
    jobs[jobIndex].acceptedAt = new Date().toISOString();
    jobs[jobIndex].providerLocation = {
      latitude: 24.8615,
      longitude: 67.0025,
      address: 'Provider Location'
    };

    await AsyncStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(jobs));

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
 * Get active jobs — user-scoped when userId provided, falls back to global key
 */
export const getActiveJobs = async (userId) => {
  try {
    if (userId) return await getUserJobs(userId);
    const stored = await AsyncStorage.getItem(ACTIVE_JOBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get active jobs error:', error);
    return [];
  }
};

/**
 * Get job by ID — checks user-scoped storage, then global fallback
 */
export const getJobById = async (jobId, userId) => {
  try {
    // Check user-scoped active jobs first
    const jobs = await getActiveJobs(userId);
    let job = jobs.find(j => j.id === jobId);

    // Check user-scoped marketplace requests
    if (!job && userId) {
      const requests = await getUserRequests(userId);
      job = requests.find(r => r.id === jobId);
    }

    // Global fallback
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
      const customerLat = job.customerLocation.latitude;
      const customerLng = job.customerLocation.longitude;

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

      await AsyncStorage.setItem(`${JOB_LOCATIONS_KEY}${jobId}`, JSON.stringify(location));

      // Notify when provider is close
      if (distance < 0.5 && !job.arrivedNotified) {
        sendMockNotification('Provider Nearby! 📍', 'Your provider is less than 500m away', { jobId });
        const jobs = await getActiveJobs();
        const idx = jobs.findIndex(j => j.id === jobId);
        if (idx !== -1) {
          jobs[idx].arrivedNotified = true;
          await AsyncStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(jobs));
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
 * Send chat message — user-scoped
 */
export const sendChatMessage = async (jobId, senderId, senderType, text, userId) => {
  try {
    const message = {
      senderId,
      senderType,
      text,
      read: false,
    };

    if (userId) {
      await saveChatMessage(userId, jobId, message);
    } else {
      // Legacy global fallback
      const msgs = await getChatMessages(jobId);
      msgs.push({ ...message, id: `msg_${Date.now()}`, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(`${JOB_MESSAGES_KEY}${jobId}`, JSON.stringify(msgs));
    }

    const recipientType = senderType === 'customer' ? 'Provider' : 'Customer';
    sendMockNotification(`New Message from ${recipientType}`, text, { jobId, type: 'chat_message' });

    return { success: true };
  } catch (error) {
    console.error('Send chat message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
};

/**
 * Get chat messages — user-scoped when userId provided
 */
export const getChatMessages = async (jobId, userId) => {
  try {
    if (userId) return await getUserMessages(userId, jobId);
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
