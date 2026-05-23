/**
 * Provider Job Service
 * Manages job requests, acceptance, and completion for providers
 * Mock implementation for Expo Go - Replace with Firebase in production
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

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
/**
 * Get all jobs for provider (filtered by their services)
 * @returns {Promise<object>} - { success, jobs: { pending, active, completed } }
 */
export const getProviderJobs = async () => {
  try {
    // Get provider profile to check their services
    const { getProviderProfile } = require('./supabaseProviderService');
    const profileResult = await getProviderProfile();
    
    if (!profileResult.success || !profileResult.data) {
      return {
        success: false,
        error: 'Provider profile not found',
        jobs: { pending: [], active: [], completed: [] },
      };
    }
    
    const providerId = profileResult.data.id;
    const providerServices = profileResult.data.services || [];
    const providerServiceNames = providerServices
      .map(s => s?.name?.toLowerCase())
      .filter(name => name); // Remove undefined/null values
    
    // Filter jobs based on provider's registered services
    const filterJobsByService = (jobs) => {
      return jobs.filter(job => {
        const jobServiceName = job.serviceName?.toLowerCase() || '';
        if (!jobServiceName) return false;
        
        // Check if job service matches any of provider's services
        return providerServiceNames.some(serviceName => {
          if (!serviceName) return false;
          return jobServiceName.includes(serviceName) || serviceName.includes(jobServiceName.split(' ')[0]);
        });
      });
    };
    
    // Load real requests from Supabase
    const { data: allRequests, error: supabaseError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('selected_provider_id', providerId);

    const getServiceIcon = (type) => {
      const icons = { plumber: '🔧', electrician: '⚡', carpenter: '🪚', ac_repair: '❄️', cleaning: '🧹' };
      return icons[type?.toLowerCase()] || '🔧';
    };

    // Map requests targeting this provider
    const mappedRequests = (allRequests || []).map(req => {
      let mappedStatus = 'Pending';
      if (req.status === 'accepted' || req.status === 'in_progress') {
        mappedStatus = 'In Progress';
      } else if (req.status === 'completed') {
        mappedStatus = 'Completed';
      }

      return {
        id: req.id,
        serviceName: req.service_name,
        serviceIcon: getServiceIcon(req.service_type),
        customerName: req.customer_name,
        location: req.address || 'Karachi, Pakistan',
        date: new Date(req.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        scheduledTime: new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: req.total_amount || 800,
        status: mappedStatus,
        description: req.description || 'Service requested',
        customerPhone: req.customer_phone || '',
        completedDate: req.completed_at ? new Date(req.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        rating: req.rating,
        review: req.review,
      };
    });

    const realPending = mappedRequests.filter(r => r.status === 'Pending');
    const realActive = mappedRequests.filter(r => r.status === 'In Progress');
    const realCompleted = mappedRequests.filter(r => r.status === 'Completed');

    const filteredJobs = {
      pending: realPending,
      active: realActive,
      completed: realCompleted,
    };
    
    return {
      success: true,
      jobs: filteredJobs,
    };
  } catch (error) {
    console.error('Get provider jobs error:', error);
    return {
      success: false,
      error: 'Failed to load jobs',
      jobs: { pending: [], active: [], completed: [] },
    };
  }
};

/**
 * Get job details by ID
 * @param {string} jobId
 * @returns {Promise<object>} - { success, job, error }
 */
export const getJobDetails = async (jobId) => {
  try {
    if (jobId.startsWith('req_')) {
      const { data: req, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (req) {
        const getServiceIcon = (type) => {
          const icons = { plumber: '🔧', electrician: '⚡', carpenter: '🪚', ac_repair: '❄️', cleaning: '🧹' };
          return icons[type?.toLowerCase()] || '🔧';
        };
        
        let mappedStatus = 'Pending';
        if (req.status === 'accepted' || req.status === 'in_progress') {
          mappedStatus = 'In Progress';
        } else if (req.status === 'completed') {
          mappedStatus = 'Completed';
        }

        const mapped = {
          id: req.id,
          serviceName: req.service_name,
          serviceIcon: getServiceIcon(req.service_type),
          customerName: req.customer_name,
          location: req.address || 'Karachi, Pakistan',
          date: new Date(req.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          scheduledTime: new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: req.total_amount || 800,
          status: mappedStatus,
          description: req.description || 'Service requested',
          customerPhone: req.customer_phone || '',
          completedDate: req.completed_at ? new Date(req.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : null,
          rating: req.rating,
          review: req.review,
        };
        return { success: true, job: mapped };
      }
    }

    return { success: false, error: 'Job not found' };
  } catch (error) {
    console.error('Get job details error:', error);
    return { success: false, error: 'Failed to load job details' };
  }
};

/**
 * Accept a job request
 * @param {string} jobId
 * @returns {Promise<object>} - { success, error }
 */
export const acceptJob = async (jobId) => {
  try {
    if (jobId.startsWith('req_')) {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', jobId);
      
      if (error) throw error;
      return { success: true };
    }

    // Move job from pending to active
    const jobIndex = mockJobs.pending.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      const job = mockJobs.pending[jobIndex];
      job.status = 'Active';
      job.acceptedAt = new Date().toISOString();
      mockJobs.active.push(job);
      mockJobs.pending.splice(jobIndex, 1);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
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
    if (jobId.startsWith('req_')) {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason })
        .eq('id', jobId);
      
      if (error) throw error;
      return { success: true };
    }

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
    if (jobId.startsWith('req_')) {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', jobId);
      
      if (error) throw error;
      return { success: true };
    }

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
    if (jobId.startsWith('req_')) {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', jobId);
      
      if (error) throw error;
      return { success: true };
    }

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
