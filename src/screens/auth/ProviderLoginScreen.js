import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { formatPakistaniPhone, cleanPhoneNumber, getPhoneError } from '../../utils/validation';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={COLORS.primaryGreen} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={COLORS.primaryGreen} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
    <View style={styles.providerBadge}>
      <Text style={styles.providerBadgeText}>Service Provider</Text>
    </View>
  </View>
);

const ProviderLoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
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
    
    const phoneError = getPhoneError(phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    if (loginMethod === 'password' && !password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      if (loginMethod === 'otp') {
        // Navigate to OTP verification
        navigation.navigate('OTPVerification', {
          phoneNumber: cleanPhoneNumber(phoneNumber),
          verificationType: 'provider_login',
          role: 'service_provider',
        });
      } else {
        // TODO: Implement password login API call
        console.log('Provider Login with password:', { phoneNumber: cleanPhoneNumber(phoneNumber), password });
        // Check account status and navigate accordingly
        // navigation.navigate('ProviderDashboard') or navigation.navigate('PendingVerification')
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
        <Logo />

        <Text style={styles.title}>Provider Login</Text>
        <Text style={styles.subtitle}>Sign in to manage your services</Text>

        {/* Login Method Toggle */}
        <View style={styles.toggleMethodContainer}>
          <TouchableOpacity
            style={[styles.methodButton, loginMethod === 'password' && styles.methodButtonActive]}
            onPress={() => setLoginMethod('password')}
          >
            <Text style={[styles.methodButtonText, loginMethod === 'password' && styles.methodButtonTextActive]}>
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodButton, loginMethod === 'otp' && styles.methodButtonActive]}
            onPress={() => setLoginMethod('otp')}
          >
            <Text style={[styles.methodButtonText, loginMethod === 'otp' && styles.methodButtonTextActive]}>
              OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone Number */}
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
        </View>

        {/* Password (only if password method selected) */}
        {loginMethod === 'password' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textGrey}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
        )}

        {/* Forgot Password */}
        {loginMethod === 'password' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Login Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>
            {loginMethod === 'otp' ? 'Send OTP' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProviderSignup')}>
            <Text style={styles.toggleLink}> Sign Up</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
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
  providerBadge: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
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
    marginBottom: 24,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
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

export default ProviderLoginScreen;
