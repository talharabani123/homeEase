import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { listenToMessages, sendMessage, markMessagesAsRead, setTypingStatus, listenToTypingStatus } from '../../services/chatService';

const ChatScreen = ({ navigation, route }) => {
  const { conversationId, otherUserId, otherUserName, serviceType, serviceIcon } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const scrollViewRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    console.log('👂 Setting up message listener for conversation:', conversationId);

    // Listen to messages in real-time
    const unsubscribeMessages = listenToMessages(conversationId, (msgs) => {
      console.log('📬 Received messages:', msgs.length);
      setMessages(msgs);
    });

    // Mark messages as read
    markMessagesAsRead(conversationId, user.uid);

    // Listen to typing status
    const unsubscribeTyping = listenToTypingStatus(conversationId, otherUserId, (isTyping) => {
      setIsOtherUserTyping(isTyping);
    });

    return () => {
      console.log('🔌 Unsubscribing from messages and typing');
      unsubscribeMessages();
      unsubscribeTyping();
      
      // Clear typing status on unmount
      setTypingStatus(conversationId, user.uid, false);
    };
  }, [conversationId, user, otherUserId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleTextChange = (text) => {
    setInputText(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status
    if (text.length > 0) {
      setTypingStatus(conversationId, user.uid, true);

      // Clear typing status after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(conversationId, user.uid, false);
      }, 2000);
    } else {
      setTypingStatus(conversationId, user.uid, false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending || !user) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Clear typing status
    setTypingStatus(conversationId, user.uid, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ScreenWrapper variant="default" useSafeArea={false}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M15 18 L9 12 L15 6" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitial}>{otherUserName?.[0] || '?'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{otherUserName || 'User'}</Text>
            <Text style={styles.headerSubtitle}>
              {isOtherUserTyping ? 'Typing...' : (serviceType || 'Service Provider')}
            </Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => {
          const isCustomer = message.senderType === 'customer' || message.senderId === user?.uid;
          const showTime = index === 0 || 
            (messages[index - 1] && 
             new Date(message.timestamp).getMinutes() !== new Date(messages[index - 1].timestamp).getMinutes());

          return (
            <View key={message.messageId || message.id || index}>
              {showTime && (
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
                </View>
              )}
              <View style={[
                styles.messageBubble,
                isCustomer ? styles.customerBubble : styles.providerBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  isCustomer ? styles.customerText : styles.providerText
                ]}>
                  {message.message}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textGrey}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M22 2 L11 13 M22 2 L15 22 L11 13 M22 2 L2 9 L11 13" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

// Mock messages removed - now using Firebase real-time data

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primaryGreen,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textGrey,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  customerBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryGreen,
    borderBottomRightRadius: 4,
  },
  providerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  customerText: {
    color: COLORS.white,
  },
  providerText: {
    color: COLORS.textBlack,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textBlack,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D1D1',
  },
});

export default ChatScreen;
