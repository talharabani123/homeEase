import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert } from 'react-native';
import Svg, { Path, Rect as SvgRect, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';

const PaymentMethodsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('cash');

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      subtitle: 'Pay with cash on service completion',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      subtitle: 'Add a card for quick payments',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            fill={COLORS.primaryGreen}
          />
        </Svg>
      ),
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      subtitle: 'Pay with JazzCash mobile wallet',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <SvgRect x="4" y="6" width="16" height="12" rx="2" fill="#FF6B00" />
          <Path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      ),
    },
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      subtitle: 'Pay with Easypaisa mobile wallet',
      icon: () => (
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <SvgRect x="4" y="6" width="16" height="12" rx="2" fill="#00A859" />
          <Path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      ),
    },
  ];

  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
    Alert.alert('Payment Method', `${paymentMethods.find(m => m.id === methodId).name} selected`);
  };

  const handleAddCard = () => {
    Alert.alert('Add Card', 'Card addition feature coming soon!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header with Menu */}
      <ScreenHeader title="Payment Methods" showBack={true} showMenu={false} navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Payment Method</Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedMethod === method.id && styles.methodCardSelected
            ]}
            onPress={() => handleSelectMethod(method.id)}
          >
            <View style={[styles.methodIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              {method.icon()}
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>{method.subtitle}</Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedMethod === method.id && styles.radioButtonSelected
            ]}>
              {selectedMethod === method.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Add Card Button */}
        <TouchableOpacity style={[styles.addCardButton, { backgroundColor: colors.card }]} onPress={handleAddCard}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={COLORS.primaryGreen} />
          </Svg>
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" stroke={COLORS.primaryGreen} strokeWidth="1.5" fill="none" />
            <Path d="M10 6v4M10 14h.01" stroke={COLORS.primaryGreen} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your payment information is secure and encrypted. You can change your preferred payment method anytime.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  methodCardSelected: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0F9F5',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 13,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primaryGreen,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primaryGreen,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 12,
  },
});

export default PaymentMethodsScreen;
