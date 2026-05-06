import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getProviderProfile } from '../../services/providerRegistrationService';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const SubmissionStatusScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { user, switchMode } = useAuth();
  const { profile } = route.params || {};
  
  const [status, setStatus] = useState(profile?.verificationStatus || 'pending');
  const [isVerified, setIsVerified] = useState(profile?.isVerified || false);
  const [rejectionReason, setRejectionReason] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Real-time Firestore listener
    const providerRef = doc(db, 'providers', user.uid);
    const unsubscribe = onSnapshot(providerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.verificationStatus || 'pending');
        setIsVerified(data.isVerified || false);
        setRejectionReason(data.rejectionReason || null);

        // Show alert when approved
        if (data.isVerified && data.verificationStatus === 'approved') {
          alert.success(
            'Congratulations! 🎉',
            'Your provider application has been approved! You can now start receiving job requests.',
            async () => {
              await switchMode('provider');
              navigation.replace('ProviderDashboard');
            }
          );
        }
      }
    }, (error) => {
      console.error('Error listening to provider status:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const startCelebrationAnimation = () => {
    // Celebration bounce animation
    Animated.sequence([
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: '✅',
          title: 'Application Approved!',
          subtitle: 'Congratulations! You can now start earning',
          color: '#10B981',
          bgColor: '#ECFDF5',
          action: 'Go to Dashboard',
          onAction: () => navigation.replace('ProviderDashboard')
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Application Not Approved',
          subtitle: rejectionReason || 'Please review the feedback and reapply',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          action: 'Back to Home',
          onAction: () => navigation.navigate('CustomerDashboard')
        };
      case 'documents_required':
        return {
          icon: '📄',
          title: 'Additional Documents Required',
          subtitle: 'Please upload the requested documents',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          action: 'Upload Documents',
          onAction: () => navigation.goBack()
        };
      default:
        return {
          icon: '🎉',
          title: 'Application Submitted Successfully!',
          subtitle: 'Our team will review your application and documents',
          color: '#3B82F6',
          bgColor: '#EFF6FF',
          action: 'Back to Home',
          onAction: () => navigation.navigate('CustomerDashboard')
        };
    }
  };

  const config = getStatusConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Confetti Animation */}
        <Animated.View style={[styles.confettiContainer, { opacity: confettiAnim }]}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  backgroundColor: i % 4 === 0 ? '#FFD700' : i % 4 === 1 ? '#FF6B6B' : i % 4 === 2 ? '#4ECDC4' : '#45B7D1',
                  left: `${Math.random() * 100}%`,
                  transform: [
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 600],
                      }),
                    },
                    {
                      rotate: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View 
          style={[
            styles.statusCard, 
            { 
              backgroundColor: colors.background,
              transform: [{ scale: celebrationAnim }]
            }
          ]}
        >
          {/* Modern Success Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: config.bgColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
              <Text style={styles.statusIcon}>{config.icon}</Text>
            </View>
          </View>
          
          <Text style={[styles.statusTitle, { color: colors.text }]}>{config.title}</Text>
          <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>{config.subtitle}</Text>
          
          {/* Application ID Card */}
          {applicationId && (
            <View style={[styles.applicationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.applicationLabel, { color: colors.textSecondary }]}>Application ID</Text>
              <Text style={[styles.applicationId, { color: colors.primary }]}>{applicationId}</Text>
            </View>
          )}
          
          {/* User Profile Summary */}
          <View style={[styles.profileSummary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {(contextData.fullName || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {contextData.fullName || 'Provider'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {contextData.email || 'No email provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {contextData.phoneNumber || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>CNIC</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {contextData.cnicNumber || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Submitted</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          
          {status === 'pending' && (
            <View style={[styles.reviewMessage, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.reviewText, { color: colors.text }]}>
                Thank you for your patience. We'll notify you once the review is complete.
              </Text>
            </View>
          )}
        </Animated.View>

        {status === 'pending' && (
          <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.timelineTitle, { color: colors.text }]}>What's Next?</Text>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Path d="M4 8 L7 11 L12 5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                </Svg>
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineItemTitle, { color: colors.text }]}>Application Submitted</Text>
                <Text style={[styles.timelineItemText, { color: colors.textSecondary }]}>Your application has been received</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#3B82F6' }]}>
                <View style={styles.timelineDotInner} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineItemTitle, { color: colors.text }]}>Document Verification</Text>
                <Text style={[styles.timelineItemText, { color: colors.textSecondary }]}>Verifying CNIC, selfie, and proof documents</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#9CA3AF' }]}>
                <View style={styles.timelineDotInner} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineItemTitle, { color: colors.text }]}>Background Check</Text>
                <Text style={[styles.timelineItemText, { color: colors.textSecondary }]}>Conducting background verification</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#9CA3AF' }]}>
                <View style={styles.timelineDotInner} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineItemTitle, { color: colors.text }]}>Final Approval</Text>
                <Text style={[styles.timelineItemText, { color: colors.textSecondary }]}>Admin review and approval</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.primary} />
            <Path d="M12 8 L12 12 M12 16 L12 16.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {status === 'pending' ? 'Approval Timeline' : 'Need Help?'}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {status === 'pending' 
                ? 'Verification typically takes 24-48 hours. You will be notified once approved.'
                : 'Contact our support team if you have any questions about your application.'}
            </Text>
          </View>
        </View>

        {status === 'pending' && (
          <View style={[styles.notificationCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.notificationText, { color: colors.text }]}>
              📱 We'll send you a notification once your application is reviewed
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={config.onAction}
        >
          <Text style={styles.actionButtonText}>{config.action}</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 40 },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 600, zIndex: 1 },
  confetti: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  statusCard: { 
    padding: 32, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 24, 
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: { fontSize: 40 },
  statusTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  statusSubtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  applicationCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  applicationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  applicationId: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileSummary: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  profileDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMessage: { 
    width: '100%',
    padding: 16, 
    borderRadius: 12, 
    marginTop: 8 
  },
  reviewText: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  timelineCard: { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  timelineTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  timelineDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF' },
  timelineContent: { flex: 1 },
  timelineItemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  timelineItemText: { fontSize: 13, lineHeight: 18 },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  infoText: { fontSize: 13, lineHeight: 18 },
  notificationCard: { padding: 16, borderRadius: 12, marginBottom: 20 },
  notificationText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footer: { padding: 20, borderTopWidth: 1 },
  actionButton: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default SubmissionStatusScreen;
