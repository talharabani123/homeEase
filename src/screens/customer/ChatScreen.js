import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
// import { sendMessage, listenToMessages, markMessagesAsRead } from '../../services/chatService';

const ChatScreen = ({ navigation, route }) => {
  const { requestId, providerName, providerAvatar } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Mock messages for Expo Go
    // In production: const unsubscribe = listenToMessages(requestId, setMessages);
    
    // Simulate initial messages
    setMessages(MOCK_MESSAGES);

    // Mark messages as read
    // markMessagesAsRead(requestId, 'customer');

    return () => {
      // unsubscribe();
    };
  }, [requestId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // Mock implementation for Expo Go
      // In production: await sendMessage(requestId, messageText, 'customer');
      
      const newMessage = {
        messageId: `msg_${Date.now()}`,
        senderId: 'customer123',
        senderType: 'customer',
        message: messageText,
        timestamp: Date.now(),
        read: false,
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Simulate provider response after 2 seconds
      setTimeout(() => {
        const providerResponse = {
          messageId: `msg_${Date.now()}`,
          senderId: 'provider456',
          senderType: 'provider',
          message: 'Got it! I\'ll be there soon.',
          timestamp: Date.now(),
          read: false,
        };
        setMessages(prev => [...prev, providerResponse]);
      }, 2000);

      setSending(false);
    } catch (error) {
      setSending(false);
      console.error('Send message error:', error);
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
            <Text style={styles.providerInitial}>{providerName[0]}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{providerName}</Text>
            <Text style={styles.headerSubtitle}>Service Provider</Text>
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
          const isCustomer = message.senderType === 'customer';
          const showTime = index === 0 || 
            (messages[index - 1] && 
             new Date(message.timestamp).getMinutes() !== new Date(messages[index - 1].timestamp).getMinutes());

          return (
            <View key={message.messageId || index}>
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
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M22 2 L11 13 M22 2 L15 22 L11 13 M22 2 L2 9 L11 13" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Mock messages for Expo Go testing
const MOCK_MESSAGES = [
  {
    messageId: 'msg1',
    senderId: 'provider456',
    senderType: 'provider',
    message: 'Hi! I\'m on my way to your location.',
    timestamp: Date.now() - 300000, // 5 minutes ago
    read: true,
  },
  {
    messageId: 'msg2',
    senderId: 'customer123',
    senderType: 'customer',
    message: 'Great! How long will it take?',
    timestamp: Date.now() - 240000, // 4 minutes ago
    read: true,
  },
  {
    messageId: 'msg3',
    senderId: 'provider456',
    senderType: 'provider',
    message: 'About 10 minutes. I\'m bringing all necessary tools.',
    timestamp: Date.now() - 180000, // 3 minutes ago
    read: true,
  },
  {
    messageId: 'msg4',
    senderId: 'customer123',
    senderType: 'customer',
    message: 'Perfect! See you soon.',
    timestamp: Date.now() - 120000, // 2 minutes ago
    read: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
