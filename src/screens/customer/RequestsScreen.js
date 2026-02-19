import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

// Icons
const ClockIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Circle cx="8" cy="8" r="7" stroke={COLORS.textGrey} strokeWidth="1.5" fill="none" />
    <Path d="M8 4v4l3 2" stroke={COLORS.textGrey} strokeWidth="1.5" fill="none" />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Path
      d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5 9.5 5.17 9.5 6 8.83 7.5 8 7.5z"
      fill={COLORS.primaryGreen}
    />
  </Svg>
);

const RequestsScreen = ({ navigation }) => {
  // Mock requests data
  const [requestsData] = useState({
    active: [
      {
        id: 1,
        serviceType: 'Plumber',
        providerName: 'Ahmed Khan',
        status: 'on_the_way',
        statusText: 'On the way',
        date: '2026-02-13',
        time: '10:30 AM',
        location: 'House 123, F-7, Islamabad',
        eta: '15 mins',
      },
    ],
    completed: [
      {
        id: 2,
        serviceType: 'Electrician',
        providerName: 'Hassan Ali',
        status: 'completed',
        statusText: 'Completed',
        date: '2026-02-10',
        time: '2:00 PM',
        location: 'House 123, F-7, Islamabad',
        amount: 750,
      },
      {
        id: 3,
        serviceType: 'Carpenter',
        providerName: 'Bilal Ahmed',
        status: 'completed',
        statusText: 'Completed',
        date: '2026-02-05',
        time: '11:00 AM',
        location: 'House 123, F-7, Islamabad',
        amount: 1200,
      },
    ],
    cancelled: [
      {
        id: 4,
        serviceType: 'AC Technician',
        providerName: 'Usman Malik',
        status: 'cancelled',
        statusText: 'Cancelled',
        date: '2026-02-01',
        time: '3:00 PM',
        location: 'House 123, F-7, Islamabad',
        reason: 'Provider unavailable',
      },
    ],
  });

  const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_the_way':
      case 'in_progress':
        return '#2196F3';
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
      case 'on_the_way':
      case 'in_progress':
        return '#E3F2FD';
      case 'completed':
        return '#E8F5E9';
      case 'cancelled':
        return '#FFE5E5';
      default:
        return '#F5F5F5';
    }
  };

  const handleTrackRequest = (request) => {
    navigation.navigate('LiveTracking', {
      provider: { name: request.providerName },
      requestData: { category: request.serviceType },
    });
  };

  const handleViewDetails = (request) => {
    if (request.status === 'on_the_way' || request.status === 'in_progress') {
      navigation.navigate('ProviderDetails', {
        provider: { name: request.providerName },
        requestData: { category: request.serviceType },
      });
    } else {
      // TODO: Navigate to request details screen
      console.log('View details:', request);
    }
  };

  const renderRequestCard = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <Text style={styles.providerName}>{item.providerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.statusText}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <ClockIcon />
          <Text style={styles.detailText}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <LocationIcon />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      {/* Active Request Info */}
      {item.status === 'on_the_way' && item.eta && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaLabel}>Estimated Arrival:</Text>
          <Text style={styles.etaValue}>{item.eta}</Text>
        </View>
      )}

      {/* Completed Request Info */}
      {item.status === 'completed' && item.amount && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount Paid:</Text>
          <Text style={styles.amountValue}>Rs {item.amount}</Text>
        </View>
      )}

      {/* Cancelled Request Info */}
      {item.status === 'cancelled' && item.reason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>

        {(item.status === 'on_the_way' || item.status === 'in_progress') && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => handleTrackRequest(item)}
          >
            <LocationIcon />
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case 'active':
        return requestsData.active;
      case 'completed':
        return requestsData.completed;
      case 'cancelled':
        return requestsData.cancelled;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
          {requestsData.active.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{requestsData.active.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      {currentData.length > 0 ? (
        <FlatList
          data={currentData}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {activeTab === 'active' ? '📋' : activeTab === 'completed' ? '✅' : '❌'}
          </Text>
          <Text style={styles.emptyTitle}>No {activeTab} requests</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'active'
              ? 'You don\'t have any active service requests'
              : activeTab === 'completed'
              ? 'No completed services yet'
              : 'No cancelled requests'}
          </Text>
        </View>
      )}
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  badge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // List
  listContent: {
    padding: 20,
  },

  // Request Card
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: COLORS.textBlack,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: COLORS.textGrey,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card Details
  cardDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textGrey,
  },

  // ETA Container
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  etaLabel: {
    fontSize: 13,
    color: '#1976D2',
  },
  etaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  // Amount Container
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },

  // Reason Container
  reasonContainer: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.textBlack,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    gap: 6,
  },
  trackButtonText: {
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
    color: COLORS.textBlack,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RequestsScreen;
