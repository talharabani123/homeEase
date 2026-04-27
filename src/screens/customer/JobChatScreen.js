import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getChatMessages, sendChatMessage, markMessagesAsRead } from '../../services/realtimeJobFlowService';
import ScreenWrapper from '../../components/ScreenWrapper';

const JobChatScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { jobId, userType } = route.params; // userType: 'customer' or 'provider'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const userId = userType === 'customer' ? 'customer_123' : 'provider_456';

  useEffect(() => {
    loadMessages();
    markMessagesAsRead(jobId, userId);
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const loadMessages = async () => {
    const msgs = await getChatMessages(jobId);
    setMessages(msgs);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    const result = await sendChatMessage(jobId, userId, userType, inputText.trim());
    
    if (result.success) {
      setInputText('');
      await loadMessages();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerDashboard');
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === userId;
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
            {item.text}
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
              {userType === 'customer' ? 'Service Provider' : 'Customer'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Online
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
            disabled={loading || !inputText.trim()}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#FFFFFF" />
            </Svg>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
