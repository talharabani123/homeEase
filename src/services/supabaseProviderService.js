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

// Service Categories (same as before)
export const SERVICE_CATEGORIES = {
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
export const saveDraft = async (draftData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('💾 Saving registration draft for user:', user.id);

    // Check if draft exists
    const { data: existingDraft } = await supabase
      .from('provider_drafts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingDraft) {
      // Update existing draft
      result = await supabase
        .from('provider_drafts')
        .update({
          draft_data: draftData,
          current_step: draftData.currentStep || 1,
        })
        .eq('user_id', user.id);
    } else {
      // Insert new draft
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
        error: result.error.message,
      };
    }

    console.log('✅ Draft saved successfully');

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
 * 
 * @returns {Promise<object>} - { success, data, error }
 */
export const loadDraft = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
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

    console.log('✅ Draft loaded successfully');

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
 * 
 * @returns {Promise<object>} - { success, error }
 */
export const clearDraft = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
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

    console.log('✅ Draft cleared successfully');

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

    // Validate CNIC
    const cnicValidation = validateCNIC(registrationData.cnic);
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
        full_name: registrationData.fullName,
        email: registrationData.email,
        phone_number: registrationData.phoneNumber,
        cnic: registrationData.cnic.replace(/[-\s]/g, ''),
        address: registrationData.address,
        city: registrationData.city,
        selected_services: registrationData.selectedServices,
        years_of_experience: registrationData.yearsOfExperience,
        skills_description: registrationData.skillsDescription,
        service_radius: registrationData.serviceRadius,
        base_price: registrationData.basePrice || 0,
        cnic_front_url: cnicFrontUrl,
        cnic_back_url: cnicBackUrl,
        selfie_url: selfieUrl,
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
      message: 'Registration submitted successfully',
    };
  } catch (error) {
    console.error('❌ Submit Provider Registration Error:', error);
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
