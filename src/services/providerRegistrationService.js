/**
 * Provider Registration Service - Firebase Integrated
 * Handles provider registration, verification, and approval using Firestore and Firebase Storage
 */

import { firestore as db, storage } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getCurrentUser } from './firebaseAuthService';

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

// ==================== FIREBASE STORAGE HELPERS ====================

/**
 * Upload image to Firebase Storage
 * @param {string} uri - Local image URI
 * @param {string} path - Storage path (e.g., 'providers/userId/cnic_front.jpg')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (uri, path) => {
  try {
    console.log('📤 Uploading image to:', path);
    
    // Fetch the image as blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('❌ Upload image error:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} url - Download URL of the image
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (url) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Delete image error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DRAFT MANAGEMENT ====================

/**
 * Save registration draft to Firestore
 * @param {object} data - Draft data to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveDraft = async (data) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('💾 Saving draft for user:', user.uid);

    const draftRef = doc(db, 'providerDrafts', user.uid);
    await setDoc(draftRef, {
      ...data,
      userId: user.uid,
      lastSaved: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('✅ Draft saved successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Save draft error:', error);
    return { success: false, error: error.message || 'Failed to save draft' };
  }
};

/**
 * Load registration draft from Firestore
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const loadDraft = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('📂 Loading draft for user:', user.uid);

    const draftRef = doc(db, 'providerDrafts', user.uid);
    const draftSnap = await getDoc(draftRef);

    if (draftSnap.exists()) {
      const data = draftSnap.data();
      
      // Check if draft is not expired (30 days)
      if (data.lastSaved) {
        const lastSaved = data.lastSaved.toDate();
        const now = new Date();
        const daysDiff = (now - lastSaved) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 30) {
          console.log('⚠️ Draft expired');
          await clearDraft();
          return { success: false, error: 'Draft expired' };
        }
      }

      console.log('✅ Draft loaded successfully');
      return { success: true, data };
    }

    console.log('ℹ️ No draft found');
    return { success: false, error: 'No draft found' };
  } catch (error) {
    console.error('❌ Load draft error:', error);
    return { success: false, error: error.message || 'Failed to load draft' };
  }
};

/**
 * Clear registration draft from Firestore
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const clearDraft = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('🗑️ Clearing draft for user:', user.uid);

    const draftRef = doc(db, 'providerDrafts', user.uid);
    await setDoc(draftRef, { deleted: true, deletedAt: serverTimestamp() });

    console.log('✅ Draft cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Clear draft error:', error);
    return { success: false, error: error.message || 'Failed to clear draft' };
  }
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validate CNIC format
 * @param {string} cnic - CNIC number to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateCNIC = (cnic) => {
  const cleanCNIC = cnic.replace(/-/g, '');
  
  if (cleanCNIC.length !== 13) {
    return { valid: false, error: 'CNIC must be 13 digits' };
  }
  
  if (!/^\d+$/.test(cleanCNIC)) {
    return { valid: false, error: 'CNIC must contain only numbers' };
  }
  
  return { valid: true };
};

/**
 * Format CNIC (XXXXX-XXXXXXX-X)
 * @param {string} cnic - CNIC number to format
 * @returns {string} Formatted CNIC
 */
export const formatCNIC = (cnic) => {
  const cleanCNIC = cnic.replace(/\D/g, '');
  if (cleanCNIC.length <= 5) return cleanCNIC;
  if (cleanCNIC.length <= 12) return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5)}`;
  return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12, 13)}`;
};

/**
 * Check if CNIC already exists in Firestore
 * @param {string} cnic - CNIC number to check
 * @returns {Promise<{exists: boolean, error?: string}>}
 */
export const checkCNICExists = async (cnic) => {
  try {
    const cleanCNIC = cnic.replace(/-/g, '');
    
    const providersRef = collection(db, 'providers');
    const q = query(providersRef, where('cnicNumber', '==', cleanCNIC));
    const querySnapshot = await getDocs(q);
    
    return { exists: !querySnapshot.empty };
  } catch (error) {
    console.error('Check CNIC error:', error);
    return { exists: false, error: error.message };
  }
};

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date of birth string
 * @returns {number} Age in years
 */
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

// ==================== PROVIDER REGISTRATION ====================

