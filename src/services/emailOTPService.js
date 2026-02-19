/**
 * Email OTP Service
 * Handles email-based OTP verification
 */

import { getFirestore, FieldValue } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const firestore = getFirestore();
const auth = getAuth();

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email
 * @param {string} email - User email
 * @param {string} purpose - 'signup' or 'login'
 * @returns {Promise<object>} - { success, otpId, error }
 */
export const sendEmailOTP = async (email, purpose = 'signup') => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP in Firestore
    const otpDoc = await firestore.collection('email_otps').add({
      email: email.toLowerCase().trim(),
      otp: otp,
      purpose: purpose,
      verified: false,
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
    });
    
    // Send email using Firebase Auth's action code
    // Note: This uses Firebase's built-in email sending
    // For custom emails, you'd need Cloud Functions
    console.log(`OTP for ${email}: ${otp}`); // For development - remove in production
    
    // TODO: In production, use Firebase Cloud Functions to send custom email
    // For now, we'll show the OTP in console for testing
    
    return {
      success: true,
      otpId: otpDoc.id,
      message: 'OTP sent to your email',
      // Remove this in production:
      devOTP: otp, // Only for development testing
    };
  } catch (error) {
    console.error('Send Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to send OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

/**
 * Verify OTP
 * @param {string} otpId - OTP document ID
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<object>} - { success, error }
 */
export const verifyEmailOTP = async (otpId, email, otpCode) => {
  try {
    const otpDocRef = firestore.collection('email_otps').doc(otpId);
    const otpDoc = await otpDocRef.get();
    
    if (!otpDoc.exists) {
      return {
        success: false,
        error: 'Invalid OTP. Please request a new one.',
      };
    }
    
    const otpData = otpDoc.data();
    
    // Check if already verified
    if (otpData.verified) {
      return {
        success: false,
        error: 'OTP already used. Please request a new one.',
      };
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = otpData.expiresAt.toDate();
    if (now > expiresAt) {
      return {
        success: false,
        error: 'OTP expired. Please request a new one.',
      };
    }
    
    // Check attempts
    if (otpData.attempts >= 3) {
      return {
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.',
      };
    }
    
    // Check email match
    if (otpData.email !== email.toLowerCase().trim()) {
      return {
        success: false,
        error: 'Email mismatch. Please try again.',
      };
    }
    
    // Verify OTP
    if (otpData.otp !== otpCode) {
      // Increment attempts
      await otpDocRef.update({
        attempts: otpData.attempts + 1,
      });
      
      return {
        success: false,
        error: `Invalid OTP. ${2 - otpData.attempts} attempts remaining.`,
      };
    }
    
    // Mark as verified
    await otpDocRef.update({
      verified: true,
      verifiedAt: FieldValue.serverTimestamp(),
    });
    
    console.log('OTP verified successfully');
    
    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to verify OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

/**
 * Resend OTP
 * @param {string} email - User email
 * @param {string} purpose - 'signup' or 'login'
 * @returns {Promise<object>} - { success, otpId, error }
 */
export const resendEmailOTP = async (email, purpose = 'signup') => {
  try {
    // Invalidate previous OTPs for this email
    const previousOTPs = await firestore
      .collection('email_otps')
      .where('email', '==', email.toLowerCase().trim())
      .where('verified', '==', false)
      .get();
    
    const batch = firestore.batch();
    previousOTPs.forEach((doc) => {
      batch.update(doc.ref, { verified: true }); // Mark as used
    });
    await batch.commit();
    
    // Send new OTP
    return await sendEmailOTP(email, purpose);
  } catch (error) {
    console.error('Resend Email OTP Error:', error);
    
    return {
      success: false,
      error: 'Failed to resend OTP. Please try again.',
      errorCode: error.code,
    };
  }
};

export default {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
};
