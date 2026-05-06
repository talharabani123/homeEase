import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Alert,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { getConversations, deleteConversation } from '../../services/userDataService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = -80; // how far left to reveal delete

// ─── Swipeable row ────────────────────────────────────────────────────────────
const SwipeableRow = ({ children, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        // Only allow left swipe
        if (g.dx < 0) translateX.setValue(Math.max(g.dx, DELETE_THRESHOLD));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DELETE_THRESHOLD / 2) {
          // Snap open
          Animated.spring(translateX, { toValue: DELETE_THRESHOLD, useNativeDriver: true }).start();
          rowOpen.current = true;
        } else {
          // Snap closed
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          rowOpen.current = false;
        }
      },
    })
  ).current;

  const close = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    rowOpen.current = false;
  };

  return (
    <View style={swipeStyles.container}>
      {/* Delete action revealed behind */}
      <View style={swipeStyles.deleteAction}>
        <TouchableOpacity
          style={swipeStyles.deleteBtn}
          onPress={() => { close(); onDelete(); }}
        >
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fff" />
          </Svg>
          <Text style={swipeStyles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
      {/* Row content */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const swipeStyles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  deleteAction: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: Math.abs(DELETE_THRESHOLD),
    backgroundColor: '#FF4444',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
  deleteBtnText: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 3 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const MessagesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadConversations(); }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    if (user?.uid) {
      const data = await getConversations(user.uid);
      setConversations(data);
    } else {
      setConversations([]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conv) => {
    navigation.navigate('Chat', {
      requestId: conv.requestId,
      providerId: conv.providerId,
      providerName: conv.providerName,
      customerName: 'You',
    });
  };

  const handleDelete = (conv) => {
    Alert.alert(
      'Delete Conversation',
      `Delete conversation with ${conv.providerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            if (user?.uid) await deleteConversation(user.uid, conv.id);
            setConversations(prev => prev.filter(c => c.id !== conv.id));
          },
        },
      ]
    );
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return 'Yesterday';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const initials = item.providerName.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <SwipeableRow onDelete={() => handleDelete(item)}>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={() => handleConversationPress(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.75}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primaryGreen }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {item.isOnline && <View style={styles.onlineDot} />}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.providerName}</Text>
              <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.lastMessageTime)}</Text>
            </View>
            <View style={styles.bottomRow}>
              <Text
                style={[
                  styles.lastMsg,
                  { color: item.unreadCount > 0 ? colors.text : colors.textSecondary },
                  item.unreadCount > 0 && { fontWeight: '600' },
                ]}
                numberOfLines={1}
              >
                {item.lastMessageSender === 'you' ? 'You: ' : ''}{item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.tagText}>{item.serviceIcon} {item.serviceType}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  const EmptyState = () => (
    <View style={styles.empty}>
      <Svg width="72" height="72" viewBox="0 0 80 80">
        <Path d="M70 10H10c-3.3 0-6 2.7-6 6v48l12-12h54c3.3 0 6-2.7 6-6V16c0-3.3-2.7-6-6-6z" fill="#E0E0E0" />
        <Circle cx="30" cy="30" r="3" fill="#fff" />
        <Circle cx="40" cy="30" r="3" fill="#fff" />
        <Circle cx="50" cy="30" r="3" fill="#fff" />
      </Svg>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages Yet</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
        Start a conversation with a service provider
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.emptyBtnText}>Request a Service</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <Text style={[styles.headerHint, { color: colors.textSecondary }]}>Swipe left to delete</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, conversations.length === 0 && { flex: 1 }]}
          ListEmptyComponent={<EmptyState />}
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
    </ScreenWrapper>
  );
};

// No more hardcoded mock data — conversations are loaded from user-specific storage

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerHint: { fontSize: 12 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingVertical: 4 },

  row: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff',
  },

  content: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', marginRight: 8 },
  time: { fontSize: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  lastMsg: { flex: 1, fontSize: 13, marginRight: 8 },
  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  tag: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: COLORS.primaryGreen },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    backgroundColor: COLORS.primaryGreen, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default MessagesScreen;
