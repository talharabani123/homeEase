import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StatusBar, 
  SafeAreaView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft, validateEmail, validatePhone, validatePassword } from '../../services/providerRegistrationService';
import ScreenWrapper from '../../components/ScreenWrapper';

// Pakistan cities list
const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Mardan',
  'Mingora', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Dera Ghazi Khan',
  'Sahiwal', 'Nawabshah', 'Okara', 'Mirpur Khas', 'Chiniot', 'Kamoke', 'Mandi Bahauddin',
  'Jhelum', 'Sadiqabad', 'Jacobabad', 'Shikarpur', 'Khanewal', 'Hafizabad', 'Kohat', 'Muzaffargarh',
  'Khanpur', 'Gojra', 'Bahawalnagar', 'Muridke', 'Pak Pattan', 'Abottabad', 'Tando Adam',
  'Jaranwala', 'Khairpur', 'Chishtian', 'Daska', 'Dadu'
];

const PersonalInfoScreenSimple = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData } = route.params;
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  // Refs for input navigation
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data) {
      setFormData({
        fullName: result.data.fullName || '',
        phoneNumber: result.data.phoneNumber || '',
        email: result.data.email || '',
        password: result.data.password || '',
        confirmPassword: result.data.confirmPassword || '',
        city: result.data.city || ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const phoneValidation = validatePhone(formData.phoneNumber);
    if (!phoneValidation.valid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };
  const handleContinue = async () => {
    console.log('Continue button pressed');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    console.log('Validation passed, starting navigation...');
    setLoading(true);

    const data = {
      ...registrationData,
      ...formData,
      currentStep: 2
    };

    console.log('Saving draft with data:', data);
    const result = await saveDraft(data);
    setLoading(false);

    console.log('Save result:', result);

    if (result.success) {
      console.log('Navigating to ProfessionalInfo...');
      navigation.navigate('ProfessionalInfo', { registrationData: data });
    } else {
      console.log('Save failed:', result.error);
      Alert.alert('Error', result.error || 'Failed to save data');
    }
  };

  const filteredCities = PAKISTAN_CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.cityItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        handleInputChange('city', item);
        setShowCityModal(false);
        setCitySearch('');
      }}
    >
      <Text style={[styles.cityText, { color: colors.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={[styles.header, { 
            backgroundColor: colors.background, 
            borderBottomColor: colors.border 
          }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path 
                  d="M15 18 L9 12 L15 6" 
                  stroke={colors.text} 
                  strokeWidth="2" 
                  fill="none" 
                />
              </Svg>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Personal Information
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Step 2 of 8
            </Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Let's get to know you better. This information helps us verify your identity.
            </Text>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Full Name *
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.fullName ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.placeholder}
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                  />
                </View>
                {errors.fullName && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.fullName}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Use your real name as it appears on your CNIC
                </Text>
              </View>
              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Phone Number *
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.phoneNumber ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <Text style={[styles.countryCode, { color: colors.text }]}>+92</Text>
                  <TextInput
                    ref={phoneRef}
                    style={[styles.textInput, { color: colors.text, flex: 1 }]}
                    placeholder="3001234567"
                    placeholderTextColor={colors.placeholder}
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </View>
                {errors.phoneNumber && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.phoneNumber}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Enter 10 digits without country code
                </Text>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email Address *
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.email ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <TextInput
                    ref={emailRef}
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="your.email@example.com"
                    placeholderTextColor={colors.placeholder}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
                {errors.email && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.email}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  We'll use this for account verification and updates
                </Text>
              </View>
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Password *
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.password ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <TextInput
                    ref={passwordRef}
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.placeholder}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Svg width="20" height="20" viewBox="0 0 24 24">
                      <Path
                        d={showPassword 
                          ? "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          : "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        }
                        fill={colors.textSecondary}
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.password}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  At least 8 characters with uppercase, lowercase, and number
                </Text>
              </View>
              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Confirm Password *
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.confirmPassword ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.placeholder}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => setShowCityModal(true)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Svg width="20" height="20" viewBox="0 0 24 24">
                      <Path
                        d={showConfirmPassword 
                          ? "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          : "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        }
                        fill={colors.textSecondary}
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.confirmPassword}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Must match your password exactly
                </Text>
              </View>
              {/* City Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  City *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer, 
                    { 
                      backgroundColor: colors.inputBackground, 
                      borderColor: errors.city ? colors.error : colors.inputBorder 
                    }
                  ]}
                  onPress={() => setShowCityModal(true)}
                >
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <Text style={[
                    styles.textInput, 
                    { 
                      color: formData.city ? colors.text : colors.placeholder,
                      paddingVertical: 16
                    }
                  ]}>
                    {formData.city || 'Select your city'}
                  </Text>
                  <Svg width="20" height="20" viewBox="0 0 24 24">
                    <Path
                      d="M7 10l5 5 5-5z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                </TouchableOpacity>
                {errors.city && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.city}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Select the city where you'll provide services
                </Text>
              </View>
            </View>
          </ScrollView>
          {/* Continue Button */}
          <View style={[styles.footer, { 
            backgroundColor: colors.background, 
            borderTopColor: colors.border 
          }]}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Svg width="20" height="20" viewBox="0 0 24 24">
                    <Path
                      d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                      fill="#fff"
                    />
                  </Svg>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* City Selection Modal */}
        <Modal
          visible={showCityModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select City</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderBottomColor: colors.border }]}>
              <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.searchIcon}>
                <Path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill={colors.textSecondary}
                />
              </Svg>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search cities..."
                placeholderTextColor={colors.placeholder}
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item}
              style={styles.cityList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '25%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
    textAlign: 'center',
  },
  formSection: {
    gap: 32,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PersonalInfoScreenSimple;