import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft, loadDraft } from '../../services/providerRegistrationService';

const ProfessionalInfoScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData } = route.params;
  
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [skillsDescription, setSkillsDescription] = useState('');
  const [serviceRadius, setServiceRadius] = useState('10');
  const [basePrice, setBasePrice] = useState('');

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = async () => {
    const result = await loadDraft();
    if (result.success && result.data) {
      setYearsOfExperience(result.data.yearsOfExperience?.toString() || '');
      setSkillsDescription(result.data.skillsDescription || '');
      setServiceRadius(result.data.serviceRadius?.toString() || '10');
      setBasePrice(result.data.basePrice?.toString() || '');
    }
  };

  const validate = () => {
    if (!yearsOfExperience || parseInt(yearsOfExperience) < 0 || parseInt(yearsOfExperience) > 50) {
      Alert.alert('Invalid Experience', 'Please enter experience between 0-50 years');
      return false;
    }

    if (!skillsDescription || skillsDescription.trim().length < 50) {
      Alert.alert('Skills Description Required', 'Please describe your skills (minimum 50 characters)');
      return false;
    }

    if (!serviceRadius || parseInt(serviceRadius) < 5 || parseInt(serviceRadius) > 50) {
      Alert.alert('Invalid Service Radius', 'Please select radius between 5-50 km');
      return false;
    }

    if (basePrice && (parseInt(basePrice) < 100 || parseInt(basePrice) > 10000)) {
      Alert.alert('Invalid Base Price', 'Base price should be between Rs. 100-10,000');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    const data = {
      ...registrationData,
      yearsOfExperience: parseInt(yearsOfExperience),
      skillsDescription: skillsDescription.trim(),
      serviceRadius: parseInt(serviceRadius),
      basePrice: basePrice ? parseInt(basePrice) : 0,
      currentStep: 3
    };

    await saveDraft(data);
    navigation.navigate('CNICVerification', { registrationData: data });
  };

  const radiusOptions = [5, 10, 15, 20, 30, 50];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Professional Info</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '37.5%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 3 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Experience */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Years of Experience <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="e.g., 5"
            placeholderTextColor={colors.placeholder}
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Enter 0 if you're just starting</Text>
        </View>

        {/* Skills Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description of Skills <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Describe your skills, expertise, and what makes you a great service provider..."
            placeholderTextColor={colors.placeholder}
            value={skillsDescription}
            onChangeText={setSkillsDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {skillsDescription.length}/500 (minimum 50)
          </Text>
        </View>

        {/* Service Radius */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Service Area Radius <Text style={styles.required}>*</Text>
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary, marginBottom: 12 }]}>
            How far are you willing to travel for jobs?
          </Text>
          <View style={styles.radiusOptions}>
            {radiusOptions.map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusOption,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  serviceRadius === radius.toString() && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => setServiceRadius(radius.toString())}
              >
                <Text style={[styles.radiusText, { color: serviceRadius === radius.toString() ? colors.primary : colors.text }]}>
                  {radius} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Base Price */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Expected Base Price (Optional)
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary, marginBottom: 12 }]}>
            Your starting price for services (you can adjust per job)
          </Text>
          <View style={styles.priceInput}>
            <Text style={[styles.currency, { color: colors.text }]}>Rs.</Text>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="e.g., 500"
              placeholderTextColor={colors.placeholder}
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  required: { color: '#DC2626' },
  input: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1 },
  textArea: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, minHeight: 120 },
  hint: { fontSize: 13, marginTop: 6 },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  radiusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  radiusOption: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 2 },
  radiusText: { fontSize: 14, fontWeight: '600' },
  priceInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, borderTopWidth: 1 },
  continueButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default ProfessionalInfoScreen;
