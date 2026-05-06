import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { getNearbyProvidersByService, createServiceRequest } from '../../services/marketplaceService';
import { getCurrentLocation, getAddressFromCoords } from '../../services/locationService';

// ─── Sort options ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: 'distance', label: 'Nearest' },
  { key: 'rating',   label: 'Top Rated' },
  { key: 'price',    label: 'Lowest Price' },
];

// ─── Star rating component ───────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <Text style={{ fontSize: 12, color: '#F59E0B' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
    </Text>
  );
};

// ─── Provider card ───────────────────────────────────────────────────────────
const ProviderCard = ({ provider, onBook, colors, booking }) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
    {/* Avatar + online dot */}
    <View style={styles.cardTop}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: COLORS.primaryGreen }]}>
          <Text style={styles.avatarText}>{provider.initials}</Text>
        </View>
        {provider.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
        <Text style={[styles.serviceLabel, { color: colors.textSecondary }]}>{provider.serviceName}</Text>
        <View style={styles.ratingRow}>
          <Stars rating={provider.rating} />
          <Text style={[styles.ratingNum, { color: colors.textSecondary }]}>
            {' '}{provider.rating} ({provider.totalReviews})
          </Text>
        </View>
      </View>

      {/* Price — distance-based */}
      <View style={styles.priceBlock}>
        <Text style={[styles.price, { color: COLORS.primaryGreen }]}>
          Rs. {Math.round(provider.distance * 50)}
        </Text>
        <Text style={[styles.jobs, { color: colors.textSecondary }]}>travel cost</Text>
        <Text style={[styles.jobs, { color: colors.textSecondary }]}>{provider.completedJobs} jobs</Text>
      </View>
    </View>

    {/* Distance / ETA / availability */}
    <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
      <View style={styles.metaItem}>
        <Svg width="14" height="14" viewBox="0 0 24 24">
          <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={COLORS.primaryGreen} />
        </Svg>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{provider.distance} km away</Text>
      </View>
      <View style={styles.metaItem}>
        <Svg width="14" height="14" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke={COLORS.primaryGreen} strokeWidth="2" fill="none" />
          <Path d="M12 6v6l4 2" stroke={COLORS.primaryGreen} strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>~{provider.eta} min ETA</Text>
      </View>
      <View style={[
        styles.availBadge,
        { backgroundColor: provider.isAvailable ? '#E8F5E9' : '#FFF3E0' }
      ]}>
        <Text style={[
          styles.availText,
          { color: provider.isAvailable ? COLORS.primaryGreen : '#F59E0B' }
        ]}>
          {provider.isAvailable ? 'Available' : 'Busy'}
        </Text>
      </View>
    </View>

    {/* Bio */}
    <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
      {provider.bio}
    </Text>

    {/* Book button */}
    <TouchableOpacity
      style={[
        styles.bookBtn,
        { backgroundColor: provider.isAvailable ? COLORS.primaryGreen : '#ccc' }
      ]}
      onPress={() => provider.isAvailable && onBook(provider)}
      disabled={!provider.isAvailable || booking === provider.id}
    >
      {booking === provider.id
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={styles.bookBtnText}>
            {provider.isAvailable ? 'Book Now' : 'Currently Busy'}
          </Text>
      }
    </TouchableOpacity>
  </View>
);

