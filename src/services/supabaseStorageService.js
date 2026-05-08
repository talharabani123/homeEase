/**
 * Supabase Storage Service
 * Handles file uploads and downloads
 * 
 * Buckets:
 * - profile-pictures (public)
 * - provider-documents (private)
 * - chat-attachments (private)
 */

import { supabase } from '../config/supabase';
// Use legacy API for expo-file-system (v54+)
import * as FileSystem from 'expo-file-system/legacy';

// Try to import decode, but have a fallback
let decode;
try {
  const base64Module = require('base64-arraybuffer');
  decode = base64Module.decode;
} catch (error) {
  console.warn('⚠️ base64-arraybuffer not available, using fallback');
  // Fallback: convert base64 to Uint8Array
  decode = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload file to Supabase Storage
 * 
 * @param {string} bucket - Bucket name ('profile-pictures', 'provider-documents', 'chat-attachments')
 * @param {string} filePath - Local file URI
 * @param {string} userId - User ID (for organizing files)
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<object>} - { success, url, path, error }
 */
export const uploadFile = async (bucket, filePath, userId, fileName = null) => {
  try {
    console.log('📤 Uploading file to', bucket);
    console.log('📂 File path:', filePath);
    console.log('👤 User ID:', userId);

    // Validate inputs
    if (!filePath) {
      return {
        success: false,
        error: 'File path is required',
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Generate unique file name if not provided
    const timestamp = Date.now();
    const fileExtension = filePath.split('.').pop();
    const finalFileName = fileName || `${timestamp}.${fileExtension}`;
    const storagePath = `${userId}/${finalFileName}`;

    console.log('📝 Storage path:', storagePath);

    // Check if FileSystem is available
    if (!FileSystem) {
      console.error('❌ FileSystem module not available');
      return {
        success: false,
        error: 'File system module not available. Please restart the app.',
      };
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.error('❌ File does not exist:', filePath);
      return {
        success: false,
        error: 'File does not exist',
      };
    }

    console.log('📊 File size:', (fileInfo.size / 1024).toFixed(2), 'KB');

    // Read file as base64
    console.log('📖 Reading file as base64...');
    const base64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType?.Base64 || 'base64',
    });

    console.log('🔄 Converting to ArrayBuffer...');
    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Determine content type
    const contentType = getContentType(fileExtension);
    console.log('📄 Content type:', contentType);

    // Upload to Supabase Storage
    console.log('⬆️ Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, {
        contentType: contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    console.log('✅ File uploaded successfully');
    console.log('🔗 URL:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
      message: 'File uploaded successfully',
    };
  } catch (error) {
    console.error('❌ Upload File Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

/**
 * Upload multiple files
 * 
 * @param {string} bucket - Bucket name
 * @param {array} filePaths - Array of local file URIs
 * @param {string} userId - User ID
 * @returns {Promise<object>} - { success, urls, paths, errors }
 */
export const uploadMultipleFiles = async (bucket, filePaths, userId) => {
  try {
    console.log(`📤 Uploading ${filePaths.length} files to`, bucket);

    const results = await Promise.allSettled(
      filePaths.map(filePath => uploadFile(bucket, filePath, userId))
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

    console.log(`✅ Uploaded ${urls.length}/${filePaths.length} files successfully`);

    return {
      success: allSuccessful,
      urls,
      paths,
      errors: errors.length > 0 ? errors : undefined,
      message: allSuccessful
        ? 'All files uploaded successfully'
        : `${urls.length}/${filePaths.length} files uploaded`,
    };
  } catch (error) {
    console.error('❌ Upload Multiple Files Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload files',
    };
  }
};

// ============================================
// FILE DOWNLOAD
// ============================================

/**
 * Get public URL for a file
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in storage
 * @returns {string} - Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * Get signed URL for private file (expires in 1 hour)
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<object>} - { success, url, error }
 */
export const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('❌ Get signed URL error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error('❌ Get Signed URL Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get signed URL',
    };
  }
};

/**
 * Download file to local device
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in storage
 * @param {string} localPath - Local path to save file
 * @returns {Promise<object>} - { success, localUri, error }
 */
export const downloadFile = async (bucket, path, localPath) => {
  try {
    console.log('📥 Downloading file from', bucket);

    // Get signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60); // 1 minute expiry

    if (error) {
      console.error('❌ Download error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Download file using Expo FileSystem
    const downloadResult = await FileSystem.downloadAsync(
      data.signedUrl,
      localPath
    );

    console.log('✅ File downloaded successfully');

    return {
      success: true,
      localUri: downloadResult.uri,
      message: 'File downloaded successfully',
    };
  } catch (error) {
    console.error('❌ Download File Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to download file',
    };
  }
};

// ============================================
// FILE DELETION
// ============================================

/**
 * Delete file from storage
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in storage
 * @returns {Promise<object>} - { success, error }
 */
export const deleteFile = async (bucket, path) => {
  try {
    console.log('🗑️ Deleting file from', bucket);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('❌ Delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ File deleted successfully');

    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    console.error('❌ Delete File Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
};

/**
 * Delete multiple files
 * 
 * @param {string} bucket - Bucket name
 * @param {array} paths - Array of file paths
 * @returns {Promise<object>} - { success, error }
 */
export const deleteMultipleFiles = async (bucket, paths) => {
  try {
    console.log(`🗑️ Deleting ${paths.length} files from`, bucket);

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error('❌ Delete multiple files error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Files deleted successfully');

    return {
      success: true,
      message: 'Files deleted successfully',
    };
  } catch (error) {
    console.error('❌ Delete Multiple Files Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete files',
    };
  }
};

/**
 * Delete file by URL
 * Extracts path from URL and deletes
 * 
 * @param {string} url - Full storage URL
 * @returns {Promise<object>} - { success, error }
 */
export const deleteFileByUrl = async (url) => {
  try {
    // Extract bucket and path from URL
    // URL format: https://xxxxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      return {
        success: false,
        error: 'Invalid storage URL',
      };
    }

    const [bucket, ...pathParts] = urlParts[1].split('/');
    const path = pathParts.join('/');

    return await deleteFile(bucket, path);
  } catch (error) {
    console.error('❌ Delete File By URL Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
};

// ============================================
// FILE MANAGEMENT
// ============================================

/**
 * List files in a folder
 * 
 * @param {string} bucket - Bucket name
 * @param {string} folder - Folder path (e.g., 'userId/')
 * @returns {Promise<object>} - { success, files, error }
 */
export const listFiles = async (bucket, folder = '') => {
  try {
    console.log('📋 Listing files in', bucket, folder);

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('❌ List files error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Found ${data.length} files`);

    return {
      success: true,
      files: data,
    };
  } catch (error) {
    console.error('❌ List Files Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to list files',
    };
  }
};

/**
 * Get file metadata
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<object>} - { success, metadata, error }
 */
export const getFileMetadata = async (bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      });

    if (error) {
      console.error('❌ Get metadata error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.length === 0) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    return {
      success: true,
      metadata: data[0],
    };
  } catch (error) {
    console.error('❌ Get File Metadata Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get file metadata',
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get content type from file extension
 * 
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
const getContentType = (extension) => {
  const contentTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Videos
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    
    // Other
    json: 'application/json',
    txt: 'text/plain',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Validate file size
 * 
 * @param {string} filePath - Local file URI
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Promise<object>} - { valid, size, error }
 */
export const validateFileSize = async (filePath, maxSizeMB = 10) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return {
        valid: false,
        error: 'File does not exist',
      };
    }

    const sizeMB = fileInfo.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        size: sizeMB,
        error: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      };
    }

    return {
      valid: true,
      size: sizeMB,
    };
  } catch (error) {
    console.error('❌ Validate File Size Error:', error);
    return {
      valid: false,
      error: error.message || 'Failed to validate file size',
    };
  }
};

export default {
  uploadFile,
  uploadMultipleFiles,
  getPublicUrl,
  getSignedUrl,
  downloadFile,
  deleteFile,
  deleteMultipleFiles,
  deleteFileByUrl,
  listFiles,
  getFileMetadata,
  validateFileSize,
};
