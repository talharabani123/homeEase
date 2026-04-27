/**
 * Email Authentication Screen
 * Passwordless login using Email Link (OTP)
 * Works for both Customer and Provider
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendOTPEmail, getStoredEmail } from '../../services/firebaseEmailAuthService';
import { saveUserData } from '../../services/userStorageService';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const EmailAuthScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const role = route.params?.role || 'customer'; // 'customer' or 'provider'
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    loadStoredEmail();
  }, []);

  const loadStoredEmail = async () => {
    const storedEmail = await getStoredEmail();
    if (storedEmail) {
      setEmail(storedEmail);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    const result = await sendOTPEmail(email.trim().toLowerCase(), role);

    setLoading(false);

    if (result.success) {
      setEmailSent(true);
      Alert.alert(
        'Email Sent! 📧',
        'We sent a verification link to your email. Click the link to sign in.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send verification email');
    }
  };

  const handleResendOTP = async () => {
    setEmailSent(false);
    await handleSendOTP();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons
                name={role === 'customer' ? 'person' : 'briefcase'}
                size={48}
                color={COLORS.primaryGreen}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {emailSent ? 'Check Your Email' : 'Sign In / Sign Up'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {emailSent
              ? 'We sent a verification link to your email'
              : `Enter your email to ${role === 'customer' ? 'get started' : 'continue as provider'}`}
          </Text>

          {!emailSent ? (
            <>
              {/* Email Input */}
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="your.email@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primaryGreen, '#0D9F6E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Send Verification Link</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="information-circle" size={20} color={COLORS.primaryGreen} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  No password needed! We'll send you a secure link to sign in.
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Email Sent Success */}
              <View style={styles.successContainer}>
                <View style={styles.emailSentIcon}>
                  <Ionicons name="mail" size={64} color={COLORS.primaryGreen} />
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </View>
                </View>

                <Text style={[styles.emailSentText, { color: colors.text }]}>
                  {email}
                </Text>

                <View style={[styles.instructionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: colors.text }]}>
                      Open your email app
                    </Text>
                  </View>

                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: colors.text }]}>
                      Click the verification link
                    </Text>
                  </View>

                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: colors.text }]}>
                      You'll be signed in automatically
                    </Text>
                  </View>
                </View>

                {/* Resend Button */}
                <TouchableOpacity
                  style={[styles.resendButton, { borderColor: colors.border }]}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.primaryGreen} />
                  <Text style={[styles.resendText, { color: COLORS.primaryGreen }]}>
                    Resend Link
                  </Text>
                </TouchableOpacity>

                {/* Change Email */}
                <TouchableOpacity
                  style={styles.changeEmailButton}
                  onPress={() => setEmailSent(false)}
                >
                  <Text style={[styles.changeEmailText, { color: colors.textSecondary }]}>
                    Wrong email? Change it
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: COLORS.primaryGreen }}>Terms of Service</Text> and{' '}
            <Text style={{ color: COLORS.primaryGreen }}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
  },
  emailSentIcon: {
    position: 'relative',
    marginBottom: 24,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailSentText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  instructionBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    gap: 8,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeEmailButton: {
    paddingVertical: 8,
  },
  changeEmailText: {
    fontSize: 14,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 'auto',
    paddingTop: 24,
  },
});

export default EmailAuthScreen;
