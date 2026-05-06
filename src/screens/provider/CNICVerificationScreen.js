import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft, validateCNIC, formatCNIC, checkCNICExists } from '../../services/providerRegistrationService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const CNICVerificationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { registrationData } = route.params;
  
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedDraft();
    checkSkipPreference();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data) {
      setCnicNumber(result.data.cnicNumber || '');
      setCnicFrontImage(result.data.cnicFrontImage || null);
      setCnicBackImage(result.data.cnicBackImage || null);
    }
  };

  const checkSkipPreference = async () => {
    try {
      const skipPref = await AsyncStorage.getItem('@skip_document_guidelines');
      setSkipGuidelines(skipPref === 'true');
    } catch (error) {
      console.log('Error checking skip preference:', error);
    }
  };

  const saveSkipPreference = async () => {
    try {
      await AsyncStorage.setItem('@skip_document_guidelines', 'true');
      setSkipGuidelines(true);
    } catch (error) {
      console.log('Error saving skip preference:', error);
    }
  };

  const showGuidelineScreen = (type) => {
    if (skipGuidelines) {
      // Skip guideline and go directly to image picker
      if (type === 'cnic_front') {
        showImagePickerOptions('front');
      } else if (type === 'cnic_back') {
        showImagePickerOptions('back');
      }
    } else {
      setCurrentGuidelineType(type);
      setShowGuideline(true);
    }
  };

  const handleGuidelineContinue = () => {
    setShowGuideline(false);
    if (currentGuidelineType === 'cnic_front') {
      showImagePickerOptions('front');
    } else if (currentGuidelineType === 'cnic_back') {
      showImagePickerOptions('back');
    }
  };

  const handleGuidelineSkip = () => {
    saveSkipPreference();
    handleGuidelineContinue();
  };

  const showImagePickerOptions = (side) => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add your CNIC image',
      [
        { text: 'Take Photo', onPress: () => takePhoto(side) },
        { text: 'Choose from Gallery', onPress: () => pickImage(side) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCnicChange = (text) => {
    const formatted = formatCNIC(text);
    setCnicNumber(formatted);
  };
  const pickImage = async (side) => {
    
    if (status !== 'granted') {
      alert.error('Permission Denied', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 10],
    });

    if (!result.canceled) {
      if (side === 'front') {
        setCnicFrontImage(result.assets[0].uri);
      } else {
        setCnicBackImage(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (side) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert.error('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 10],
    });

    if (!result.canceled) {
      if (side === 'front') {
        setCnicFrontImage(result.assets[0].uri);
        // Show success animation
        showSuccessAnimation();
      } else {
        setCnicBackImage(result.assets[0].uri);
        // Show success animation
        showSuccessAnimation();
      }
    }
  };

  const showSuccessAnimation = () => {
    // This would show the tick.mp4 animation
    // For now, we'll show a simple success message
    Alert.alert('Success!', 'Document captured successfully');
  };

  const validate = async () => {
    const cnicValidation = validateCNIC(cnicNumber);
    if (!cnicValidation.valid) {
      alert.error('Invalid CNIC', cnicValidation.error);
      return false;
    }

    const exists = await checkCNICExists(cnicNumber);
    if (exists.exists) {
      alert.error('CNIC Already Registered', 'This CNIC is already registered with another account');
      return false;
    }

    if (!cnicFrontImage) {
      alert.error('Front Image Required', 'Please upload CNIC front image');
      return false;
    }

    if (!cnicBackImage) {
      alert.error('Back Image Required', 'Please upload CNIC back image');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!await validate()) return;

    setLoading(true);

    const data = {
      ...registrationData,
      cnicNumber,
      cnicFrontImage,
      cnicBackImage,
      currentStep: 4
    };

    const saveResult = await saveDraft(data);
    
    setLoading(false);

    if (saveResult.success) {
      navigation.navigate('SelfieVerification', { registrationData: data });
    } else {
      alert.error('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <>
      {showGuideline ? (
        <DocumentGuidelineScreen
          documentType={currentGuidelineType}
          onContinue={handleGuidelineContinue}
          onSkip={handleGuidelineSkip}
          showSkipOption={true}
        />
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>CNIC Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 4 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" fill={colors.primary} />
            <Path d="M10 6 L10 10 M10 14 L10 14.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Your CNIC will be verified by our team. All information is kept secure.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            CNIC Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="XXXXX-XXXXXXX-X"
            placeholderTextColor={colors.placeholder}
            value={cnicNumber}
            onChangeText={handleCnicChange}
            keyboardType="numeric"
            maxLength={15}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Format: 12345-1234567-1</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            CNIC Front Image <Text style={styles.required}>*</Text>
          </Text>
          {cnicFrontImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: cnicFrontImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeButton} onPress={() => setCnicFrontImage(null)}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="11" fill="#DC2626" />
                  <Path d="M8 8 L16 16 M16 8 L8 16" stroke="#FFFFFF" strokeWidth="2" />
                </Svg>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => showGuidelineScreen('cnic_front')}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2ZM9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" fill={colors.primary} />
                </Svg>
                <Text style={[styles.uploadText, { color: colors.text }]}>Upload CNIC Front</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            CNIC Back Image <Text style={styles.required}>*</Text>
          </Text>
          {cnicBackImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: cnicBackImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeButton} onPress={() => setCnicBackImage(null)}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="11" fill="#DC2626" />
                  <Path d="M8 8 L16 16 M16 8 L8 16" stroke="#FFFFFF" strokeWidth="2" />
                </Svg>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => showGuidelineScreen('cnic_back')}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2ZM9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" fill={colors.primary} />
                </Svg>
                <Text style={[styles.uploadText, { color: colors.text }]}>Upload CNIC Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.securityNote, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={colors.primary} />
          </Svg>
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, { color: colors.text }]}>Your Data is Secure</Text>
            <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>
              All documents are encrypted and only used for verification purposes
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]} 
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={alert.hide}
      />
    </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  progressContainer: { paddingHorizontal: 20, marginBottom: 20 },
  progressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 12 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 20 },
  infoText: { fontSize: 13, marginLeft: 8, flex: 1 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  required: { color: '#DC2626' },
  input: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1 },
  hint: { fontSize: 13, marginTop: 6 },
  uploadButtons: { flexDirection: 'row', gap: 12 },
  uploadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  uploadText: { fontSize: 14, fontWeight: '600' },
  imagePreview: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  removeButton: { position: 'absolute', top: 8, right: 8 },
  securityNote: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  securityText: { flex: 1, marginLeft: 12 },
  securityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  securityDesc: { fontSize: 13, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1 },
  continueButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default CNICVerificationScreen;
