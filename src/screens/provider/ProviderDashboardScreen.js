import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Switch, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { getProviderProfile, updateOnlineStatus } from '../../services/providerRegistrationService';

const ProviderDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await getProviderProfile();
    if (result.success) {
      setProfile(result.data);
      setIsOnline(result.data.isOnline);
    }
    setLoading(false);
  };

  const handleToggleOnline = async (value) => {
    if (value) {
      Alert.alert(
        'Go Online',
        'You will start receiving job requests. Are you ready?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go Online',
            onPress: async () => {
              const result = await updateOnlineStatus(true);
              if (result.success) {
                setIsOnline(true);
                setProfile(result.data);
              }
            }
          }
        ]
      );
    } else {
      const result = await updateOnlineStatus(false);
      if (result.success) {
        setIsOnline(false);
        setProfile(result.data);
      }
    }
  };

  if (loading) {
    return (
      <ScreenWrapper variant="default">
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Provider Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Online Status Card */}
        <View style={[styles.onlineCard, { backgroundColor: isOnline ? '#10B981' : '#6B7280' }]}>
          <View style={styles.onlineContent}>
            <View>
              <Text style={styles.onlineTitle}>
                {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
              </Text>
              <Text style={styles.onlineSubtitle}>
                {isOnline ? 'Receiving job requests' : 'Not receiving requests'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#D1D5DB', true: '#FFFFFF' }}
              thumbColor={isOnline ? '#10B981' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={styles.statValue}>{profile?.rating || '0.0'}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            <Text style={styles.statIcon}>⭐</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={styles.statValue}>{profile?.totalJobs || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Jobs</Text>
            <Text style={styles.statIcon}>📋</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={styles.statValue}>Rs. {profile?.earnings || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earnings</Text>
            <Text style={styles.statIcon}>💰</Text>
          </View>
        </View>

        {/* Services */}
        <View style={[styles.servicesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Services</Text>
          <View style={styles.servicesList}>
            {profile?.services.map((service, index) => (
              <View key={index} style={[styles.serviceChip, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.serviceChipText}>{service.icon} {service.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Jobs')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={colors.primary} />
              </Svg>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Active Requests</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>View incoming job requests</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => {
              Alert.alert(
                'Map Feature',
                'Maps require a standalone build and are not available in Expo Go. Build the app to use real-time location sharing.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981" />
              </Svg>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Share Live Location (Build Required)</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Go online and share your location</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('ProviderJobHistory')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" fill={colors.primary} />
              </Svg>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Job History</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>View completed and cancelled jobs</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('ProviderWallet')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={colors.primary} />
              </Svg>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Wallet</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>View earnings and balance</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.primary} />
            <Path d="M12 8 L12 12 M12 16 L12 16.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Keep your profile updated and maintain good ratings to receive more job requests
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollView: { flex: 1 },
  onlineCard: { marginHorizontal: 20, marginTop: 20, padding: 20, borderRadius: 16 },
  onlineContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  onlineTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  onlineSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 12, marginBottom: 8 },
  statIcon: { fontSize: 24 },
  servicesCard: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  servicesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  serviceChipText: { fontSize: 13, fontWeight: '600' },
  actionsSection: { paddingHorizontal: 20, marginTop: 20 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  actionSubtitle: { fontSize: 13 },
  infoBanner: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, marginBottom: 20, padding: 16, borderRadius: 12 },
  infoText: { fontSize: 13, marginLeft: 12, flex: 1, lineHeight: 18 },
});

export default ProviderDashboardScreen;
