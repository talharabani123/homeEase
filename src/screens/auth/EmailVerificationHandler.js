/**
 * Email Verification Handler Screen
 * Handles the email link verification and saves user data
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { verifyEmailLink } from '../../services/firebaseEmailAuthService';
import { saveUserData } from '../../services/userStorageService';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const EmailVerificationHandler = ({ navigation }) => {
  const { colors } = useTheme();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    handleEmailLink();
  }, []);

  const handleEmailLink = async () => {
    try {
      // Get the initial URL (when app is opened from email link)
      const initialUrl = await Linking.getInitialURL();
      
      if (initialUrl) {
        await processEmailLink(initialUrl);
      } else {
        // Listen for URL changes (when app is already open)
        const subscription = Linking.addEventListener('url', ({ url }) => {
          processEmailLink(url);
        });

        return () => subscription.remove();
      }
    } catch (error) {
      console.error('Handle Email Link Error:', error);
      setStatus('error');
      setMessage('Failed to process verification link');
    }
  };

  const processEmailLink = async (url) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email...');

      // Verify the email link
      const result = await verifyEmailLink(url);

      if (result.success) {
        // Save user data
        const userData = {
          userId: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
          role: result.role,
          createdAt: result.user.createdAt,
          fullName: result.user.email.split('@')[0], // Temporary name
        };

        await saveUserData(userData);

        setStatus('success');
        setMessage('Email verified successfully!');

        // Navigate based on role
        setTimeout(() => {
          if (result.role === 'provider') {
            // Check if provider has completed registration
            navigation.replace('ProviderRegistrationIntro');
          } else {
            // Customer goes to dashboard
            navigation.replace('CustomerDashboard');
          }
        }, 1500);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed');
        
        Alert.alert(
          'Verification Failed',
          result.error || 'Failed to verify email link',
          [
            {
              text: 'Try Again',
              onPress: () => navigation.replace('RoleSelection'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Process Email Link Error:', error);
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            <Text style={[styles.submessage, { color: colors.textSecondary }]}>
              Please wait...
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.primaryGreen} />
            </View>
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            <Text style={[styles.submessage, { color: colors.textSecondary }]}>
              Redirecting you...
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={80} color="#EF4444" />
            </View>
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            <Text style={[styles.submessage, { color: colors.textSecondary }]}>
              Please try again
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EmailVerificationHandler;
