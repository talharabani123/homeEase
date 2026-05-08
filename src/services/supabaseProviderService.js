/**
 * Supabase Provider Registration Service
 * Replaces providerRegistrationService.js
 * 
 * Features:
 * - Multi-step registration with draft saving
 * - Document uploads to Supabase Storage
 * - Provider profile management
 */

import { supabase } from '../config/supabase';
import { getCurrentUser } from './supabaseAuthService';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteFileByUrl,
} from './supabaseStorageService';

// Service Categories (array format for UI components)
export const SERVICE_CATEGORIES = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repairs, leak fixing, bathroom & kitchen plumbing' },
  { id: 'electrician', name: 'Electrician', icon: '💡', description: 'Wiring, switch repairs, appliance installation' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚', description: 'Furniture repair, door & window fixing, woodwork' },
  { id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior & exterior painting, wall finishing' },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home cleaning, deep cleaning, sanitization' },
  { id: 'hvac', name: 'AC Technician', icon: '❄️', description: 'AC repair, installation, maintenance' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', description: 'Washing machine, fridge, microwave repairs' },
  { id: 'pest', name: 'Pest Control', icon: '🐛', description: 'Termite treatment, fumigation, pest removal' },
  { id: 'gardener', name: 'Gardener', icon: '🌱', description: 'Lawn care, plant maintenance, landscaping' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔩', description: 'Vehicle repair, maintenance, diagnostics' },
];

// Service Categories Map (for easy lookup)
export const SERVICE_CATEGORIES_MAP = {
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  CARPENTRY: 'Carpentry',
  PAINTING: 'Painting',
  CLEANING: 'Cleaning',
  HVAC: 'HVAC',
  APPLIANCE_REPAIR: 'Appliance Repair',
  PEST_CONTROL: 'Pest Control',
  LANDSCAPING: 'Landscaping',
  ROOFING: 'Roofing',
};

// Commission Rates
export const COMMISSION_RATES = {
  PLUMBING: 15,
  ELECTRICAL: 15,
  CARPENTRY: 12,
  PAINTING: 12,
  CLEANING: 10,
  HVAC: 15,
  APPLIANCE_REPAIR: 15,
  PEST_CONTROL: 12,
  LANDSCAPING: 12,
  ROOFING: 15,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format CNIC with dashes
 * 
 * @param {string} cnic - CNIC number
 * @returns {string} - Formatted CNIC (12345-1234567-1)
 */
export const formatCNIC = (cnic) => {
  const cleaned = cnic.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
};

/**
 * Check if CNIC already exists
 * 
 * @param {string} cnic - CNIC number
 * @returns {Promise<object>} - { success, exists, error }
 */
export const checkCNICExists = async (cnic) => {
  try {
    const cleanCNIC = cnic.replace(/[-\s]/g, '');
    
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('cnic', cleanCNIC)
      .limit(1);
    
    if (error) throw error;
    
    return {
      success: true,
      exists: data && data.length > 0,
    };
  } catch (error) {
    console.error('❌ Check CNIC Exists Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check CNIC',
    };
  }
};

// ==================== DRAFT MANAGEMENT ====================

/**
 * Save registration draft
 * 
 * @param {object} draftData - Registration form data
 * @returns {Promise<object>} - { success, error }
 */
/**
 * Save registration draft
 * For provider registration, saves locally if user not authenticated yet
 * 
 * @param {object} draftData - Registration form data
 * @param {string} userId - Optional user ID (if not logged in yet)
 * @returns {Promise<object>} - { success, error }
 */
export const saveDraft = async (draftData, userId = null) => {
  try {
    // Try to get current user, or use provided userId
    let user = await getCurrentUser();
    
    if (!user && userId) {
      // Use provided userId (for cases where user just signed up but session not established)
      user = { id: userId };
    }
    
    if (!user || !user.id) {
      // User not authenticated yet - save locally instead
      console.log('💾 User not authenticated, saving draft locally');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('provider_draft', JSON.stringify(draftData));
        console.log('✅ Draft saved locally');
        return {
          success: true,
          message: 'Progress saved locally',
        };
      } catch (localError) {
        console.error('❌ Failed to save locally:', localError);
        return {
          success: false,
          error: 'Failed to save progress',
        };
      }
    }

    console.log('💾 Saving registration draft for user:', user.id);

    // Check if draft exists
    const { data: existingDraft, error: checkError } = await supabase
      .from('provider_drafts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (which is fine for new drafts)
      console.error('❌ Error checking existing draft:', checkError);
    }

    let result;

    if (existingDraft) {
      // Update existing draft
      console.log('🔄 Updating existing draft:', existingDraft.id);
      result = await supabase
        .from('provider_drafts')
        .update({
          draft_data: draftData,
          current_step: draftData.currentStep || 1,
        })
        .eq('user_id', user.id);
    } else {
      // Insert new draft
      console.log('➕ Creating new draft');
      result = await supabase
        .from('provider_drafts')
        .insert({
          user_id: user.id,
          draft_data: draftData,
          current_step: draftData.currentStep || 1,
        });
    }

    if (result.error) {
      console.error('❌ Save draft error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to save draft',
      };
    }

    console.log('✅ Draft saved to database');

    return {
      success: true,
      message: 'Progress saved',
    };
  } catch (error) {
    console.error('❌ Save Draft Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save draft',
    };
  }
};

/**
 * Load registration draft
 * Loads from local storage if user not authenticated yet
 * 
 * @returns {Promise<object>} - { success, data, error }
 */
export const loadDraft = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // User not authenticated yet - load from local storage
      console.log('📂 User not authenticated, loading draft locally');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const localDraft = await AsyncStorage.getItem('provider_draft');
        if (localDraft) {
          const draftData = JSON.parse(localDraft);
          console.log('✅ Draft loaded from local storage');
          return {
            success: true,
            data: draftData,
            currentStep: draftData.currentStep || 1,
          };
        } else {
          console.log('ℹ️ No local draft found');
          return {
            success: true,
            data: null,
          };
        }
      } catch (localError) {
        console.error('❌ Failed to load locally:', localError);
        return {
          success: true,
          data: null,
        };
      }
    }

    console.log('📂 Loading registration draft for user:', user.id);

    const { data, error } = await supabase
      .from('provider_drafts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No draft found
        console.log('ℹ️ No draft found');
        return {
          success: true,
          data: null,
        };
      }
      console.error('❌ Load draft error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Draft loaded from database');

    return {
      success: true,
      data: data.draft_data,
      currentStep: data.current_step,
    };
  } catch (error) {
    console.error('❌ Load Draft Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load draft',
    };
  }
};

