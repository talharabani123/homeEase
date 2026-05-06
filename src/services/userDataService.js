/**
 * userDataService
 * All AsyncStorage keys are namespaced by userId so each user
 * has completely isolated data. No user can see another user's data.
 *
 * Key pattern:  @homeease_{userId}_{dataType}
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Key builders ─────────────────────────────────────────────────────────────
const k = {
  jobs:         (uid) => `@homeease_${uid}_active_jobs`,
  requests:     (uid) => `@homeease_${uid}_service_requests`,
  history:      (uid) => `@homeease_${uid}_service_history`,
  conversations:(uid) => `@homeease_${uid}_conversations`,
  messages:     (uid, jobId) => `@homeease_${uid}_messages_${jobId}`,
  locations:    (uid, jobId) => `@homeease_${uid}_locations_${jobId}`,
  settings:     (uid) => `@homeease_${uid}_settings`,
};

// ─── Generic helpers ──────────────────────────────────────────────────────────
const get = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const set = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
};

// ─── Service History ──────────────────────────────────────────────────────────
export const getServiceHistory = async (userId) => {
  if (!userId) return [];
  return (await get(k.history(userId))) || [];
};

export const addServiceHistory = async (userId, entry) => {
  if (!userId) return false;
  const history = await getServiceHistory(userId);
  history.unshift({ ...entry, id: `hist_${Date.now()}`, createdAt: new Date().toISOString() });
  return set(k.history(userId), history);
};

export const clearServiceHistory = async (userId) => {
  if (!userId) return;
  await AsyncStorage.removeItem(k.history(userId));
};

// ─── Conversations (Messages screen) ─────────────────────────────────────────
export const getConversations = async (userId) => {
  if (!userId) return [];
  return (await get(k.conversations(userId))) || [];
};

export const saveConversations = async (userId, conversations) => {
  if (!userId) return false;
  return set(k.conversations(userId), conversations);
};

export const deleteConversation = async (userId, conversationId) => {
  if (!userId) return false;
  const convs = await getConversations(userId);
  return set(k.conversations(userId), convs.filter(c => c.id !== conversationId));
};

export const upsertConversation = async (userId, conversation) => {
  if (!userId) return false;
  const convs = await getConversations(userId);
  const idx = convs.findIndex(c => c.id === conversation.id);
  if (idx >= 0) convs[idx] = conversation;
  else convs.unshift(conversation);
  return set(k.conversations(userId), convs);
};

// ─── Chat messages (per job) ──────────────────────────────────────────────────
export const getChatMessages = async (userId, jobId) => {
  if (!userId || !jobId) return [];
  return (await get(k.messages(userId, jobId))) || [];
};

export const saveChatMessage = async (userId, jobId, message) => {
  if (!userId || !jobId) return false;
  const msgs = await getChatMessages(userId, jobId);
  msgs.push({ ...message, id: `msg_${Date.now()}`, timestamp: new Date().toISOString() });
  return set(k.messages(userId, jobId), msgs);
};

// ─── Active jobs ──────────────────────────────────────────────────────────────
export const getActiveJobs = async (userId) => {
  if (!userId) return [];
  return (await get(k.jobs(userId))) || [];
};

export const saveActiveJobs = async (userId, jobs) => {
  if (!userId) return false;
  return set(k.jobs(userId), jobs);
};

// ─── Service requests (marketplace) ──────────────────────────────────────────
export const getServiceRequests = async (userId) => {
  if (!userId) return [];
  return (await get(k.requests(userId))) || [];
};

export const saveServiceRequests = async (userId, requests) => {
  if (!userId) return false;
  return set(k.requests(userId), requests);
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getUserSettings = async (userId) => {
  if (!userId) return {};
  return (await get(k.settings(userId))) || {};
};

export const saveUserSettings = async (userId, settings) => {
  if (!userId) return false;
  return set(k.settings(userId), settings);
};

// ─── Clear ALL data for a user (on logout) ────────────────────────────────────
export const clearAllUserData = async (userId) => {
  if (!userId) return;
  try {
    // Get all keys and remove those belonging to this user
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.startsWith(`@homeease_${userId}_`));
    if (userKeys.length > 0) await AsyncStorage.multiRemove(userKeys);
  } catch (e) {
    console.error('clearAllUserData error:', e);
  }
};
