import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { getTopRatedProviders } from '../../services/homeDataService';
import { useTheme } from '../../context/ThemeContext';

const TopRatedProvidersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    const result = await getTopRatedProviders(null); // Get all providers
    if (result.success) {
      setProviders(result.data);
    }
    setLoading(false);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('ProviderDetails', { 
      provider: {
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        totalReviews: provider.reviews,
        experienceYears: provider.experience.replace(' years', ''),
        distance: '2.5 km',
        estimatedArrival: '15 mins',
        phoneNumber: provider.phone,
        profileImage: null,
        serviceType: provider.service,
        completedJobs: provider.completedJobs,
        skills: ['Professional Service', 'Quality Work', 'On Time', 'Affordable'],
        verified: true,
        status: 'Available',
      }
    });
  };

  const renderProvider = ({ item, index }) => {
    const initials = item.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return (
      <TouchableOpacity
        style={[styles.providerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => handleProviderPress(item)}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        
        <View style={styles.providerAvatar}>
          <Text style={styles.providerInitial}>{initials}</Text>
        </View>
        
        <View style={styles.providerInfo}>
          <Text style={[styles.providerName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.providerService, { color: colors.textSecondary }]}>{item.service}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Path
                  d="M7 1l1.5 3.5h3.5l-2.5 2 1 3.5-3-2-3 2 1-3.5-2.5-2h3.5z"
                  fill="#FFA726"
                />
              </Svg>
              <Text style={[styles.statText, { color: colors.text }]}>{item.rating}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Path
                  d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 8 5 8s5-4.5 5-8c0-2.76-2.24-5-5-5z"
                  fill={COLORS.primaryGreen}
                />
              </Svg>
              <Text style={[styles.statText, { color: colors.text }]}>{item.completedJobs} jobs</Text>
            </View>
          </View>
          
          <View style={styles.reviewsRow}>
            <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>{item.reviews} reviews</Text>
            <Text style={styles.experienceText}>{item.experience}</Text>
          </View>
        </View>
        
        <Svg width="20" height="20" viewBox="0 0 20 20">
          <Path d="M7 6 L13 10 L7 14" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
        </Svg>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading providers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Top Rated Providers</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerService: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewsText: {
    fontSize: 12,
  },
  experienceText: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
});

export default TopRatedProvidersScreen;
