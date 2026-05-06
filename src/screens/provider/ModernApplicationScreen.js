import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useUserRegistration } from '../../context/UserRegistrationContext';
import { saveDraft } from '../../services/providerRegistrationService';

const ModernApplicationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData: contextData, submitApplication } = useUserRegistration();
  const { registrationData } = route.params;

  // Form state
  const [formData, setFormData] = useState({
    experience: '',
    specialization: '',
    workingHours: '',
    serviceArea: '',
    additionalInfo: '',
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [certificates, setCertificates] = useState([]);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Real-time validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'experience':
        if (!value.trim()) {
          newErrors.experience = 'Experience is required';
        } else if (value.trim().length < 10) {
          newErrors.experience = 'Please provide more details (minimum 10 characters)';
        } else {
          delete newErrors.experience;
        }
        break;
      case 'specialization':
        if (!value.trim()) {
          newErrors.specialization = 'Specialization is required';
        } else {
          delete newErrors.specialization;
        }
        break;
      case 'workingHours':
        if (!value.trim()) {
          newErrors.workingHours = 'Working hours are required';
        } else {
          delete newErrors.workingHours;
        }
        break;
      case 'serviceArea':
        if (!value.trim()) {
          newErrors.serviceArea = 'Service area is required';
        } else {
          delete newErrors.serviceArea;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const addCertificate = async () => {
    if (certificates.length >= 3) {
      Alert.alert('Limit Reached', 'Maximum 3 certificates allowed');
      return;
    }

    Alert.alert(
      'Add Certificate',
      'Choose how you want to add your certificate',
      [
        { text: 'Take Photo', onPress: () => takePhoto() },
        { text: 'Choose from Gallery', onPress: () => pickImage() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCertificates(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCertificates(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeCertificate = (index) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      const step1Errors = {};
      if (!formData.experience.trim()) step1Errors.experience = 'Experience is required';
      if (!formData.specialization.trim()) step1Errors.specialization = 'Specialization is required';
      
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }
      
      setCurrentStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'additionalInfo' && !formData[field].trim()) {
        allErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setLoading(true);

    try {
      // Combine all data
      const applicationData = {
        ...registrationData,
        ...contextData,
        ...formData,
        certificates,
        submissionDate: new Date().toISOString(),
        currentStep: 8,
      };

      // Save to context and get application ID
      await submitApplication();
      await saveDraft(applicationData);

      // Navigate directly to dashboard (no celebration screen)
      setTimeout(() => {
        setLoading(false);
        navigation.replace('ProviderDashboard');
      }, 1000);

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          { backgroundColor: currentStep >= 1 ? colors.primary : colors.border }
        ]}>
          <Text style={[
            styles.stepNumber,
            { color: currentStep >= 1 ? '#FFFFFF' : colors.textSecondary }
          ]}>1</Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>Experience</Text>
      </View>
      
      <View style={[styles.stepLine, { backgroundColor: currentStep >= 2 ? colors.primary : colors.border }]} />
      
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          { backgroundColor: currentStep >= 2 ? colors.primary : colors.border }
        ]}>
          <Text style={[
            styles.stepNumber,
            { color: currentStep >= 2 ? '#FFFFFF' : colors.textSecondary }
          ]}>2</Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>Details</Text>
      </View>
    </View>
  );

  const renderInputField = (field, label, placeholder, multiline = false, icon = null) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: colors.card,
          borderColor: focusedField === field ? colors.primary : 
                      errors[field] ? '#EF4444' : colors.cardBorder,
        }
      ]}>
        {icon && (
          <View style={styles.inputIcon}>
            {icon}
          </View>
        )}
        <TextInput
          style={[
            styles.textInput,
            { 
              color: colors.text,
              height: multiline ? 80 : 50,
              textAlignVertical: multiline ? 'top' : 'center',
            }
          ]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Professional Experience</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Tell us about your professional background
      </Text>

      {renderInputField(
        'experience',
        'Years of Experience',
        'e.g., 5 years in plumbing, residential and commercial...',
        true,
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path d="M12 14L9 11L10.4 9.6L12 11.2L15.6 7.6L17 9L12 14Z" fill={colors.primary} />
          <Path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4Z" fill={colors.primary} />
        </Svg>
      )}

      {renderInputField(
        'specialization',
        'Specialization',
        'e.g., Residential plumbing, Emergency repairs...',
        false,
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill={colors.primary} />
        </Svg>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Service Details</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Complete your service information
      </Text>

      {renderInputField(
        'workingHours',
        'Working Hours',
        'e.g., Monday-Friday 9AM-6PM, Weekends available',
        false,
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12S7.6 4 12 4 20 7.6 20 12 16.4 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill={colors.primary} />
        </Svg>
      )}

      {renderInputField(
        'serviceArea',
        'Service Area',
        'e.g., Downtown, North Side, 10km radius',
        false,
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill={colors.primary} />
        </Svg>
      )}

      {renderInputField(
        'additionalInfo',
        'Additional Information (Optional)',
        'Any other details you\'d like to share...',
        true
      )}

      {/* Certificates Section */}
      <View style={styles.certificatesSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Certificates & Licenses
        </Text>
        
        <TouchableOpacity
          style={[styles.addCertificateButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={addCertificate}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill={colors.primary} />
          </Svg>
          <Text style={[styles.addCertificateText, { color: colors.text }]}>
            Add Certificate ({certificates.length}/3)
          </Text>
        </TouchableOpacity>

        {certificates.length > 0 && (
          <View style={styles.certificatesGrid}>
            {certificates.map((uri, index) => (
              <View key={index} style={styles.certificateItem}>
                <Image source={{ uri }} style={styles.certificateImage} />
                <TouchableOpacity
                  style={styles.removeCertificateButton}
                  onPress={() => removeCertificate(index)}
                >
                  <Svg width="20" height="20" viewBox="0 0 24 24">
                    <Circle cx="12" cy="12" r="10" fill="#EF4444" />
                    <Path d="M8 8L16 16M16 8L8 16" stroke="#FFFFFF" strokeWidth="2" />
                  </Svg>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 20 }]}>
        <TouchableOpacity 
          onPress={() => currentStep > 1 ? setCurrentStep(1) : navigation.canGoBack() && navigation.goBack()} 
          style={styles.backButton}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Complete Application</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Step Indicator */}
        {renderStepIndicator()}

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { 
                backgroundColor: loading ? colors.disabled : colors.primary,
                shadowColor: colors.primary,
              }
            ]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 1 ? 'Next Step' : 'Submit Application'}
                </Text>
                <Svg width="20" height="20" viewBox="0 0 24 24">
                  <Path d="M9 18L15 12L9 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                </Svg>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  certificatesSection: {
    marginTop: 32,
  },
  addCertificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addCertificateText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  certificatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  certificateItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: 'relative',
  },
  certificateImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeCertificateButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default ModernApplicationScreen;