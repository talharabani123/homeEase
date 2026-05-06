import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import CustomerLocationCard from '../../components/CustomerLocationCard';
import { useTheme } from '../../context/ThemeContext';
import { acceptServiceRequest, calculateTravelFee } from '../../services/marketplaceService';
import { getProviderProfile } from '../../services/providerRegistrationService';

const RequestDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { request } = route.params;

  const travelFee = calculateTravelFee(request.distanceFromProvider);

  const handleAcceptRequest = async () => {
    Alert.alert(
      'Accept This Job?',
      `Service: ${request.serviceName}\nDistance: ${request.distanceFromProvider} km\nTravel Fee: Rs. ${travelFee}\n\nYou will navigate to customer location after accepting.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Navigate',
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
              currentLocation: provider.gpsLocation,
            };

            const result = await acceptServiceRequest(request.id, provider.id, providerData);

            if (result.success) {
              Alert.alert(
                'Job Accepted! ✅',
                'Navigate to customer location now.',
                [
                  {
                    text: 'Start Navigation',
                    onPress: () => {
                      navigation.replace('ActiveJob', {
                        requestId: request.id,
                        request: result.request,
                      });
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to accept request');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Request Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Service Info Card */}
          <View style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.serviceHeader}>
              <View style={[styles.serviceIcon, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.serviceEmoji}>🔧</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{request.serviceName}</Text>
                <Text style={[styles.serviceCategory, { color: colors.textSecondary }]}>
                  {request.category || 'Home Service'}
                </Text>
              </View>
              <View style={[styles.urgentBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.urgentText, { color: '#F59E0B' }]}>⚡ ASAP</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{request.customerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>{request.customerPhone || 'Not provided'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Distance</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{request.distanceFromProvider} km</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Travel Fee</Text>
              <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
                Rs. {travelFee}
              </Text>
            </View>
          </View>

          {/* Description Card */}
          <View style={[styles.descriptionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.text }]}>{request.description}</Text>
          </View>

          {/* Customer Location Card */}
          <CustomerLocationCard
            location={{
              latitude: request.location.latitude,
              longitude: request.location.longitude,
              address: request.address,
              formattedAddress: request.location.formattedAddress,
              landmark: request.location.landmark,
              distance: `${request.distanceFromProvider} km`,
            }}
            customerName={request.customerName}
            showNavigateButton={true}
          />

          {/* Pricing Breakdown */}
          <View style={[styles.pricingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing Breakdown</Text>
            
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>Base Service Fee</Text>
              <Text style={[styles.pricingValue, { color: colors.text }]}>Rs. {request.basePrice || 500}</Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>
                Travel Fee ({request.distanceFromProvider} km)
              </Text>
              <Text style={[styles.pricingValue, { color: colors.text }]}>Rs. {travelFee}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.pricingRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Estimated Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                Rs. {(request.basePrice || 500) + travelFee}
              </Text>
            </View>
          </View>

          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
            <Svg width="20" height="20" viewBox="0 0 20 20">
              <Path
                d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={[styles.infoText, { color: colors.text }]}>
              After accepting, you'll be able to navigate directly to the customer's location using Google Maps.
            </Text>
          </View>
        </ScrollView>

        {/* Accept Button */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleAcceptRequest}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                fill="#FFFFFF"
              />
            </Svg>
            <Text style={styles.acceptButtonText}>Accept Job & Navigate</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  serviceCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
  },
  urgentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  pricingCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
  },
  pricingValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RequestDetailScreen;
