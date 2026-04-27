import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_STORAGE_KEY = '@homeease_provider_wallet';

const ProviderWalletScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [balance, setBalance] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const stored = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setBalance(data.balance || 0);
        setPendingEarnings(data.pendingEarnings || 0);
        setTransactions(data.transactions || []);
      } else {
        // Initialize with mock data
        const mockData = {
          balance: 15000,
          pendingEarnings: 3500,
          transactions: [
            {
              id: 'txn_001',
              type: 'earning',
              amount: 1500,
              description: 'Plumbing Repair - Ahmed Khan',
              date: '2024-02-20',
              status: 'completed'
            },
            {
              id: 'txn_002',
              type: 'earning',
              amount: 2000,
              description: 'Electrical Work - Sara Ali',
              date: '2024-02-19',
              status: 'completed'
            },
            {
              id: 'txn_003',
              type: 'earning',
              amount: 1800,
              description: 'AC Repair - Ali Hassan',
              date: '2024-02-17',
              status: 'completed'
            },
            {
              id: 'txn_004',
              type: 'earning',
              amount: 2500,
              description: 'Carpentry Work - Fatima Khan',
              date: '2024-02-16',
              status: 'pending'
            },
            {
              id: 'txn_005',
              type: 'earning',
              amount: 3200,
              description: 'Painting Service - Hassan Ali',
              date: '2024-02-15',
              status: 'completed'
            },
          ]
        };
        await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(mockData));
        setBalance(mockData.balance);
        setPendingEarnings(mockData.pendingEarnings);
        setTransactions(mockData.transactions);
      }
    } catch (error) {
      console.error('Load wallet error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const renderTransaction = (transaction) => {
    const isPositive = transaction.amount > 0;

    return (
      <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: '#10B981' + '20' }
        ]}>
          <Text style={styles.transactionEmoji}>💰</Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, { color: colors.text }]}>
            {transaction.description}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {transaction.date}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: transaction.status === 'completed' ? '#10B981' + '20' : '#F59E0B' + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: transaction.status === 'completed' ? '#10B981' : '#F59E0B' }
            ]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        <Text style={[
          styles.transactionAmount,
          { color: isPositive ? '#10B981' : '#EF4444' }
        ]}>
          {isPositive ? '+' : ''}Rs. {Math.abs(transaction.amount)}
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper variant="default">
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Total Earnings</Text>
          <Text style={styles.balanceAmount}>Rs. {balance.toLocaleString()}</Text>
          
          <View style={styles.pendingEarnings}>
            <Svg width="16" height="16" viewBox="0 0 16 16">
              <Circle cx="8" cy="8" r="7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              <Path d="M8 4 L8 8 L11 8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={styles.pendingText}>
              Rs. {pendingEarnings.toLocaleString()} pending
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBox, { backgroundColor: colors.primaryLight }]}>
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" fill={colors.primary} />
            <Path d="M10 6 L10 10 M10 14 L10 14.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Your earnings are tracked here. Withdrawal feature will be available soon.
          </Text>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Earnings History</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No earnings yet
              </Text>
            </View>
          ) : (
            transactions.map(transaction => renderTransaction(transaction))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollView: { flex: 1 },
  balanceCard: { marginHorizontal: 20, marginTop: 20, padding: 24, borderRadius: 16 },
  balanceLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  pendingEarnings: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingText: { fontSize: 13, color: '#FFFFFF', opacity: 0.9 },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 12, marginHorizontal: 20, marginTop: 20, gap: 12 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  transactionsSection: { marginHorizontal: 20, marginTop: 20, marginBottom: 20 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  transactionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionEmoji: { fontSize: 24 },
  transactionInfo: { flex: 1 },
  transactionDescription: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  transactionDate: { fontSize: 12, marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14 },
});

export default ProviderWalletScreen;
