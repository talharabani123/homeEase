/**
 * In-App Chat Service
 * Real-time messaging between customer and provider using Firebase Realtime Database
 */

import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

/**
 * Send a message
 * @param {string} requestId - Request ID (used as chat room ID)
 * @param {string} message - Message text
 * @param {string} senderType - 'customer' or 'provider'
 * @returns {Promise<object>} - { success, messageId, error }
 */
export const sendMessage = async (requestId, message, senderType) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!message.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    const messageRef = database().ref(`chats/${requestId}/messages`).push();
    const messageId = messageRef.key;

    const messageData = {
      messageId,
      senderId: currentUser.uid,
      senderType, // 'customer' or 'provider'
      message: message.trim(),
      timestamp: database.ServerValue.TIMESTAMP,
      read: false,
    };

    await messageRef.set(messageData);

    // Update last message in chat metadata
    await database().ref(`chats/${requestId}/metadata`).update({
      lastMessage: message.trim(),
      lastMessageTime: database.ServerValue.TIMESTAMP,
      lastMessageSender: senderType,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message'
    };
  }
};

/**
 * Listen to messages in real-time
 * @param {string} requestId - Request ID (chat room ID)
 * @param {function} callback - Callback function (messages) => {}
 * @returns {function} - Unsubscribe function
 */
export const listenToMessages = (requestId, callback) => {
  const messagesRef = database()
    .ref(`chats/${requestId}/messages`)
    .orderByChild('timestamp');

  const onValueChange = messagesRef.on('value', (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        ...childSnapshot.val(),
        key: childSnapshot.key
      });
    });

    callback(messages);
  });

  return () => messagesRef.off('value', onValueChange);
};

/**
 * Mark messages as read
 * @param {string} requestId - Request ID
 * @param {string} userType - 'customer' or 'provider'
 * @returns {Promise<object>} - { success, error }
 */