/**
 * Clear registration draft
 * Clears from local storage if user not authenticated yet
 * 
 * @returns {Promise<object>} - { success, error }
 */
export const clearDraft = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // User not authenticated yet - clear from local storage
      console.log('🗑️ User not authenticated, clearing local draft');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('provider_draft');
        console.log('✅ Local draft cleared');
        return {
          success: true,
          message: 'Draft cleared',
        };
      } catch (localError) {
        console.error('❌ Failed to clear locally:', localError);
        return {
          success: false,
          error: 'Failed to clear draft',
        };
      }
    }

    console.log('🗑️ Clearing registration draft for user:', user.id);

    const { error } = await supabase
      .from('provider_drafts')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Clear draft error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Draft cleared from database');

    return {
      success: true,
      message: 'Draft cleared',
    };
  } catch (error) {
    console.error('❌ Clear Draft Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to clear draft',
    };
  }
};

// ==================== IMAGE UPLOAD ====================

/**
 * Upload image to Supabase Storage
 * 
 * @param {string} imageUri - Local image URI
 * @param {string} folder - Folder name (e.g., 'cnic', 'selfie', 'proof')
 * @returns {Promise<object>} - { success, url, path, error }
 */
export const uploadImage = async (imageUri, folder = 'documents') => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('📤 Uploading image to provider-documents bucket');

    // Generate file name with folder structure
    const timestamp = Date.now();
    const extension = imageUri.split('.').pop();
    const fileName = `${folder}/${timestamp}.${extension}`;

    const result = await uploadFile(
      'provider-documents',
      imageUri,
      user.id,
      fileName
    );

    return result;
  } catch (error) {
    console.error('❌ Upload Image Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
};

/**
 * Upload multiple images
 * 
 * @param {array} imageUris - Array of local image URIs
 * @param {string} folder - Folder name
 * @returns {Promise<object>} - { success, urls, paths, errors }
 */
export const uploadMultipleImages = async (imageUris, folder = 'documents') => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log(`📤 Uploading ${imageUris.length} images to provider-documents bucket`);

    const results = await Promise.allSettled(
      imageUris.map(uri => uploadImage(uri, folder))
    );

    const urls = [];
    const paths = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        urls.push(result.value.url);
        paths.push(result.value.path);
      } else {
        errors.push({
          index,
          error: result.reason || result.value?.error || 'Upload failed',
        });
      }
    });

    const allSuccessful = errors.length === 0;

    return {
      success: allSuccessful,
      urls,
      paths,
      errors: errors.length > 0 ? errors : undefined,
      message: allSuccessful
        ? 'All images uploaded successfully'
        : `${urls.length}/${imageUris.length} images uploaded`,
    };
  } catch (error) {
    console.error('❌ Upload Multiple Images Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload images',
    };
  }
};