/**
 * Submit provider registration to Firestore
 * @param {object} registrationData - Complete registration data
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const submitProviderRegistration = async (registrationData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('📝 Submitting provider registration for user:', user.uid);

    // Upload images to Firebase Storage if they exist
    let cnicFrontURL = registrationData.cnicFrontImage;
    let cnicBackURL = registrationData.cnicBackImage;
    let selfieURL = registrationData.selfieImage;
    let proofDocuments = registrationData.proofDocuments || [];

    // Upload CNIC front
    if (cnicFrontURL && cnicFrontURL.startsWith('file://')) {
      const uploadResult = await uploadImage(
        cnicFrontURL,
        `providers/${user.uid}/cnic_front.jpg`
      );
      if (uploadResult.success) {
        cnicFrontURL = uploadResult.url;
      } else {
        return { success: false, error: 'Failed to upload CNIC front image' };
      }
    }

    // Upload CNIC back
    if (cnicBackURL && cnicBackURL.startsWith('file://')) {
      const uploadResult = await uploadImage(
        cnicBackURL,
        `providers/${user.uid}/cnic_back.jpg`
      );
      if (uploadResult.success) {
        cnicBackURL = uploadResult.url;
      } else {
        return { success: false, error: 'Failed to upload CNIC back image' };
      }
    }

    // Upload selfie
    if (selfieURL && selfieURL.startsWith('file://')) {
      const uploadResult = await uploadImage(
        selfieURL,
        `providers/${user.uid}/selfie.jpg`
      );
      if (uploadResult.success) {
        selfieURL = uploadResult.url;
      } else {
        return { success: false, error: 'Failed to upload selfie image' };
      }
    }

    // Upload proof documents
    const uploadedProofDocs = [];
    for (let i = 0; i < proofDocuments.length; i++) {
      const doc = proofDocuments[i];
      if (doc.uri && doc.uri.startsWith('file://')) {
        const uploadResult = await uploadImage(
          doc.uri,
          `providers/${user.uid}/proof_${i + 1}.jpg`
        );
        if (uploadResult.success) {
          uploadedProofDocs.push({
            ...doc,
            uri: uploadResult.url
          });
        }
      } else {
        uploadedProofDocs.push(doc);
      }
    }

    // Create provider profile
    const providerProfile = {
      userId: user.uid,
      
      // Services
      services: registrationData.selectedServices || [],
      
      // Personal Info
      fullName: registrationData.fullName,
      dateOfBirth: registrationData.dateOfBirth,
      age: registrationData.dateOfBirth ? calculateAge(registrationData.dateOfBirth) : null,
      phoneNumber: registrationData.phoneNumber,
      email: user.email,
      residentialAddress: registrationData.residentialAddress,
      city: registrationData.city,
      gpsLocation: registrationData.gpsLocation || null,
      
      // Professional Info
      yearsOfExperience: registrationData.yearsOfExperience || 0,
      skillsDescription: registrationData.skillsDescription || '',
      serviceRadius: registrationData.serviceRadius || 10,
      basePrice: registrationData.basePrice || 0,
      
      // KYC Documents
      cnicNumber: registrationData.cnicNumber?.replace(/-/g, ''),
      cnicFrontImage: cnicFrontURL,
      cnicBackImage: cnicBackURL,
      selfieImage: selfieURL,
      proofDocuments: uploadedProofDocs,
      
      // Verification Status
      isVerified: false,
      verificationStatus: 'pending',
      rejectionReason: null,
      submittedAt: serverTimestamp(),
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
      termsAccepted: registrationData.termsAccepted || false,
      termsAcceptedAt: registrationData.termsAccepted ? serverTimestamp() : null,
      backgroundCheckAccepted: registrationData.backgroundCheckAccepted || false,
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const providerRef = doc(db, 'providers', user.uid);
    await setDoc(providerRef, providerProfile);

    // Update user document to mark as verified provider
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      isVerified: false, // Will be true after admin approval
      providerRegistrationComplete: true,
      updatedAt: serverTimestamp()
    });

    // Clear draft
    await clearDraft();

    console.log('✅ Provider registration submitted successfully');

    return {
      success: true,
      data: providerProfile
    };
  } catch (error) {
    console.error('❌ Submit registration error:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit registration'
    };
  }
};

// ==================== PROVIDER PROFILE ====================

/**
 * Get provider profile from Firestore
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getProviderProfile = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('📂 Getting provider profile for user:', user.uid);

    const providerRef = doc(db, 'providers', user.uid);
    const providerSnap = await getDoc(providerRef);

    if (providerSnap.exists()) {
      console.log('✅ Provider profile found');
      return {
        success: true,
        data: { id: providerSnap.id, ...providerSnap.data() }
      };
    }

    console.log('ℹ️ No provider profile found');
    return {
      success: false,
      error: 'No profile found'
    };
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get profile'
    };
  }
};

/**
 * Update provider online status
 * @param {boolean} isOnline - Online status
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateOnlineStatus = async (isOnline) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('🔄 Updating online status to:', isOnline);

    const providerRef = doc(db, 'providers', user.uid);
    await updateDoc(providerRef, {
      isOnline,
      lastOnline: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Online status updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Update online status error:', error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
};

/**
 * Check if user is a verified provider
 * @returns {Promise<boolean>}
 */
export const isProvider = async () => {
  try {
    const result = await getProviderProfile();
    return result.success && result.data.isVerified;
  } catch (error) {
    return false;
  }
};

/**
 * Get verification status
 * @returns {Promise<{success: boolean, status?: string, isVerified?: boolean, error?: string}>}
 */
export const getVerificationStatus = async () => {
  try {
    const result = await getProviderProfile();
    if (result.success) {
      return {
        success: true,
        status: result.data.verificationStatus,
        isVerified: result.data.isVerified,
        data: result.data
      };
    }
    return {
      success: false,
      status: 'not_submitted'
    };
  } catch (error) {
    return {
      success: false,
      status: 'error',
      error: error.message
    };
  }
};

// ==================== EXPORTS ====================

export default {
  SERVICE_CATEGORIES,
  COMMISSION_RATES,
  uploadImage,
  deleteImage,
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