// ─── Main screen ─────────────────────────────────────────────────────────────
const NearbyProvidersScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { service, formData: passedForm } = route.params;

  const [providers, setProviders]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(null); // provider id being booked
  const [sortBy, setSortBy]         = useState('distance');
  const [radius, setRadius]         = useState(10);
  const [customerLoc, setCustomerLoc] = useState(null);
  const [address, setAddress]       = useState(passedForm?.address || '');

  // ── Load location + providers ──────────────────────────────────────────────
  const loadProviders = useCallback(async (loc, r = radius) => {
    setLoading(true);
    const result = await getNearbyProvidersByService(service.id || service.name, loc, r);
    setProviders(result.providers || []);
    setLoading(false);
  }, [service, radius]);

  useEffect(() => {
    (async () => {
      let loc = passedForm?.latitude
        ? { latitude: passedForm.latitude, longitude: passedForm.longitude }
        : null;

      if (!loc) {
        const locResult = await getCurrentLocation();
        if (locResult.success) {
          loc = locResult.location;
          const addrResult = await getAddressFromCoords(loc.latitude, loc.longitude);
          if (addrResult.success) setAddress(addrResult.address);
        } else {
          // Fallback to Karachi centre
          loc = { latitude: 24.8607, longitude: 67.0011 };
        }
      }
      setCustomerLoc(loc);
      loadProviders(loc, radius);
    })();
  }, []);

  // ── Sort providers ─────────────────────────────────────────────────────────
  const sorted = [...providers].sort((a, b) => {
    if (sortBy === 'rating')   return b.rating - a.rating;
    if (sortBy === 'price')    return a.pricePerJob - b.pricePerJob;
    return a.distance - b.distance; // default: nearest
  });

  // ── Book a provider ────────────────────────────────────────────────────────
  const handleBook = async (provider) => {
    if (!customerLoc) {
      Alert.alert('Error', 'Could not determine your location.');
      return;
    }

    setBooking(provider.id);

    try {
      const requestData = {
        customerId:    user?.uid || user?.id || 'customer_' + Date.now(),
        customerName:  user?.fullName || user?.displayName || 'Customer',
        customerPhone: user?.phone || '+92 300 0000000',
        serviceType:   service.id || service.name.toLowerCase().replace(/\s+/g, '_'),
        serviceName:   service.name,
        description:   passedForm?.description || `${service.name} service requested`,
        selectedProviderId: provider.id,
        providerName:  provider.name,
        location: {
          latitude:  customerLoc.latitude,
          longitude: customerLoc.longitude,
          address:   address || 'Current Location',
        },
        radius: 10,
      };

      const result = await createServiceRequest(requestData);

      if (result.success) {
        setBooking(null);

        // Create a conversation entry for this booking so it appears in Messages
        const userId = user?.uid || user?.id;
        if (userId) {
          const { upsertConversation } = require('../../services/userDataService');
          await upsertConversation(userId, {
            id: result.requestId,
            requestId: result.requestId,
            providerId: provider.id,
            providerName: provider.name,
            providerImage: null,
            serviceType: service.name,
            serviceIcon: service.icon || '🔧',
            lastMessage: 'Booking confirmed. Chat with your provider here.',
            lastMessageSender: 'system',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            isOnline: provider.isAvailable,
          });
        }

        navigation.replace('JobTrackingScreenEnhanced', {
          requestId: result.requestId,
          request: {
            ...result.request,
            providerName:     provider.name,
            providerInitials: provider.initials,
            providerRating:   provider.rating,
            providerEta:      provider.eta,
          },
        });
      } else {
        setBooking(null);
        Alert.alert('Booking Failed', result.error || 'Please try again.');
      }
    } catch (e) {
      setBooking(null);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // ── Expand radius ──────────────────────────────────────────────────────────
  const handleExpandRadius = () => {
    const newRadius = radius + 5;
    setRadius(newRadius);
    if (customerLoc) loadProviders(customerLoc, newRadius);
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No nearby providers found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        No {service.name} providers within {radius} km of your location.
      </Text>
      <TouchableOpacity
        style={[styles.expandBtn, { borderColor: COLORS.primaryGreen }]}
        onPress={handleExpandRadius}
      >
        <Text style={[styles.expandBtnText, { color: COLORS.primaryGreen }]}>
          Expand to {radius + 5} km
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {service.icon} {service.name} Providers
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {loading ? 'Searching...' : `${sorted.length} found within ${radius} km`}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Sort bar */}
      <View style={[styles.sortBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.sortChip,
              sortBy === opt.key && { backgroundColor: COLORS.primaryGreen },
            ]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[
              styles.sortChipText,
              { color: sortBy === opt.key ? '#fff' : colors.textSecondary },
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding nearby {service.name} providers...
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              onBook={handleBook}
              colors={colors}
              booking={booking}
            />
          )}
          contentContainerStyle={[styles.list, sorted.length === 0 && { flex: 1 }]}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },

  sortBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    gap: 8, borderBottomWidth: 1,
  },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F0F0F0',
  },
  sortChipText: { fontSize: 13, fontWeight: '600' },

  list: { padding: 16, gap: 12 },

  card: {
    borderRadius: 16, padding: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff',
  },
  cardInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  serviceLabel: { fontSize: 13, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingNum: { fontSize: 12 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '700' },
  jobs: { fontSize: 11, marginTop: 2 },

  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 10, marginBottom: 10, borderTopWidth: 1, gap: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  availBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  availText: { fontSize: 12, fontWeight: '600' },

  bio: { fontSize: 13, lineHeight: 18, marginBottom: 12 },

  bookBtn: {
    paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  bookBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  expandBtn: {
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  expandBtnText: { fontSize: 15, fontWeight: '600' },
});

export default NearbyProvidersScreen;
