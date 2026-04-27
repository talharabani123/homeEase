import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock service categories for search
  const allServices = [
    { id: 'plumber', name: 'Plumber', icon: '🔧', category: 'Home Repair' },
    { id: 'electrician', name: 'Electrician', icon: '💡', category: 'Home Repair' },
    { id: 'carpenter', name: 'Carpenter', icon: '🪚', category: 'Home Repair' },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', category: 'Cleaning' },
    { id: 'painter', name: 'Painter', icon: '🎨', category: 'Home Improvement' },
    { id: 'ac-repair', name: 'AC Repair', icon: '❄️', category: 'Appliance' },
    { id: 'mechanic', name: 'Mechanic', icon: '🔩', category: 'Vehicle' },
    { id: 'gardener', name: 'Gardener', icon: '🌱', category: 'Outdoor' },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      setIsSearching(true);
      // Filter services based on search query
      const filtered = allServices.filter(service => 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleServiceSelect = (service) => {
    navigation.navigate('RequestServiceForm', { 
      service: {
        id: service.id,
        name: service.name,
        icon: service.icon,
        priceRange: 'Rs. 500+',
        description: `Professional ${service.name.toLowerCase()} service at your doorstep`
      }
    });
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.serviceItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={styles.serviceIcon}>
        <Text style={styles.serviceEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.serviceCategory, { color: colors.textSecondary }]}>{item.category}</Text>
      </View>
      <Svg width="20" height="20" viewBox="0 0 20 20">
        <Path d="M7 4 L13 10 L7 16" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search Services</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="8" cy="8" r="6" stroke={colors.textSecondary} strokeWidth="2" fill="none" />
            <Path d="M13 13 L18 18" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Circle cx="10" cy="10" r="8" fill={colors.textSecondary} opacity="0.2" />
                <Path d="M7 7 L13 13 M13 7 L7 13" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {searchQuery.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Search for Services</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Find plumbers, electricians, cleaners, and more
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😕</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try searching for different services
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingHorizontal: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SearchScreen;
