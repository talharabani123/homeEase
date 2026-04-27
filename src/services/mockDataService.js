/**
 * Centralized Mock Data Service
 * 
 * This service provides mock data for development and testing.
 * Replace with real API calls when backend is ready.
 */

// Service Categories
export const SERVICE_CATEGORIES = [
  { 
    id: 'plumber', 
    name: 'Plumber', 
    icon: '🔧', 
    priceRange: 'Rs. 500', 
    description: 'Pipe repairs, leak fixing, bathroom & kitchen plumbing' 
  },
  { 
    id: 'electrician', 
    name: 'Electrician', 
    icon: '💡', 
    priceRange: 'Rs. 600', 
    description: 'Wiring, switch repairs, appliance installation' 
  },
  { 
    id: 'carpenter', 
    name: 'Carpenter', 
    icon: '🪚', 
    priceRange: 'Rs. 800', 
    description: 'Furniture repair, door & window fixing, custom woodwork' 
  },
  { 
    id: 'cleaner', 
    name: 'Cleaner', 
    icon: '🧹', 
    priceRange: 'Rs. 1,000', 
    description: 'Deep cleaning, regular cleaning, move-in/out cleaning' 
  },
  { 
    id: 'painter', 
    name: 'Painter', 
    icon: '🎨', 
    priceRange: 'Rs. 1,500', 
    description: 'Interior & exterior painting, wall texture' 
  },
  { 
    id: 'ac-repair', 
    name: 'AC Repair', 
    icon: '❄️', 
    priceRange: 'Rs. 700', 
    description: 'AC installation, repair, maintenance, gas refilling' 
  },
  { 
    id: 'mechanic', 
    name: 'Mechanic', 
    icon: '🔩', 
    priceRange: 'Rs. 1,200', 
    description: 'Car & bike repair, maintenance, oil change' 
  },
  { 
    id: 'gardener', 
    name: 'Gardener', 
    icon: '🌱', 
    priceRange: 'Rs. 900', 
    description: 'Lawn care, plant maintenance, landscaping' 
  },
];

// Mock Providers
export const MOCK_PROVIDERS = [
  { 
    id: 1, 
    name: 'Ahmed Khan', 
    service: 'Plumber', 
    rating: 4.8, 
    reviews: 120,
    experience: '5 years',
    phone: '+92 300 1234567',
    completedJobs: 450,
    verified: true,
  },
  { 
    id: 2, 
    name: 'Ali Raza', 
    service: 'Electrician', 
    rating: 4.9, 
    reviews: 95,
    experience: '7 years',
    phone: '+92 301 2345678',
    completedJobs: 380,
    verified: true,
  },
  { 
    id: 3, 
    name: 'Hassan Ali', 
    service: 'Carpenter', 
    rating: 4.7, 
    reviews: 80,
    experience: '4 years',
    phone: '+92 302 3456789',
    completedJobs: 290,
    verified: true,
  },
  { 
    id: 4, 
    name: 'Bilal Ahmed', 
    service: 'Cleaner', 
    rating: 4.6, 
    reviews: 65,
    experience: '3 years',
    phone: '+92 303 4567890',
    completedJobs: 210,
    verified: true,
  },
  { 
    id: 5, 
    name: 'Usman Malik', 
    service: 'Painter', 
    rating: 4.8, 
    reviews: 110,
    experience: '6 years',
    phone: '+92 304 5678901',
    completedJobs: 340,
    verified: true,
  },
];