/**
 * Delete image from Supabase Storage
 * 
 * @param {string} url - Image URL
 * @returns {Promise<object>} - { success, error }
 */
export const deleteImage = async (url) => {
  try {
    console.log('🗑️ Deleting image from storage');
    return await deleteFileByUrl(url);
  } catch (error) {
    console.error('❌ Delete Image Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete image',
    };
  }
};

// ==================== CNIC VALIDATION ====================

/**
 * Validate CNIC format
 * 
 * @param {string} cnic - CNIC number
 * @returns {object} - { valid, error }
 */
export const validateCNIC = (cnic) => {
  const cleanCNIC = cnic.replace(/[-\s]/g, '');

  if (cleanCNIC.length !== 13) {
    return {
      valid: false,
      error: 'CNIC must be 13 digits',
    };
  }

  if (!/^\d+$/.test(cleanCNIC)) {
    return {
      valid: false,
      error: 'CNIC must contain only numbers',
    };
  }

  return {
    valid: true,
  };
};

// ==================== PROVIDER REGISTRATION ====================

/**
 * Submit provider registration
 * Uploads all images and creates provider profile
 * 
 * @param {object} registrationData - Complete registration data
 * @returns {Promise<object>} - { success, profileId, error }
 */
export const submitProviderRegistration = async (registrationData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('📝 Submitting provider registration for user:', user.id);
    console.log('📋 Registration data:', JSON.stringify(registrationData, null, 2));

    // Handle both field names: cnic and cnicNumber
    const cnicValue = registrationData.cnic || registrationData.cnicNumber;

    // Validate required fields
    if (!cnicValue) {
      return {
        success: false,
        error: 'CNIC is required',
      };
    }

    // Validate CNIC
    const cnicValidation = validateCNIC(cnicValue);
    if (!cnicValidation.valid) {
      return {
        success: false,
        error: cnicValidation.error,
      };
    }

    // Upload images if they are local URIs (not already uploaded)
    let cnicFrontUrl = registrationData.cnicFrontImage;
    let cnicBackUrl = registrationData.cnicBackImage;
    let selfieUrl = registrationData.selfieImage;
    let proofUrls = registrationData.proofOfServiceImages || [];

    // Upload CNIC front if local
    if (cnicFrontUrl && !cnicFrontUrl.startsWith('http')) {
      const result = await uploadImage(cnicFrontUrl, 'cnic');
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to upload CNIC front image',
        };
      }
      cnicFrontUrl = result.url;
    }

    // Upload CNIC back if local
    if (cnicBackUrl && !cnicBackUrl.startsWith('http')) {
      const result = await uploadImage(cnicBackUrl, 'cnic');
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to upload CNIC back image',
        };
      }
      cnicBackUrl = result.url;
    }

    // Upload selfie if local
    if (selfieUrl && !selfieUrl.startsWith('http')) {
      const result = await uploadImage(selfieUrl, 'selfie');
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to upload selfie image',
        };
      }
      selfieUrl = result.url;
    }

    // Upload proof of service images if local
    const localProofImages = proofUrls.filter(url => !url.startsWith('http'));
    if (localProofImages.length > 0) {
      const result = await uploadMultipleImages(localProofImages, 'proof');
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to upload proof of service images',
        };
      }
      // Replace local URIs with uploaded URLs
      proofUrls = proofUrls.map(url => {
        if (url.startsWith('http')) return url;
        const index = localProofImages.indexOf(url);
        return result.urls[index];
      });
    }

    // Create provider profile
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert({
        user_id: user.id,
        full_name: registrationData.fullName || '',
        email: registrationData.email || user.email || '',
        phone_number: registrationData.phoneNumber || '',
        cnic: cnicValue.replace(/[-\s]/g, ''),
        address: registrationData.address || registrationData.residentialAddress || '',
        city: registrationData.city || '',
        selected_services: registrationData.selectedServices || [],
        years_of_experience: registrationData.yearsOfExperience || 0,
        skills_description: registrationData.skillsDescription || '',
        service_radius: registrationData.serviceRadius || 10,
        base_price: registrationData.basePrice || 0,
        cnic_front_url: cnicFrontUrl || '',
        cnic_back_url: cnicBackUrl || '',
        selfie_url: selfieUrl || '',
        proof_of_service_urls: proofUrls,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Submit registration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Clear draft after successful submission
    await clearDraft();

    console.log('✅ Provider registration submitted successfully');

    return {
      success: true,
      profileId: data.id,
      data: data,
      message: 'Registration submitted successfully',
    };
  } catch (error) {
    console.error('❌ Submit Provider Registration Error:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Failed to submit registration',
    };
  }
};

