import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft } from '../../services/supabaseProviderService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const ProofOfServiceScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { registrationData } = route.params;
  
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [servicesWithProof, setServicesWithProof] = useState(() => {
    // Initialize with proofDocuments array for each service
    return (registrationData.selectedServices || []).map(service => ({
      ...service,
      proofDocuments: service.proofDocuments || []
    }));
  });

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data && result.data.selectedServices) {
      const servicesWithDocs = result.data.selectedServices.map(service => ({
        ...service,
        proofDocuments: service.proofDocuments || []
      }));
      setServicesWithProof(servicesWithDocs);
    }
  };

  const currentService = servicesWithProof[currentServiceIndex] || {};
  const proofDocuments = currentService.proofDocuments || [];

  const pickImage = async () => {
    // Check limit
    if (proofDocuments.length >= 3) {
      alert.warning('Limit Reached', 'Maximum 3 images per service');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert.error('Permission Denied', 'Gallery permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 3,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const currentCount = proofDocuments.length;
      const remainingSlots = 3 - currentCount;
      const imagesToAdd = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
      
      setServicesWithProof(prev => {
        const updated = [...prev];
        updated[currentServiceIndex] = {
          ...updated[currentServiceIndex],
          proofDocuments: [...proofDocuments, ...imagesToAdd]
        };
        return updated;
      });
      
      if (result.assets.length > remainingSlots) {
        alert.warning('Limit Reached', `Only ${remainingSlots} image(s) added. Maximum 3 images per service.`);
      }
    }
  };

  const takePhoto = async () => {
    // Check limit
    if (proofDocuments.length >= 3) {
      alert.warning('Limit Reached', 'Maximum 3 images per service');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert.error('Permission Denied', 'Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setServicesWithProof(prev => {
        const updated = [...prev];
        updated[currentServiceIndex] = {
          ...updated[currentServiceIndex],
          proofDocuments: [...proofDocuments, result.assets[0].uri]
        };
        return updated;
      });
    }
  };

  const removeImage = (index) => {
    setServicesWithProof(prev => {
      const updated = [...prev];
      updated[currentServiceIndex] = {
        ...updated[currentServiceIndex],
        proofDocuments: proofDocuments.filter((_, i) => i !== index)
      };
      return updated;
    });
  };

  const handleNext = () => {
    if (proofDocuments.length < 2) {
      alert.error('Minimum 2 Images Required', 'Please upload at least 2 proof images for this service');
      return;
    }

    if (currentServiceIndex < servicesWithProof.length - 1) {
      setCurrentServiceIndex(currentServiceIndex + 1);
    } else {
      handleContinue();
    }
  };

  const handleContinue = async () => {
    setLoading(true);

    const data = {
      ...registrationData,
      selectedServices: servicesWithProof,
      currentStep: 6
    };

    const saveResult = await saveDraft(data);
    
    setLoading(false);

    if (saveResult.success) {
      navigation.navigate('ProviderAgreement', { registrationData: data });
    } else {
      alert.error('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Proof of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 6 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.serviceCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Text style={styles.serviceIcon}>{currentService?.icon || '📦'}</Text>
          <Text style={[styles.serviceName, { color: colors.text }]}>{currentService?.name || 'Service'}</Text>
          <Text style={[styles.serviceProgress, { color: colors.textSecondary }]}>
            Service {currentServiceIndex + 1} of {servicesWithProof.length}
          </Text>
        </View>

        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" fill={colors.primary} />
            <Path d="M10 6 L10 10 M10 14 L10 14.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Upload certificates, work photos, or shop pictures (minimum 2 images)
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            Upload Proof <Text style={styles.required}>*</Text>
          </Text>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={takePhoto}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 15.2C13.77 15.2 15.2 13.77 15.2 12C15.2 10.23 13.77 8.8 12 8.8C10.23 8.8 8.8 10.23 8.8 12C8.8 13.77 10.23 15.2 12 15.2ZM9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" fill={colors.primary} />
              </Svg>
              <Text style={[styles.uploadText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={pickImage}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill={colors.primary} />
              </Svg>
              <Text style={[styles.uploadText, { color: colors.text }]}>Choose Image</Text>
            </TouchableOpacity>
          </View>

          {proofDocuments.length > 0 && (
            <View style={styles.imagesGrid}>
              {proofDocuments.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                    <Svg width="24" height="24" viewBox="0 0 24 24">
                      <Circle cx="12" cy="12" r="11" fill="#DC2626" />
                      <Path d="M8 8 L16 16 M16 8 L8 16" stroke="#FFFFFF" strokeWidth="2" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.uploadCount, { color: colors.textSecondary }]}>
            {proofDocuments.length}/3 images uploaded (minimum 2 required)
          </Text>
        </View>

        <View style={[styles.examplesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.examplesTitle, { color: colors.text }]}>💡 What to Upload</Text>
          <Text style={[styles.exampleItem, { color: colors.textSecondary }]}>• Professional certificates or licenses</Text>
          <Text style={[styles.exampleItem, { color: colors.textSecondary }]}>• Photos of completed work</Text>
          <Text style={[styles.exampleItem, { color: colors.textSecondary }]}>• Your workshop or shop</Text>
          <Text style={[styles.exampleItem, { color: colors.textSecondary }]}>• Tools and equipment</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: proofDocuments.length >= 2 ? colors.primary : colors.disabled }, loading && { opacity: 0.6 }]} 
          onPress={handleNext}
          disabled={proofDocuments.length < 2 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {currentServiceIndex < servicesWithProof.length - 1 ? 'Next Service' : 'Continue'}
            </Text>
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
  serviceCard: { padding: 20, borderRadius: 12, borderWidth: 2, alignItems: 'center', marginBottom: 20 },
  serviceIcon: { fontSize: 48, marginBottom: 12 },
  serviceName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  serviceProgress: { fontSize: 14 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  infoText: { fontSize: 13, marginLeft: 8, flex: 1, lineHeight: 18 },
  uploadSection: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  required: { color: '#DC2626' },
  uploadButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  uploadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  uploadText: { fontSize: 14, fontWeight: '600' },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  imageItem: { width: 100, height: 100, borderRadius: 8, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  removeButton: { position: 'absolute', top: -8, right: -8 },
  uploadCount: { fontSize: 13, textAlign: 'center' },
  examplesCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  examplesTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  exampleItem: { fontSize: 13, marginBottom: 6, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1 },
  continueButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default ProofOfServiceScreen;
