/**
 * Emergency Services
 * Handles all emergency request operations
 * Mock implementation for Expo Go - Replace with Firebase in production
 */

// Mock emergency service types
export const STANDARD_EMERGENCY_TYPES = [
  {
    id: 'emergency_plumber',
    name: 'Emergency Plumber',
    icon: '🔧',
    basePrice: 800,
    surgeMultiplier: 1.5,
    examples: ['Pipe burst', 'Water leakage', 'Drain blockage', 'Toilet overflow'],
    category: 'standard'
  },
  {
    id: 'emergency_electrician',
    name: 'Emergency Electrician',
    icon: '⚡',
    basePrice: 900,
    surgeMultiplier: 1.5,
    examples: ['Short circuit', 'Power failure', 'Sparking outlet', 'Tripped breaker'],
    category: 'standard'
  },
  {
    id: 'gas_leakage',
    name: 'Gas Leakage Repair',
    icon: '🔥',
    basePrice: 1200,
    surgeMultiplier: 1.8,
    examples: ['Gas smell', 'Leaking pipe', 'Faulty regulator', 'Emergency shutoff'],
    category: 'standard',
    critical: true
  },
  {
    id: 'ac_breakdown',
    name: 'AC Breakdown',
    icon: '❄️',
    basePrice: 1000,
    surgeMultiplier: 1.5,
    examples: ['Not cooling', 'Strange noise', 'Water leaking', 'Won\'t turn on'],
    category: 'standard'
  },
  {
    id: 'lock_repair',
    name: 'Lock Repair (Lockout)',
    icon: '🔑',
    basePrice: 700,
    surgeMultiplier: 1.4,
    examples: ['Locked out', 'Broken key', 'Jammed lock', 'Lost keys'],
    category: 'standard'
  },
  {
    id: 'generator_failure',
    name: 'Generator Failure',
    icon: '⚙️',
    basePrice: 1100,
    surgeMultiplier: 1.5,
    examples: ['Won\'t start', 'No power output', 'Strange noise', 'Overheating'],
    category: 'standard'
  }
];

// Calculate emergency price with surge and distance
export const calculateEmergencyPrice = (basePrice, surgeMultiplier, distance = 0) => {
  let price = basePrice * surgeMultiplier;
  
  // Distance surcharge (beyond 3km)
  if (distance > 3) {
    const extraKm = distance - 3;
    price += extraKm * 50;
  }
  
  // Time-based surge (night hours 10 PM - 6 AM)
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    price *= 1.2; // 20% night surcharge
  }
  
  // Round to nearest 50
  return Math.round(price / 50) * 50;
};

// Get price breakdown
export const getPriceBreakdown = (basePrice, surgeMultiplier, distance = 0) => {
  const base = basePrice;
  const surge = basePrice * (surgeMultiplier - 1);
  const distanceFee = distance > 3 ? (distance - 3) * 50 : 0;
  
  const hour = new Date().getHours();
  const nightSurcharge = (hour >= 22 || hour < 6) 
    ? (base + surge + distanceFee) * 0.2 
    : 0;
  
  const total = base + surge + distanceFee + nightSurcharge;
  
  return {
    base: Math.round(base),
    surge: Math.round(surge),
    distanceFee: Math.round(distanceFee),
    nightSurcharge: Math.round(nightSurcharge),
    total: Math.round(total / 50) * 50
  };
};

// Create standard emergency request
export const createStandardEmergencyRequest = async (serviceTypeId, location, description = '') => {
  try {
    // Mock implementation
    const serviceType = STANDARD_EMERGENCY_TYPES.find(s => s.id === serviceTypeId);
    
    if (!serviceType) {
      return { success: false, error: 'Invalid service type' };
    }

    const requestId = `EMG-${Date.now()}`;
    const estimatedPrice = calculateEmergencyPrice(
      serviceType.basePrice,
      serviceType.surgeMultiplier,
      0
    );

    const request = {
      id: requestId,
      requestNumber: `EMG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      serviceType: serviceType,
      category: 'standard',
      location: location,
      description: description,
      status: 'searching',
      estimatedPrice: estimatedPrice,
      searchRadius: 5,
      providerTimeout: 30,
      createdAt: new Date().toISOString()
    };

    console.log('Standard emergency request created:', request);

    return {
      success: true,
      data: request
    };
  } catch (error) {
    console.error('Create standard emergency error:', error);
    return {
      success: false,
      error: 'Failed to create emergency request'
    };
  }
};

// Create non-standard emergency request
export const createNonStandardEmergencyRequest = async (location, description, mediaUrls = []) => {
  try {
    if (!description || description.trim().length < 10) {
      return { success: false, error: 'Description must be at least 10 characters' };
    }

    const requestId = `EMG-NS-${Date.now()}`;

    const request = {
      id: requestId,
      requestNumber: `EMG-NS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      category: 'non_standard',
      location: location,
      description: description,
      mediaUrls: mediaUrls,
      status: 'searching',
      searchRadius: 5,
      broadcastCount: 15,
      createdAt: new Date().toISOString()
    };

    console.log('Non-standard emergency request created:', request);

    return {
      success: true,
      data: request
    };
  } catch (error) {
    console.error('Create non-standard emergency error:', error);
    return {
      success: false,
      error: 'Failed to create emergency request'
    };
  }
};

