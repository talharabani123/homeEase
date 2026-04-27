import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getProviderJobs } from '../../services/providerJobService';

const ProviderJobHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [jobs, setJobs] = useState({ completed: [], cancelled: [] });
  const [activeTab, setActiveTab] = useState('completed'); // completed, cancelled
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

  const handleViewJobDetails = (job) => {
    const jobDetails = `
Service: ${job.serviceName}
Customer: ${job.customerName}
Location: ${job.location}
Date: ${job.date}
Time: ${job.scheduledTime}
Payment: Rs. ${job.price}
Status: ${job.status}
${job.completedDate ? `Completed: ${job.completedDate}` : ''}
${job.rating ? `Rating: ⭐ ${job.rating}` : ''}
    `.trim();

    Alert.alert('Job Details', jobDetails);
  };

  const renderJobCard = (job) => {
    const isCompleted = job.status === 'Completed';

    return (
      <TouchableOpacity
        key={job.id}
        style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => handleViewJobDetails(job)}
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
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isCompleted ? '#10B981' + '20' : '#EF4444' + '20' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: isCompleted ? '#10B981' : '#EF4444' }
            ]}>
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
              {job.date} • {job.scheduledTime}
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
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Payment</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>Rs. {job.price}</Text>
          </View>

          {isCompleted && job.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {job.rating}</Text>
            </View>
          )}

          {isCompleted && job.completedDate && (
            <Text style={[styles.completedDate, { color: colors.textSecondary }]}>
              {job.completedDate}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const currentJobs = jobs[activeTab] || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Job History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'completed' ? colors.primary : colors.textSecondary }]}>
            Completed
          </Text>
          {jobs.completed.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{jobs.completed.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'cancelled' ? colors.primary : colors.textSecondary }]}>
            Cancelled
          </Text>
          {jobs.cancelled && jobs.cancelled.length > 0 && (
            <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.badgeText}>{jobs.cancelled.length}</Text>
            </View>
          )}
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
              {activeTab === 'completed' ? '✅' : '❌'}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {activeTab} jobs
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {activeTab === 'completed' && 'Your completed jobs will appear here'}
              {activeTab === 'cancelled' && 'Cancelled jobs will appear here'}
            </Text>
          </View>
        ) : (
          currentJobs.map(job => renderJobCard(job))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
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
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600' },
  completedDate: { fontSize: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

export default ProviderJobHistoryScreen;
