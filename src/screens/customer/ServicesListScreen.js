import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const ServicesListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = SERVICES.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="8" cy="8" r="6" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
            <Path d="M13 13 L18 18" stroke={COLORS.textGrey} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={COLORS.textGrey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Services List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesGrid}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
            >
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceEmoji}>{service.icon}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
                <View style={styles.serviceFooter}>
                  <Text style={styles.servicePrice}>From {service.priceRange}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {service.rating}</Text>
                  </View>
                </View>
              </View>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M7 4 L13 10 L7 16" stroke={COLORS.textGrey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        {filteredServices.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No services found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const SERVICES = [
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    description: 'Pipe repairs, leak fixing, bathroom & kitchen plumbing',
    priceRange: 'Rs. 500',
    rating: 4.8,
    category: 'Home Maintenance'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    icon: '💡',
    description: 'Wiring, switch repairs, appliance installation',
    priceRange: 'Rs. 600',
    rating: 4.9,
    category: 'Home Maintenance'
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: '🪚',
    description: 'Furniture repair, door & window fixing, custom woodwork',
    priceRange: 'Rs. 800',
    rating: 4.7,
    category: 'Home Maintenance'
  },
  {
    id: 'cleaner',
    name: 'House Cleaning',
    icon: '🧹',
    description: 'Deep cleaning, regular cleaning, move-in/out cleaning',
    priceRange: 'Rs. 1,000',
    rating: 4.6,
    category: 'Cleaning'
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: '🎨',
    description: 'Interior & exterior painting, wall texture, color consultation',
    priceRange: 'Rs. 1,500',
    rating: 4.8,
    category: 'Home Improvement'
  },
  {
    id: 'ac-repair',
    name: 'AC Repair',
    icon: '❄️',
    description: 'AC installation, repair, maintenance, gas refilling',
    priceRange: 'Rs. 700',
    rating: 4.9,
    category: 'Appliance Repair'
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    icon: '🔩',
    description: 'Car & bike repair, maintenance, oil change',
    priceRange: 'Rs. 1,200',
    rating: 4.7,
    category: 'Vehicle Service'
  },
  {
    id: 'gardener',
    name: 'Gardener',
    icon: '🌱',
    description: 'Lawn care, plant maintenance, landscaping',
    priceRange: 'Rs. 900',
    rating: 4.5,
    category: 'Outdoor'
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textBlack,
  },
  scrollView: {
    flex: 1,
  },
  servicesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
});

export default ServicesListScreen;
