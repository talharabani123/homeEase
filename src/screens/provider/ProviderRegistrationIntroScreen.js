import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getProviderProfile, loadDraft } from '../../services/providerRegistrationService';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const ProviderRegistrationIntroScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const [hasDraft, setHasDraft] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check for existing provider profile in Firestore
    const profileResult = await getProviderProfile();
    
    if (profileResult.success && profileResult.data) {
      const providerData = profileResult.data;
      setVerificationStatus(providerData.verificationStatus);
      
      // If already approved, go to dashboard
      if (providerData.isVerified && providerData.verificationStatus === 'approved') {
        navigation.replace('ProviderDashboard');
        return;
      }
      
      // If pending, go to status screen
      if (providerData.verificationStatus === 'pending') {
        navigation.replace('SubmissionStatus', { profile: providerData });
        return;
      }
    }

    // Check for existing draft in Firestore
    const draftResult = await loadDraft();
    setHasDraft(draftResult.success);
  };

  const handleStart = () => {
    if (verificationStatus === 'pending') {
      navigation.navigate('SubmissionStatus');
    } else if (verificationStatus === 'approved') {
      navigation.navigate('ProviderDashboard');
    } else {
      navigation.navigate('ServiceSelection');
    }
  };

  const handleResumeDraft = () => {
    alert.confirm(
      'Resume Application',
      'Continue from where you left off?',
      () => navigation.navigate('ServiceSelection', { resumeDraft: true }),
      () => navigation.navigate('ServiceSelection')
    );
  };

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
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.heroIcon}>💼</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Earn as a Service Provider
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Join thousands of professionals earning on HomeEase
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <View style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>💰</Text>
            </View>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>Flexible Earnings</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Set your own rates and work on your schedule
            </Text>
          </View>

          <View style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>📱</Text>
            </View>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>Easy to Use</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Receive requests, accept jobs, and get paid instantly
            </Text>
          </View>

          <View style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>🛡️</Text>
            </View>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>Safe & Secure</Text>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
              Verified customers and secure payment system
            </Text>
          </View>
        </View>

        {/* Requirements */}
        <View style={[styles.requirementsSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What You'll Need</Text>
          
          <View style={styles.requirementItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill={colors.primary} />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.requirementText, { color: colors.text }]}>
              Valid CNIC (18+ years old)
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill={colors.primary} />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.requirementText, { color: colors.text }]}>
              Professional skills or experience
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill={colors.primary} />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.requirementText, { color: colors.text }]}>
              Proof of service (certificates or work photos)
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="9" fill={colors.primary} />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={[styles.requirementText, { color: colors.text }]}>
              Clear selfie for verification
            </Text>
          </View>
        </View>

        {/* Process Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Registration Process</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.timelineNumber}>1</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Select Services</Text>
              <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                Choose the services you want to offer
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.timelineNumber}>2</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Complete Profile</Text>
              <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                Fill in your personal and professional details
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.timelineNumber}>3</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Verification</Text>
              <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                Upload documents and complete verification
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.timelineNumber}>4</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Start Earning</Text>
              <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                Get approved and start receiving job requests
              </Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.primary} />
            <Path d="M12 8 L12 12 M12 16 L12 16.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Approval typically takes 24-48 hours after submission
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {hasDraft && verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
          <TouchableOpacity
            style={[styles.draftButton, { borderColor: colors.primary }]}
            onPress={handleResumeDraft}
          >
            <Text style={[styles.draftButtonText, { color: colors.primary }]}>
              Resume Draft
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>
            {verificationStatus === 'pending' ? 'View Status' :
             verificationStatus === 'approved' ? 'Go to Dashboard' :
             'Get Started'}
          </Text>
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitEmoji: {
    fontSize: 28,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  requirementsSection: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  draftButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProviderRegistrationIntroScreen;
