import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { acceptOffer } from '../../services/emergencyService';

const EmergencyOffersScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { request, offers, category } = route.params;
  
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  const sortedOffers = [...offers].sort((a, b) => a.price - b.price);

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
  };

  const handleAcceptOffer = async () => {
    if (!selectedOffer) {
      Alert.alert('Select Offer', 'Please select an offer to continue');
      return;
    }

    Alert.alert(
      'Accept Offer',
      `Accept offer from ${selectedOffer.provider.name} for Rs. ${selectedOffer.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setLoading(true);
            
            const result = await acceptOffer(selectedOffer.id, request.id);
            
            setLoading(false);
            
            if (result.success) {
              navigation.replace('EmergencyTracking', {
                request,
                provider: selectedOffer.provider,
                category,
                acceptedPrice: selectedOffer.price
              });
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const getBestValueBadge = (offer, index) => {
    if (index === 0) return { text: 'LOWEST PRICE', color: '#10B981' };
    if (parseFloat(offer.provider.rating) >= 4.7) return { text: 'TOP RATED', color: '#F59E0B' };
    if (offer.eta <= 15) return { text: 'FASTEST', color: '#3B82F6' };
    return null;
  };

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 18C11.4 18 11 17.6 11 17C11 16.4 11.4 16 12 16C12.6 16 13 16.4 13 17C13 17.6 12.6 18 12 18ZM13 13H11V7H13V13Z" fill="#92400E" />
          </Svg>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              {offers.length} provider{offers.length > 1 ? 's' : ''} sent you custom offers. Compare and choose the best one!
            </Text>
          </View>
        </View>

        {/* Request Summary */}
        <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.requestTitle, { color: colors.text }]}>Your Request</Text>
          <Text style={[styles.requestDescription, { color: colors.textSecondary }]} numberOfLines={3}>
            {request.description}
          </Text>
          <Text style={[styles.requestLocation, { color: colors.textSecondary }]}>
            📍 {request.location.address}
          </Text>
        </View>

        {/* Offers List */}
        <View style={styles.offersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Offers ({offers.length})
          </Text>

          {sortedOffers.map((offer, index) => {
            const badge = getBestValueBadge(offer, index);
            const isSelected = selectedOffer?.id === offer.id;

            return (
              <TouchableOpacity
                key={offer.id}
                style={[
                  styles.offerCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  isSelected && styles.offerCardSelected
                ]}
                onPress={() => handleSelectOffer(offer)}
                activeOpacity={0.7}
              >
                {badge && (
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <Text style={styles.badgeText}>{badge.text}</Text>
                  </View>
                )}

                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Svg width="24" height="24" viewBox="0 0 24 24">
                      <Path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM10 18L4 12L5.4 10.6L10 15.2L18.6 6.6L20 8L10 18Z" fill="#10B981" />
                    </Svg>
                  </View>
                )}

                <View style={styles.offerHeader}>
                  <View style={styles.providerAvatar}>
                    <Text style={styles.providerInitial}>
                      {offer.provider.name.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={styles.providerInfo}>
                    <Text style={[styles.providerName, { color: colors.text }]}>
                      {offer.provider.name}
                    </Text>
                    <View style={styles.providerMeta}>
                      <Text style={styles.providerRating}>⭐ {offer.provider.rating}</Text>
                      <Text style={[styles.providerJobs, { color: colors.textSecondary }]}>
                        • {offer.provider.totalJobs} jobs
                      </Text>
                      {offer.provider.emergencyBadge && (
                        <Text style={styles.emergencyBadge}>• 🚨 Emergency Pro</Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.offerDetails}>
                  <View style={styles.offerDetailItem}>
                    <Svg width="20" height="20" viewBox="0 0 20 20">
                      <Path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18ZM10.5 5H9V11L14 14L15 12.5L10.5 10V5Z" fill={colors.primary} />
                    </Svg>
                    <Text style={[styles.offerDetailText, { color: colors.text }]}>
                      ETA: {offer.eta} mins
                    </Text>
                  </View>

                  <View style={styles.offerPrice}>
                    <Text style={styles.priceLabel}>Offer Price</Text>
                    <Text style={styles.priceValue}>Rs. {offer.price}</Text>
                  </View>
                </View>

                {offer.message && (
                  <View style={[styles.messageBox, { backgroundColor: colors.inputBackground }]}>
                    <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                      💬 "{offer.message}"
                    </Text>
                  </View>
                )}

                <View style={styles.offerFooter}>
                  <Text style={[styles.offerTime, { color: colors.textSecondary }]}>
                    Offer expires in 5 minutes
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Text style={styles.tipsTitle}>💡 Tips for Choosing</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>•</Text>
            <Text style={styles.tipText}>Check provider rating and total jobs completed</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>•</Text>
            <Text style={styles.tipText}>Consider ETA if you need urgent help</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>•</Text>
            <Text style={styles.tipText}>Emergency badge means verified for urgent work</Text>
          </View>
        </View>
      </ScrollView>

      {/* Accept Button */}
      {selectedOffer && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerInfo}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Selected Offer</Text>
            <Text style={[styles.footerProvider, { color: colors.text }]}>
              {selectedOffer.provider.name}
            </Text>
            <Text style={styles.footerPrice}>Rs. {selectedOffer.price}</Text>
          </View>
          <TouchableOpacity
            style={[styles.acceptButton, loading && styles.acceptButtonDisabled]}
            onPress={handleAcceptOffer}
            disabled={loading}
          >
            <Text style={styles.acceptButtonText}>
              {loading ? 'Accepting...' : 'Accept Offer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  requestCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  requestLocation: {
    fontSize: 12,
  },
  offersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  offerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    position: 'relative',
  },
  offerCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  providerRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  providerJobs: {
    fontSize: 13,
    marginLeft: 4,
  },
  emergencyBadge: {
    fontSize: 12,
    marginLeft: 4,
    color: '#DC2626',
  },
  offerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  offerPrice: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  offerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  offerTime: {
    fontSize: 12,
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipDot: {
    fontSize: 14,
    color: '#1E40AF',
    marginRight: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  footerInfo: {
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerProvider: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EmergencyOffersScreen;
