/**
 * Email OTP Service
 * Handles email-based OTP verification
 * 
 * COMMENTED OUT FOR EXPO GO - Firebase doesn't work in Expo Go
 * All functions below are commented out and replaced with mock exports
 */

/*
import { getFirestore, FieldValue } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const firestore = getFirestore();
const auth = getAuth();
*/

// Mock exports for Expo Go
export const sendEmailOTP = async (email, purpose = 'signup') => {
  console.log(`Mock: OTP sent to ${email} for ${purpose}`);
  return { 
    success: true, 
    message: 'Mock OTP sent',
    otpId: 'mock_otp_123',
    devOTP: '123456' // Mock OTP for testing
  };
};

export const verifyEmailOTP = async (otpId, email, otpCode) => {
  console.log(`Mock: Verifying OTP ${otpCode} for ${email}`);
  // Accept any 6-digit code for testing
  if (otpCode && otpCode.length === 6) {
    return { success: true, message: 'Mock OTP verified' };
  }
  return { success: false, error: 'Invalid OTP format' };
};

export const resendEmailOTP = async (email, purpose = 'signup') => {
  console.log(`Mock: Resending OTP to ${email}`);
  return { 
    success: true, 
    message: 'Mock OTP resent',
    otpId: 'mock_otp_456',
    devOTP: '654321'
  };
};

export default {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
};

/*
// ORIGINAL FIREBASE CODE - COMMENTED OUT FOR EXPO GO
// Uncomment when building with EAS for production

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
/*
export const sendEmailOTP = async (email, purpose = 'signup') => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const otpDoc = await firestore.collection('email_otps').add({
      email: email.toLowerCase().trim(),
      otp: otp,
      purpose: purpose,
      verified: false,
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
    });
    
    console.log(`OTP for ${email}: ${otp}`);
    
    return {
      success: true,
      otpId: otpDoc.id,
      message: 'OTP sent to your email',
      devOTP: otp,
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
*/

/*
export const verifyEmailOTP = async (otpId, email, otpCode) => {
  // ... rest of Firebase code
};
*/

/*
export const resendEmailOTP = async (email, purpose = 'signup') => {
  // ... rest of Firebase code
};
*/
