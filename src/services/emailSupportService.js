/**
 * Email Support Service
 * Handles opening device email app with pre-filled support email
 */

import { Linking, Alert } from 'react-native';

const SUPPORT_EMAIL = 'supporthomeease@gmail.com';
const LEGAL_EMAIL = 'legal@homeease.com';
const PRIVACY_EMAIL = 'privacy@homeease.com';

/**
 * Open device email app with support email
 * @param {string} subject - Email subject
 * @param {string} body - Pre-filled email body (optional)
 */
export const openSupportEmail = async (subject = 'Support Request', body = '') => {
  try {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const canOpen = await Linking.canOpenURL(emailUrl);
    
    if (canOpen) {
      await Linking.openURL(emailUrl);
    } else {
      // Fallback: Show alert with email details
      Alert.alert(
        'Email App Not Available',
        `Please send your query to:\n${SUPPORT_EMAIL}`,
        [
          {
            text: 'Copy Email',
            onPress: () => {
              // Note: Clipboard functionality would require @react-native-clipboard/clipboard
              Alert.alert('Email Address', SUPPORT_EMAIL);
            }
          },
          { text: 'OK' }
        ]
      );
    }
  } catch (error) {
    console.error('Error opening email:', error);
    Alert.alert(
      'Error',
      `Unable to open email app. Please contact us at:\n${SUPPORT_EMAIL}`
    );
  }
};

/**
 * Get support email address
 */
export const getSupportEmail = () => SUPPORT_EMAIL;

/**
 * Get legal email address
 */
export const getLegalEmail = () => LEGAL_EMAIL;

/**
 * Get privacy email address
 */
export const getPrivacyEmail = () => PRIVACY_EMAIL;

/**
 * Open support email with issue details
 * @param {string} issueType - Type of issue
 * @param {string} description - Issue description
 */
export const openSupportEmailWithIssue = async (issueType, description) => {
  const subject = `Support Request - ${issueType}`;
  const body = `Issue Type: ${issueType}\n\nDescription:\n${description}\n\n---\nPlease provide any additional details above this line.`;
  
  await openSupportEmail(subject, body);
};

export default {
  openSupportEmail,
  getSupportEmail,
  getLegalEmail,
  getPrivacyEmail,
  openSupportEmailWithIssue,
};