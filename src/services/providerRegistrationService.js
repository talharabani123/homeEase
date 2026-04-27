/**
 * Provider Registration Service
 * Handles provider registration, verification, and approval
 * Mock implementation for Expo Go - Replace with Firebase in production
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from './authService';

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repairs, installations, drainage' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, fixtures, electrical repairs' },
  { id: 'ac_technician', name: 'AC Technician', icon: '❄️', description: 'AC installation, repair, maintenance' },
  { id: 'gas_repair', name: 'Gas Repair', icon: '🔥', description: 'Gas line repairs, leak detection' },
  { id: 'locksmith', name: 'Locksmith', icon: '🔑', description: 'Lock installation, key duplication' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚', description: 'Furniture, woodwork, installations' },
  { id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior/exterior painting' },
  { id: 'home_cleaner', name: 'Home Cleaner', icon: '🧹', description: 'House cleaning, deep cleaning' },
  { id: 'appliance_repair', name: 'Appliance Repair', icon: '🔨', description: 'Washing machine, fridge, etc.' }
];

// Commission Rates
export const COMMISSION_RATES = {
  standard_service: 15,
  emergency_service: 20,
  first_10_jobs: 10,
};

// Storage Keys
const DRAFT_KEY = '@provider_registration_draft';
const PROFILE_KEY = '@provider_profile';

// Save draft
export const saveDraft = async (data) => {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    }));
    return { success: true };
  } catch (error) {
    console.error('Save draft error:', error);
    return { success: false, error: 'Failed to save draft' };
  }
};

// Load draft
export const loadDraft = async () => {
  try {
    const draft = await AsyncStorage.getItem(DRAFT_KEY);
    if (draft) {
      const data = JSON.parse(draft);
      // Check if draft is not expired (30 days)
      const lastSaved = new Date(data.lastSaved);
      const now = new Date();
      const daysDiff = (now - lastSaved) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 30) {
        return { success: true, data };
      } else {
        await AsyncStorage.removeItem(DRAFT_KEY);
        return { success: false, error: 'Draft expired' };
      }
    }
    return { success: false, error: 'No draft found' };
  } catch (error) {
    console.error('Load draft error:', error);
    return { success: false, error: 'Failed to load draft' };
  }
};

// Clear draft
export const clearDraft = async () => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
    return { success: true };
  } catch (error) {
    console.error('Clear draft error:', error);
    return { success: false, error: 'Failed to clear draft' };
  }
};

// Validate CNIC format
export const validateCNIC = (cnic) => {
  // Remove dashes
  const cleanCNIC = cnic.replace(/-/g, '');
  
  if (cleanCNIC.length !== 13) {
    return { valid: false, error: 'CNIC must be 13 digits' };
  }
  
  if (!/^\d+$/.test(cleanCNIC)) {
    return { valid: false, error: 'CNIC must contain only numbers' };
  }
  
  return { valid: true };
};

// Format CNIC (XXXXX-XXXXXXX-X)
export const formatCNIC = (cnic) => {
  const cleanCNIC = cnic.replace(/\D/g, '');
  if (cleanCNIC.length <= 5) return cleanCNIC;
  if (cleanCNIC.length <= 12) return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5)}`;
  return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12, 13)}`;
};

// Check if CNIC already exists
export const checkCNICExists = async (cnic) => {
  try {
    // Mock implementation - In production, check against database
    const profile = await AsyncStorage.getItem(PROFILE_KEY);
    if (profile) {
      const data = JSON.parse(profile);
      if (data.cnicNumber === cnic) {
        return { exists: true };
      }
    }
    return { exists: false };
  } catch (error) {
    console.error('Check CNIC error:', error);
    return { exists: false };
  }
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Submit provider registration
export const submitProviderRegistration = async (registrationData) => {
  try {
    // First, register the user in the auth system
    const authResult = await registerUser({
      email: registrationData.email,
      phone: registrationData.phoneNumber,
      password: registrationData.password,
      fullName: registrationData.fullName,
      cnic: registrationData.cnicNumber,
      role: 'provider',
      // Include all registration data
      ...registrationData
    });

    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error || 'Failed to create user account'
      };
    }

    const profile = {
      id: 'provider_' + Date.now(),
      userId: authResult.user.id,
      
      // Services
      services: registrationData.selectedServices,
      
      // Personal Info
      fullName: registrationData.fullName,
      dateOfBirth: registrationData.dateOfBirth,
      age: calculateAge(registrationData.dateOfBirth),
      phoneNumber: registrationData.phoneNumber,
      phoneVerified: true,
      email: registrationData.email,
      residentialAddress: registrationData.residentialAddress,
      city: registrationData.city,
      gpsLocation: registrationData.gpsLocation,
      
      // Professional Info
      yearsOfExperience: registrationData.yearsOfExperience,
      skillsDescription: registrationData.skillsDescription,
      serviceRadius: registrationData.serviceRadius,
      basePrice: registrationData.basePrice || 0,
      
      // KYC Documents
      cnicNumber: registrationData.cnicNumber,
      cnicFrontImage: registrationData.cnicFrontImage,
      cnicBackImage: registrationData.cnicBackImage,
      selfieImage: registrationData.selfieImage,
      
      // Verification Status
      isVerified: false,
      verificationStatus: 'pending',
      rejectionReason: null,
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      
      // Provider Status
      isOnline: false,
      isActive: false,
      
      // Performance Metrics
      rating: 0,
      totalJobs: 0,
      completedJobs: 0,
      cancelledJobs: 0,
      earnings: 0,
      
      // Agreement
      termsAccepted: registrationData.termsAccepted,
      termsAcceptedAt: new Date().toISOString(),
      backgroundCheckAccepted: registrationData.backgroundCheckAccepted,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    
    // Clear draft
    await clearDraft();
    
    // Mock auto-approval after 10 seconds for testing
    setTimeout(async () => {
      profile.isVerified = true;
      profile.verificationStatus = 'approved';
      profile.approvedAt = new Date().toISOString();
      profile.isActive = true;
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }, 10000);

    return {
      success: true,
      data: profile
    };
  } catch (error) {
    console.error('Submit registration error:', error);
    return {
      success: false,
      error: 'Failed to submit registration'
    };
  }
};

// Get provider profile
export const getProviderProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(PROFILE_KEY);
    if (profile) {
      return {
        success: true,
        data: JSON.parse(profile)
      };
    }
    return {
      success: false,
      error: 'No profile found'
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: 'Failed to get profile'
    };
  }
};

// Update provider online status
export const updateOnlineStatus = async (isOnline) => {
  try {
    const result = await getProviderProfile();
    if (result.success) {
      const profile = result.data;
      profile.isOnline = isOnline;
      profile.updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return { success: true, data: profile };
    }
    return { success: false, error: 'Profile not found' };
  } catch (error) {
    console.error('Update online status error:', error);
    return { success: false, error: 'Failed to update status' };
  }
};

// Check if user is a provider
export const isProvider = async () => {
  try {
    const result = await getProviderProfile();
    return result.success && result.data.isVerified;
  } catch (error) {
    return false;
  }
};

// Get verification status
export const getVerificationStatus = async () => {
  try {
    const result = await getProviderProfile();
    if (result.success) {
      return {
        success: true,
        status: result.data.verificationStatus,
        isVerified: result.data.isVerified
      };
    }
    return {
      success: false,
      status: 'not_submitted'
    };
  } catch (error) {
    return {
      success: false,
      status: 'error'
    };
  }
};

export default {
  SERVICE_CATEGORIES,
  COMMISSION_RATES,
  saveDraft,
  loadDraft,
  clearDraft,
  validateCNIC,
  formatCNIC,
  checkCNICExists,
  calculateAge,
  submitProviderRegistration,
  getProviderProfile,
  updateOnlineStatus,
  isProvider,
  getVerificationStatus
};
