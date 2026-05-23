/**
 * Supabase Chat Service
 * Replaces chatService.js
 * 
 * Features:
 * - Real-time messaging
 * - Typing indicators
 * - Read receipts
 * - Conversation management
 */

import { supabase } from '../config/supabase';
import { getCurrentUser } from './supabaseAuthService';

// ==================== CONVERSATION MANAGEMENT ====================

/**
 * Create or get existing conversation between users
 * 
 * @param {array} participantIds - Array of user IDs
 * @param {string} jobId - Optional job ID
 * @returns {Promise<object>} - { success, conversationId, isNew, error }
 */
export const createOrGetConversation = async (participantIds, jobId = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('💬 Creating/getting conversation for participants:', participantIds);

    // Sort participant IDs for consistent comparison
    const sortedIds = [...participantIds].sort();

    // Check if conversation already exists
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', sortedIds);

    if (searchError) {
      console.error('❌ Search conversation error:', searchError);
      return {
        success: false,
        error: searchError.message,
      };
    }

    // Find exact match (same participants, no extras)
    const exactMatch = existingConversations?.find(
      conv => conv.participant_ids.length === sortedIds.length &&
               conv.participant_ids.every(id => sortedIds.includes(id))
    );

    if (exactMatch) {
      console.log('✅ Found existing conversation:', exactMatch.id);
      return {
        success: true,
        conversationId: exactMatch.id,
        conversation: exactMatch,
        isNew: false,
      };
    }

    // Create new conversation
    const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const cleanJobId = jobId && isUuid(jobId) ? jobId : null;

    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_ids: sortedIds,
        job_id: cleanJobId,
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Create conversation error:', createError);
      return {
        success: false,
        error: createError.message,
      };
    }

    console.log('✅ Created new conversation:', newConversation.id);

    return {
      success: true,
      conversationId: newConversation.id,
      conversation: newConversation,
      isNew: true,
    };
  } catch (error) {
    console.error('❌ Create/Get Conversation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create conversation',
    };
  }
};

/**
 * Get all conversations for current user
 * 
 * @returns {Promise<object>} - { success, conversations, error }
 */
export const getUserConversations = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('📋 Fetching conversations for user:', user.id);

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id])
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Get conversations error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Found ${data.length} conversations`);

    return {
      success: true,
      conversations: data,
    };
  } catch (error) {
    console.error('❌ Get User Conversations Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get conversations',
    };
  }
};

/**
 * Get conversation by ID
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} - { success, conversation, error }
 */
export const getConversation = async (conversationId) => {
  try {
    console.log('📖 Fetching conversation:', conversationId);

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('❌ Get conversation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Conversation fetched successfully');

    return {
      success: true,
      conversation: data,
    };
  } catch (error) {
    console.error('❌ Get Conversation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get conversation',
    };
  }
};

/**
 * Delete conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} - { success, error }
 */
export const deleteConversation = async (conversationId) => {
  try {
    console.log('🗑️ Deleting conversation:', conversationId);

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('❌ Delete conversation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Conversation deleted successfully');

    return {
      success: true,
      message: 'Conversation deleted',
    };
  } catch (error) {
    console.error('❌ Delete Conversation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete conversation',
    };
  }
};

// ==================== MESSAGE MANAGEMENT ====================

/**
 * Send message
 * 
 * @param {string} conversationId - Conversation ID
 * @param {string} messageText - Message text
 * @param {string} messageType - 'text', 'image', 'file'
 * @param {string} attachmentUrl - Optional attachment URL
 * @returns {Promise<object>} - { success, message, error }
 */
export const sendMessage = async (
  conversationId,
  messageText,
  messageType = 'text',
  attachmentUrl = null
) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('📤 Sending message to conversation:', conversationId);

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_text: messageText,
        message_type: messageType,
        attachment_url: attachmentUrl,
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Send message error:', messageError);
      return {
        success: false,
        error: messageError.message,
      };
    }

    // Update conversation's last message
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: messageText,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('❌ Update conversation error:', updateError);
      // Don't fail the whole operation
    }

    console.log('✅ Message sent successfully');

    return {
      success: true,
      message: message,
    };
  } catch (error) {
    console.error('❌ Send Message Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
};

/**
 * Get messages for a conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch (default: 50)
 * @returns {Promise<object>} - { success, messages, error }
 */
export const getMessages = async (conversationId, limit = 50) => {
  try {
    console.log('📥 Fetching messages for conversation:', conversationId);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Get messages error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Fetched ${data.length} messages`);

    return {
      success: true,
      messages: data,
    };
  } catch (error) {
    console.error('❌ Get Messages Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get messages',
    };
  }
};

