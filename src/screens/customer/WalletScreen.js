import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, SafeAreaView, FlatList, Alert } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const WalletIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 32 32">
    <Path
      d="M6 10h20c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V12c0-1.1.9-2 2-2z"
      fill={COLORS.white}
    />
    <Rect x="22" y="16" width="4" height="4" rx="1" fill={COLORS.primaryGreen} />
  </Svg>
);

const AddIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="9" fill={COLORS.white} />
    <Path d="M10 5v10M5 10h10" stroke={COLORS.primaryGreen} strokeWidth="2" />
  </Svg>
);

const ArrowUpIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path d="M8 12V4M4 8l4-4 4 4" stroke="#FF4444" strokeWidth="2" fill="none" />
  </Svg>
);

const ArrowDownIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path d="M8 4v8M4 8l4 4 4-4" stroke="#4CAF50" strokeWidth="2" fill="none" />
  </Svg>
);

const WalletScreen = ({ navigation }) => {
  const [balance] = useState(1250);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  // Mock transaction history
  const [transactions] = useState([
    {
      id: 1,
      type: 'debit',
      title: 'Payment to Ahmed Khan',
      description: 'Plumber service',
      amount: 580,
      date: '2026-02-13',
      time: '10:30 AM',
    },
    {
      id: 2,
      type: 'credit',
      title: 'Wallet Top-up',
      description: 'Added via Card',
      amount: 1000,
      date: '2026-02-12',
      time: '3:15 PM',
    },
    {
      id: 3,
      type: 'debit',
      title: 'Payment to Hassan Ali',
      description: 'Electrician service',
      amount: 750,
      date: '2026-02-10',
      time: '2:00 PM',
    },
    {
      id: 4,
      type: 'credit',
      title: 'Refund',
      description: 'Cancelled service',
      amount: 450,
      date: '2026-02-08',
      time: '11:20 AM',
    },
    {
      id: 5,
      type: 'debit',
      title: 'Payment to Bilal Ahmed',
      description: 'Carpenter service',
      amount: 1200,
      date: '2026-02-05',
      time: '4:45 PM',
    },
  ]);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleAddFunds = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Invalid Amount', 'Please enter an amount of at least Rs 100');
      return;
    }

    // TODO: Integrate payment gateway
    Alert.alert(
      'Add Funds',
      `Add Rs ${amount} to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            Alert.alert('Success', 'Funds will be added after payment confirmation');
            setShowAddFunds(false);
            setAmount('');
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: item.type === 'credit' ? '#E8F5E9' : '#FFE5E5' }
      ]}>
        {item.type === 'credit' ? <ArrowDownIcon /> : <ArrowUpIcon />}
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {formatDate(item.date)} • {item.time}
        </Text>
      </View>

      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'credit' ? '#4CAF50' : '#FF4444' }
      ]}>
        {item.type === 'credit' ? '+' : '-'} Rs {item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />
      
      {/* Header with Balance */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        
        <View style={styles.balanceCard}>
          <View style={styles.walletIconContainer}>
            <WalletIcon />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>Rs {balance.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addFundsButton}
          onPress={() => setShowAddFunds(!showAddFunds)}
        >
          <AddIcon />
          <Text style={styles.addFundsButtonText}>Add Funds</Text>
        </TouchableOpacity>
      </View>

      {/* Add Funds Section */}
      {showAddFunds && (
        <View style={styles.addFundsSection}>
          <Text style={styles.addFundsTitle}>Enter Amount</Text>
          
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>Rs {quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleAddFunds}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>

          <Text style={styles.noteText}>
            💳 Payment via Card, JazzCash, or EasyPaisa
          </Text>
        </View>
      )}

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Transaction History</Text>
        
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.white,
    marginBottom: 20,
  },

  // Balance Card
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Add Funds Button
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addFundsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Add Funds Section
  addFundsSection: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addFundsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 12,
  },
  amountInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textBlack,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F9F5',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  proceedButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: 'center',
  },

  // History Section
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },

  // Transaction Card
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 13,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: COLORS.textGrey,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});

export default WalletScreen;
