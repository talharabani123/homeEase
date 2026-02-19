import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Rect as SvgRect } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={COLORS.textBlack} strokeWidth="2" fill="none" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={COLORS.primaryGreen} />
    <Path d="M8 12l3 3 5-5" stroke={COLORS.white} strokeWidth="2" fill="none" />
  </Svg>
);

const CashIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <SvgRect x="2" y="8" width="24" height="12" rx="2" fill={COLORS.primaryGreen} />
    <Circle cx="14" cy="14" r="3" fill={COLORS.white} />
  </Svg>
);

const WalletIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <Path
      d="M4 8h20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z"
      fill="#2196F3"
    />
    <SvgRect x="18" y="13" width="6" height="6" rx="1" fill={COLORS.white} />
  </Svg>
);

const CardIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <SvgRect x="2" y="6" width="24" height="16" rx="2" fill="#FF9800" />
    <SvgRect x="2" y="10" width="24" height="3" fill={COLORS.white} opacity="0.3" />
    <SvgRect x="4" y="16" width="8" height="2" rx="1" fill={COLORS.white} />
  </Svg>
);

const PaymentScreen = ({ navigation, route }) => {
  const { jobData, provider } = route.params || {};
  
  // Mock job data
  const job = jobData || {
    serviceType: 'Plumber',
    distance: 2.5,
    duration: 45, // minutes
    baseCharge: 500,
    distanceCharge: 50,
    platformFee: 30,
  };

  const providerData = provider || {
    name: 'Ahmed Khan',
  };

  const [selectedPayment, setSelectedPayment] = useState('cash');

  // Calculate charges
  const distanceCharge = Math.round(job.distance * 20); // Rs 20 per km
  const workCharge = job.baseCharge || 500;
  const platformFee = job.platformFee || 30;
  const totalAmount = workCharge + distanceCharge + platformFee;

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: CashIcon, available: true },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon, available: true, balance: 1200 },
    { id: 'card', label: 'Card', icon: CardIcon, available: true },
  ];

  const handlePayment = () => {
    // TODO: Process payment
    navigation.navigate('Rating', {
      jobData: job,
      provider: providerData,
      paymentMethod: selectedPayment,
      amount: totalAmount,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <CheckIcon />
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>Job Completed!</Text>
            <Text style={styles.successSubtitle}>
              {providerData.name} has completed the service
            </Text>
          </View>
        </View>

        {/* Bill Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Breakdown</Text>
          
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Service Type</Text>
              <Text style={styles.billValue}>{job.serviceType}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Work Charges</Text>
              <Text style={styles.billValue}>Rs {workCharge}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Distance ({job.distance} km)</Text>
              <Text style={styles.billValue}>Rs {distanceCharge}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Platform Fee</Text>
              <Text style={styles.billValue}>Rs {platformFee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.billRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs {totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
              disabled={!method.available}
            >
              <View style={styles.paymentIconContainer}>
                <method.icon />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                {method.balance && (
                  <Text style={styles.paymentBalance}>
                    Balance: Rs {method.balance}
                  </Text>
                )}
              </View>

              <View style={styles.radioContainer}>
                {selectedPayment === method.id ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioDot} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 You can pay now or after reviewing the service
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>Rs {totalAmount}</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>
            {selectedPayment === 'cash' ? 'Confirm & Rate' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Success Banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  successTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textGrey,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 12,
  },

  // Bill Card
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  billLabel: {
    fontSize: 15,
    color: COLORS.textGrey,
  },
  billValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // Payment Card
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  paymentCardSelected: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0F9F5',
  },
  paymentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  paymentBalance: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primaryGreen,
  },

  // Note Card
  noteCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noteText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 15,
    color: COLORS.textGrey,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  payButton: {
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
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default PaymentScreen;
