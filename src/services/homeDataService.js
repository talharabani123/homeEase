import AsyncStorage from '@react-native-async-storage/async-storage';

const PROVIDERS_KEY = '@homeease_providers';
const RECENT_SERVICES_KEY = '@homeease_recent_services';

// Mock providers data (in production, this would come from Firebase)
const MOCK_PROVIDERS = [
  {
    id: '1',
    name: 'Ahmed Khan',
    service: 'Plumber',
    rating: 4.9,
    reviews: 156,
    completedJobs: 180,
    experience: '8 years',
    phone: '+92 300 1234567',
    image: null,
  },
  {
    id: '2',
    name: 'Ali Raza',
    service: 'Electrician',
    rating: 4.8,
    reviews: 142,
    completedJobs: 165,
    experience: '6 years',
    phone: '+92 301 2345678',
    image: null,
  },
  {
    id: '3',
    name: 'Hassan Ali',
    service: 'Carpenter',
    rating: 4.7,
    reviews: 128,
    completedJobs: 145,
    experience: '7 years',
    phone: '+92 302 3456789',
    image: null,
  },
  {
    id: '4',
    name: 'Usman Sheikh',
    service: 'Painter',
    rating: 4.9,
    reviews: 134,
    completedJobs: 150,
    experience: '5 years',
    phone: '+92 303 4567890',
    image: null,
  },
  {
    id: '5',
    name: 'Bilal Ahmed',
    service: 'AC Repair',
    rating: 4.8,
    reviews: 119,
    completedJobs: 135,
    experience: '9 years',
    phone: '+92 304 5678901',
    image: null,
  },
  {
    id: '6',
    name: 'Kamran Malik',
    service: 'Cleaner',
    rating: 4.6,
    reviews: 98,
    completedJobs: 120,
    experience: '4 years',
    phone: '+92 305 6789012',
    image: null,
  },
  {
    id: '7',
    name: 'Faisal Khan',
    service: 'Mechanic',
    rating: 4.7,
    reviews: 105,
    completedJobs: 125,
    experience: '10 years',
    phone: '+92 306 7890123',
    image: null,
  },
  {
    id: '8',
    name: 'Imran Ali',
    service: 'Gardener',
    rating: 4.5,
    reviews: 87,
    completedJobs: 100,
    experience: '3 years',
    phone: '+92 307 8901234',
    image: null,
  },
];

// Get all providers
export const getAllProviders = async () => {
  try {
    // In production, fetch from Firebase
    // For now, return mock data
    return {
      success: true,
      data: MOCK_PROVIDERS,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get top-rated providers (sorted by rating)
export const getTopRatedProviders = async (limit = 3) => {
  try {
    const result = await getAllProviders();
    if (result.success) {
      const sorted = [...result.data].sort((a, b) => {
        // Sort by rating first, then by reviews
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.reviews - a.reviews;
      });
      
      return {
        success: true,
        data: limit ? sorted.slice(0, limit) : sorted,
      };
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get provider by ID
export const getProviderById = async (providerId) => {
  try {
    const result = await getAllProviders();
    if (result.success) {
      const provider = result.data.find(p => p.id === providerId);
      return {
        success: true,
        data: provider,
      };
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Save recent service
export const saveRecentService = async (serviceData) => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SERVICES_KEY);
    let recentServices = stored ? JSON.parse(stored) : [];
    
    // Check if service already exists
    const existingIndex = recentServices.findIndex(
      s => s.id === serviceData.id
    );
    
    if (existingIndex >= 0) {
      // Update existing service
      recentServices[existingIndex] = {
        ...serviceData,
        lastUsed: new Date().toISOString(),
      };
    } else {
      // Add new service
      recentServices.unshift({
        ...serviceData,
        lastUsed: new Date().toISOString(),
      });
    }
    
    // Keep only last 5 services
    recentServices = recentServices.slice(0, 5);
    
    await AsyncStorage.setItem(RECENT_SERVICES_KEY, JSON.stringify(recentServices));
    
    return {
      success: true,
      data: recentServices,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get recent services
export const getRecentServices = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SERVICES_KEY);
    const recentServices = stored ? JSON.parse(stored) : [];
    
    return {
      success: true,
      data: recentServices,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Clear recent services
export const clearRecentServices = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_SERVICES_KEY);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get time ago string
export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};
