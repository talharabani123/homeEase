import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { formatPakistaniPhone, formatCNIC, cleanPhoneNumber, getCNICError, getPhoneError, getPasswordError } from '../../utils/validation';
import RegistrationSuccessModal from '../../components/RegistrationSuccessModal';
import { signUpWithEmail } from '../../services/supabaseAuthService';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="40" height="40" viewBox="0 0 40 40">
      <Circle cx="15" cy="20" r="12" fill={COLORS.textBlack} opacity="0.9" />
      <Circle cx="25" cy="20" r="12" fill={COLORS.textBlack} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
  </View>
);

const serviceCategories = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Mechanic',
  'AC Technician',
  'Painter',
  'Cleaner',
  'Gardener',
  'Other',
];

const ProviderSignupScreen = ({ navigation, route }) => {
  const { signIn } = useAuth();
  const alert = useAlert();
  
  // Check if this is part of registration flow
  const { selectedServices, isRegistration } = route.params || {};
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Account Info
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const totalSteps = 1; // Simplified to just account creation, then navigate to full registration

  const handlePhoneChange = (value) => {
    const formatted = formatPakistaniPhone(value);
    updateField('phoneNumber', formatted);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      
      const phoneError = getPhoneError(formData.phoneNumber);
      if (phoneError) newErrors.phoneNumber = phoneError;
      
      const passwordError = getPasswordError(formData.password);
      if (passwordError) newErrors.password = passwordError;
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Sign up with Supabase (will send OTP email automatically)
      const signupResult = await signUpWithEmail(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        'provider',
        cleanPhoneNumber(formData.phoneNumber)
      );
      
      setLoading(false);
      
      if (signupResult.success) {
        // Always require OTP verification — Resend handles email delivery
        navigation.navigate('EmailOTPVerification', {
          email: formData.email.trim(),
          isRegistration,
          selectedServices,
          role: 'provider',
          // Pass through to PersonalInfo so the provider doesn't re-type them
          providerFullName: formData.fullName.trim(),
          providerPhone: formData.phoneNumber,
          devOTP: signupResult.devOTP,
        });
      } else {
        // Handle specific error cases
        if (signupResult.error && signupResult.error.includes('already registered')) {
          alert.error(
            'Email Already Registered',
            'This email is already registered. If you registered as a customer, please use a different email for your provider account, or login as a customer.',
            [
              {
                text: 'Try Different Email',
                onPress: () => {},
              },
              {
                text: 'Go to Login',
                onPress: () => navigation.navigate('ProviderLogin'),
                style: 'primary',
              },
            ]
          );
        } else {
          alert.error('Error', signupResult.error || 'Failed to create account');
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Sign up error:', error);
      alert.error('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSuccessModalClose = (action) => {
    setShowSuccessModal(false);
    if (action === 'login') {
      navigation.navigate('ProviderLogin');
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const renderStepContent = () => {
    return (
      <>
        <Text style={styles.stepTitle}>Create Provider Account</Text>
        <Text style={styles.stepDescription}>
          Fill in your details to get started as a service provider
        </Text>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
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
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Logo />

        <Text style={styles.title}>
          {isRegistration ? 'Create Your Account' : 'Become a Service Provider'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegistration 
            ? 'First, let\'s create your account to continue registration' 
            : 'Complete verification to start offering services'}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Account Creation</Text>
        </View>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.primaryButtonFull, loading && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Already registered?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProviderLogin')}>
            <Text style={styles.toggleLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={alert.hide}
      />
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginTop: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginBottom: 20,
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
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  uploadButton: {
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
  },
  uploadButtonLarge: {
    height: 120,
  },
  uploadButtonSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    borderStyle: 'solid',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  uploadButtonTextLarge: {
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.buttonWeight,
    color: COLORS.white,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
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

export default ProviderSignupScreen;