// Mock provider matching (simulates real-time provider search)
export const searchProviders = (requestId, callback) => {
  let timeElapsed = 0;
  const maxTime = 30; // 30 seconds

  const interval = setInterval(() => {
    timeElapsed += 1;

    // Simulate provider found after 5-10 seconds
    if (timeElapsed >= 8) {
      clearInterval(interval);
      
      const mockProvider = {
        id: 'provider_' + Math.random().toString(36).substr(2, 9),
        name: ['Ahmed Khan', 'Ali Raza', 'Hassan Ali', 'Usman Shah'][Math.floor(Math.random() * 4)],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        photo: null,
        phone: '+92 300 1234567',
        location: {
          latitude: 24.8607 + (Math.random() - 0.5) * 0.01,
          longitude: 67.0011 + (Math.random() - 0.5) * 0.01
        },
        distance: (Math.random() * 3 + 1).toFixed(1),
        eta: Math.floor(Math.random() * 10 + 10),
        emergencyBadge: Math.random() > 0.5,
        totalJobs: Math.floor(Math.random() * 100 + 50),
        responseTime: timeElapsed
      };

      callback({
        status: 'provider_found',
        provider: mockProvider
      });
    } else if (timeElapsed >= maxTime) {
      clearInterval(interval);
      callback({
        status: 'no_provider',
        message: 'No providers available. Expanding search...'
      });
    } else {
      callback({
        status: 'searching',
        timeRemaining: maxTime - timeElapsed
      });
    }
  }, 1000);

  // Return cleanup function
  return () => clearInterval(interval);
};

// Mock offers for non-standard emergency
export const generateMockOffers = (requestId, callback) => {
  const offers = [];
  const providerNames = ['Ahmed Khan', 'Ali Raza', 'Hassan Ali', 'Usman Shah', 'Bilal Ahmed'];
  
  // Generate 3-5 offers over time
  const offerCount = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < offerCount; i++) {
    setTimeout(() => {
      const offer = {
        id: 'offer_' + Math.random().toString(36).substr(2, 9),
        provider: {
          id: 'provider_' + Math.random().toString(36).substr(2, 9),
          name: providerNames[i % providerNames.length],
          rating: (4.3 + Math.random() * 0.7).toFixed(1),
          photo: null,
          totalJobs: Math.floor(Math.random() * 150 + 50),
          emergencyBadge: Math.random() > 0.4
        },
        price: Math.floor(Math.random() * 500 + 1000),
        eta: Math.floor(Math.random() * 15 + 10),
        message: [
          'I can fix it quickly. Have all tools.',
          'Experienced with similar issues.',
          'Very close to your location.',
          'Available immediately.',
          'Best price guaranteed!'
        ][Math.floor(Math.random() * 5)],
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      offers.push(offer);
      callback(offers);
    }, (i + 1) * 2000); // Stagger offers by 2 seconds
  }
};

// Accept offer
export const acceptOffer = async (offerId, requestId) => {
  try {
    console.log('Accepting offer:', offerId, 'for request:', requestId);

    // Mock success
    return {
      success: true,
      message: 'Offer accepted! Provider is on the way.'
    };
  } catch (error) {
    console.error('Accept offer error:', error);
    return {
      success: false,
      error: 'Failed to accept offer'
    };
  }
};

// Cancel emergency request
export const cancelEmergencyRequest = async (requestId) => {
  try {
    console.log('Cancelling emergency request:', requestId);

    return {
      success: true,
      message: 'Emergency request cancelled'
    };
  } catch (error) {
    console.error('Cancel request error:', error);
    return {
      success: false,
      error: 'Failed to cancel request'
    };
  }
};

// Mock live tracking data
export const getProviderLocation = (providerId, customerLocation) => {
  // Simulate provider moving towards customer
  const randomOffset = () => (Math.random() - 0.5) * 0.001;
  
  return {
    provider: {
      latitude: customerLocation.latitude + randomOffset(),
      longitude: customerLocation.longitude + randomOffset(),
      heading: Math.floor(Math.random() * 360),
      speed: Math.floor(Math.random() * 20 + 20) // 20-40 km/h
    },
    customer: customerLocation,
    distance: (Math.random() * 2 + 0.5).toFixed(1), // 0.5-2.5 km
    eta: Math.floor(Math.random() * 10 + 5) // 5-15 minutes
  };
};

export default {
  STANDARD_EMERGENCY_TYPES,
  calculateEmergencyPrice,
  getPriceBreakdown,
  createStandardEmergencyRequest,
  createNonStandardEmergencyRequest,
  searchProviders,
  generateMockOffers,
  acceptOffer,
  cancelEmergencyRequest,
  getProviderLocation
};
