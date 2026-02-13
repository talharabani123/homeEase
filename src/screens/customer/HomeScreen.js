import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.welcomeText}>What service do you need today?</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="8" cy="8" r="6" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            <Path d="M13 13 L18 18" stroke={COLORS.textGrey} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={styles.searchPlaceholder}>Search for services...</Text>
        </TouchableOpacity>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Providers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providersScroll}>
            {providers.map((provider) => (
              <TouchableOpacity key={provider.id} style={styles.providerCard}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>{provider.name[0]}</Text>
                </View>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerService}>{provider.service}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {provider.rating}</Text>
                  <Text style={styles.reviewsText}>({provider.reviews})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <View style={styles.recentServices}>
            <TouchableOpacity style={styles.recentServiceCard}>
              <View style={styles.recentServiceIcon}>
                <Text style={styles.recentServiceEmoji}>🔧</Text>
              </View>
              <View style={styles.recentServiceInfo}>
                <Text style={styles.recentServiceName}>Plumbing</Text>
                <Text style={styles.recentServiceDate}>Last used 2 days ago</Text>
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 4 L13 10 L7 16" stroke={COLORS.textGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const categories = [
  { id: 1, name: 'Plumber', icon: '🔧' },
  { id: 2, name: 'Electrician', icon: '💡' },
  { id: 3, name: 'Carpenter', icon: '🪚' },
  { id: 4, name: 'Cleaner', icon: '🧹' },
  { id: 5, name: 'Painter', icon: '🎨' },
  { id: 6, name: 'AC Repair', icon: '❄️' },
  { id: 7, name: 'Mechanic', icon: '🔩' },
  { id: 8, name: 'Gardener', icon: '🌱' },
];

const providers = [
  { id: 1, name: 'Ahmed Khan', service: 'Plumber', rating: 4.8, reviews: 120 },
  { id: 2, name: 'Ali Raza', service: 'Electrician', rating: 4.9, reviews: 95 },
  { id: 3, name: 'Hassan Ali', service: 'Carpenter', rating: 4.7, reviews: 80 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 15,
    color: COLORS.textGrey,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textGrey,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
  },
  providersScroll: {
    paddingLeft: 20,
  },
  providerCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
    textAlign: 'center',
  },
  providerService: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: COLORS.textGrey,
  },
  recentServices: {
    paddingHorizontal: 20,
  },
  recentServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recentServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentServiceEmoji: {
    fontSize: 24,
  },
  recentServiceInfo: {
    flex: 1,
  },
  recentServiceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  recentServiceDate: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
});

export default HomeScreen;
