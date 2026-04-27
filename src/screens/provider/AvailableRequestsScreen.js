import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { getAvailableRequests, acceptServiceRequest, calculateTravelFee } from '../../services/marketplaceService';
import { getProviderProfile } from '../../services/providerRegistrationService';

const AvailableRequestsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    loadProviderAndRequests();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadProviderAndRequests = async () => {
    const profileResult = await getProviderProfile();
    if (profileResult.success && profileResult.data) {
      setProviderId(profileResult.data.id);
      await loadRequests(profileResult.data.id);
    } else {
      setLoading(false);
      Alert.alert('Error', 'Provider profile not found');
    }
  };

  const loadRequests = async (provId = providerId) => {
    if (!provId) return;
    
    const result = await getAvailableRequests(provId);
    if (result.success) {
      setRequests(result.requests);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAcceptRequest = async (request) => {
    Alert.alert(
      'Accept Request?',
      `Distance: ${request.distanceFromProvider} km\nTravel Fee: Rs. ${calculateTravelFee(request.distanceFromProvider)}\n\nAccept this job?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const profileResult = await getProviderProfile();
            if (!profileResult.success) {
              Alert.alert('Error', 'Could not load provider profile');
              return;
            }

            const provider = profileResult.data;
            const providerData = {
              name: provider.fullName,
              phone: provider.phoneNumber,
              currentLocation: provider.gpsLocation
            };

            const result = await acceptServiceRequest(request.id, provider.id, providerData);

            if (result.success) {
              Alert.alert(
                'Job Accepted! ✅',
                `Travel Fee: Rs. ${result.travelFee}\nDistance: ${result.travelDistance} km\n\nNavigate to customer location now.`,
                [
                  {
                    text: 'Start Navigation',
                    onPress: () => navigation.navigate('ActiveJob', {
                      requestId: request.id,
                      request: result.request
                    })
                  }
                ]
              );
              
              // Refresh list
              loadRequests();
            } else {
              Alert.alert('Error', result.error || 'Failed to accept request');
            }
          }
        }
      ]
    );
  };

  const renderRequest = ({ item }) => {
    const travelFee = calculateTravelFee(item.distanceFromProvider);
    
    return (
      <TouchableOpacity
        style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => handleAcceptRequest(item)}
      >
        <View style={styles.requestHeader}>
          <View style={[styles.serviceIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.serviceEmoji}>🔧</Text>
          </View>
          <View style={styles.requestInfo}>
            <Text style={[styles.serviceName, { color: colors.text }]}>{item.serviceName}</Text>
            <Text style={[styles.customerName, { color: colors.textSecondary }]}>
              {item.customerName}
            </Text>
          </View>
          <View style={[styles.distanceBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.distanceText}>{item.distanceFromProvider} km</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.locationRow}>
          <Svg width="16" height="16" viewBox="0 0 16 16">
            <Path
              d="M8 2C5.79 2 4 3.79 4 6c0 2.5 4 8 4 8s4-5.5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5s1.5.67 1.5 1.5S8.83 7.5 8 7.5z"
              fill={colors.primary}
            />
          </Svg>
          <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.feeContainer}>
            <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Travel Fee</Text>
            <Text style={[styles.feeAmount, { color: colors.primary }]}>Rs. {travelFee}</Text>
          </View>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={() => handleAcceptRequest(item)}
          >
            <Text style={styles.acceptButtonText}>Accept Job</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.urgentBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.urgentText, { color: '#F59E0B' }]}>⚡ ASAP</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Requests Available</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        New requests will appear here automatically
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}
        onPress={onRefresh}
      >
        <Text style={[styles.refreshButtonText, { color: colors.primary }]}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Available Requests</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshIconButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill={colors.primary}
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{requests.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>Online</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
        </View>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  refreshIconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  statsBar: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, marginBottom: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  divider: { width: 1, marginHorizontal: 16 },
  listContent: { padding: 20, paddingTop: 8 },
  requestCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, position: 'relative' },
  requestHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceEmoji: { fontSize: 24 },
  requestInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  customerName: { fontSize: 14 },
  distanceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  distanceText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  description: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  address: { fontSize: 13, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feeContainer: { flex: 1 },
  feeLabel: { fontSize: 12, marginBottom: 4 },
  feeAmount: { fontSize: 18, fontWeight: '700' },
  acceptButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  acceptButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  urgentBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  urgentText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshButtonText: { fontSize: 15, fontWeight: '600' },
});

export default AvailableRequestsScreen;
