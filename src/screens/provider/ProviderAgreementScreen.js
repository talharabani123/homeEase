import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { submitProviderRegistration, COMMISSION_RATES } from '../../services/supabaseProviderService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const ProviderAgreementScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { registrationData } = route.params;
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [backgroundCheckAccepted, setBackgroundCheckAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleSubmit = async () => {
    if (!termsAccepted) {
      alert.error('Terms Required', 'Please accept the terms and conditions');
      return;
    }

    if (!backgroundCheckAccepted) {
      alert.error('Background Check Required', 'Please accept the background check consent');
      return;
    }

    setSubmitting(true);
    setUploadProgress('Preparing submission...');

    const finalData = {
      ...registrationData,
      termsAccepted,
      backgroundCheckAccepted
    };

    // Show upload progress
    setUploadProgress('Uploading CNIC images...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUploadProgress('Uploading selfie...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUploadProgress('Uploading proof documents...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUploadProgress('Creating provider profile...');

    const result = await submitProviderRegistration(finalData);
    
    setSubmitting(false);
    setUploadProgress('');

    if (result.success) {
      alert.success(
        'Application Submitted!',
        'Your application has been submitted successfully. We will review it within 24-48 hours.',
        () => {
          navigation.replace('SubmissionStatus', { profile: result.data });
        }
      );
    } else {
      alert.error('Submission Failed', result.error || 'Something went wrong. Please try again.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Agreement & Terms</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '87.5%', backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>Step 7 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.commissionCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Text style={[styles.commissionTitle, { color: colors.text }]}>💰 Commission Structure</Text>
          <View style={styles.commissionItem}>
            <Text style={[styles.commissionLabel, { color: colors.text }]}>Standard Services</Text>
            <Text style={[styles.commissionValue, { color: colors.primary }]}>{COMMISSION_RATES.standard_service}%</Text>
          </View>
          <View style={styles.commissionItem}>
            <Text style={[styles.commissionLabel, { color: colors.text }]}>Emergency Services</Text>
            <Text style={[styles.commissionValue, { color: colors.primary }]}>{COMMISSION_RATES.emergency_service}%</Text>
          </View>
          <View style={styles.commissionItem}>
            <Text style={[styles.commissionLabel, { color: colors.text }]}>First 10 Jobs (Promo)</Text>
            <Text style={[styles.commissionValue, { color: '#10B981' }]}>{COMMISSION_RATES.first_10_jobs}%</Text>
          </View>
        </View>

        <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.termsTitle, { color: colors.text }]}>📋 Key Terms</Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            You will receive job requests based on your location and availability
          </Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            Commission is deducted from each completed job
          </Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            Maintain professional conduct and quality service
          </Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            Cancellation penalties apply for repeated cancellations
          </Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            Customer ratings affect your visibility and job opportunities
          </Text>
          
          <Text style={[styles.termItem, { color: colors.text }]}>
            <Text style={styles.termBullet}>• </Text>
            Payments are processed within 24-48 hours after job completion
          </Text>
        </View>

        <View style={[styles.penaltyCard, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
          <Text style={styles.penaltyTitle}>⚠️ Cancellation Policy</Text>
          <Text style={styles.penaltyText}>
            • First cancellation: Warning{'\n'}
            • Second cancellation: Rs. 200 penalty{'\n'}
            • Third+ cancellation: Rs. 500 penalty + account review{'\n'}
            • Repeated violations may result in account suspension
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.checkbox, { borderColor: colors.cardBorder }]}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[styles.checkboxBox, { borderColor: colors.cardBorder }, termsAccepted && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {termsAccepted && (
              <Svg width="16" height="16" viewBox="0 0 16 16">
                <Path d="M4 8 L7 11 L12 5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              </Svg>
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            I accept the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Service Provider Agreement</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.checkbox, { borderColor: colors.cardBorder }]}
          onPress={() => setBackgroundCheckAccepted(!backgroundCheckAccepted)}
        >
          <View style={[styles.checkboxBox, { borderColor: colors.cardBorder }, backgroundCheckAccepted && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {backgroundCheckAccepted && (
              <Svg width="16" height="16" viewBox="0 0 16 16">
                <Path d="M4 8 L7 11 L12 5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              </Svg>
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            I consent to background verification and document checks
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {submitting && uploadProgress && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>{uploadProgress}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: (termsAccepted && backgroundCheckAccepted) ? colors.primary : colors.disabled }, submitting && { opacity: 0.6 }]} 
          onPress={handleSubmit}
          disabled={!termsAccepted || !backgroundCheckAccepted || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
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
  commissionCard: { padding: 20, borderRadius: 12, borderWidth: 2, marginBottom: 20 },
  commissionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  commissionItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  commissionLabel: { fontSize: 15 },
  commissionValue: { fontSize: 18, fontWeight: '700' },
  termsCard: { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  termsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  termItem: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  termBullet: { fontWeight: '700' },
  penaltyCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  penaltyTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 12 },
  penaltyText: { fontSize: 13, color: '#7F1D1D', lineHeight: 20 },
  checkbox: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16, alignItems: 'flex-start' },
  checkboxBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  checkboxLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  link: { color: '#3B82F6', fontWeight: '600' },
  footer: { padding: 20, borderTopWidth: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 8 },
  progressText: { fontSize: 14 },
  submitButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default ProviderAgreementScreen;
