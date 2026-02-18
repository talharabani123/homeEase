import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

// Icons
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Circle cx="8" cy="8" r="6" stroke={COLORS.textGrey} strokeWidth="2" fill="none" />
    <Path d="M13 13l4 4" stroke={COLORS.textGrey} strokeWidth="2" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path
      d="M2 4h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      fill={COLORS.textGrey}
    />
    <Path d="M4 2v4M12 2v4M0 8h16" stroke={COLORS.white} strokeWidth="1.5" />
  </Svg>
);

const RefreshIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18">
    <Path
      d="M14 9c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5c1.38 0 2.63.56 3.54 1.46L10 8h5V3l-1.65 1.65C12.15 3.45 10.66 2.5 9 2.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5"
      stroke={COLORS.primaryGreen}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  // Mock history data
  const [historyData] = useState([
    {
      id: 1,
      serviceType: 'Plumber',
      providerName: 'Ahmed Khan',
      date: '2026-02-10',
      amount: 580,
      status: 'completed',
      rating: 5,
    },
    {
      id: 2,
      serviceType: 'Electrician',
      providerName: 'Hassan Ali',
      date: '2026-02-05',
      amount: 750,
      status: 'completed',
      rating: 4,
    },
    {
      id: 3,
      serviceType: 'Carpenter',
      providerName: 'Bilal Ahmed',
      date: '2026-01-28',
      amount: 1200,
      status: 'completed',
      rating: 5,
    },
    {
      id: 4,
      serviceType: 'AC Technician',
      providerName: 'Usman Malik',
      date: '2026-01-20',
      amount: 950,
      status: 'cancelled',
      rating: 0,
    },
    {
      id: 5,
      serviceType: 'Plumber',
      providerName: 'Ahmed Khan',
      date: '2026-01-15',
      amount: 450,
      status: 'completed',
      rating: 5,
    },
  ]);

  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#FF4444';
      default:
        return COLORS.textGrey;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed':
        return '#E8F5E9';
      case 'cancelled':
        return '#FFE5E5';
      default:
        return '#F5F5F5';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleViewDetails = (item) => {
    // TODO: Navigate to details screen
    console.log('View details:', item);
  };

  const handleRebook = (item) => {
    navigation.navigate('ServiceRequest', {
      category: item.serviceType,
      preferredProvider: item.providerName,
    });
  };

  const renderStars = (rating) => {
    if (rating === 0) return null;
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Svg key={i} width="12" height="12" viewBox="0 0 12 12">
            <Path
              d="M6 1l1.5 3.5h3.5l-2.5 2 1 3.5-3-2-3 2 1-3.5-2.5-2h3.5z"
              fill={i < rating ? '#FFA726' : '#E0E0E0'}
            />
          </Svg>
        ))}
      </View>
    );
  };

  const renderHistoryItem = ({ item }) => (
    <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Text style={[styles.serviceType, { color: colors.text }]}>{item.serviceType}</Text>
          <Text style={[styles.providerName, { color: colors.textSecondary }]}>{item.providerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <CalendarIcon />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.amountText}>Rs {item.amount}</Text>
      </View>

      {item.rating > 0 && (
        <View style={styles.ratingRow}>
          <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Your Rating:</Text>
          {renderStars(item.rating)}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>View Details</Text>
        </TouchableOpacity>
        
        {item.status === 'completed' && (
          <TouchableOpacity
            style={styles.rebookButton}
            onPress={() => handleRebook(item)}
          >
            <RefreshIcon />
            <Text style={styles.rebookButtonText}>Rebook</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filteredData = filter === 'all'
    ? historyData
    : historyData.filter(item => item.status === filter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.filterTab, { backgroundColor: colors.backgroundSecondary }, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, { backgroundColor: colors.backgroundSecondary }, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, { backgroundColor: colors.backgroundSecondary }, filter === 'cancelled' && styles.filterTabActive]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'cancelled' && styles.filterTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No History Found</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'all'
              ? 'You haven\'t booked any services yet'
              : `No ${filter} services found`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
  },

  // Filter Container
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // List
  listContent: {
    padding: 20,
  },

  // History Card
  historyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card Details
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // Rating Row
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rebookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    gap: 6,
  },
  rebookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HistoryScreen;