// ==================== PROVIDER PROFILE ====================

/**
 * Get provider profile
 * 
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<object>} - { success, data, error }
 */
export const getProviderProfile = async (userId = null) => {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id;
    if (!targetUserId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('👤 Fetching provider profile for user:', targetUserId);

    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        console.log('ℹ️ No provider profile found');
        return {
          success: true,
          data: null,
        };
      }
      console.error('❌ Get provider profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Provider profile fetched successfully');

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Get Provider Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get provider profile',
    };
  }
};

/**
 * Update provider profile
 * 
 * @param {string} profileId - Profile ID
 * @param {object} updates - Profile updates
 * @returns {Promise<object>} - { success, data, error }
 */
export const updateProviderProfile = async (profileId, updates) => {
  try {
    console.log('✏️ Updating provider profile:', profileId);

    const { data, error } = await supabase
      .from('provider_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update provider profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Provider profile updated successfully');

    return {
      success: true,
      data: data,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('❌ Update Provider Profile Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
};

/**
 * Subscribe to provider profile changes (real-time)
 * 
 * @param {string} userId - User ID
 * @param {function} callback - Callback function (payload) => {}
 * @returns {object} - Subscription object
 */
export const subscribeToProviderProfile = (userId, callback) => {
  console.log('🔔 Subscribing to provider profile changes:', userId);

  const subscription = supabase
    .channel(`provider_profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'provider_profiles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔄 Provider profile changed:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

export default {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORIES_MAP,
  COMMISSION_RATES,
  formatCNIC,
  checkCNICExists,
  saveDraft,
  loadDraft,
  clearDraft,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateCNIC,
  submitProviderRegistration,
  getProviderProfile,
  updateProviderProfile,
  subscribeToProviderProfile,
};
