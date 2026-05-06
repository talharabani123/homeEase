import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StatusBar, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft } from '../../services/providerRegistrationService';

// Years of Experience Options
const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Just Starting (0 years)' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5 years' },
  { value: '6', label: '6 years' },
  { value: '7', label: '7 years' },
  { value: '8', label: '8 years' },
  { value: '9', label: '9 years' },
  { value: '10', label: '10 years' },
  { value: '11', label: '11 years' },
  { value: '12', label: '12 years' },
  { value: '13', label: '13 years' },
  { value: '14', label: '14 years' },
  { value: '15', label: '15 years' },
  { value: '16', label: '16 years' },
  { value: '17', label: '17 years' },
  { value: '18', label: '18 years' },
  { value: '19', label: '19 years' },
  { value: '20', label: '20 years' },
  { value: '20+', label: '20+ years' },
];

const ProfessionalInfoScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData } = route.params;
  
  const [formData, setFormData] = useState({
    yearsOfExperience: '',
    skillsDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data) {
      setFormData({
        yearsOfExperience: result.data.yearsOfExperience?.toString() || '',
        skillsDescription: result.data.skillsDescription || '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Please select your years of experience';
    }

    if (!formData.skillsDescription.trim()) {
      newErrors.skillsDescription = 'Please describe your skills and expertise';
    } else if (formData.skillsDescription.trim().length < 50) {
      newErrors.skillsDescription = 'Description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleExperienceSelect = (experience) => {
    handleInputChange('yearsOfExperience', experience.value);
    setShowExperienceModal(false);
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...registrationData,
        yearsOfExperience: formData.yearsOfExperience,
        skillsDescription: formData.skillsDescription.trim(),
        currentStep: 3
      };

      await saveDraft(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigation.navigate('CNICVerification', { registrationData: data });
    } catch (error) {
      console.error('Continue error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExperienceLabel = (value) => {
    const option = EXPERIENCE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : 'Select experience';
  };

  const renderExperienceItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.experienceItem, { 
        backgroundColor: colors.card, 
        borderBottomColor: colors.border 
      }]}
      onPress={() => handleExperienceSelect(item)}
    >
      <Text style={[styles.experienceText, { color: colors.text }]}>{item.label}</Text>
      {formData.yearsOfExperience === item.value && (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            fill={colors.primary}
          />
        </Svg>
      )}
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
              Professional Information
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Step 3 of 7
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
              Tell us about your professional background and expertise
            </Text>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Years of Experience Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Years of Experience *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer, 
                    { 
                      backgroundColor: colors.inputBackground, 
                      borderColor: errors.yearsOfExperience ? colors.error : colors.inputBorder 
                    }
                  ]}
                  onPress={() => setShowExperienceModal(true)}
                >
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path
                      d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <Text style={[
                    styles.textInput, 
                    { 
                      color: formData.yearsOfExperience ? colors.text : colors.placeholder,
                      paddingVertical: 16
                    }
                  ]}>
                    {getExperienceLabel(formData.yearsOfExperience)}
                  </Text>
                  <Svg width="20" height="20" viewBox="0 0 24 24">
                    <Path
                      d="M7 10l5 5 5-5z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                </TouchableOpacity>
                {errors.yearsOfExperience && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.yearsOfExperience}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Select your total years of professional experience
                </Text>
              </View>

              {/* Skills Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Skills & Expertise Description *
                </Text>
                <View style={[
                  styles.textAreaContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: errors.skillsDescription ? colors.error : colors.inputBorder 
                  }
                ]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.textAreaIcon}>
                    <Path
                      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                      fill={colors.textSecondary}
                    />
                  </Svg>
                  <TextInput
                    style={[styles.textArea, { color: colors.text }]}
                    placeholder="Describe your skills, expertise, certifications, and what makes you a great service provider. Include specific techniques, tools, or specializations you have..."
                    placeholderTextColor={colors.placeholder}
                    value={formData.skillsDescription}
                    onChangeText={(value) => handleInputChange('skillsDescription', value)}
                    multiline
                    numberOfLines={6}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.textAreaFooter}>
                  <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                    {formData.skillsDescription.length}/500 characters
                  </Text>
                  <Text style={[styles.minChars, { 
                    color: formData.skillsDescription.length >= 50 ? colors.success : colors.textSecondary 
                  }]}>
                    (minimum 50)
                  </Text>
                </View>
                {errors.skillsDescription && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.skillsDescription}
                  </Text>
                )}
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Be specific about your skills to attract more customers
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

        {/* Experience Selection Modal */}
        <Modal
          visible={showExperienceModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowExperienceModal(false)}>
                <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Years of Experience</Text>
              <View style={{ width: 60 }} />
            </View>

            <FlatList
              data={EXPERIENCE_OPTIONS}
              renderItem={renderExperienceItem}
              keyExtractor={(item) => item.value}
              style={styles.experienceList}
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
    paddingTop: 60, // Safe area top padding
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
    width: '43%', // 3 of 7 steps
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
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 140,
  },
  textAreaIcon: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 13,
  },
  minChars: {
    fontSize: 13,
    fontWeight: '500',
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
  experienceList: {
    flex: 1,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  experienceText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfessionalInfoScreen;
