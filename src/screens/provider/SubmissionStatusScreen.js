import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getProviderProfile, subscribeToProviderProfile } from '../../services/supabaseProviderService';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

const SubmissionStatusScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const { user, switchMode } = useAuth();
  const { profile } = route.params || {};
  
  const [status, setStatus] = useState(profile?.status || 'pending');
  const [isVerified, setIsVerified] = useState(profile?.status === 'approved');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [showTestingOptions, setShowTestingOptions] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Real-time Supabase listener
    const subscription = subscribeToProviderProfile(user.id, (payload) => {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const data = payload.new;
        setStatus(data.status || 'pending');
        setIsVerified(data.status === 'approved');
        setRejectionReason(data.rejection_reason || null);

        // Show alert when approved
        if (data.status === 'approved') {
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
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user]);

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
          onAction: async () => {
            await switchMode('provider');
            navigation.replace('ProviderDashboard');
          }
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Application Not Approved',
          subtitle: rejectionReason || 'Please review the feedback and reapply',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          action: 'Reapply',
          onAction: () => navigation.replace('ServiceSelection')
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
          icon: '⏳',
          title: 'Application Under Review',
          subtitle: 'Our team is verifying your documents',
          color: '#3B82F6',
          bgColor: '#EFF6FF',
          action: 'Continue as Customer',
          onAction: async () => {
            await switchMode('customer');
            navigation.replace('CustomerDashboard');
          }
        };
    }
  };

  const handleTestingBypass = async () => {
    alert.confirm(
      'Testing Mode',
      'Approve application for testing? This will update the database.',
      async () => {
        try {
          // Update the provider profile status in database
          const { supabase } = require('../../config/supabase');
          const { error } = await supabase
            .from('provider_profiles')
            .update({ status: 'approved' })
            .eq('user_id', user.id);

          if (error) {
            console.error('❌ Failed to update status:', error);
            alert.error('Error', 'Failed to approve application. Please try again.');
            return;
          }

          // Update status locally
          setStatus('approved');
          setIsVerified(true);
          
          // Show success and navigate
          alert.success(
            'Approved for Testing',
            'You can now access the provider dashboard',
            async () => {
              await switchMode('provider');
              navigation.replace('ProviderDashboard');
            }
          );
        } catch (error) {
          console.error('❌ Testing bypass error:', error);
          alert.error('Error', 'Something went wrong. Please try again.');
        }
      }
    );
  };

  const config = getStatusConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Testing Bypass Button - Hidden by default */}
        <TouchableOpacity
          style={styles.testingButton}
          onPress={() => setShowTestingOptions(!showTestingOptions)}
          onLongPress={handleTestingBypass}
        >
          <Text style={styles.testingButtonText}>🧪</Text>
        </TouchableOpacity>

        {showTestingOptions && (
          <View style={[styles.testingCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Text style={styles.testingTitle}>🧪 Testing Mode</Text>
            <Text style={styles.testingText}>Long press the 🧪 icon to bypass review</Text>
            <TouchableOpacity
              style={[styles.testingBypassButton, { backgroundColor: '#F59E0B' }]}
              onPress={handleTestingBypass}
            >
              <Text style={styles.testingBypassText}>Approve for Testing</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.statusCard, { backgroundColor: config.bgColor }]}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
          <Text style={[styles.statusSubtitle, { color: colors.text }]}>{config.subtitle}</Text>
        </View>

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
        {/* Testing Bypass Button */}
        {status === 'pending' && (
          <TouchableOpacity 
            style={[styles.testingBypassButtonFooter, { backgroundColor: '#F59E0B', marginBottom: 12 }]} 
            onPress={handleTestingBypass}
          >
            <Text style={styles.testingBypassText}>🧪 Approve for Testing</Text>
          </TouchableOpacity>
        )}
        
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
  testingButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  testingButtonText: {
    fontSize: 24,
  },
  testingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  testingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  testingText: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 12,
  },
  testingBypassButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testingBypassText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testingBypassButtonFooter: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusCard: { padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  statusIcon: { fontSize: 64, marginBottom: 16 },
  statusTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  statusSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
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
  actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default SubmissionStatusScreen;
