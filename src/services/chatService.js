/**
 * Chat Service - Firebase Real-time Messaging
 * Handles real-time chat between customers and service providers
 */

import { firestore as db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { getCurrentUser } from './firebaseAuthService';

// ==================== CONVERSATION MANAGEMENT ====================

/**
 * Create or get existing conversation between customer and provider
 * @param {string} customerId - Customer user ID
 * @param {string} providerId - Provider user ID
 * @param {string} requestId - Service request ID (optional)
 * @param {object} metadata - Additional metadata (service type, etc.)
 * @returns {Promise<{success: boolean, conversationId?: string, error?: string}>}
 */
export const createConversation = async (customerId, providerId, requestId = null, metadata = {}) => {
  try {
    console.log('📝 Creating conversation:', { customerId, providerId, requestId });

    // Create conversation ID (consistent regardless of who initiates)
    const conversationId = [customerId, providerId].sort().join('_');

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      console.log('✅ Conversation already exists');
      return { success: true, conversationId };
    }

    // Create new conversation
    const conversationData = {
      conversationId,
      participants: {
        customer: customerId,
        provider: providerId
      },
      participantIds: [customerId, providerId],
      requestId: requestId || null,
      serviceType: metadata.serviceType || null,
      serviceIcon: metadata.serviceIcon || null,
      lastMessage: null,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: null,
      unreadCount: {
        [customerId]: 0,
        [providerId]: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(conversationRef, conversationData);

    console.log('✅ Conversation created successfully');
    return { success: true, conversationId };
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, conversations?: array, error?: string}>}
 */
export const getUserConversations = async (userId) => {
  try {
    console.log('📂 Getting conversations for user:', userId);

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Get participant info
      const otherUserId = data.participantIds.find(id => id !== userId);
      const userDoc = await getDoc(doc(db, 'users', otherUserId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      conversations.push({
        id: docSnap.id,
        ...data,
        otherUser: {
          id: otherUserId,
          name: userData.fullName || 'Unknown User',
          isOnline: userData.isOnline || false
        },
        unreadCount: data.unreadCount?.[userId] || 0,
        lastMessageTime: data.lastMessageTime?.toMillis() || Date.now()
      });
    }

    console.log(`✅ Found ${conversations.length} conversations`);
    return { success: true, conversations };
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    return { success: false, error: error.message, conversations: [] };
  }
};

/**
 * Listen to user conversations in real-time
 * @param {string} userId - User ID
 * @param {function} callback - Callback function to receive updates
 * @returns {function} Unsubscribe function
 */
export const listenToConversations = (userId, callback) => {
  try {
    console.log('👂 Listening to conversations for user:', userId);

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const conversations = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        
        // Get participant info
        const otherUserId = data.participantIds.find(id => id !== userId);
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        conversations.push({
          id: docSnap.id,
          ...data,
          otherUser: {
            id: otherUserId,
            name: userData.fullName || 'Unknown User',
            isOnline: userData.isOnline || false
          },
          unreadCount: data.unreadCount?.[userId] || 0,
          lastMessageTime: data.lastMessageTime?.toMillis() || Date.now()
        });
      }

      callback(conversations);
    }, (error) => {
      console.error('❌ Listen to conversations error:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Listen to conversations setup error:', error);
    return () => {};
  }
};

// ==================== MESSAGE MANAGEMENT ====================

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} senderType - 'customer' or 'provider'
 * @param {string} messageText - Message content
 * @param {object} metadata - Additional metadata (images, etc.)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendMessage = async (conversationId, senderId, senderType, messageText, metadata = {}) => {
  try {
    console.log('📤 Sending message:', { conversationId, senderId, senderType });

    // Create message document
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageRef = doc(messagesRef);

    const messageData = {
      messageId: messageRef.id,
      senderId,
      senderType,
      message: messageText.trim(),
      timestamp: serverTimestamp(),
      read: false,
      readAt: null,
      type: metadata.type || 'text', // text, image, location, etc.
      metadata: metadata || {},
      createdAt: serverTimestamp()
    };

    await setDoc(messageRef, messageData);

    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      const receiverId = conversationData.participantIds.find(id => id !== senderId);

      await updateDoc(conversationRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderId,
        [`unreadCount.${receiverId}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ Message sent successfully');
    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('❌ Send message error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limitCount - Number of messages to fetch
 * @returns {Promise<{success: boolean, messages?: array, error?: string}>}
 */
export const getMessages = async (conversationId, limitCount = 50) => {
  try {
    console.log('📂 Getting messages for conversation:', conversationId);

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    }));

    console.log(`✅ Found ${messages.length} messages`);
    return { success: true, messages };
  } catch (error) {
    console.error('❌ Get messages error:', error);
    return { success: false, error: error.message, messages: [] };
  }
};

/**
 * Listen to messages in real-time
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function to receive updates
 * @returns {function} Unsubscribe function
 */
export const listenToMessages = (conversationId, callback) => {
  try {
    console.log('👂 Listening to messages for conversation:', conversationId);

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      }));

      callback(messages);
    }, (error) => {
      console.error('❌ Listen to messages error:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Listen to messages setup error:', error);
    return () => {};
  }
};

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID marking messages as read
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    console.log('✅ Marking messages as read:', { conversationId, userId });

    const batch = writeBatch(db);

    // Get unread messages
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('read', '==', false),
      where('senderId', '!=', userId)
    );

    const querySnapshot = await getDocs(q);

    // Mark each message as read
    querySnapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });

    // Reset unread count for this user
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });

    await batch.commit();

    console.log('✅ Messages marked as read');
    return { success: true };
  } catch (error) {
    console.error('❌ Mark messages as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    console.log('🗑️ Deleting conversation:', conversationId);

    // Note: In production, you might want to soft-delete or archive instead
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Mark as deleted instead of actually deleting
    await updateDoc(conversationRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });

    console.log('✅ Conversation deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== TYPING INDICATORS ====================

/**
 * Set typing status
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Typing status
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const setTypingStatus = async (conversationId, userId, isTyping) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`typing.${userId}`]: isTyping,
      [`typingTimestamp.${userId}`]: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Set typing status error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to typing status
 * @param {string} conversationId - Conversation ID
 * @param {string} otherUserId - Other user ID to watch
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToTypingStatus = (conversationId, otherUserId, callback) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    
    const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isTyping = data.typing?.[otherUserId] || false;
        callback(isTyping);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Listen to typing status error:', error);
    return () => {};
  }
};

// ==================== EXPORTS ====================

export default {
  createConversation,
  getUserConversations,
  listenToConversations,
  sendMessage,
  getMessages,
  listenToMessages,
  markMessagesAsRead,
  deleteConversation,
  setTypingStatus,
  listenToTypingStatus
};
