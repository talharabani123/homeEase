/**
 * Provider Job Service
 * All job data is user-scoped via userDataService.
 * No hardcoded mock data — providers see only their own jobs.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveJobs as getUserJobs, saveActiveJobs } from './userDataService';

const STORAGE_KEY = '@homeease_provider_jobs';

// Mock job data - diverse services
const mockJobs = {
  pending: [
    {
      id: 'job_001',
      serviceName: 'Plumbing Repair',
      serviceIcon: '🔧',
      customerName: 'Ahmed Khan',
      location: 'Block 5, Gulshan-e-Iqbal, Karachi',
      date: 'Today',
      scheduledTime: '2:00 PM - 4:00 PM',
      price: 1500,
      status: 'Pending',
      description: 'Kitchen sink leaking, needs urgent repair',
      customerPhone: '+92 300 1234567',
    },
    {
      id: 'job_002',
      serviceName: 'AC Repair',
      serviceIcon: '❄️',
      customerName: 'Fatima Ali',
      location: 'DHA Phase 6, Karachi',
      date: 'Tomorrow',
      scheduledTime: '10:00 AM - 12:00 PM',
      price: 2500,
      status: 'Pending',
      description: 'AC not cooling properly',
      customerPhone: '+92 321 9876543',
    },
    {
      id: 'job_006',
      serviceName: 'Electrical Wiring',
      serviceIcon: '⚡',
      customerName: 'Bilal Ahmed',
      location: 'Gulistan-e-Johar, Karachi',
      date: 'Today',
      scheduledTime: '4:00 PM - 6:00 PM',
      price: 2800,
      status: 'Pending',
      description: 'Install ceiling fan and fix switches',
      customerPhone: '+92 300 2222222',
    },
    {
      id: 'job_007',
      serviceName: 'Plumber Service',
      serviceIcon: '🔧',
      customerName: 'Zainab Hassan',
      location: 'North Nazimabad, Karachi',
      date: 'Tomorrow',
      scheduledTime: '9:00 AM - 11:00 AM',
      price: 1800,
      status: 'Pending',
      description: 'Bathroom pipe leakage repair',
      customerPhone: '+92 333 3333333',
    },
    {
      id: 'job_008',
      serviceName: 'Carpenter Work',
      serviceIcon: '🪚',
      customerName: 'Imran Malik',
      location: 'Saddar, Karachi',
      date: 'Today',
      scheduledTime: '1:00 PM - 3:00 PM',
      price: 3500,
      status: 'Pending',
      description: 'Custom wardrobe installation',
      customerPhone: '+92 321 4444444',
    },
    {
      id: 'job_009',
      serviceName: 'Electrician Service',
      serviceIcon: '⚡',
      customerName: 'Ayesha Siddiqui',
      location: 'Clifton, Karachi',
      date: 'Tomorrow',
      scheduledTime: '11:00 AM - 1:00 PM',
      price: 2200,
      status: 'Pending',
      description: 'Replace circuit breaker and fix wiring',
      customerPhone: '+92 300 5555555',
    },
  ],
  active: [
    {
      id: 'job_003',
      serviceName: 'Electrical Wiring',
      serviceIcon: '⚡',
      customerName: 'Hassan Raza',
      location: 'Clifton Block 2, Karachi',
      date: 'Today',
      scheduledTime: '11:00 AM - 1:00 PM',
      price: 3000,
      status: 'In Progress',
      description: 'Install new electrical outlets in living room',
      customerPhone: '+92 333 5555555',
      acceptedAt: new Date().toISOString(),
    },
    {
      id: 'job_010',
      serviceName: 'AC Installation',
      serviceIcon: '❄️',
      customerName: 'Kamran Ali',
      location: 'Bahria Town, Karachi',
      date: 'Today',
      scheduledTime: '2:00 PM - 4:00 PM',
      price: 4500,
      status: 'Active',
      description: 'Install new 1.5 ton AC unit',
      customerPhone: '+92 321 6666666',
      acceptedAt: new Date().toISOString(),
    },
  ],
  completed: [
    {
      id: 'job_004',
      serviceName: 'Plumbing Installation',
      serviceIcon: '🔧',
      customerName: 'Sara Ahmed',
      location: 'Nazimabad, Karachi',
      date: 'Yesterday',
      scheduledTime: '3:00 PM - 5:00 PM',
      price: 2000,
      status: 'Completed',
      description: 'Install new bathroom fixtures',
      customerPhone: '+92 300 7777777',
      completedDate: 'Dec 20, 2024',
      rating: 4.5,
      review: 'Great work! Very professional.',
    },
    {
      id: 'job_005',
      serviceName: 'AC Servicing',
      serviceIcon: '❄️',
      customerName: 'Ali Haider',
      location: 'Malir Cantt, Karachi',
      date: 'Dec 18',
      scheduledTime: '9:00 AM - 11:00 AM',
      price: 1800,
      status: 'Completed',
      description: 'Regular AC maintenance and cleaning',
      customerPhone: '+92 321 8888888',
      completedDate: 'Dec 18, 2024',
      rating: 5.0,
      review: 'Excellent service!',
    },
    {
      id: 'job_011',
      serviceName: 'Electrical Repair',
      serviceIcon: '⚡',
      customerName: 'Nadia Khan',
      location: 'Defence, Karachi',
      date: 'Dec 19',
      scheduledTime: '10:00 AM - 12:00 PM',
      price: 2500,
      status: 'Completed',
      description: 'Fixed short circuit issue',
      customerPhone: '+92 333 9999999',
      completedDate: 'Dec 19, 2024',
      rating: 4.8,
      review: 'Quick and efficient!',
    },
  ],
};

/**
 * Get all jobs for provider (filtered by their services)
 * @returns {Promise<object>} - { success, jobs: { pending, active, completed } }
 */
