import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { formatPakistaniPhone, cleanPhoneNumber, getPhoneError, getEmailError } from '../../utils/validation';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
  </View>
);

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [resetMethod, setResetMethod] = useState('phone'); // 'phone' or 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (value) => {
    const formatted = formatPakistaniPhone(value);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (resetMethod === 'phone') {
      const phoneError = getPhoneError(phoneNumber);
      if (phoneError) newErrors.phoneNumber = phoneError;
    } else {
      const emailError = getEmailError(email);
      if (emailError) newErrors.email = emailError;
      if (!email) newErrors.email = 'Email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = () => {
    if (validateForm()) {
      if (resetMethod === 'phone') {
        // Navigate to OTP verification for phone reset
        navigation.navigate('OTPVerification', {
          phoneNumber: cleanPhoneNumber(phoneNumber),
          verificationType: 'password_reset',
          resetMethod: 'phone',
        });
      } else {
        // TODO: Send email reset link
        console.log('Send reset email to:', email);
        // Show success message
        alert('Password reset link has been sent to your email');
        navigation.goBack();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Logo />

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Choose how you want to reset your password
        </Text>

        {/* Reset Method Toggle */}
        <View style={styles.toggleMethodContainer}>
          <TouchableOpacity
            style={[styles.methodButton, resetMethod === 'phone' && styles.methodButtonActive]}
            onPress={() => setResetMethod('phone')}
          >
            <Text style={[styles.methodButtonText, resetMethod === 'phone' && styles.methodButtonTextActive]}>
              📱 Mobile Number
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodButton, resetMethod === 'email' && styles.methodButtonActive]}
            onPress={() => setResetMethod('email')}
          >
            <Text style={[styles.methodButtonText, resetMethod === 'email' && styles.methodButtonTextActive]}>
              ✉️ Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone Number Input */}
        {resetMethod === 'phone' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="+92 300 1234 567"
              placeholderTextColor={COLORS.textGrey}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            <Text style={styles.helperText}>
              We'll send an OTP to verify your identity
            </Text>
          </View>
        )}

        {/* Email Input */}
        {resetMethod === 'email' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your.email@example.com"
              placeholderTextColor={COLORS.textGrey}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <Text style={styles.helperText}>
              We'll send a password reset link to your email
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            {resetMethod === 'phone'
              ? 'Make sure you have access to this phone number to receive the OTP'
              : 'If this email is not registered with your account, you won\'t receive the reset link'}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
          <Text style={styles.primaryButtonText}>
            {resetMethod === 'phone' ? 'Send OTP' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Remember your password?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.toggleLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginTop: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.mainHeading,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 32,
  },
  toggleMethodContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  methodButtonTextActive: {
    color: COLORS.primaryGreen,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textBlack,
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
});

export default ForgotPasswordScreen;
