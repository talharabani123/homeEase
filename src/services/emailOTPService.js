/**
 * Email OTP Service
 * Handles email-based OTP verification using Firestore
 * 
 * Features:
 * - Generate and send 6-digit OTP
 * - Store OTP in Firestore with expiration
 * - Verify OTP with attempt limiting
 * - Resend OTP with rate limiting
 * - Auto-cleanup expired OTPs
 * 
 * Free Tier Optimizations:
 * - Uses Firestore (free tier: 50K reads, 20K writes per day)
 * - No email sending service (logs OTP to console in dev)
 * - Efficient queries with proper indexing
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

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
    const recentOTPQuery = query(
      collection(firestore, 'email_otps'),
      where('email', '==', normalizedEmail),
      where('purpose', '==', purpose)
    );
    
    const recentOTPs = await getDocs(recentOTPQuery);
    
    // Check if there's a recent OTP that's still in cooldown
    const now = new Date();
    for (const otpDoc of recentOTPs.docs) {
      const otpData = otpDoc.data();
      const createdAt = otpData.createdAt?.toDate();
      
      if (createdAt) {
        const secondsSinceCreation = (now - createdAt) / 1000;
        if (secondsSinceCreation < RESEND_COOLDOWN_SECONDS) {
          return {
            success: false,
            error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreation)} seconds before requesting a new OTP.`,
          };
        }
      }
    }
    
    // Delete old OTPs for this email and purpose
    for (const otpDoc of recentOTPs.docs) {
      await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Store OTP in Firestore
    const otpDoc = await addDoc(collection(firestore, 'email_otps'), {
      email: normalizedEmail,
      otp: otp,
      purpose: purpose,
      verified: false,
      attempts: 0,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
    });
    
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
    const otpDocRef = doc(firestore, 'email_otps', otpId);
    const otpSnapshot = await getDocs(
      query(
        collection(firestore, 'email_otps'),
        where('email', '==', normalizedEmail)
      )
    );
    
    if (otpSnapshot.empty) {
      return {
        success: false,
        error: 'OTP not found. Please request a new one.',
      };
    }
    
    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();
    
    // Check if already verified
    if (otpData.verified) {
      return {
        success: false,
        error: 'This OTP has already been used.',
      };
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = otpData.expiresAt?.toDate();
    
    if (expiresAt && now > expiresAt) {
      await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
      return {
        success: false,
        error: 'OTP has expired. Please request a new one.',
      };
    }
    
    // Check max attempts
    if (otpData.attempts >= MAX_ATTEMPTS) {
      await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
      return {
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.',
      };
    }
    
    // Verify OTP code
    if (otpData.otp !== otpCode) {
      // Increment attempts
      await updateDoc(doc(firestore, 'email_otps', otpDoc.id), {
        attempts: otpData.attempts + 1,
      });
      
      const remainingAttempts = MAX_ATTEMPTS - (otpData.attempts + 1);
      
      return {
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      };
    }
    
    // OTP is valid - mark as verified
    await updateDoc(doc(firestore, 'email_otps', otpDoc.id), {
      verified: true,
      verifiedAt: serverTimestamp(),
    });
    
    console.log('✅ OTP verified successfully');
    
    // Clean up after successful verification (optional)
    setTimeout(async () => {
      try {
        await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
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
    const existingOTPsQuery = query(
      collection(firestore, 'email_otps'),
      where('email', '==', normalizedEmail),
      where('purpose', '==', purpose)
    );
    
    const existingOTPs = await getDocs(existingOTPsQuery);
    
    for (const otpDoc of existingOTPs.docs) {
      await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
    }
    
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
    const now = new Date();
    
    // Query all OTPs
    const allOTPsQuery = query(collection(firestore, 'email_otps'));
    const allOTPs = await getDocs(allOTPsQuery);
    
    let deletedCount = 0;
    
    for (const otpDoc of allOTPs.docs) {
      const otpData = otpDoc.data();
      const expiresAt = otpData.expiresAt?.toDate();
      
      if (expiresAt && now > expiresAt) {
        await deleteDoc(doc(firestore, 'email_otps', otpDoc.id));
        deletedCount++;
      }
    }
    
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
