import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { SERVICE_CATEGORIES } from '../../services/mockDataService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
// 3 service tiles per row
const TILE_GAP = 12;
const TILE_SIZE = (SCREEN_WIDTH - H_PAD * 2 - TILE_GAP * 2) / 3;

// Show all services on home screen
const FEATURED_SERVICES = SERVICE_CATEGORIES;

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();

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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ───────────────────────────────────────────────────────── */}
        <View style={styles.greetingRow}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello! 👋</Text>
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
        {/* Book a Service — full width */}
        <TouchableOpacity
          style={[styles.bookCard, { backgroundColor: COLORS.primaryGreen }]}
          onPress={() => navigation.navigate('ServicesList')}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconCircle}>
            <Text style={styles.actionEmoji}>🏠</Text>
          </View>
          <View style={styles.bookCardText}>
            <Text style={styles.actionTitle}>Book a Service</Text>
            <Text style={styles.actionSub}>Plumber, Electrician & more</Text>
          </View>
          <View style={styles.actionArrow}>
            <Svg width="16" height="16" viewBox="0 0 20 20">
              <Path d="M7 4L13 10L7 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Emergency — Standard + Non-Standard side by side */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCardStandard}
            onPress={() => navigation.navigate('EmergencyLocation', {
              type: 'standard',
              service: null,
              description: '',
            })}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <Text style={styles.actionEmoji}>⚡</Text>
            </View>
            <Text style={styles.actionTitle}>Standard</Text>
            <Text style={styles.actionSub}>Fixed services, instant dispatch</Text>
            <View style={styles.actionArrow}>
              <Svg width="16" height="16" viewBox="0 0 20 20">
                <Path d="M7 4L13 10L7 16" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardCustom}
            onPress={() => navigation.navigate('EmergencyLocation', {
              type: 'custom',
              service: null,
              description: '',
            })}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <Text style={styles.actionEmoji}>📝</Text>
            </View>
            <Text style={styles.actionTitleDark}>Non-Standard</Text>
            <Text style={styles.actionSubDark}>Custom issue, get offers</Text>
            <View style={styles.actionArrowDark}>
              <Svg width="16" height="16" viewBox="0 0 20 20">
                <Path d="M7 4L13 10L7 16" stroke="#922B21" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
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
  headerTitles: { justifyContent: 'center' },
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
  actionCardStandard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 150,
    justifyContent: 'space-between',
    backgroundColor: '#FFEBEE',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardCustom: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 150,
    justifyContent: 'space-between',
    backgroundColor: '#FCE4EC',
    borderWidth: 1.5,
    borderColor: '#F8BBD0',
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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

  // Book card (full width)
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  bookCardText: { flex: 1, marginLeft: 12 },

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
});

export default HomeScreen;
