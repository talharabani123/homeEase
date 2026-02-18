import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';
// import { getUserConversations, deleteConversation } from '../../services/chatService';

// Icons
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Path
      d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
      fill={COLORS.textGrey}
    />
  </Svg>
);

const MessagesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    
    // Mock conversations for Expo Go
    // In production: const result = await getUserConversations(currentUserId, 'customer');
    
    setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('Chat', {
      requestId: conversation.requestId,
      providerId: conversation.providerId,
      providerName: conversation.providerName,
      customerName: 'You',
    });
  };

  const handleDeleteConversation = (conversation) => {
    Alert.alert(
      'Delete Conversation',
      `Delete conversation with ${conversation.providerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // In production: await deleteConversation(conversation.requestId);
            setConversations(prev => prev.filter(c => c.id !== conversation.id));
          },
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderConversation = ({ item }) => {
    const initials = item.providerName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return (
      <TouchableOpacity
        style={[styles.conversationCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleDeleteConversation(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.providerImage ? (
            <Image source={{ uri: item.providerImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {item.isOnline && <View style={styles.onlineBadge} />}
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
              {item.providerName}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          
          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.lastMessage,
                { color: colors.textSecondary },
                item.unreadCount > 0 && [styles.unreadMessage, { color: colors.text }]
              ]}
              numberOfLines={1}
            >
              {item.lastMessageSender === 'you' && 'You: '}
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          {/* Service Type Tag */}
          <View style={styles.serviceTag}>
            <Text style={styles.serviceIcon}>{item.serviceIcon}</Text>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
          </View>
        </View>

        {/* Delete Button (visible on long press hint) */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item)}
        >
          <Svg width="20" height="20" viewBox="0 0 20 20">
            <Path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              fill="#FF4444"
            />
          </Svg>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Svg width="80" height="80" viewBox="0 0 80 80">
        <Path
          d="M70 10H10c-3.3 0-6 2.7-6 6v48l12-12h54c3.3 0 6-2.7 6-6V16c0-3.3-2.7-6-6-6z"
          fill="#E0E0E0"
        />
        <Circle cx="30" cy="30" r="3" fill={COLORS.white} />
        <Circle cx="40" cy="30" r="3" fill={COLORS.white} />
        <Circle cx="50" cy="30" r="3" fill={COLORS.white} />
      </Svg>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages Yet</Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Start a conversation with a service provider
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>Request a Service</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyListContent
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primaryGreen]}
              tintColor={COLORS.primaryGreen}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

// Mock conversations for Expo Go testing
const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    requestId: 'req1',
    providerId: 'provider1',
    providerName: 'Ahmed Khan',
    providerImage: null,
    serviceType: 'Plumber',
    serviceIcon: '🔧',
    lastMessage: 'I will arrive in 10 minutes',
    lastMessageSender: 'provider',
    lastMessageTime: Date.now() - 300000, // 5 mins ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv2',
    requestId: 'req2',
    providerId: 'provider2',
    providerName: 'Ali Raza',
    providerImage: null,
    serviceType: 'Electrician',
    serviceIcon: '⚡',
    lastMessage: 'Thank you for your service!',
    lastMessageSender: 'you',
    lastMessageTime: Date.now() - 3600000, // 1 hour ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv3',
    requestId: 'req3',
    providerId: 'provider3',
    providerName: 'Hassan Ali',
    providerImage: null,
    serviceType: 'Carpenter',
    serviceIcon: '🪚',
    lastMessage: 'What time works best for you?',
    lastMessageSender: 'provider',
    lastMessageTime: Date.now() - 7200000, // 2 hours ago
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'conv4',
    requestId: 'req4',
    providerId: 'provider4',
    providerName: 'Usman Sheikh',
    providerImage: null,
    serviceType: 'Painter',
    serviceIcon: '🎨',
    lastMessage: 'Job completed successfully',
    lastMessageSender: 'provider',
    lastMessageTime: Date.now() - 86400000, // 1 day ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv5',
    requestId: 'req5',
    providerId: 'provider5',
    providerName: 'Bilal Ahmed',
    providerImage: null,
    serviceType: 'AC Repair',
    serviceIcon: '❄️',
    lastMessage: 'Can you send me your location?',
    lastMessageSender: 'you',
    lastMessageTime: Date.now() - 172800000, // 2 days ago
    unreadCount: 0,
    isOnline: false,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.headerWeight,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },

  // List
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  // Conversation Card
  conversationCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },

  // Delete Button
  deleteButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // Conversation Info
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Service Tag
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  serviceType: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default MessagesScreen;
