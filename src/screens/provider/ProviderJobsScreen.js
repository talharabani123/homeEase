import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, RefreshControl, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getProviderJobs, acceptJob, rejectJob, completeJob } from '../../services/providerJobService';
import { acceptJobRequest } from '../../services/realtimeJobFlowService';

const ProviderJobsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, completed
  const [jobs, setJobs] = useState({ pending: [], active: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const result = await getProviderJobs();
    if (result.success) {
      setJobs(result.jobs);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleAcceptJob = async (jobId) => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            // Accept in local service
            const result = await acceptJob(jobId);
            if (result.success) {
              // Also accept in real-time service for tracking using real user id
              const providerId = user?.id || 'provider_unknown';
              await acceptJobRequest(jobId, providerId);

              Alert.alert('Success', 'Job accepted successfully!', [
                {
                  text: 'Start Navigation',
                  onPress: () => navigation.navigate('ActiveJob', { jobId })
                }
              ]);
              loadJobs(); // Reload jobs
            } else {
              Alert.alert('Error', result.error || 'Failed to accept job');
            }
          }
        }
      ]
    );
  };


  const handleRejectJob = (jobId) => {
    Alert.alert(
      'Reject Job',
      'Are you sure you want to reject this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const result = await rejectJob(jobId);
            if (result.success) {
              Alert.alert('Job Rejected', 'You have rejected this job request.');
              loadJobs(); // Reload jobs
            } else {
              Alert.alert('Error', result.error || 'Failed to reject job');
            }
          }
        }
      ]
    );
  };

  const handleViewJob = (job) => {
    const jobDetails = `
Service: ${job.serviceName}
Customer: ${job.customerName}
Location: ${job.location}
Date: ${job.date}
Time: ${job.scheduledTime}
Payment: Rs. ${job.price}
Description: ${job.description}
Phone: ${job.customerPhone}
    `.trim();

    Alert.alert(
      'Job Details',
      jobDetails,
      [
        { text: 'Close', style: 'cancel' },
        job.status === 'In Progress' && {
          text: 'Mark Complete',
          onPress: async () => {
            const result = await completeJob(job.id);
            if (result.success) {
              Alert.alert('Success', 'Job marked as completed!');
              loadJobs();
            }
          }
        }
      ].filter(Boolean)
    );
  };

  const renderJobCard = (job) => {
    const isActive = activeTab === 'active';
    const isPending = activeTab === 'pending';
    const isCompleted = activeTab === 'completed';

    return (
      <TouchableOpacity
        key={job.id}
        style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => handleViewJob(job)}
      >
        <View style={styles.jobHeader}>
          <View style={[styles.serviceIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.serviceEmoji}>{job.serviceIcon}</Text>
          </View>
          <View style={styles.jobInfo}>
            <Text style={[styles.jobTitle, { color: colors.text }]}>{job.serviceName}</Text>
            <Text style={[styles.jobCustomer, { color: colors.textSecondary }]}>
              {job.customerName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill={colors.textSecondary} />
              <Path d="M8 4v4.5l3.5 2.1" stroke={colors.textSecondary} strokeWidth="1" fill="none" />
            </Svg>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {job.scheduledTime}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Path d="M8 0C5.2 0 3 2.2 3 5c0 3.5 5 11 5 11s5-7.5 5-11c0-2.8-2.2-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill={colors.textSecondary} />
            </Svg>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {job.location}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Path d="M14 2h-1V0h-2v2H5V0H3v2H2C.9 2 0 2.9 0 4v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H2V7h12v7z" fill={colors.textSecondary} />
            </Svg>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {job.date}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Payment</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>Rs. {job.price}</Text>
          </View>

          {isPending && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.rejectButton, { borderColor: colors.error }]}
                onPress={() => handleRejectJob(job.id)}
              >
                <Text style={[styles.rejectButtonText, { color: colors.error }]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                onPress={() => handleAcceptJob(job.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.chatButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('JobChat', { jobId: job.id, userType: 'provider' })}
              >
                <Text style={[styles.chatButtonText, { color: colors.primary }]}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('ActiveJob', { jobId: job.id })}
              >
                <Text style={styles.viewButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedInfo}>
              <Text style={[styles.completedLabel, { color: colors.textSecondary }]}>
                Completed on {job.completedDate}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {job.rating}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'active': return '#10B981';
      case 'in progress': return '#3B82F6';
      case 'completed': return '#6B7280';
      default: return colors.textSecondary;
    }
  };

  const currentJobs = jobs[activeTab] || [];

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Jobs</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.primary : colors.textSecondary }]}>
            Pending
          </Text>
          {jobs.pending.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{jobs.pending.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.primary : colors.textSecondary }]}>
            Active
          </Text>
          {jobs.active.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{jobs.active.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'completed' ? colors.primary : colors.textSecondary }]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {currentJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'pending' ? '📋' : activeTab === 'active' ? '🔧' : '✅'}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {activeTab} jobs
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {activeTab === 'pending' && 'New job requests will appear here'}
              {activeTab === 'active' && 'Accepted jobs will appear here'}
              {activeTab === 'completed' && 'Your completed jobs will appear here'}
            </Text>
          </View>
        ) : (
          currentJobs.map(job => renderJobCard(job))
        )}
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#88C791' },
  tabText: { fontSize: 15, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  jobCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceEmoji: { fontSize: 24 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  jobCustomer: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  jobDetails: { marginBottom: 12, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, flex: 1 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  priceContainer: {},
  priceLabel: { fontSize: 12, marginBottom: 4 },
  priceValue: { fontSize: 18, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  rejectButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  rejectButtonText: { fontSize: 14, fontWeight: '600' },
  acceptButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  acceptButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  viewButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  viewButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  chatButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  chatButtonText: { fontSize: 14, fontWeight: '700' },
  completedInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  completedLabel: { fontSize: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

export default ProviderJobsScreen;
