/**
 * Firebase Cloud Functions for HomeEase
 * Handles email sending for OTP verification
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// ============================================
// EMAIL CONFIGURATION
// ============================================

// Option 1: Gmail Configuration
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail?.email || 'your-email@gmail.com',
    pass: functions.config().gmail?.password || 'your-app-password',
  },
});

// Option 2: SendGrid Configuration (uncomment to use)
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(functions.config().sendgrid?.key || 'your-sendgrid-key');

// ============================================
// CLOUD FUNCTION: Send OTP Email
// ============================================

/**
 * Triggered when a new OTP document is created in Firestore
 * Automatically sends email with OTP code
 */
exports.sendOTPEmail = functions.firestore
  .document('email_otps/{otpId}')
  .onCreate(async (snap, context) => {
    const otpData = snap.data();
    const { email, otp, purpose } = otpData;

    console.log(`Sending OTP ${otp} to ${email} for ${purpose}`);

    // Email content
    const subject = purpose === 'signup' 
      ? 'Verify Your HomeEase Account' 
      : 'Your HomeEase Login Code';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background: white;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            margin: 20px 0;
            border-radius: 8px;
          }
          .info {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 HomeEase</h1>
          <p>Your Home Services Platform</p>
        </div>
        
        <div class="content">
          <h2>Hello!</h2>
          <p>Your verification code is:</p>
          
          <div class="otp-box">
            ${otp}
          </div>
          
          <div class="info">
            <strong>⏰ Important:</strong>
            <ul>
              <li>This code expires in <strong>10 minutes</strong></li>
              <li>You have <strong>3 attempts</strong> to enter the correct code</li>
              <li>Never share this code with anyone</li>
            </ul>
          </div>
          
          <p>If you didn't request this code, please ignore this email or contact our support team.</p>
          
          <p>Best regards,<br><strong>The HomeEase Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 HomeEase. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      HomeEase - Email Verification
      
      Your verification code is: ${otp}
      
      This code expires in 10 minutes.
      You have 3 attempts to enter the correct code.
      
      If you didn't request this code, please ignore this email.
      
      Best regards,
      The HomeEase Team
    `;

    try {
      // Option 1: Send with Gmail (Nodemailer)
      await gmailTransporter.sendMail({
        from: '"HomeEase" <noreply@homeease.com>',
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      // Option 2: Send with SendGrid (uncomment to use)
      /*
      await sgMail.send({
        to: email,
        from: 'noreply@homeease.com', // Must be verified in SendGrid
        subject: subject,
        text: textContent,
        html: htmlContent,
      });
      */

      console.log(`✅ OTP email sent successfully to ${email}`);
      
      // Update Firestore to mark email as sent
      await snap.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      
      // Update Firestore to mark email send failure
      await snap.ref.update({
        emailSent: false,
        emailError: error.message,
      });

      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
  });

// ============================================
// CLOUD FUNCTION: Cleanup Expired OTPs
// ============================================

/**
 * Runs every hour to delete expired OTP documents
 * Keeps Firestore clean and reduces storage costs
 */
exports.cleanupExpiredOTPs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredOTPs = await admin.firestore()
      .collection('email_otps')
      .where('expiresAt', '<', now.toDate())
      .get();

    const batch = admin.firestore().batch();
    expiredOTPs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️ Deleted ${expiredOTPs.size} expired OTP documents`);
    
    return { deleted: expiredOTPs.size };
  });

// ============================================
// CLOUD FUNCTION: HTTP Endpoint (Alternative)
// ============================================

/**
 * Alternative: Call this function directly from your app
 * Usage: POST https://your-region-your-project.cloudfunctions.net/sendOTPEmailHTTP
 * Body: { email: "user@example.com", otp: "123456", purpose: "signup" }
 */
exports.sendOTPEmailHTTP = functions.https.onCall(async (data, context) => {
  const { email, otp, purpose } = data;

  if (!email || !otp) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and OTP are required');
  }

  // Same email sending logic as above
  // ... (copy from sendOTPEmail function)

  return { success: true, message: 'OTP email sent' };
});
