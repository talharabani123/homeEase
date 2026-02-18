import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
// import { listenToOffers, acceptOffer } from '../../services/realTimeServiceSystem';

const OfferListScreen = ({ navigation, route }) => {
  const { requestId, serviceType, serviceIcon } = route.params;
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    // Mock offers for Expo Go
    // In production, use: const unsubscribe = listenToOffers(requestId, setOffers);
    
    setTimeout(() => {
      setLoading(false);
      // Start with first offer
      setOffers([MOCK_OFFERS[0]]);
    }, 2000);

    // Simulate new offers arriving (only add if not already present)
    const timer1 = setTimeout(() => {
      setOffers(prev => {
        const exists = prev.find(o => o.offerId === MOCK_OFFERS[1].offerId);
        return exists ? prev : [...prev, MOCK_OFFERS[1]];
      });
    }, 4000);

    const timer2 = setTimeout(() => {
      setOffers(prev => {
        const exists = prev.find(o => o.offerId === MOCK_OFFERS[2].offerId);
        return exists ? prev : [...prev, MOCK_OFFERS[2]];
      });
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      // unsubscribe();
    };
  }, [requestId]);

  const handleAcceptOffer = async (offer) => {
    setAccepting(offer.offerId);

    try {
      // Mock implementation for Expo Go
      // In production: const result = await acceptOffer(requestId, offer.offerId);
      
      setTimeout(() => {
        setAccepting(null);
        Alert.alert(
          'Offer Accepted!',
          `${offer.providerName} will arrive in ${offer.arrivalTime} minutes.`,
          [
            {
              text: 'Chat',
              onPress: () => navigation.navigate('Chat', {
                requestId,
                providerId: offer.providerId,
                providerName: offer.providerName,
                customerName: 'You',
              })
            },
            {
              text: 'Track Provider',
              onPress: () => navigation.navigate('LiveTracking', {
                requestId,
                providerId: offer.providerId,
                provider: {
                  id: offer.providerId,
                  name: offer.providerName,
                  rating: offer.providerRating,
                  serviceType: serviceType,
                },
                requestData: { requestId }
              })
            }
          ]
        );
      }, 1000);
    } catch (error) {
      setAccepting(null);
      Alert.alert('Error', 'Failed to accept offer');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={COLORS.textBlack} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Offers</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceIcon}>{serviceIcon}</Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceName}>{serviceType}</Text>
          <Text style={styles.serviceSubtext}>Searching for nearby providers...</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulse} />
            <View style={styles.pulseCore} />
          </View>
          <Text style={styles.statusText}>
            {loading ? 'Finding providers...' : `${offers.length} offer${offers.length !== 1 ? 's' : ''} received`}
          </Text>
        </View>
      </View>

      {/* Offers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            <Text style={styles.loadingText}>Notifying nearby providers...</Text>
            <Text style={styles.loadingSubtext}>This usually takes 10-30 seconds</Text>
          </View>
        ) : offers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No offers yet</Text>
            <Text style={styles.emptySubtext}>Providers are reviewing your request</Text>
          </View>
        ) : (
          <View style={styles.offersList}>
            {offers.map((offer, index) => (
              <View key={offer.offerId} style={styles.offerCard}>
                {/* New Badge */}
                {index === offers.length - 1 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}

                {/* Provider Info */}
                <View style={styles.offerHeader}>
                  <View style={styles.providerAvatar}>
                    <Text style={styles.providerInitial}>{offer.providerName[0]}</Text>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{offer.providerName}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>⭐ {offer.providerRating}</Text>
                      <Text style={styles.jobsText}>• {offer.totalJobs} jobs</Text>
                    </View>
                  </View>
                </View>

                {/* Offer Details */}
                <View style={styles.offerDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.priceText}>Rs. {offer.price}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Arrival Time</Text>
                      <Text style={styles.etaText}>{offer.arrivalTime} min</Text>
                    </View>
                  </View>

                  {offer.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageLabel}>Message:</Text>
                      <Text style={styles.messageText}>{offer.message}</Text>
                    </View>
                  )}
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptButton, accepting === offer.offerId && styles.acceptButtonDisabled]}
                  onPress={() => handleAcceptOffer(offer)}
                  disabled={accepting !== null}
                >
                  {accepting === offer.offerId ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept Offer</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// Mock offers for Expo Go testing
const MOCK_OFFERS = [
  {
    offerId: 'offer1',
    providerId: 'provider1',
    providerName: 'Ahmed Khan',
    providerRating: 4.8,
    totalJobs: 120,
    price: 500,
    arrivalTime: 15,
    message: 'I can fix it quickly. I have all the tools.',
  },
  {
    offerId: 'offer2',
    providerId: 'provider2',
    providerName: 'Ali Raza',
    providerRating: 4.9,
    totalJobs: 95,
    price: 450,
    arrivalTime: 20,
    message: 'Experienced professional. Best price guaranteed!',
  },
  {
    offerId: 'offer3',
    providerId: 'provider3',
    providerName: 'Hassan Ali',
    providerRating: 4.7,
    totalJobs: 80,
    price: 550,
    arrivalTime: 10,
    message: 'Very close to your location. Can come immediately.',
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
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F9F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  serviceSubtext: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  statusCard: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    opacity: 0.3,
  },
  pulseCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primaryGreen,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  offersList: {
    padding: 20,
  },
  offerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  jobsText: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginLeft: 4,
  },
  offerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
  },
  etaText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  messageContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textBlack,
    lineHeight: 18,
  },
  acceptButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default OfferListScreen;
