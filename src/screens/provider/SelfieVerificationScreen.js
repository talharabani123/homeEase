import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Alert, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useUserRegistration } from '../../context/UserRegistrationContext';
import { saveDraft, loadDraft } from '../../services/providerRegistrationService';
import DocumentGuidelineScreen from '../../components/DocumentGuidelineScreen';

const SelfieVerificationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData: contextData, setSelfieImage: setContextSelfie } = useUserRegistration();
  const { registrationData } = route.params;
  
  const [selfieImage, setSelfieImage] = useState(null);
  const [showGuideline, setShowGuideline] = useState(false);
  const [skipGuidelines, setSkipGuidelines] = useState(false);

  useEffect(() => {
    loadSavedDraft();
    checkSkipPreference();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data && result.data.selfieImage) {
      setSelfieImage(result.data.selfieImage);
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

  const showGuidelineScreen = () => {
    if (skipGuidelines) {
      takeSelfie();
    } else {
      setShowGuideline(true);
    }
  };

  const handleGuidelineContinue = () => {
    setShowGuideline(false);
    takeSelfie();
  };

  const handleGuidelineSkip = () => {
    saveSkipPreference();
    handleGuidelineContinue();
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required for selfie verification');
      return;
    }

    // Direct camera capture without employee detection screen
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setSelfieImage(photoUri);
        
        // Save to context immediately
        await setContextSelfie(photoUri);
        
        // Show success feedback
        Alert.alert('Success!', 'Selfie captured successfully');
      }
    } catch (error) {
      console.error('Error capturing selfie:', error);
      Alert.alert('Error', 'Failed to capture selfie. Please try again.');
    }
  };

  const showSuccessAnimation = () => {
    // This would show the tick.mp4 animation
    // For now, we'll show a simple success message
    Alert.alert('Success!', 'Selfie captured successfully');
  };

  const handleContinue = async () => {
    if (!selfieImage) {
      Alert.alert('Selfie Required', 'Please take a clear selfie to continue');
      return;
    }

    // Save to context
    await setContextSelfie(selfieImage);

    const data = {
      ...registrationData,
      ...contextData,
      selfieImage,
      currentStep: 5
    };

    await saveDraft(data);
    // Navigate to modern application screen instead of ProofOfService
    navigation.navigate('ModernApplication', { registrationData: data });
  };

  return (
    <>
      {showGuideline ? (
        <DocumentGuidelineScreen
          documentType="selfie_with_cnic"
          onContinue={handleGuidelineContinue}
          onSkip={handleGuidelineSkip}
          showSkipOption={true}
        />
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Selfie Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '62.5%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 5 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Svg width="80" height="80" viewBox="0 0 80 80">
            <Circle cx="40" cy="40" r="38" fill={colors.primaryLight} />
            <Path d="M40 20C31.16 20 24 27.16 24 36C24 44.84 31.16 52 40 52C48.84 52 56 44.84 56 36C56 27.16 48.84 20 40 20ZM40 28C43.31 28 46 30.69 46 34C46 37.31 43.31 40 40 40C36.69 40 34 37.31 34 34C34 30.69 36.69 28 40 28ZM40 48C34.67 48 29.99 45.33 27.33 41.33C27.99 38.67 33.33 37.33 40 37.33C46.67 37.33 52.01 38.67 52.67 41.33C50.01 45.33 45.33 48 40 48Z" fill={colors.primary} />
          </Svg>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Take a Clear Selfie</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This helps us verify your identity and build trust with customers
        </Text>

        {selfieImage ? (
          <View style={styles.selfiePreview}>
            <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={takeSelfie}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.captureButton, { backgroundColor: colors.primary }]} onPress={showGuidelineScreen}>
            <Svg width="32" height="32" viewBox="0 0 32 32">
              <Circle cx="16" cy="16" r="14" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              <Circle cx="16" cy="16" r="10" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.captureText}>Take Selfie with CNIC</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.guidelinesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.guidelinesTitle, { color: colors.text }]}>📸 Selfie Guidelines</Text>
          
          <View style={styles.guidelineItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill="#10B981" />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.guidelineText, { color: colors.text }]}>Face clearly visible</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill="#10B981" />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.guidelineText, { color: colors.text }]}>Good lighting</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill="#10B981" />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.guidelineText, { color: colors.text }]}>No sunglasses or hat</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill="#10B981" />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.guidelineText, { color: colors.text }]}>Plain background preferred</Text>
          </View>
        </View>

        <View style={[styles.warningCard, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#F59E0B" />
          </Svg>
          <Text style={[styles.warningText, { color: '#92400E' }]}>
            Gallery upload is disabled. You must take a live selfie using the camera.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: selfieImage ? colors.primary : colors.disabled }]} 
          onPress={handleContinue}
          disabled={!selfieImage}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  iconContainer: { marginTop: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  captureButton: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  captureText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginTop: 12 },
  selfiePreview: { width: 250, height: 250, borderRadius: 125, overflow: 'hidden', marginBottom: 32, position: 'relative' },
  selfieImage: { width: '100%', height: '100%' },
  retakeButton: { position: 'absolute', bottom: 16, left: '50%', transform: [{ translateX: -60 }], flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  retakeText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  guidelinesCard: { width: '100%', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  guidelinesTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  guidelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  guidelineText: { fontSize: 14, marginLeft: 12 },
  warningCard: { width: '100%', flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  warningText: { fontSize: 13, marginLeft: 12, flex: 1, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1 },
  continueButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default SelfieVerificationScreen;