/**
 * Mark message as read
 * 
 * @param {string} messageId - Message ID
 * @returns {Promise<object>} - { success, error }
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      console.error('❌ Mark as read error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Mark Message As Read Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark message as read',
    };
  }
};

/**
 * Mark all messages in conversation as read
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} - { success, error }
 */
export const markAllMessagesAsRead = async (conversationId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    console.log('✅ Marking all messages as read in conversation:', conversationId);

    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id) // Don't mark own messages
      .eq('is_read', false);

    if (error) {
      console.error('❌ Mark all as read error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ All messages marked as read');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Mark All Messages As Read Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark messages as read',
    };
  }
};

/**
 * Delete message
 * 
 * @param {string} messageId - Message ID
 * @returns {Promise<object>} - { success, error }
 */
export const deleteMessage = async (messageId) => {
  try {
    console.log('🗑️ Deleting message:', messageId);

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('❌ Delete message error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Message deleted successfully');

    return {
      success: true,
      message: 'Message deleted',
    };
  } catch (error) {
    console.error('❌ Delete Message Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete message',
    };
  }
};

// ==================== TYPING INDICATORS ====================

/**
 * Set typing indicator
 * 
 * @param {string} conversationId - Conversation ID
 * @param {boolean} isTyping - Whether user is typing
 * @returns {Promise<object>} - { success, error }
 */
export const setTypingIndicator = async (conversationId, isTyping) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const { error } = await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Set typing indicator error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Set Typing Indicator Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to set typing indicator',
    };
  }
};

/**
 * Get typing indicators for conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} - { success, typingUsers, error }
 */
export const getTypingIndicators = async (conversationId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const { data, error } = await supabase
      .from('typing_indicators')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_typing', true)
      .neq('user_id', user.id); // Exclude current user

    if (error) {
      console.error('❌ Get typing indicators error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      typingUsers: data,
    };
  } catch (error) {
    console.error('❌ Get Typing Indicators Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get typing indicators',
    };
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

/**
 * Subscribe to new messages in a conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function (message) => {}
 * @returns {object} - Subscription object
 */
export const subscribeToMessages = (conversationId, callback) => {
  console.log('🔔 Subscribing to messages in conversation:', conversationId);

  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('📨 New message received:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to message updates (read receipts)
 * 
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function (message) => {}
 * @returns {object} - Subscription object
 */
export const subscribeToMessageUpdates = (conversationId, callback) => {
  console.log('🔔 Subscribing to message updates in conversation:', conversationId);

  const subscription = supabase
    .channel(`message_updates:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('✅ Message updated:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to typing indicators
 * 
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function (indicator) => {}
 * @returns {object} - Subscription object
 */
export const subscribeToTypingIndicators = (conversationId, callback) => {
  console.log('🔔 Subscribing to typing indicators in conversation:', conversationId);

  const subscription = supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('⌨️ Typing indicator changed:', payload);
        callback(payload.new || payload.old);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to conversation list updates
 * 
 * @param {function} callback - Callback function (conversation) => {}
 * @returns {object} - Subscription object
 */
export const subscribeToConversations = (callback) => {
  console.log('🔔 Subscribing to conversation updates');

  const subscription = supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        console.log('💬 Conversation changed:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from a channel
 * 
 * @param {object} subscription - Subscription object
 * @returns {Promise<void>}
 */
export const unsubscribe = async (subscription) => {
  if (subscription) {
    console.log('🔕 Unsubscribing from channel');
    await supabase.removeChannel(subscription);
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get unread message count for a conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} - { success, count, error }
 */
export const getUnreadCount = async (conversationId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Get unread count error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error('❌ Get Unread Count Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get unread count',
    };
  }
};

/**
 * Get total unread message count for user
 * 
 * @returns {Promise<object>} - { success, count, error }
 */
export const getTotalUnreadCount = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get all user's conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', [user.id]);

    if (convError) {
      console.error('❌ Get conversations error:', convError);
      return {
        success: false,
        error: convError.message,
      };
    }

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages in all conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Get total unread count error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error('❌ Get Total Unread Count Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get total unread count',
    };
  }
};

export default {
  createOrGetConversation,
  getUserConversations,
  getConversation,
  deleteConversation,
  sendMessage,
  getMessages,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage,
  setTypingIndicator,
  getTypingIndicators,
  subscribeToMessages,
  subscribeToMessageUpdates,
  subscribeToTypingIndicators,
  subscribeToConversations,
  unsubscribe,
  getUnreadCount,
  getTotalUnreadCount,
};
