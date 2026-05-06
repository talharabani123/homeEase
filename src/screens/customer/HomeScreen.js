import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SERVICE_CATEGORIES } from '../../services/mockDataService';
import { getUnreadCount, addNotificationListener } from '../../services/notificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
// 3 service tiles per row
const TILE_GAP = 12;
const TILE_SIZE = (SCREEN_WIDTH - H_PAD * 2 - TILE_GAP * 2) / 3;

// Show all services on home screen
const FEATURED_SERVICES = SERVICE_CATEGORIES;

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count
  const loadUnreadCount = async () => {
    if (user?.uid) {
      const count = await getUnreadCount(user.uid);
      setUnreadCount(count);
    }
  };

  // Setup notification listener for real-time updates
  useEffect(() => {
    const unsubscribe = addNotificationListener((event, data) => {
      if (event === 'unread_count_changed') {
        setUnreadCount(data);
      } else if (event === 'notification_added' || event === 'notification_deleted' || 
                 event === 'notification_read' || event === 'all_notifications_read') {
        loadUnreadCount();
      }
    });

    return unsubscribe;
  }, []);

  // Initial load
  useEffect(() => {
    loadUnreadCount();
  }, [user?.uid]);

  const handleServicePress = (service) => {
    navigation.navigate('RequestServiceForm', {
      service: {
        id: service.id,
        name: service.name,
        icon: service.icon,
        priceRange: service.priceRange,
        description: service.description,
      },
    });
  };

  // Get user initials for profile icon
  const getUserInitials = () => {
    if (userData?.fullName) {
      return userData.fullName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return 'U';
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.logoBox, { borderColor: COLORS.primaryGreen, backgroundColor: colors.card }]}>
          <Svg width="28" height="28" viewBox="0 0 40 40">
            <Path d="M8 18L12 14L14 16L10 20L8 18Z" fill={COLORS.primaryGreen} />
            <Path d="M13 13L15 11C16 10 18 10 19 11C20 12 20 14 19 15L17 17L13 13Z" fill={COLORS.primaryGreen} />
            <Path d="M22 18L26 14L28 16L24 20L22 18Z" fill="#FF9800" />
            <Path d="M27 13L29 11L31 13L29 15L27 13Z" fill="#FF9800" />
            <Path d="M16 22L18 24L14 28L12 26L16 22Z" fill="#2196F3" />
            <Path d="M19 19L21 21L19 23L17 21L19 19Z" fill="#2196F3" />
            <Path d="M20 6L8 14V16L20 8L32 16V14L20 6Z" fill={COLORS.textGrey} opacity="0.3" />
          </Svg>
        </View>
        <View style={styles.headerTitles}>
          <Text style={[styles.appName, { color: colors.text }]}>HomeEase</Text>
          <Text style={[styles.tagline, { color: COLORS.primaryGreen }]}>Your Home Service Partner</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path 
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" 
                fill={colors.text} 
              />
            </Svg>
            {unreadCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: COLORS.primaryGreen }]}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            {userData?.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileInitials, { backgroundColor: COLORS.primaryGreen }]}>
                <Text style={styles.profileInitialsText}>{getUserInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ───────────────────────────────────────────────────────── */}
        <View style={styles.greetingRow}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hello{userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : ''}! 👋
          </Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
            What do you need today?
          </Text>
        </View>

        {/* ── Search bar ─────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.75}
        >
          <Svg width="18" height="18" viewBox="0 0 20 20">
            <Circle cx="8" cy="8" r="6" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            <Path d="M13 13L18 18" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>Search services…</Text>
        </TouchableOpacity>

        {/* ── Primary action cards ────────────────────────────────────────────── */}
        {/* Book a Service — full width with image background */}
        <View style={styles.bookServiceContainer}>
          <View style={styles.bookServiceCard}>
            {/* Full background image */}
            <Image 
              source={require('../../../assets/book.png')} 
              style={styles.bookServiceBackgroundImage}
              resizeMode="cover"
            />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.85)', 'rgba(46, 125, 50, 0.85)', 'rgba(27, 94, 32, 0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bookServiceOverlay}
            />
            {/* Content */}
            <View style={styles.bookServiceContent}>
              <Text style={styles.bookServiceTitle}>Book a Service</Text>
              <Text style={styles.bookServiceSubtitle}>Professional help in 30 mins</Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => navigation.navigate('ServicesList')}
                activeOpacity={0.85}
              >
                <Text style={styles.bookNowText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Emergency — Standard + Non-Standard side by side */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.emergencyButtonContainer}
            onPress={() => navigation.navigate('EmergencyLocation', {
              type: 'standard',
              service: null,
              description: '',
            })}
            activeOpacity={0.85}
          >
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.emergencyButtonImage}
              resizeMode="cover"
            />
            <View style={styles.emergencyButtonOverlay}>
              <Text style={styles.emergencyButtonTitle}>Standard</Text>
              <Text style={styles.emergencyButtonSubtitle}>Fixed services, instant dispatch</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyButtonContainer}
            onPress={() => navigation.navigate('EmergencyLocation', {
              type: 'custom',
              service: null,
              description: '',
            })}
            activeOpacity={0.85}
          >
            <Image 
              source={require('../../../assets/non standard.png')} 
              style={styles.emergencyButtonImage}
              resizeMode="cover"
            />
            <View style={styles.emergencyButtonOverlay}>
              <Text style={styles.emergencyButtonTitle}>Non-Standard</Text>
              <Text style={styles.emergencyButtonSubtitle}>Custom issue, get offers</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Services grid ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ServicesList')}>
            <Text style={[styles.seeAll, { color: COLORS.primaryGreen }]}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tilesGrid}>
          {FEATURED_SERVICES.map((svc) => (
            <TouchableOpacity
              key={svc.id}
              style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleServicePress(svc)}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.tileEmoji}>{svc.icon}</Text>
              </View>
              <Text style={[styles.tileName, { color: colors.text }]} numberOfLines={1}>
                {svc.name}
              </Text>
              <Text style={[styles.tilePrice, { color: colors.textSecondary }]} numberOfLines={1}>
                Distance-based
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Emergency quick access ──────────────────────────────────────────── */}
        {/* REMOVED — emergency buttons already shown above the services grid */}

        {/* ── How it works ────────────────────────────────────────────────────── */}
        <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.howTitle, { color: colors.text }]}>How it works</Text>
          <View style={styles.howSteps}>
            {[
              { n: '1', label: 'Pick a service' },
              { n: '2', label: 'Get offers' },
              { n: '3', label: 'Track provider' },
            ].map((step) => (
              <View key={step.n} style={styles.howStep}>
                <View style={[styles.howNum, { backgroundColor: COLORS.primaryGreen }]}>
                  <Text style={styles.howNumText}>{step.n}</Text>
                </View>
                <Text style={[styles.howLabel, { color: colors.textSecondary }]}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Development: Test Notifications Button (Hidden in production) */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={async () => {
              if (user?.uid) {
                const { simulateRealTimeNotification } = require('../../utils/notificationUtils');
                await simulateRealTimeNotification(user.uid);
              }
            }}
          >
            <Text style={[styles.testButtonText, { color: colors.textSecondary }]}>
              🔔 Add Test Notification (Dev Only)
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  headerTitles: { justifyContent: 'center', flex: 1 },
  headerIcons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profileInitials: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  appName: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  tagline: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Greeting
  greetingRow: {
    paddingHorizontal: H_PAD,
    paddingTop: 22,
    paddingBottom: 16,
  },
  greeting: { fontSize: 26, fontWeight: '800', marginBottom: 3 },
  greetingSub: { fontSize: 14, lineHeight: 19 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    gap: 10,
  },
  searchText: { fontSize: 14 },

  // Action cards — light red theme
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: H_PAD,
    gap: 12,
    marginBottom: 28,
  },
  emergencyButtonContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyButtonImage: {
    width: '100%',
    height: 150,
  },
  emergencyButtonOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  emergencyButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  emergencyButtonSubtitle: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionEmoji: { fontSize: 24 },
  actionImage: { width: 32, height: 32 },
  actionTitle: { fontSize: 16, fontWeight: '800', color: '#C0392B', marginBottom: 3 },
  actionTitleDark: { fontSize: 16, fontWeight: '800', color: '#922B21', marginBottom: 3 },
  actionSub: { fontSize: 11, color: '#E57373', lineHeight: 15, flex: 1 },
  actionSubDark: { fontSize: 11, color: '#C0392B', lineHeight: 15, flex: 1 },
  actionArrow: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(192,57,43,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionArrowDark: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(146,43,33,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },

  // Service tiles
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: TILE_GAP,
    marginBottom: 28,
  },
  tile: {
    width: TILE_SIZE,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileEmoji: { fontSize: 26 },
  tileName: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  tilePrice: { fontSize: 10, textAlign: 'center' },

  // Book service card (full image background)
  bookServiceContainer: {
    marginHorizontal: H_PAD,
    marginBottom: 12,
  },
  bookServiceCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    minHeight: 120,
  },
  bookServiceBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bookServiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bookServiceContent: {
    padding: 20,
    zIndex: 3,
    position: 'relative',
  },
  bookServiceTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bookServiceSubtitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    opacity: 0.95,
  },
  bookNowButton: {
    backgroundColor: '#000',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Emergency label above the two cards
  emergencyLabel: {
    paddingHorizontal: H_PAD,
    marginBottom: 8,
  },
  emergencyLabelText: { fontSize: 13, fontWeight: '600' },

  // Emergency section card (second placement)
  emergencySection: {
    marginHorizontal: H_PAD,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
  },
  emergencySectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  emergencySectionSub: { fontSize: 12, marginBottom: 14 },
  emergencyBtnRow: { flexDirection: 'row', gap: 12 },
  emergencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  emergencyBtnIcon: { fontSize: 16 },
  emergencyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // How it works
  howCard: {
    marginHorizontal: H_PAD,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  howTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  howSteps: { flexDirection: 'row', justifyContent: 'space-between' },
  howStep: { alignItems: 'center', flex: 1 },
  howNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  howNumText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  howLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  // Test button (development only)
  testButton: {
    marginHorizontal: H_PAD,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;