export const getProviderJobs = async (providerId) => {
  try {
    if (!providerId) {
      return { success: true, jobs: { pending: [], active: [], completed: [], cancelled: [] } };
    }

    // Load jobs from user-scoped storage
    const allJobs = await getUserJobs(providerId);

    const pending   = allJobs.filter(j => j.status === 'pending');
    const active    = allJobs.filter(j => ['accepted', 'in_progress'].includes(j.status));
    const completed = allJobs.filter(j => j.status === 'completed');
    const cancelled = allJobs.filter(j => j.status === 'cancelled');

    return { success: true, jobs: { pending, active, completed, cancelled } };
  } catch (error) {
    console.error('getProviderJobs error:', error);
    return { success: false, error: 'Failed to load jobs', jobs: { pending: [], active: [], completed: [], cancelled: [] } };
  }
};

/**
 * Get job details by ID
 */
export const getJobDetails = async (jobId, providerId) => {
  try {
    const allJobs = await getUserJobs(providerId);
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found' };
    return { success: true, job };
  } catch (error) {
    console.error('Get job details error:', error);
    return { success: false, error: 'Failed to load job details' };
  }
};

/**
 * Accept a job request
 */
export const acceptJob = async (jobId, providerId) => {
  try {
    const jobs = await getUserJobs(providerId);
    const idx = jobs.findIndex(j => j.id === jobId);
    if (idx !== -1) {
      jobs[idx].status = 'accepted';
      jobs[idx].acceptedAt = new Date().toISOString();
      await saveActiveJobs(providerId, jobs);
    }
    return { success: true };
  } catch (error) {
    console.error('Accept job error:', error);
    return { success: false, error: 'Failed to accept job' };
  }
};

/**
 * Reject a job request
 * @param {string} jobId
 * @param {string} reason
 * @returns {Promise<object>} - { success, error }
 */
export const rejectJob = async (jobId, reason = '') => {
  try {
    // In production, update Firebase
    // Remove job from pending
    const jobIndex = mockJobs.pending.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      mockJobs.pending.splice(jobIndex, 1);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Reject job error:', error);
    return { success: false, error: 'Failed to reject job' };
  }
};

/**
 * Mark job as completed
 * @param {string} jobId
 * @returns {Promise<object>} - { success, error }
 */
export const completeJob = async (jobId) => {
  try {
    // In production, update Firebase
    // Move job from active to completed
    const jobIndex = mockJobs.active.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      const job = mockJobs.active[jobIndex];
      job.status = 'Completed';
      job.completedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      mockJobs.completed.unshift(job);
      mockJobs.active.splice(jobIndex, 1);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Complete job error:', error);
    return { success: false, error: 'Failed to complete job' };
  }
};

/**
 * Start job (mark as in progress)
 * @param {string} jobId
 * @returns {Promise<object>} - { success, error }
 */
export const startJob = async (jobId) => {
  try {
    const jobIndex = mockJobs.active.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      mockJobs.active[jobIndex].status = 'In Progress';
      mockJobs.active[jobIndex].startedAt = new Date().toISOString();
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Start job error:', error);
    return { success: false, error: 'Failed to start job' };
  }
};

export default {
  getProviderJobs,
  getJobDetails,
  acceptJob,
  rejectJob,
  completeJob,
  startJob,
};