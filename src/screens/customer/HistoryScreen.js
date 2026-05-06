import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator,
  RefreshControl,
  Dimensions 
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getServiceHistory } from '../../services/userDataService';

const { width: screenWidth } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    if (user?.uid) {
      const data = await getServiceHistory(user.uid);
      setHistoryData(data);
    } else {
      setHistoryData([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'pending':
        return colors.warning;
      case 'in_progress':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.isDarkMode ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9';
      case 'cancelled':
        return colors.isDarkMode ? 'rgba(255, 68, 68, 0.15)' : '#FFE5E5';
      case 'pending':
        return colors.isDarkMode ? 'rgba(255, 152, 0, 0.15)' : '#FFF3E0';
      case 'in_progress':
        return colors.isDarkMode ? 'rgba(33, 150, 243, 0.15)' : '#E3F2FD';
      default:
        return colors.backgroundSecondary;
    }
  };

  const getStatusIcon = (status) => {
    const iconColor = getStatusColor(status);
    switch (status) {
      case 'completed':
        return (
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill={iconColor}
            />
          </Svg>
        );
      case 'cancelled':
        return (
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
              fill={iconColor}
            />
          </Svg>
        );
      case 'pending':
        return (
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"
              fill={iconColor}
            />
          </Svg>
        );
      default:
        return (
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill={iconColor}
            />
          </Svg>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleViewDetails = (item) => {
    // Navigate to job tracking or details screen
    navigation.navigate('JobTracking', { jobId: item.id });
  };

  const handleRebook = (item) => {
    navigation.navigate('RequestServiceForm', {
      service: {
        name: item.serviceType,
        category: item.category || item.serviceType,
      },
      preferredProvider: item.providerName,
    });
  };

  const handleRateService = (item) => {
    navigation.navigate('Rating', { 
      serviceId: item.id,
      providerName: item.providerName,
      serviceType: item.serviceType 
    });
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Svg key={i} width="14" height="14" viewBox="0 0 24 24">
            <Path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={i < rating ? '#FFA726' : colors.border}
            />
          </Svg>
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>({rating})</Text>
      </View>
    );
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyCard, { 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        shadowColor: colors.shadow 
      }]}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Text style={[styles.serviceType, { color: colors.text }]} numberOfLines={1}>
            {item.serviceType}
          </Text>
          <Text style={[styles.providerName, { color: colors.textSecondary }]} numberOfLines={1}>
            by {item.providerName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
              fill={colors.textSecondary}
            />
          </Svg>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(item.date || item.createdAt)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill={colors.textSecondary}
            />
          </Svg>
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.address || 'Service location'}
          </Text>
        </View>
      </View>

      {/* Amount and Rating */}
      <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.amountText, { color: colors.primary }]}>
            Rs {item.amount || '0'}
          </Text>
        </View>
        
        {item.rating > 0 ? (
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
        ) : item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => handleRateService(item)}
          >
            <Text style={[styles.rateButtonText, { color: colors.primary }]}>Rate</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton, { 
            backgroundColor: colors.backgroundSecondary, 
            borderColor: colors.border 
          }]}
          onPress={() => handleViewDetails(item)}
        >
          <Svg width="16" height="16" viewBox="0 0 24 24">
            <Path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill={colors.text}
            />
          </Svg>
          <Text style={[styles.actionButtonText, { color: colors.text }]}>View Details</Text>
        </TouchableOpacity>
        
        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rebookButton, { backgroundColor: colors.primary }]}
            onPress={() => handleRebook(item)}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24">
              <Path
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                fill="#fff"
              />
            </Svg>
            <Text style={styles.rebookButtonText}>Rebook</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredData = filter === 'all'
    ? historyData
    : historyData.filter(item => item.status === filter);

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return historyData.length;
    return historyData.filter(item => item.status === filterType).length;
  };

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.headerBackground, 
          borderBottomColor: colors.headerBorder 
        }]}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Service History</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {historyData.length} service{historyData.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
          {[
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Completed' },
            { key: 'pending', label: 'Pending' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(filterItem => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterTab,
                { backgroundColor: colors.backgroundSecondary },
                filter === filterItem.key && [styles.filterTabActive, { backgroundColor: colors.primary }]
              ]}
              onPress={() => setFilter(filterItem.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === filterItem.key && styles.filterTextActive
              ]}>
                {filterItem.label}
              </Text>
              {getFilterCount(filterItem.key) > 0 && (
                <View style={[
                  styles.filterBadge,
                  { backgroundColor: filter === filterItem.key ? 'rgba(255,255,255,0.3)' : colors.border }
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    { color: filter === filterItem.key ? '#fff' : colors.textSecondary }
                  ]}>
                    {getFilterCount(filterItem.key)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading history...</Text>
          </View>
        ) : filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Svg width="80" height="80" viewBox="0 0 24 24">
              <Path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                fill={colors.textSecondary}
                opacity="0.3"
              />
            </Svg>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'all' ? 'No Service History' : `No ${filter.replace('_', ' ')} Services`}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filter === 'all'
                ? "You haven't booked any services yet. Start by exploring our services!"
                : `No ${filter.replace('_', ' ')} services found in your history.`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreButtonText}>Explore Services</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 60, // Safe area top padding
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Filter Container
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    minHeight: 44,
  },
  filterTabActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  filterBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  // List
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },

  // History Card
  historyCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceType: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    letterSpacing: -0.1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    minHeight: 32,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Card Content
  cardContent: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 24,
  },
  detailText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    letterSpacing: -0.1,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  amountContainer: {
    alignItems: 'flex-start',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
    letterSpacing: -0.1,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    opacity: 0.7,
  },
  rateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    minHeight: 52,
  },
  viewButton: {
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  rebookButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rebookButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.8,
    letterSpacing: -0.1,
  },
  exploreButton: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
});

export default HistoryScreen;