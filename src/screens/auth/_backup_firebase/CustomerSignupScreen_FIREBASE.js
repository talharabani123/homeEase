import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import { formatPakistaniPhone, cleanPhoneNumber, getPhoneError, getPasswordError } from '../../../utils/validation';
import { KeyboardDismissView } from '../../../components/KeyboardDismissView';
import { sendOTP } from '../../../services/firebaseAuthService';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="50" height="50" viewBox="0 0 50 50">
      <Circle cx="18" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
      <Circle cx="32" cy="25" r="15" fill={COLORS.textBlack} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
  </View>
);

const CustomerSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (value) => {
    const formatted = formatPakistaniPhone(value);
    setFormData({ ...formData, phoneNumber: formatted });
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    const phoneError = getPhoneError(formData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    const passwordError = getPasswordError(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Email is optional but validate if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const cleanedPhone = cleanPhoneNumber(formData.phoneNumber);
      
      // Send OTP via Firebase
      const result = await sendOTP(cleanedPhone);

      setLoading(false);

      if (result.success) {
        // Navigate to OTP verification with user data
        navigation.navigate('OTPVerification', {
          phoneNumber: cleanedPhone,
          confirmation: result.confirmation,
          userData: {
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: cleanedPhone,
            password: formData.password, // Note: In production, don't store password
            role: 'customer',
          },
          verificationType: 'signup',
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to send OTP');
      }
    } catch (error) {
      setLoading(false);
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <KeyboardDismissView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Logo />

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to hire service professionals</Text>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textGrey}
            value={formData.fullName}
            onChangeText={(value) => updateField('fullName', value)}
            editable={!loading}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="+92 300 1234 567"
            placeholderTextColor={COLORS.textGrey}
            value={formData.phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            editable={!loading}
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
        </View>

        {/* Email (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="your.email@example.com"
            placeholderTextColor={COLORS.textGrey}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Minimum 6 characters"
            placeholderTextColor={COLORS.textGrey}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            editable={!loading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Re-enter your password"
            placeholderTextColor={COLORS.textGrey}
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry
            editable={!loading}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Signup Button */}
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLogin')} disabled={loading}>
            <Text style={styles.toggleLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardDismissView>
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
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
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

export default CustomerSignupScreen;