// Mock Chat Messages
export const MOCK_CHAT_MESSAGES = [
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

// Mock User Profile
export const MOCK_USER_PROFILE = {
  uid: 'user123',
  name: 'Muhammad Ali',
  phone: '+92 300 1234567',
  email: 'ali@example.com',
  address: 'House 123, Street 5, F-7, Islamabad',
  role: 'customer',
  isPhoneVerified: true,
  isActive: true,
  createdAt: Date.now() - 86400000 * 30, // 30 days ago
  savedLocations: [
    { id: 1, label: 'Home', address: 'House 123, Street 5, F-7, Islamabad' },
    { id: 2, label: 'Office', address: 'Plot 45, Blue Area, Islamabad' },
  ],
};

// Mock Service Requests
export const MOCK_SERVICE_REQUESTS = [
  {
    id: 'req1',
    serviceType: 'plumber',
    serviceName: 'Plumber',
    status: 'completed',
    providerId: 1,
    providerName: 'Ahmed Khan',
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    completedAt: Date.now() - 86400000 * 2 + 3600000, // 2 days ago + 1 hour
    amount: 800,
  },
  {
    id: 'req2',
    serviceType: 'electrician',
    serviceName: 'Electrician',
    status: 'completed',
    providerId: 2,
    providerName: 'Ali Raza',
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    completedAt: Date.now() - 86400000 * 7 + 7200000, // 7 days ago + 2 hours
    amount: 1200,
  },
];

// Mock Wallet Transactions
export const MOCK_WALLET_TRANSACTIONS = [
  {
    id: 'txn1',
    type: 'debit',
    amount: 800,
    description: 'Payment for Plumber service',
    date: Date.now() - 86400000 * 2,
    status: 'completed',
  },
  {
    id: 'txn2',
    type: 'credit',
    amount: 2000,
    description: 'Added funds to wallet',
    date: Date.now() - 86400000 * 5,
    status: 'completed',
  },
  {
    id: 'txn3',
    type: 'debit',
    amount: 1200,
    description: 'Payment for Electrician service',
    date: Date.now() - 86400000 * 7,
    status: 'completed',
  },
];

/**
 * Get service categories
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getServiceCategories = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: SERVICE_CATEGORIES,
  };
};

/**
 * Get top rated providers
 * @param {number} limit - Number of providers to return
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getTopRatedProviders = async (limit = 5) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sortedProviders = [...MOCK_PROVIDERS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
  
  return {
    success: true,
    data: sortedProviders,
  };
};

/**
 * Get provider by ID
 * @param {number} providerId
 * @returns {Promise<{success: boolean, data: Object|null}>}
 */
export const getProviderById = async (providerId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const provider = MOCK_PROVIDERS.find(p => p.id === providerId);
  
  return {
    success: !!provider,
    data: provider || null,
  };
};

/**
 * Get user profile
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getUserProfile = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: MOCK_USER_PROFILE,
  };
};

/**
 * Get service request history
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getServiceRequestHistory = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    success: true,
    data: MOCK_SERVICE_REQUESTS,
  };
};

/**
 * Get wallet balance
 * @returns {Promise<{success: boolean, data: {balance: number}}>}
 */
export const getWalletBalance = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      balance: 3500,
    },
  };
};

/**
 * Get wallet transactions
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getWalletTransactions = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    success: true,
    data: MOCK_WALLET_TRANSACTIONS,
  };
};

/**
 * Get chat messages for a request
 * @param {string} requestId
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getChatMessages = async (requestId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: MOCK_CHAT_MESSAGES,
  };
};

/**
 * Send a chat message
 * @param {string} requestId
 * @param {string} message
 * @param {string} senderType - 'customer' or 'provider'
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const sendChatMessage = async (requestId, message, senderType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newMessage = {
    messageId: `msg_${Date.now()}`,
    senderId: senderType === 'customer' ? 'customer123' : 'provider456',
    senderType,
    message,
    timestamp: Date.now(),
    read: false,
  };
  
  return {
    success: true,
    data: newMessage,
  };
};

// Export all mock data
export default {
  SERVICE_CATEGORIES,
  MOCK_PROVIDERS,
  MOCK_CHAT_MESSAGES,
  MOCK_USER_PROFILE,
  MOCK_SERVICE_REQUESTS,
  MOCK_WALLET_TRANSACTIONS,
  getServiceCategories,
  getTopRatedProviders,
  getProviderById,
  getUserProfile,
  getServiceRequestHistory,
  getWalletBalance,
  getWalletTransactions,
  getChatMessages,
  sendChatMessage,
};