export const markMessagesAsRead = async (requestId, userType) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const snapshot = await database()
      .ref(`chats/${requestId}/messages`)
      .once('value');

    const updates = {};
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      // Mark messages from the other party as read
      if (message.senderType !== userType && !message.read) {
        updates[`chats/${requestId}/messages/${childSnapshot.key}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await database().ref().update(updates);
    }

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark messages as read'
    };
  }
};

/**
 * Get unread message count
 * @param {string} requestId - Request ID
 * @param {string} userType - 'customer' or 'provider'
 * @returns {Promise<number>} - Unread count
 */
export const getUnreadCount = async (requestId, userType) => {
  try {
    const snapshot = await database()
      .ref(`chats/${requestId}/messages`)
      .once('value');

    let unreadCount = 0;
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      // Count unread messages from the other party
      if (message.senderType !== userType && !message.read) {
        unreadCount++;
      }
    });

    return unreadCount;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

/**
 * Initialize chat room
 * @param {string} requestId - Request ID
 * @param {object} participants - { customerId, customerName, providerId, providerName }
 * @returns {Promise<object>} - { success, error }
 */
export const initializeChatRoom = async (requestId, participants) => {
  try {
    await database().ref(`chats/${requestId}/metadata`).set({
      requestId,
      customerId: participants.customerId,
      customerName: participants.customerName,
      providerId: participants.providerId,
      providerName: participants.providerName,
      createdAt: database.ServerValue.TIMESTAMP,
      lastMessage: null,
      lastMessageTime: null,
      lastMessageSender: null,
    });

    return { success: true };
  } catch (error) {
    console.error('Initialize chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize chat'
    };
  }
};

/**
 * Delete chat (when request is completed/cancelled)
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, error }
 */
export const deleteChat = async (requestId) => {
  try {
    await database().ref(`chats/${requestId}`).remove();
    return { success: true };
  } catch (error) {
    console.error('Delete chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete chat'
    };
  }
};

export default {
  sendMessage,
  listenToMessages,
  markMessagesAsRead,
  getUnreadCount,
  initializeChatRoom,
  deleteChat,
};

/**
 * Get all conversations for a user
 * Returns list of conversations with last message info
 * @param {string} userId - Current user ID
 * @param {string} userType - 'customer' or 'provider'
 * @returns {Promise<object>} - { success, conversations, error }
 */
export const getUserConversations = async (userId, userType = 'customer') => {
  try {
    // Mock implementation for Expo Go
    // In production with Firebase:
    /*
    const chatsRef = database().ref('chats');
    const snapshot = await chatsRef.once('value');
    const conversations = [];
    
    snapshot.forEach((childSnapshot) => {
      const chat = childSnapshot.val();
      const metadata = chat.metadata;
      
      // Filter conversations for this user
      if (userType === 'customer' && metadata.customerId === userId) {
        conversations.push({
          id: childSnapshot.key,
          requestId: metadata.requestId,
          providerId: metadata.providerId,
          providerName: metadata.providerName,
          lastMessage: metadata.lastMessage,
          lastMessageSender: metadata.lastMessageSender,
          lastMessageTime: metadata.lastMessageTime,
          // Count unread messages
          unreadCount: 0, // Calculate from messages
        });
      } else if (userType === 'provider' && metadata.providerId === userId) {
        conversations.push({
          id: childSnapshot.key,
          requestId: metadata.requestId,
          customerId: metadata.customerId,
          customerName: metadata.customerName,
          lastMessage: metadata.lastMessage,
          lastMessageSender: metadata.lastMessageSender,
          lastMessageTime: metadata.lastMessageTime,
          unreadCount: 0,
        });
      }
    });
    
    // Sort by last message time
    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    
    return { success: true, conversations };
    */
    
    // Mock data for Expo Go
    return {
      success: true,
      conversations: [],
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return { success: false, error: error.message, conversations: [] };
  }
};

/**
 * Listen to conversations in real-time
 * @param {string} userId - Current user ID
 * @param {string} userType - 'customer' or 'provider'
 * @param {function} callback - Callback function (conversations) => {}
 * @returns {function} - Unsubscribe function
 */
export const listenToConversations = (userId, userType, callback) => {
  // Mock implementation for Expo Go
  // In production with Firebase:
  /*
  const chatsRef = database().ref('chats');
  
  const onValueChange = chatsRef.on('value', (snapshot) => {
    const conversations = [];
    
    snapshot.forEach((childSnapshot) => {
      const chat = childSnapshot.val();
      const metadata = chat.metadata;
      
      if (userType === 'customer' && metadata.customerId === userId) {
        conversations.push({
          id: childSnapshot.key,
          requestId: metadata.requestId,
          providerId: metadata.providerId,
          providerName: metadata.providerName,
          lastMessage: metadata.lastMessage,
          lastMessageSender: metadata.lastMessageSender,
          lastMessageTime: metadata.lastMessageTime,
        });
      } else if (userType === 'provider' && metadata.providerId === userId) {
        conversations.push({
          id: childSnapshot.key,
          requestId: metadata.requestId,
          customerId: metadata.customerId,
          customerName: metadata.customerName,
          lastMessage: metadata.lastMessage,
          lastMessageSender: metadata.lastMessageSender,
          lastMessageTime: metadata.lastMessageTime,
        });
      }
    });
    
    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(conversations);
  });
  
  return () => chatsRef.off('value', onValueChange);
  */
  
  // Mock for Expo Go - return empty unsubscribe
  return () => {};
};

/**
 * Mark conversation as read
 * @param {string} requestId - Request ID
 * @param {string} userType - 'customer' or 'provider'
 * @returns {Promise<object>} - { success, error }
 */
export const markConversationAsRead = async (requestId, userType) => {
  return await markMessagesAsRead(requestId, userType);
};

/**
 * Delete conversation
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, error }
 */
export const deleteConversation = async (requestId) => {
  return await deleteChat(requestId);
};
