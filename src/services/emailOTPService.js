/**
 * Email OTP Service
 * Handles email-based OTP verification using Supabase
 * 
 * Features:
 * - Generate and send 6-digit OTP
 * - Store OTP in Supabase with expiration
 * - Verify OTP with attempt limiting
 * - Resend OTP with rate limiting
 * - Auto-cleanup expired OTPs
 * 
 * Free Tier Optimizations:
 * - Uses Supabase PostgreSQL (free tier: unlimited API requests)
 * - No email sending service (logs OTP to console in dev)
 * - Efficient queries with proper indexing
 */

import { supabase } from '../config/supabase';

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a random 6-digit OTP
 * 
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email
 * In production, integrate with email service (SendGrid, AWS SES, etc.)
 * For now, logs OTP to console for development
 * 
 * @param {string} email - User email
 * @param {string} purpose - 'signup', 'login', or 'reset'
 * @returns {Promise<object>} - { success, otpId, devOTP, error }
 */
export const sendEmailOTP = async (email, purpose = 'signup') => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check for recent OTP requests (rate limiting)
    const { data: recentOTPs, error: queryError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('purpose', purpose);
    
    if (queryError) throw queryError;
    
    // Check if there's a recent OTP that's still in cooldown
    const now = new Date();
    for (const otpData of recentOTPs || []) {
      const createdAt = new Date(otpData.created_at);
      const secondsSinceCreation = (now - createdAt) / 1000;
      
      if (secondsSinceCreation < RESEND_COOLDOWN_SECONDS) {
        return {
          success: false,
          error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreation)} seconds before requesting a new OTP.`,
        };
      }
    }
    
    // Delete old OTPs for this email and purpose
    if (recentOTPs && recentOTPs.length > 0) {
      const otpIds = recentOTPs.map(otp => otp.id);
      await supabase
        .from('email_otps')
        .delete()
        .in('id', otpIds);
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Store OTP in Supabase
    const { data: otpDoc, error: insertError } = await supabase
      .from('email_otps')
      .insert({
        email: normalizedEmail,
        otp: otp,
        purpose: purpose,
        verified: false,
        attempts: 0,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // In production, send email here
    // Example: await sendEmail(email, otp, purpose);
    
    // For development, log OTP to console
    if (__DEV__) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 OTP for ${email}`);
      console.log(`🔢 Code: ${otp}`);
      console.log(`⏰ Expires in ${OTP_EXPIRY_MINUTES} minutes`);
      console.log(`📝 Purpose: ${purpose}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    return {
      success: true,
      otpId: otpDoc.id,
      message: `OTP sent to ${email}`,
      devOTP: __DEV__ ? otp : undefined, // Only include in development
    };
  } catch (error) {
    console.error('❌ Send Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to send OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

/**
 * Verify OTP code
 * Checks if OTP matches, is not expired, and hasn't exceeded max attempts
 * 
 * @param {string} otpId - OTP document ID
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<object>} - { success, error }
 */
export const verifyEmailOTP = async (otpId, email, otpCode) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get OTP document
    const { data: otpDocs, error: queryError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1);
    
    if (queryError) throw queryError;
    
    if (!otpDocs || otpDocs.length === 0) {
      return {
        success: false,
        error: 'OTP not found. Please request a new one.',
      };
    }
    
    const otpData = otpDocs[0];
    
    // Check if already verified
    if (otpData.verified) {
      return {
        success: false,
        error: 'This OTP has already been used.',
      };
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    
    if (now > expiresAt) {
      await supabase
        .from('email_otps')
        .delete()
        .eq('id', otpData.id);
      
      return {
        success: false,
        error: 'OTP has expired. Please request a new one.',
      };
    }
    
    // Check max attempts
    if (otpData.attempts >= MAX_ATTEMPTS) {
      await supabase
        .from('email_otps')
        .delete()
        .eq('id', otpData.id);
      
      return {
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.',
      };
    }
    
    // Verify OTP code
    if (otpData.otp !== otpCode) {
      // Increment attempts
      await supabase
        .from('email_otps')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);
      
      const remainingAttempts = MAX_ATTEMPTS - (otpData.attempts + 1);
      
      return {
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      };
    }
    
    // OTP is valid - mark as verified
    await supabase
      .from('email_otps')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', otpData.id);
    
    console.log('✅ OTP verified successfully');
    
    // Clean up after successful verification (optional)
    setTimeout(async () => {
      try {
        await supabase
          .from('email_otps')
          .delete()
          .eq('id', otpData.id);
      } catch (error) {
        console.error('Error cleaning up OTP:', error);
      }
    }, 5000);
    
    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    console.error('❌ Verify Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to verify OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

/**
 * Resend OTP to email
 * Deletes old OTP and sends a new one
 * 
 * @param {string} email - User email
 * @param {string} purpose - 'signup', 'login', or 'reset'
 * @returns {Promise<object>} - { success, otpId, devOTP, error }
 */
export const resendEmailOTP = async (email, purpose = 'signup') => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Delete all existing OTPs for this email and purpose
    await supabase
      .from('email_otps')
      .delete()
      .eq('email', normalizedEmail)
      .eq('purpose', purpose);
    
    // Send new OTP
    return await sendEmailOTP(email, purpose);
  } catch (error) {
    console.error('❌ Resend Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to resend OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

/**
 * Clean up expired OTPs
 * Should be called periodically or via Cloud Function
 * 
 * @returns {Promise<object>} - { success, deletedCount, error }
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const now = new Date().toISOString();
    
    // Delete all expired OTPs
    const { data, error } = await supabase
      .from('email_otps')
      .delete()
      .lt('expires_at', now)
      .select();
    
    if (error) throw error;
    
    const deletedCount = data?.length || 0;
    
    console.log(`✅ Cleaned up ${deletedCount} expired OTPs`);
    
    return {
      success: true,
      deletedCount: deletedCount,
    };
  } catch (error) {
    console.error('❌ Cleanup Expired OTPs Error:', error);
    
    return {
      success: false,
      error: 'Failed to cleanup expired OTPs',
      errorCode: error.code,
    };
  }
};

export default {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
  cleanupExpiredOTPs,
};
