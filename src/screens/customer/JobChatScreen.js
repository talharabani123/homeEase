import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { listenToMessages, sendMessage, markMessagesAsRead, createConversation } from '../../services/chatService';

const JobChatScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { jobId, otherUserId, otherUserName, serviceType, serviceIcon } = route.params;
  
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!user || !otherUserId) {
      setLoading(false);
      return;
    }

    initializeConversation();
  }, [user, otherUserId, jobId]);

  const initializeConversation = async () => {
    console.log('🔄 Initializing conversation for job:', jobId);

    // Determine customer and provider IDs based on user role
    const customerId = user.role === 'customer' ? user.uid : otherUserId;
    const providerId = user.role === 'provider' ? user.uid : otherUserId;

    // Create or get existing conversation
    const result = await createConversation(
      customerId,
      providerId,
      jobId,
      { serviceType, serviceIcon }
    );

    if (result.success) {
      console.log('✅ Conversation ready:', result.conversationId);
      setConversationId(result.conversationId);
    } else {
      console.error('❌ Failed to create conversation:', result.error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId || !user) return;

    console.log('👂 Setting up message listener for conversation:', conversationId);

    // Listen to messages in real-time
    const unsubscribe = listenToMessages(conversationId, (msgs) => {
      console.log('📬 Received messages:', msgs.length);
      setMessages(msgs);
      setLoading(false);
    });

    // Mark messages as read
    markMessagesAsRead(conversationId, user.uid);

    return () => {
      console.log('🔌 Unsubscribing from messages');
      unsubscribe();
    };
  }, [conversationId, user]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !conversationId || !user) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      console.log('📤 Sending message...');
      
      const result = await sendMessage(
        conversationId,
        user.uid,
        user.role || 'customer',
        messageText
      );
      
      if (result.success) {
        console.log('✅ Message sent successfully');
        // Message will appear via real-time listener
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.error('❌ Failed to send message:', result.error);
        setInputText(messageText); // Restore message on error
      }
      
      setSending(false);
    } catch (error) {
      setSending(false);
      console.error('❌ Send message error:', error);
      setInputText(messageText); // Restore message on error
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerDashboard');
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user?.uid;
    const time = new Date(item.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <View style={[
          styles.messageBubble,
          { backgroundColor: isMyMessage ? colors.primary : colors.card },
          !isMyMessage && { borderColor: colors.cardBorder, borderWidth: 1 }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMyMessage ? '#FFFFFF' : colors.text }
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isMyMessage ? '#FFFFFF' : colors.textSecondary }
          ]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper variant="default" useSafeArea={false}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading conversation...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18 L9 12 L15 6" stroke={colors.text} strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {otherUserName || (user?.role === 'customer' ? 'Service Provider' : 'Customer')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {serviceType || 'Online'}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.messageId || item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#FFFFFF" />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 12
  },
  loadingText: { fontSize: 14, marginTop: 8 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  messageContainer: { marginBottom: 12 },
  myMessage: { alignItems: 'flex-end' },
  theirMessage: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '75%', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 16 
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 11, marginTop: 4, opacity: 0.7 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    borderTopWidth: 1,
    gap: 8
  },
  input: { 
    flex: 1, 
    maxHeight: 100, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    fontSize: 15 
  },
  sendButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});

export default JobChatScreen;
