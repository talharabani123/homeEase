import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { formatPakistaniPhone, formatCNIC, cleanPhoneNumber, getCNICError, getPhoneError, getPasswordError } from '../../utils/validation';
import RegistrationSuccessModal from '../../components/RegistrationSuccessModal';

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

const ProviderSignupScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    // Step 2: Identity Verification
    cnicNumber: '',
    cnicFront: null,
    cnicBack: null,
    // Step 3: Facial Verification
    faceImage: null,
    // Step 4: Service Details
    serviceCategory: '',
    experienceYears: '',
    skillsDescription: '',
    toolsAvailable: '',
    // Step 5: Address & Location
    fullAddress: '',
    city: '',
    postalCode: '',
    gpsLocation: null,
    // Step 6: Work Proof
    workProofImages: [],
    certificates: [],
  });
  const [errors, setErrors] = useState({});

  const totalSteps = 6;

  const handlePhoneChange = (value) => {
    const formatted = formatPakistaniPhone(value);
    updateField('phoneNumber', formatted);
  };

  const handleCNICChange = (value) => {
    const formatted = formatCNIC(value);
    updateField('cnicNumber', formatted);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        
        const phoneError = getPhoneError(formData.phoneNumber);
        if (phoneError) newErrors.phoneNumber = phoneError;
        
        const passwordError = getPasswordError(formData.password);
        if (passwordError) newErrors.password = passwordError;
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 2:
        const cnicError = getCNICError(formData.cnicNumber);
        if (cnicError) newErrors.cnicNumber = cnicError;
        
        if (!formData.cnicFront) newErrors.cnicFront = 'CNIC front image is required';
        if (!formData.cnicBack) newErrors.cnicBack = 'CNIC back image is required';
        break;
        
      case 3:
        if (!formData.faceImage) newErrors.faceImage = 'Facial verification is required';
        break;
        
      case 4:
        if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required';
        if (!formData.experienceYears) newErrors.experienceYears = 'Experience is required';
        if (!formData.skillsDescription.trim()) newErrors.skillsDescription = 'Skills description is required';
        break;
        
      case 5:
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Full address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.gpsLocation) newErrors.gpsLocation = 'GPS location is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Navigate to OTP verification
    navigation.navigate('OTPVerification', {
      phoneNumber: cleanPhoneNumber(formData.phoneNumber),
      userData: {
        ...formData,
        phoneNumber: cleanPhoneNumber(formData.phoneNumber),
        role: 'service_provider',
        accountStatus: 'pending_verification',
      },
      verificationType: 'provider_signup',
      onSuccess: () => setShowSuccessModal(true),
    });
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

  const handleImageUpload = (field) => {
    // TODO: Implement image picker
    Alert.alert('Image Upload', 'Image picker will be implemented with expo-image-picker');
    updateField(field, { uri: 'placeholder' });
  };

  const handleLocationPick = () => {
    // TODO: Implement location picker
    Alert.alert('Location Picker', 'GPS location picker will be implemented');
    updateField('gpsLocation', { latitude: 0, longitude: 0 });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textGrey}
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
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
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Identity Verification</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CNIC Number</Text>
              <TextInput
                style={[styles.input, errors.cnicNumber && styles.inputError]}
                placeholder="35202-1234567-1"
                placeholderTextColor={COLORS.textGrey}
                value={formData.cnicNumber}
                onChangeText={handleCNICChange}
                keyboardType="number-pad"
              />
              {errors.cnicNumber && <Text style={styles.errorText}>{errors.cnicNumber}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CNIC Front Image</Text>
              <TouchableOpacity
                style={[styles.uploadButton, formData.cnicFront && styles.uploadButtonSuccess]}
                onPress={() => handleImageUpload('cnicFront')}
              >
                <Text style={styles.uploadButtonText}>
                  {formData.cnicFront ? '✓ Image Uploaded' : '📷 Upload CNIC Front'}
                </Text>
              </TouchableOpacity>
              {errors.cnicFront && <Text style={styles.errorText}>{errors.cnicFront}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CNIC Back Image</Text>
              <TouchableOpacity
                style={[styles.uploadButton, formData.cnicBack && styles.uploadButtonSuccess]}
                onPress={() => handleImageUpload('cnicBack')}
              >
                <Text style={styles.uploadButtonText}>
                  {formData.cnicBack ? '✓ Image Uploaded' : '📷 Upload CNIC Back'}
                </Text>
              </TouchableOpacity>
              {errors.cnicBack && <Text style={styles.errorText}>{errors.cnicBack}</Text>}
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Facial Verification</Text>
            <Text style={styles.stepDescription}>
              Take a clear selfie for identity verification
            </Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.uploadButton, styles.uploadButtonLarge, formData.faceImage && styles.uploadButtonSuccess]}
                onPress={() => handleImageUpload('faceImage')}
              >
                <Text style={[styles.uploadButtonText, styles.uploadButtonTextLarge]}>
                  {formData.faceImage ? '✓ Selfie Captured' : '🤳 Capture Selfie'}
                </Text>
              </TouchableOpacity>
              {errors.faceImage && <Text style={styles.errorText}>{errors.faceImage}</Text>}
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Service Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Service Category</Text>
              <View style={styles.categoryGrid}>
                {serviceCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.serviceCategory === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => updateField('serviceCategory', category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.serviceCategory === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.serviceCategory && <Text style={styles.errorText}>{errors.serviceCategory}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={[styles.input, errors.experienceYears && styles.inputError]}
                placeholder="e.g., 5"
                placeholderTextColor={COLORS.textGrey}
                value={formData.experienceYears}
                onChangeText={(value) => updateField('experienceYears', value)}
                keyboardType="number-pad"
              />
              {errors.experienceYears && <Text style={styles.errorText}>{errors.experienceYears}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Skills Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.skillsDescription && styles.inputError]}
                placeholder="Describe your skills and expertise"
                placeholderTextColor={COLORS.textGrey}
                value={formData.skillsDescription}
                onChangeText={(value) => updateField('skillsDescription', value)}
                multiline
                numberOfLines={4}
              />
              {errors.skillsDescription && <Text style={styles.errorText}>{errors.skillsDescription}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tools Available (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List tools you have"
                placeholderTextColor={COLORS.textGrey}
                value={formData.toolsAvailable}
                onChangeText={(value) => updateField('toolsAvailable', value)}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.stepTitle}>Address & Location</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.fullAddress && styles.inputError]}
                placeholder="House/Flat no, Street, Area"
                placeholderTextColor={COLORS.textGrey}
                value={formData.fullAddress}
                onChangeText={(value) => updateField('fullAddress', value)}
                multiline
                numberOfLines={3}
              />
              {errors.fullAddress && <Text style={styles.errorText}>{errors.fullAddress}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="Enter your city"
                placeholderTextColor={COLORS.textGrey}
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Postal Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter postal code"
                placeholderTextColor={COLORS.textGrey}
                value={formData.postalCode}
                onChangeText={(value) => updateField('postalCode', value)}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>GPS Location</Text>
              <TouchableOpacity
                style={[styles.uploadButton, formData.gpsLocation && styles.uploadButtonSuccess]}
                onPress={handleLocationPick}
              >
                <Text style={styles.uploadButtonText}>
                  {formData.gpsLocation ? '✓ Location Set' : '📍 Pick Location on Map'}
                </Text>
              </TouchableOpacity>
              {errors.gpsLocation && <Text style={styles.errorText}>{errors.gpsLocation}</Text>}
            </View>
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.stepTitle}>Work Proof (Optional)</Text>
            <Text style={styles.stepDescription}>
              Upload images of your previous work and certificates to build trust
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Previous Work Images</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => Alert.alert('Work Images', 'Multiple image picker will be implemented')}
              >
                <Text style={styles.uploadButtonText}>
                  📸 Upload Work Images ({formData.workProofImages.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Certificates</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => Alert.alert('Certificates', 'Document picker will be implemented')}
              >
                <Text style={styles.uploadButtonText}>
                  📄 Upload Certificates ({formData.certificates.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
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

        <Text style={styles.title}>Become a Service Provider</Text>
        <Text style={styles.subtitle}>Complete verification to start offering services</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
        </View>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        {currentStep === 1 && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProviderLogin')}>
              <Text style={styles.toggleLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <RegistrationSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        userRole="service_provider"
        userName={formData.fullName}
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
