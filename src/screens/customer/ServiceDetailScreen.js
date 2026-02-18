import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const ServiceDetailScreen = ({ navigation, route }) => {
  const { service } = route.params;

  const handleRequestService = () => {
    navigation.navigate('RequestServiceForm', { service });
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
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Service Icon & Name */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconLarge}>
            <Text style={styles.serviceEmojiLarge}>{service.icon}</Text>
          </View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {service.rating}</Text>
            <Text style={styles.ratingSubtext}>(250+ reviews)</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{service.description}</Text>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starting Price</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.priceValue}>{service.priceRange}</Text>
            <Text style={styles.priceNote}>*Final price may vary based on work scope</Text>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {INCLUDED_ITEMS.map((item, index) => (
            <View key={index} style={styles.includedItem}>
              <View style={styles.checkIcon}>
                <Svg width="16" height="16" viewBox="0 0 16 16">
                  <Path d="M3 8 L6 11 L13 4" stroke={COLORS.primaryGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
              <Text style={styles.includedText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestService}>
          <Text style={styles.requestButtonText}>Request Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const INCLUDED_ITEMS = [
  'Professional service provider',
  'Quality workmanship guarantee',
  'Transparent pricing',
  'Customer support',
];

const STEPS = [
  {
    title: 'Submit Request',
    description: 'Fill in your requirements and schedule'
  },
  {
    title: 'Get Matched',
    description: 'We connect you with nearby professionals'
  },
  {
    title: 'Service Delivered',
    description: 'Provider completes the work'
  },
  {
    title: 'Rate & Review',
    description: 'Share your experience'
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
  scrollView: {
    flex: 1,
  },
  serviceHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceEmojiLarge: {
    fontSize: 48,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginRight: 8,
  },
  ratingSubtext: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textGrey,
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: '#F0F9F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  includedText: {
    fontSize: 15,
    color: COLORS.textBlack,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textGrey,
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  requestButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ServiceDetailScreen;
